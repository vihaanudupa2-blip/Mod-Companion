import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reactionRolesTable = pgTable("reaction_roles", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull(),
  channelId: text("channel_id").notNull(),
  guildId: text("guild_id").notNull(),
  emoji: text("emoji").notNull(),
  roleId: text("role_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReactionRoleSchema = createInsertSchema(reactionRolesTable).omit({ id: true, createdAt: true });
export type InsertReactionRole = z.infer<typeof insertReactionRoleSchema>;
export type ReactionRole = typeof reactionRolesTable.$inferSelect;
