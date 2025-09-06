import { Hono } from 'hono'

const social = new Hono()

// Env (configured in your backend environment)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_TOKEN = process.env.N8N_WEBHOOK_TOKEN

function normalizeUsername(input: string, platform: string) {
  try {
    const asUrl = new URL(input)
    const path = asUrl.pathname.replace(/\/+$/, '')
    switch (platform) {
      case 'tiktok':
      case 'youtube':
        return path.replace(/^\/@?/, '@')
      case 'instagram':
      case 'twitter':
      default:
        return path.replace(/^\//, '@')
    }
  } catch {
    return input.startsWith('@') ? input : `@${input}`
  }
}

// Accept both preflight (OPTIONS) and POST for /connect
social.on(['OPTIONS', 'POST'], '/connect', async (c) => {
  // --- CORS preflight ---
  if (c.req.method === 'OPTIONS') {
    const origin = c.req.header('Origin') ?? '*'
    c.header('Access-Control-Allow-Origin', origin)
    c.header('Vary', 'Origin')
    c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    c.header('Access-Control-Allow-Credentials', 'true')
    return c.body(null, 204) // 204 must have no body
  }

  // --- POST /connect ---
  try {
    if (!N8N_WEBHOOK_URL) {
      return c.json({ error: 'N8N_WEBHOOK_URL is not configured on the server' }, 500)
    }

    const { platform, usernameOrUrl, userId } = await c.req.json<{
      platform: string
      usernameOrUrl: string
      userId?: string
    }>()

    if (!platform || !usernameOrUrl) {
      return c.json({ error: 'platform and usernameOrUrl required' }, 400)
    }

    const username = normalizeUsername(usernameOrUrl, platform)

    const resp = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_TOKEN ? { Authorization: `Bearer ${N8N_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        platform,
        username,
        rawInput: usernameOrUrl,
        userId: userId ?? null,
        triggeredAt: new Date().toISOString(),
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text()
      return c.json({ error: 'n8n webhook failed', detail }, 502)
    }

    // Helpful when credentials mode is used
    const origin = c.req.header('Origin')
    if (origin) {
      c.header('Access-Control-Allow-Origin', origin)
      c.header('Vary', 'Origin')
    }

    return c.json({ ok: true, username })
  } catch (e: any) {
    return c.json({ error: 'server error', detail: e?.message }, 500)
  }
})

export default social
