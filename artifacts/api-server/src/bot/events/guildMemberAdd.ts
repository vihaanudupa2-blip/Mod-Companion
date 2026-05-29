import type { GuildMember, TextChannel } from "discord.js";
import { welcomeEmbed } from "../utils/embeds.js";

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
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

  const embed = welcomeEmbed(
    member.user.username,
    guild.name,
    member.user.displayAvatarURL(),
  );

  await channel.send({ embeds: [embed] }).catch(() => null);
}
