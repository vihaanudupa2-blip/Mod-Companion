import { Router, type IRouter, type Request, type Response } from "express";
import { db, guildSettingsTable, reactionRolesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const MANAGE_GUILD = 0x20;

function canManageGuild(permissions: string): boolean {
  return (BigInt(permissions) & BigInt(MANAGE_GUILD)) !== BigInt(0);
}

function requireAuth(req: Request, res: Response): boolean {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

function getBotClient() {
  // Dynamically import the bot client to avoid circular deps
  return import("discord.js").then(({ Client }) => null);
}

// GET /api/dashboard/guilds
router.get("/dashboard/guilds", async (req: Request, res: Response): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const userGuilds = req.session.guilds ?? [];
  const adminGuilds = userGuilds.filter(g => canManageGuild(g.permissions));

  // Get bot guilds via Discord API using bot token
  let botGuildIds = new Set<string>();
  try {
    const botGuildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
    });
    if (botGuildsRes.ok) {
      const botGuilds = (await botGuildsRes.json()) as Array<{ id: string }>;
      botGuildIds = new Set(botGuilds.map(g => g.id));
    }
  } catch (err) {
    logger.error({ err }, "Failed to fetch bot guilds");
  }

  const result = adminGuilds.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    iconUrl: g.icon
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
      : null,
    botPresent: botGuildIds.has(g.id),
  }));

  res.json(result);
});

// GET /api/dashboard/guilds/:guildId/settings
router.get("/dashboard/guilds/:guildId/settings", async (req: Request, res: Response): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const guildId = Array.isArray(req.params.guildId) ? req.params.guildId[0] : req.params.guildId;

  const userGuilds = req.session.guilds ?? [];
  const guild = userGuilds.find(g => g.id === guildId && canManageGuild(g.permissions));
  if (!guild) {
    res.status(403).json({ error: "You don't have permission to manage this server" });
    return;
  }

  const [existing] = await db
    .select()
    .from(guildSettingsTable)
    .where(eq(guildSettingsTable.guildId, guildId));

  if (!existing) {
    // Return defaults
    res.json({
      guildId,
      welcomeEnabled: true,
      welcomeChannelId: null,
      goodbyeEnabled: true,
      autoModEnabled: true,
      bannedWords: [],
      maxMentions: 5,
      maxEmojis: 10,
      maxCapsRatio: 70,
    });
    return;
  }

  res.json(existing);
});

// PATCH /api/dashboard/guilds/:guildId/settings
router.patch("/dashboard/guilds/:guildId/settings", async (req: Request, res: Response): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const guildId = Array.isArray(req.params.guildId) ? req.params.guildId[0] : req.params.guildId;

  const userGuilds = req.session.guilds ?? [];
  const guild = userGuilds.find(g => g.id === guildId && canManageGuild(g.permissions));
  if (!guild) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { bannedWords, ...rest } = req.body as Partial<typeof guildSettingsTable.$inferInsert>;

  const [updated] = await db
    .insert(guildSettingsTable)
    .values({ guildId, ...rest })
    .onConflictDoUpdate({
      target: guildSettingsTable.guildId,
      set: { ...rest, updatedAt: new Date() },
    })
    .returning();

  res.json(updated);
});

// POST /api/dashboard/guilds/:guildId/banned-words
router.post("/dashboard/guilds/:guildId/banned-words", async (req: Request, res: Response): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const guildId = Array.isArray(req.params.guildId) ? req.params.guildId[0] : req.params.guildId;
  const { word } = req.body as { word: string };

  if (!word || typeof word !== "string" || !word.trim()) {
    res.status(400).json({ error: "Invalid word" });
    return;
  }

  const userGuilds = req.session.guilds ?? [];
  const guild = userGuilds.find(g => g.id === guildId && canManageGuild(g.permissions));
  if (!guild) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [existing] = await db
    .select()
    .from(guildSettingsTable)
    .where(eq(guildSettingsTable.guildId, guildId));

  const currentWords = existing?.bannedWords ?? [];
  const newWord = word.trim().toLowerCase();
  if (currentWords.includes(newWord)) {
    res.json({ bannedWords: currentWords });
    return;
  }

  const newWords = [...currentWords, newWord];
  await db
    .insert(guildSettingsTable)
    .values({ guildId, bannedWords: newWords })
    .onConflictDoUpdate({
      target: guildSettingsTable.guildId,
      set: { bannedWords: newWords, updatedAt: new Date() },
    });

  res.json({ bannedWords: newWords });
});

// DELETE /api/dashboard/guilds/:guildId/banned-words/:word
router.delete("/dashboard/guilds/:guildId/banned-words/:word", async (req: Request, res: Response): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const guildId = Array.isArray(req.params.guildId) ? req.params.guildId[0] : req.params.guildId;
  const word = Array.isArray(req.params.word) ? req.params.word[0] : req.params.word;

  const userGuilds = req.session.guilds ?? [];
  const guild = userGuilds.find(g => g.id === guildId && canManageGuild(g.permissions));
  if (!guild) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [existing] = await db
    .select()
    .from(guildSettingsTable)
    .where(eq(guildSettingsTable.guildId, guildId));

  const newWords = (existing?.bannedWords ?? []).filter(w => w !== word.toLowerCase());
  await db
    .insert(guildSettingsTable)
    .values({ guildId, bannedWords: newWords })
    .onConflictDoUpdate({
      target: guildSettingsTable.guildId,
      set: { bannedWords: newWords, updatedAt: new Date() },
    });

  res.json({ bannedWords: newWords });
});

// GET /api/dashboard/guilds/:guildId/reaction-roles
router.get("/dashboard/guilds/:guildId/reaction-roles", async (req: Request, res: Response): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const guildId = Array.isArray(req.params.guildId) ? req.params.guildId[0] : req.params.guildId;

  const userGuilds = req.session.guilds ?? [];
  const guild = userGuilds.find(g => g.id === guildId && canManageGuild(g.permissions));
  if (!guild) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const roles = await db
    .select()
    .from(reactionRolesTable)
    .where(eq(reactionRolesTable.guildId, guildId));

  res.json(roles);
});

export default router;
