import type { GuildMember, PartialGuildMember, TextChannel } from "discord.js";
import { goodbyeEmbed } from "../utils/embeds.js";

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember,
): Promise<void> {
  const guild = member.guild;

  let channel: TextChannel | null = guild.systemChannel;

  if (!channel) {
    const fallback = guild.channels.cache.find(
      (c) =>
        c.isTextBased() &&
        !c.isDMBased() &&
        guild.members.me?.permissionsIn(c).has("SendMessages") === true,
    );
    if (fallback && fallback.isTextBased() && !fallback.isDMBased()) {
      channel = fallback as TextChannel;
    }
  }

  if (!channel) return;

  const username = member.user?.username ?? "A member";
  const avatarUrl = member.user?.displayAvatarURL() ?? null;

  const embed = goodbyeEmbed(username, guild.name, avatarUrl);

  await channel.send({ embeds: [embed] }).catch(() => null);
}
