import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { infoEmbed, errorEmbed } from "../utils/embeds.js";
import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";

const warnings: Command = {
  name: "warnings",
  description: "View warnings for a member",
  usage: "!warnings @user",
  requiredPermissions: ["ManageMessages"],

  async execute({ message }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isModerator(message.member)) {
      await message.reply({
        embeds: [errorEmbed("Permission Denied", "You need moderator permissions to use this command.")],
      });
      return;
    }

    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply({
        embeds: [errorEmbed("Invalid Usage", `Usage: \`${warnings.usage}\``)],
      });
      return;
    }

    const key = `${message.guild.id}-${target.id}`;
    const userWarnings = message.client.botState.warnings.get(key) ?? [];

    if (userWarnings.length === 0) {
      await message.reply({
        embeds: [infoEmbed("No Warnings", `**${target.user.tag}** has no warnings.`)],
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle(`⚠️ Warnings for ${target.user.tag}`)
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    const lines = userWarnings.slice(-10).map((w, i) => {
      const mod = message.guild!.members.cache.get(w.moderatorId);
      const modTag = mod?.user.tag ?? "Unknown Moderator";
      return `**${i + 1}.** ${w.reason}\n> By ${modTag} • <t:${Math.floor(w.timestamp.getTime() / 1000)}:R>`;
    });

    embed.setDescription(lines.join("\n\n"));
    embed.setFooter({ text: `Total warnings: ${userWarnings.length}` });

    await message.reply({ embeds: [embed] });
  },
};

export default warnings;
