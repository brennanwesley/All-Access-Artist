import { Hono } from 'hono';

const social = new Hono();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;   // e.g. https://n8n.example.com/webhook/social-connect
const N8N_TOKEN = process.env.N8N_WEBHOOK_TOKEN;        // optional

function normalizeUsername(input: string, platform: string) {
  try {
    const asUrl = new URL(input);
    const path = asUrl.pathname.replace(/\/+$/, ''); // trim trailing slash
    switch (platform) {
      case 'tiktok':
      case 'youtube':
        return path.replace(/^\/@?/, '@');
      case 'instagram':
      case 'twitter':
      default:
        return path.replace(/^\//, '@');
    }
  } catch {
    return input.startsWith('@') ? input : `@${input}`;
  }
}

social.post('/api/social/connect', async (c) => {
  try {
    const { platform, usernameOrUrl, userId } = await c.req.json<{ platform: string; usernameOrUrl: string; userId?: string }>();

    if (!platform || !usernameOrUrl) {
      return c.json({ error: 'platform and usernameOrUrl required' }, 400);
    }

    const username = normalizeUsername(usernameOrUrl, platform);

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
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return c.json({ error: 'n8n webhook failed', detail }, 502);
    }

    return c.json({ ok: true, username });
  } catch (e: any) {
    return c.json({ error: 'server error', detail: e?.message }, 500);
  }
});

export default social;
