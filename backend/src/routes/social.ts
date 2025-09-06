import { Hono } from 'hono'

const social = new Hono()

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

function setCors(c: any) {
  const origin = c.req.header('Origin') ?? '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Vary', 'Origin')
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
}

async function handler(c: any) {
  const method = c.req.method
  // helpful server-side log
  console.log(`[social] ${method} ${new URL(c.req.url).pathname}`)

  // CORS preflight
  if (method === 'OPTIONS') {
    setCors(c)
    return c.body(null, 204)
  }

  // quick HEAD success for monitors/CDN
  if (method === 'HEAD') {
    setCors(c)
    return c.body(null, 204)
  }

  // Allow GET as a simple connectivity test (no n8n call)
  if (method === 'GET') {
    setCors(c)
    return c.json({ ok: true, info: 'POST here to forward to n8n' })
  }

  // POST → forward to n8n
  try {
    if (!N8N_WEBHOOK_URL) {
      setCors(c)
      return c.json({ error: 'N8N_WEBHOOK_URL is not configured on the server' }, 500)
    }

    const { platform, usernameOrUrl, userId } = await c.req.json<{
      platform: string
      usernameOrUrl: string
      userId?: string
    }>()

    if (!platform || !usernameOrUrl) {
      setCors(c)
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
      setCors(c)
      return c.json({ error: 'n8n webhook failed', detail }, 502)
    }

    setCors(c)
    return c.json({ ok: true, username })
  } catch (e: any) {
    setCors(c)
    return c.json({ error: 'server error', detail: e?.message }, 500)
  }
}

// Accept both /connect and /connect/ and all common methods
for (const path of ['/connect', '/connect/']) {
  social.on(['OPTIONS', 'HEAD', 'GET', 'POST'], path, handler)
}

export default social
