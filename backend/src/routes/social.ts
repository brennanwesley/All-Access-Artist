import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const social = new Hono()

// Supabase client for metrics queries
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

// One URL per platform (set these in Render → Backend → Environment)
// Fallback DEFAULT is used if a specific platform var is missing.
const WEBHOOKS: Record<string, string | undefined> = {
  instagram: process.env.N8N_WEBHOOK_INSTAGRAM,
  tiktok:    process.env.N8N_WEBHOOK_TIKTOK,
  youtube:   process.env.N8N_WEBHOOK_YOUTUBE,
  twitter:   process.env.N8N_WEBHOOK_TWITTER,
  default:   process.env.N8N_WEBHOOK_URL,   // optional global fallback
}

// Optional per-platform bearer tokens (if you secure the n8n webhooks)
const TOKENS: Record<string, string | undefined> = {
  instagram: process.env.N8N_TOKEN_INSTAGRAM,
  tiktok:    process.env.N8N_TOKEN_TIKTOK,
  youtube:   process.env.N8N_TOKEN_YOUTUBE,
  twitter:   process.env.N8N_TOKEN_TWITTER,
  default:   process.env.N8N_WEBHOOK_TOKEN, // optional global fallback
}

function setCors(c: any) {
  const origin = c.req.header('Origin') ?? '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Vary', 'Origin')
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
}

function pickWebhook(platform: string) {
  const key = platform?.toLowerCase()
  const url = WEBHOOKS[key] ?? WEBHOOKS.default
  const token = TOKENS[key] ?? TOKENS.default
  return { url, token }
}

// Parse any input (URL or handle) into:
//   handle: '@user' (always with '@')
//   plain:  'user'   (no '@', no slashes)
function parseHandle(input: string, platform: string) {
  const ensureAt = (s: string) => (s.startsWith('@') ? s : `@${s}`)
  const stripAt  = (s: string) => s.replace(/^@/, '')
  let raw = (input || '').trim()

  try {
    const u = new URL(raw)
    let seg = u.pathname.replace(/\/+$/, '') // trim trailing slash
    // common patterns
    // /@handle   (tiktok, youtube)
    // /handle    (instagram, x)
    seg = seg.split('/').filter(Boolean).pop() || ''
    if (!seg) return { handle: '', plain: '' }
    // youtube sometimes uses /channel/UC...  (no @) — keep as-is but we’ll still @-prefix
    return { handle: ensureAt(seg), plain: stripAt(seg) }
  } catch {
    // not a URL — it’s a handle or raw text
    const plain = stripAt(raw)
    return { handle: ensureAt(plain), plain }
  }
}

async function handler(c: any) {
  const method = c.req.method
  if (method === 'OPTIONS' || method === 'HEAD') {
    setCors(c); return c.body(null, 204)
  }
  if (method === 'GET') {
    setCors(c); return c.json({ ok: true, info: 'POST here to forward to n8n' })
  }

  // POST → forward to the platform-specific webhook
  try {
    const body = (await c.req.json().catch(() => null)) as any
    const platform = (body?.platform || '').toLowerCase()
    const usernameOrUrl = body?.usernameOrUrl as string | undefined
    const userId = body?.userId as string | undefined

    if (!platform || !usernameOrUrl) {
      setCors(c); return c.json({ error: 'platform and usernameOrUrl required' }, 400)
    }

    const { handle, plain } = parseHandle(usernameOrUrl, platform)

    const { url, token } = pickWebhook(platform)
    if (!url) {
      setCors(c); return c.json({ error: `No webhook configured for platform '${platform}'` }, 500)
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        platform,             // "instagram" | "tiktok" | "youtube" | "twitter"
        username: handle,     // e.g. "@breakoutcards"
        usernamePlain: plain, // e.g. "breakoutcards"
        rawInput: usernameOrUrl,
        userId: userId ?? null,
        triggeredAt: new Date().toISOString(),
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text()
      setCors(c); return c.json({ error: 'n8n webhook failed', detail }, 502)
    }

    setCors(c); return c.json({ ok: true, platform, username: handle })
  } catch (e: any) {
    setCors(c); return c.json({ error: 'server error', detail: e?.message }, 500)
  }
}

// Support both /connect and /connect/
for (const path of ['/connect', '/connect/']) {
  social.on(['OPTIONS', 'HEAD', 'GET', 'POST'], path, handler)
}

// ============================================================================
// Metrics Interfaces
// ============================================================================
interface InstagramMetrics {
  id: number
  date_ingested: string
  username: string
  posts_30d: number | null
  likes_30d: number | null
  comments_30d: number | null
  posts_365d: number | null
  likes_365d: number | null
  comments_365d: number | null
  profile_url: string | null
  followers: number | null
}

interface TikTokMetrics {
  id: number
  date_ingested: string
  name: string
  videos_published_30d: number | null
  play_30d: number | null
  digg_30d: number | null
  comment_30d: number | null
  share_30d: number | null
  collect_30d: number | null
  profile_url: string | null
}

interface YouTubeMetrics {
  id: number
  date_ingested: string
  username: string
  videos_30d: number | null
  views_30d: number | null
  likes_30d: number | null
  profile_url: string | null
}

interface TwitterMetrics {
  id: number
  date_ingested: string
  username: string
  like_30d: number | null
  retweet_30d: number | null
  reply_30d: number | null
  quote_30d: number | null
  profile_url: string | null
  followers: number | null
}

// ============================================================================
// GET /metrics/instagram/:username - Fetch Instagram metrics for a username
// ============================================================================

