import type { Client, TextChannel } from "discord.js";
import { and, eq, lte } from "drizzle-orm";
import {
  db,
  scheduledAnnouncementsTable,
  securitySettingsTable,
} from "@workspace/db";

let started = false;

async function processAnnouncements(client: Client): Promise<void> {
  const due = await db
    .select()
    .from(scheduledAnnouncementsTable)
    .where(and(
      eq(scheduledAnnouncementsTable.active, true),
      lte(scheduledAnnouncementsTable.sendAt, new Date()),
    ));

  for (const entry of due) {
    const guild = client.guilds.cache.get(entry.guildId);
    const channel = guild?.channels.cache.get(entry.channelId);
    if (channel?.isTextBased() && !channel.isDMBased()) {
      await channel.send(entry.message).catch(() => null);
    }

    if (entry.repeatMinutes) {
      await db.update(scheduledAnnouncementsTable)
        .set({ sendAt: new Date(Date.now() + entry.repeatMinutes * 60_000) })
        .where(eq(scheduledAnnouncementsTable.id, entry.id));
    } else {
      await db.update(scheduledAnnouncementsTable)
        .set({ active: false })
        .where(eq(scheduledAnnouncementsTable.id, entry.id));
    }
  }
}

async function processCleanup(client: Client): Promise<void> {
  const configured = await db
    .select()
    .from(securitySettingsTable)
    .where(eq(securitySettingsTable.cleanupEnabled, true));

  for (const settings of configured) {
    if (!settings.cleanupChannelId) continue;
    const guild = client.guilds.cache.get(settings.guildId);
    const channel = guild?.channels.cache.get(settings.cleanupChannelId);
    if (!channel?.isTextBased() || channel.isDMBased()) continue;
    const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
    if (!messages) continue;
    const cutoff = Date.now() - settings.cleanupAfterMinutes * 60_000;
    const old = messages.filter((message) => message.createdTimestamp < cutoff);
    if (old.size > 0) await (channel as TextChannel).bulkDelete(old, true).catch(() => null);
  }
}

export function runScheduledTasks(client: Client): void {
  if (started) return;
  started = true;
  const tick = () => {
    processAnnouncements(client).catch(() => null);
    processCleanup(client).catch(() => null);
  };
  tick();
  setInterval(tick, 30_000);
}