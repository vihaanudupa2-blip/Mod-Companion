import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const guildSettingsTable = pgTable("guild_settings", {
  guildId: text("guild_id").primaryKey(),
  welcomeEnabled: boolean("welcome_enabled").notNull().default(true),
  welcomeChannelId: text("welcome_channel_id"),
  goodbyeEnabled: boolean("goodbye_enabled").notNull().default(true),
  autoModEnabled: boolean("auto_mod_enabled").notNull().default(true),
  bannedWords: text("banned_words").array().notNull().default([]),
  maxMentions: integer("max_mentions").notNull().default(5),
  maxEmojis: integer("max_emojis").notNull().default(10),
  maxCapsRatio: integer("max_caps_ratio").notNull().default(70),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGuildSettingsSchema = createInsertSchema(guildSettingsTable);
export type InsertGuildSettings = z.infer<typeof insertGuildSettingsSchema>;
export type GuildSettings = typeof guildSettingsTable.$inferSelect;
