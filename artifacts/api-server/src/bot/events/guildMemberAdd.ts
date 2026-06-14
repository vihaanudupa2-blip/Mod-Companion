import type { GuildMember, TextChannel } from "discord.js";
import { welcomeEmbed } from "../utils/embeds.js";
import { getGuildSettings } from "../utils/guildSettings.js";

function interpolate(template: string, username: string, serverName: string): string {
  return template
    .replace(/\{user\}/gi, username)
    .replace(/\{server\}/gi, serverName);
}

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  const guild = member.guild;
  const settings = await getGuildSettings(guild.id);

  if (!settings.welcomeEnabled) return;

  let channel: TextChannel | null = null;

  // Use configured welcome channel if set
  if (settings.welcomeChannelId) {
    const ch = guild.channels.cache.get(settings.welcomeChannelId);
    if (ch?.isTextBased() && !ch.isDMBased()) {
      channel = ch as TextChannel;
    }
  }

  // Fall back to system channel
  if (!channel) channel = guild.systemChannel;

  // Fall back to any sendable text channel
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

  const username = member.user.username;
  const avatarUrl = member.user.displayAvatarURL();

  // Use custom message or default embed
  if (settings.welcomeMessage?.trim()) {
    const text = interpolate(settings.welcomeMessage, username, guild.name);
    await channel.send(text).catch(() => null);
  } else {
    const embed = welcomeEmbed(username, guild.name, avatarUrl);
    await channel.send({ embeds: [embed] }).catch(() => null);
  }
}
