import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const moderationCasesTable = pgTable("moderation_cases", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  caseNumber: integer("case_number").notNull(),
  action: text("action").notNull(),
  userId: text("user_id").notNull(),
  moderatorId: text("moderator_id").notNull(),
  reason: text("reason").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staffNotesTable = pgTable("staff_notes", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  authorId: text("author_id").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberReportsTable = pgTable("member_reports", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  reporterId: text("reporter_id").notNull(),
  targetUserId: text("target_user_id").notNull(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id"),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scheduledAnnouncementsTable = pgTable("scheduled_announcements", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  message: text("message").notNull(),
  sendAt: timestamp("send_at", { withTimezone: true }).notNull(),
  repeatMinutes: integer("repeat_minutes"),
  createdBy: text("created_by").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stickyMessagesTable = pgTable("sticky_messages", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id"),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const autoResponsesTable = pgTable("auto_responses", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  trigger: text("trigger").notNull(),
  response: text("response").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const securitySettingsTable = pgTable("security_settings", {
  guildId: text("guild_id").primaryKey(),
  antiNukeEnabled: boolean("anti_nuke_enabled").notNull().default(false),
  roleProtectEnabled: boolean("role_protect_enabled").notNull().default(false),
  messageLogsEnabled: boolean("message_logs_enabled").notNull().default(false),
  messageLogChannelId: text("message_log_channel_id"),
  cleanupEnabled: boolean("cleanup_enabled").notNull().default(false),
  cleanupChannelId: text("cleanup_channel_id"),
  cleanupAfterMinutes: integer("cleanup_after_minutes").notNull().default(1440),
  antiNukeThreshold: integer("anti_nuke_threshold").notNull().default(3),
  trustedUsers: text("trusted_users").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  action: text("action").notNull(),
  actorId: text("actor_id"),
  targetId: text("target_id"),
  channelId: text("channel_id"),
  messageId: text("message_id"),
  details: text("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const selfRoleMenusTable = pgTable("self_role_menus", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id"),
  prompt: text("prompt").notNull(),
  roleIds: text("role_ids").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ModerationCase = typeof moderationCasesTable.$inferSelect;
export type StaffNote = typeof staffNotesTable.$inferSelect;
export type MemberReport = typeof memberReportsTable.$inferSelect;
export type ScheduledAnnouncement = typeof scheduledAnnouncementsTable.$inferSelect;
export type StickyMessage = typeof stickyMessagesTable.$inferSelect;
export type AutoResponse = typeof autoResponsesTable.$inferSelect;
export type SecuritySettings = typeof securitySettingsTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;
export type SelfRoleMenu = typeof selfRoleMenusTable.$inferSelect;