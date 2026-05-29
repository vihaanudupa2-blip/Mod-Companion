import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

function getRedirectUri(req: Request): string {
  const host = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : `http://localhost:${process.env.PORT ?? 8080}`;
  return `${host}/api/auth/callback`;
}

// GET /api/auth/login — redirect to Discord OAuth2
router.get("/auth/login", (req: Request, res: Response): void => {
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// GET /api/auth/callback — handle OAuth2 code exchange
router.get("/auth/callback", async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing code" });
    return;
  }

  const redirectUri = getRedirectUri(req);

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      req.log.error({ status: tokenRes.status }, "Failed to exchange Discord token");
      res.status(500).json({ error: "Failed to authenticate with Discord" });
      return;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    // Fetch user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      res.status(500).json({ error: "Failed to fetch user info" });
      return;
    }

    const user = (await userRes.json()) as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
    };

    // Fetch user guilds
    const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const guilds = guildsRes.ok
      ? ((await guildsRes.json()) as Array<{ id: string; name: string; icon: string | null; permissions: string }>)
      : [];

    // Save to session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.discriminator = user.discriminator;
    req.session.avatar = user.avatar;
    req.session.accessToken = tokenData.access_token;
    req.session.guilds = guilds;

    req.log.info({ userId: user.id }, "User authenticated via Discord");

    // Redirect to dashboard
    const dashboardBase = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "";
    res.redirect(`${dashboardBase}/dashboard/`);
  } catch (err) {
    logger.error({ err }, "OAuth2 callback error");
    res.status(500).json({ error: "Authentication failed" });
  }
});

// GET /api/auth/me — return current session user
router.get("/auth/me", (req: Request, res: Response): void => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const avatarUrl = req.session.avatar
    ? `https://cdn.discordapp.com/avatars/${req.session.userId}/${req.session.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(req.session.userId) % 5}.png`;

  res.json({
    id: req.session.userId,
    username: req.session.username,
    discriminator: req.session.discriminator,
    avatar: req.session.avatar,
    avatarUrl,
  });
});

// POST /api/auth/logout
router.post("/auth/logout", (req: Request, res: Response): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
