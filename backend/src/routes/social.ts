import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;   // e.g. https://n8n.example.com/webhook/social-connect
const N8N_TOKEN = process.env.N8N_WEBHOOK_TOKEN;        // optional

function normalizeUsername(input: string, platform: string) {
  try {
    const asUrl = new URL(input);
    const path = asUrl.pathname.replace(/\/+$/, ""); // trim trailing slash
    switch (platform) {
      case "tiktok":
      case "youtube":
        return path.replace(/^\/@?/, "@");
      case "instagram":
      case "twitter":
      default:
        return path.replace(/^\//, "@");
    }
  } catch {
    return input.startsWith("@") ? input : `@${input}`;
  }
}

router.post("/social/connect", async (req, res) => {
  try {
    const { platform, usernameOrUrl, userId } = req.body || {};
    if (!platform || !usernameOrUrl) {
      return res.status(400).json({ error: "platform and usernameOrUrl required" });
    }

    const username = normalizeUsername(usernameOrUrl, platform);

    const resp = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      return res.status(502).json({ error: "n8n webhook failed", detail });
    }

    return res.json({ ok: true, username });
  } catch (e: any) {
    return res.status(500).json({ error: "server error", detail: e?.message });
  }
});

export default router;