social.get('/metrics/instagram/:username', async (c) => {
  setCors(c)
  
  const username = c.req.param('username')
  if (!username) {
    return c.json({ success: false, error: { message: 'Username is required' } }, 400)
  }

  // Strip @ prefix if present
  const cleanUsername = username.replace(/^@/, '')

  if (!supabaseUrl || !supabaseServiceKey) {
    return c.json({ success: false, error: { message: 'Database configuration error' } }, 500)
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the most recent metrics for this username
    const { data, error } = await supabase
      .from('instagram_metrics')
      .select('id, date_ingested, username, posts_30d, likes_30d, comments_30d, posts_365d, likes_365d, comments_365d, profile_url, followers')
      .ilike('username', cleanUsername)
      .order('date_ingested', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // No data found is not an error - just return null metrics
      if (error.code === 'PGRST116') {
        return c.json({
          success: true,
          data: null,
          message: 'No metrics found for this username'
        })
      }
      return c.json({ success: false, error: { message: error.message } }, 500)
    }

    const metrics = data as InstagramMetrics

    return c.json({
      success: true,
      data: {
        username: metrics.username,
        date_ingested: metrics.date_ingested,
        posts_30d: metrics.posts_30d,
        likes_30d: metrics.likes_30d,
        comments_30d: metrics.comments_30d,
        profile_url: metrics.profile_url
      }
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ success: false, error: { message: errorMessage } }, 500)
  }
})

// ============================================================================
// GET /metrics/tiktok/:username - Fetch TikTok metrics for a username
// ============================================================================
social.get('/metrics/tiktok/:username', async (c) => {
  setCors(c)
  
  const username = c.req.param('username')
  if (!username) {
    return c.json({ success: false, error: { message: 'Username is required' } }, 400)
  }

  // Strip @ prefix if present
  const cleanUsername = username.replace(/^@/, '')

  if (!supabaseUrl || !supabaseServiceKey) {
    return c.json({ success: false, error: { message: 'Database configuration error' } }, 500)
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the most recent metrics for this username (TikTok uses 'name' column)
    const { data, error } = await supabase
      .from('tiktok_metrics')
      .select('id, date_ingested, name, videos_published_30d, play_30d, digg_30d, comment_30d, share_30d, collect_30d, profile_url')
      .ilike('name', cleanUsername)
      .order('date_ingested', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          success: true,
          data: null,
          message: 'No metrics found for this username'
        })
      }
      return c.json({ success: false, error: { message: error.message } }, 500)
    }

    const metrics = data as TikTokMetrics

    return c.json({
      success: true,
      data: {
        username: metrics.name,
        date_ingested: metrics.date_ingested,
        videos_30d: metrics.videos_published_30d,
        plays_30d: metrics.play_30d,
        likes_30d: metrics.digg_30d,
        comments_30d: metrics.comment_30d,
        profile_url: metrics.profile_url
      }
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ success: false, error: { message: errorMessage } }, 500)
  }
})

// ============================================================================
// GET /metrics/youtube/:username - Fetch YouTube metrics for a username
// ============================================================================
social.get('/metrics/youtube/:username', async (c) => {
  setCors(c)
  
  const username = c.req.param('username')
  if (!username) {
    return c.json({ success: false, error: { message: 'Username is required' } }, 400)
  }

  // Strip @ prefix if present
  const cleanUsername = username.replace(/^@/, '')

  if (!supabaseUrl || !supabaseServiceKey) {
    return c.json({ success: false, error: { message: 'Database configuration error' } }, 500)
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await supabase
      .from('youtube_metrics')
      .select('id, date_ingested, username, videos_30d, views_30d, likes_30d, profile_url')
      .ilike('username', cleanUsername)
      .order('date_ingested', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          success: true,
          data: null,
          message: 'No metrics found for this username'
        })
      }
      return c.json({ success: false, error: { message: error.message } }, 500)
    }

    const metrics = data as YouTubeMetrics

    return c.json({
      success: true,
      data: {
        username: metrics.username,
        date_ingested: metrics.date_ingested,
        videos_30d: metrics.videos_30d,
        views_30d: metrics.views_30d,
        likes_30d: metrics.likes_30d,
        profile_url: metrics.profile_url
      }
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ success: false, error: { message: errorMessage } }, 500)
  }
})

// ============================================================================
// GET /metrics/twitter/:username - Fetch Twitter/X metrics for a username
// ============================================================================
social.get('/metrics/twitter/:username', async (c) => {
  setCors(c)
  
  const username = c.req.param('username')
  if (!username) {
    return c.json({ success: false, error: { message: 'Username is required' } }, 400)
  }

  // Strip @ prefix if present
  const cleanUsername = username.replace(/^@/, '')

  if (!supabaseUrl || !supabaseServiceKey) {
    return c.json({ success: false, error: { message: 'Database configuration error' } }, 500)
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await supabase
      .from('twitter_metrics')
      .select('id, date_ingested, username, like_30d, retweet_30d, reply_30d, quote_30d, profile_url, followers')
      .ilike('username', cleanUsername)
      .order('date_ingested', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          success: true,
          data: null,
          message: 'No metrics found for this username'
        })
      }
      return c.json({ success: false, error: { message: error.message } }, 500)
    }

    const metrics = data as TwitterMetrics

    return c.json({
      success: true,
      data: {
        username: metrics.username,
        date_ingested: metrics.date_ingested,
        likes_30d: metrics.like_30d,
        retweets_30d: metrics.retweet_30d,
        replies_30d: metrics.reply_30d,
        profile_url: metrics.profile_url
      }
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ success: false, error: { message: errorMessage } }, 500)
  }
})

export default social
