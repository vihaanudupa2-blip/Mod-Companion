import { EmbedBuilder } from "discord.js";
import type { Command, CommandContext } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import { config } from "../config.js";

const userinfo: Command = {
  name: "userinfo",
  description: "Show information about a member",
  usage: "!userinfo [@user]",
  requiredPermissions: [],

  async execute({ message }: CommandContext) {
    if (!message.guild || !message.member) return;

    const target = message.mentions.members?.first() ?? message.member;
    const user = target.user;

    const joinedAt = target.joinedAt;
    const createdAt = user.createdAt;
    const key = `${message.guild.id}-${user.id}`;
    const warnCount = message.client.botState.warnings.get(key)?.length ?? 0;

    const roles = target.roles.cache
      .filter(r => r.id !== message.guild!.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .slice(0, 10);

    const isMuted = target.isCommunicationDisabled();

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "User ID", value: user.id, inline: true },
        { name: "Nickname", value: target.nickname ?? "None", inline: true },
        { name: "Bot?", value: user.bot ? "Yes" : "No", inline: true },
        { name: "Account Created", value: `<t:${Math.floor(createdAt.getTime() / 1000)}:D> (<t:${Math.floor(createdAt.getTime() / 1000)}:R>)`, inline: false },
        { name: "Joined Server", value: joinedAt ? `<t:${Math.floor(joinedAt.getTime() / 1000)}:D> (<t:${Math.floor(joinedAt.getTime() / 1000)}:R>)` : "Unknown", inline: false },
        { name: `Roles (${roles.length})`, value: roles.length > 0 ? roles.join(" ") : "None", inline: false },
        { name: "Warnings", value: `${warnCount}`, inline: true },
        { name: "Status", value: isMuted ? "🔇 Muted" : "✅ Active", inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });
  },
};

export default userinfo;
