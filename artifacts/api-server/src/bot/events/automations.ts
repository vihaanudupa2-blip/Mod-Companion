import type { Message, TextChannel } from "discord.js";
import { and, eq } from "drizzle-orm";
import { autoResponsesTable, db, stickyMessagesTable } from "@workspace/db";

function interpolate(template: string, username: string, serverName: string): string {
  return template
    .replace(/\{user\}/gi, username)
    .replace(/\{server\}/gi, serverName);
}

export async function handleAutomations(message: Message): Promise<void> {
  if (!message.guild || message.author.bot || !message.channel.isTextBased() || message.channel.isDMBased()) return;

  const channel = message.channel as TextChannel;
  const content = message.content.toLowerCase();
  const responses = await db
    .select()
    .from(autoResponsesTable)
    .where(and(eq(autoResponsesTable.guildId, message.guild.id), eq(autoResponsesTable.enabled, true)));

  const response = responses.find((entry) => content.includes(entry.trigger.toLowerCase()));
  if (response) {
    await channel.send(interpolate(response.response, message.author.username, message.guild.name)).catch(() => null);
  }

  const [sticky] = await db
    .select()
    .from(stickyMessagesTable)
    .where(and(
      eq(stickyMessagesTable.guildId, message.guild.id),
      eq(stickyMessagesTable.channelId, channel.id),
      eq(stickyMessagesTable.active, true),
    ));
  if (!sticky) return;

  if (sticky.messageId && sticky.messageId !== message.id) {
    await channel.messages.fetch(sticky.messageId).then((old) => old.delete()).catch(() => null);
  }
  const posted = await channel.send(sticky.content).catch(() => null);
  if (posted) {
    await db.update(stickyMessagesTable)
      .set({ messageId: posted.id, updatedAt: new Date() })
      .where(eq(stickyMessagesTable.id, sticky.id));
  }
}