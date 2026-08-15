import type { Message, PartialMessage } from "discord.js";
import { getSecuritySettings, recordAuditLog } from "../utils/advancedData.js";

type MessageLike = Message | PartialMessage;

async function sendAudit(message: MessageLike, action: string, details: string): Promise<void> {
  const guild = message.guild;
  if (!guild) return;
  const settings = await getSecuritySettings(guild.id);
  if (!settings.messageLogsEnabled || !settings.messageLogChannelId) return;

  await recordAuditLog({
    guildId: guild.id,
    action,
    actorId: message.author?.id ?? null,
    channelId: message.channelId,
    messageId: message.id,
    details,
  });

  const channel = guild.channels.cache.get(settings.messageLogChannelId);
  if (channel?.isTextBased() && !channel.isDMBased()) {
    await channel.send({
      content: `**${action === "message_deleted" ? "Message deleted" : "Message edited"}** in <#${message.channelId}> by ${message.author ? `<@${message.author.id}>` : "unknown user"}\n${details}`,
    }).catch(() => null);
  }
}

export async function onMessageDelete(message: MessageLike): Promise<void> {
  if (message.author?.bot) return;
  await sendAudit(message, "message_deleted", message.content?.slice(0, 1500) || "Content unavailable");
}

export async function onMessageUpdate(oldMessage: MessageLike, newMessage: MessageLike): Promise<void> {
  if (newMessage.author?.bot || oldMessage.content === newMessage.content) return;
  await sendAudit(newMessage, "message_edited", `Before: ${oldMessage.content?.slice(0, 700) || "Unavailable"}\nAfter: ${newMessage.content?.slice(0, 700) || "Unavailable"}`);
}