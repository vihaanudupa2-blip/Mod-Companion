import {
  AuditLogEvent,
  type GuildChannel,
  type Role,
} from "discord.js";
import { getSecuritySettings, isTrustedUser, recordAuditLog } from "../utils/advancedData.js";

const activity = new Map<string, { count: number; lastSeen: number }>();

async function latestExecutor(guild: Role["guild"], type: AuditLogEvent): Promise<string | null> {
  const logs = await guild.fetchAuditLogs({ type, limit: 1 }).catch(() => null);
  const entry = logs?.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 15_000) return null;
  return entry.executorId;
}

async function guard(
  guild: Role["guild"],
  action: string,
  type: AuditLogEvent,
  targetId: string,
  details: string,
): Promise<void> {
  const settings = await getSecuritySettings(guild.id);
  const executorId = await latestExecutor(guild, type);
  await recordAuditLog({ guildId: guild.id, action, actorId: executorId, targetId, details });
  if (!settings.antiNukeEnabled || !executorId || executorId === guild.client.user?.id || executorId === guild.ownerId) return;
  if (await isTrustedUser(guild.id, executorId)) return;

  const key = `${guild.id}:${executorId}`;
  const previous = activity.get(key);
  const now = Date.now();
  const next = previous && now - previous.lastSeen < 10_000
    ? { count: previous.count + 1, lastSeen: now }
    : { count: 1, lastSeen: now };
  activity.set(key, next);
  if (next.count < settings.antiNukeThreshold) return;

  const member = await guild.members.fetch(executorId).catch(() => null);
  if (member?.bannable) {
    await member.ban({ reason: "SentinelBot anti-nuke protection" }).catch(() => null);
  }
  activity.delete(key);
}

export async function onRoleCreate(role: Role): Promise<void> {
  await guard(role.guild, "role_created", AuditLogEvent.RoleCreate, role.id, `Role ${role.name} was created.`);
}

export async function onRoleDelete(role: Role): Promise<void> {
  await guard(role.guild, "role_deleted", AuditLogEvent.RoleDelete, role.id, `Role ${role.name} was deleted.`);
}

export async function onChannelDelete(channel: GuildChannel): Promise<void> {
  await guard(channel.guild, "channel_deleted", AuditLogEvent.ChannelDelete, channel.id, `Channel ${channel.name} was deleted.`);
}

export async function onRoleUpdate(oldRole: Role, newRole: Role): Promise<void> {
  const settings = await getSecuritySettings(newRole.guild.id);
  if (!settings.roleProtectEnabled) return;
  if (oldRole.permissions.bitfield === newRole.permissions.bitfield && oldRole.name === newRole.name) return;
  const executorId = await latestExecutor(newRole.guild, AuditLogEvent.RoleUpdate);
  if (!executorId || executorId === newRole.guild.client.user?.id || executorId === newRole.guild.ownerId || await isTrustedUser(newRole.guild.id, executorId)) return;
  if (newRole.editable) {
    await newRole.edit({ name: oldRole.name, permissions: oldRole.permissions, color: oldRole.color, hoist: oldRole.hoist, mentionable: oldRole.mentionable, reason: "SentinelBot role protection" }).catch(() => null);
  }
  await recordAuditLog({ guildId: newRole.guild.id, action: "role_change_reverted", actorId: executorId, targetId: newRole.id, details: `Unauthorized change to ${newRole.name} was reverted.` });
}