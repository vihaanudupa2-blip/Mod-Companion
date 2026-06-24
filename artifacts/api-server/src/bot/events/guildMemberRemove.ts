import type { GuildMember, PartialGuildMember, TextChannel } from "discord.js";
import { goodbyeEmbed } from "../utils/embeds.js";
import { getGuildSettings } from "../utils/guildSettings.js";

function interpolate(template: string, username: string, serverName: string): string {
  return template
    .replace(/\{user\}/gi, username)
    .replace(/\{server\}/gi, serverName);
}

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember,
): Promise<void> {
  const guild = member.guild;
  const settings = await getGuildSettings(guild.id);

  if (!settings.goodbyeEnabled) return;

  let channel: TextChannel | null = null;

  // Use dedicated goodbye channel, fall back to welcome channel
  const channelId = settings.goodbyeChannelId ?? settings.welcomeChannelId;
  if (channelId) {
    const ch = guild.channels.cache.get(channelId);
    if (ch?.isTextBased() && !ch.isDMBased()) {
      channel = ch as TextChannel;
    }
  }

  if (!channel) channel = guild.systemChannel;

  if (!channel) {
    const fallback = guild.channels.cache.find(
      (c) =>
        c.isTextBased() &&
        !c.isDMBased() &&
        guild.members.me?.permissionsIn(c).has("SendMessages") === true,
    );
    if (fallback?.isTextBased() && !fallback.isDMBased()) {
      channel = fallback as TextChannel;
    }
  }

  if (!channel) return;

  const username = member.user?.username ?? "A member";
  const avatarUrl = member.user?.displayAvatarURL() ?? null;

  if (settings.goodbyeMessage?.trim()) {
    const text = interpolate(settings.goodbyeMessage, username, guild.name);
    await channel.send(text).catch(() => null);
  } else {
    const embed = goodbyeEmbed(username, guild.name, avatarUrl);
    await channel.send({ embeds: [embed] }).catch(() => null);
  }
}
