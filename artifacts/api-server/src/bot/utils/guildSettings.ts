import { db, guildSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { GuildSettings } from "@workspace/db";

interface CachedSettings {
  data: GuildSettings;
  expiresAt: number;
}

const cache = new Map<string, CachedSettings>();
const TTL_MS = 60_000; // 1 minute

const DEFAULTS: Omit<GuildSettings, "guildId" | "updatedAt"> = {
  welcomeEnabled: true,
  welcomeChannelId: null,
  welcomeMessage: null,
  goodbyeEnabled: true,
  goodbyeChannelId: null,
  goodbyeMessage: null,
  welcomeDmEnabled: false,
  welcomeDmMessage: null,
  autoModEnabled: true,
  bannedWords: [],
  maxMentions: 5,
  maxEmojis: 10,
  maxCapsRatio: 70,
};

export async function getGuildSettings(guildId: string): Promise<GuildSettings> {
  const cached = cache.get(guildId);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  const [row] = await db
    .select()
    .from(guildSettingsTable)
    .where(eq(guildSettingsTable.guildId, guildId));

  const data: GuildSettings = row ?? {
    ...DEFAULTS,
    guildId,
    updatedAt: new Date(),
  };

  cache.set(guildId, { data, expiresAt: Date.now() + TTL_MS });
  return data;
}

export function invalidateGuildCache(guildId: string): void {
  cache.delete(guildId);
}
