import type { Command, CommandContext } from "../types.js";
import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";

const help: Command = {
  name: "help",
  description: "Show all available commands",
  usage: "!help",
  requiredPermissions: [],

  async execute({ message }: CommandContext) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle("🤖 Bot Commands")
      .setDescription(`Prefix: \`${config.prefix}\``)
      .addFields(
        {
          name: "🔨 Moderation",
          value: [
            `\`!ban @user [reason]\` — Ban a member`,
            `\`!kick @user [reason]\` — Kick a member`,
            `\`!warn @user [reason]\` — Warn a member`,
            `\`!warnings @user\` — View warnings for a member`,
            `\`!clearwarnings @user\` — Clear all warnings (Admin only)`,
            `\`!purge <1-100>\` — Bulk delete messages`,
          ].join("\n"),
        },
        {
          name: "🛡️ Auto-Moderation",
          value: [
            "Auto-mod is always active and handles:",
            "• Banned words / slurs",
            "• Excessive mentions (spam)",
            "• Excessive caps",
            "• Excessive emojis",
            "• Discord invite links",
            "• Duplicate/spam messages",
          ].join("\n"),
        },
        {
          name: "👋 Welcome / Goodbye",
          value: "Automatic welcome and goodbye messages are sent in the system channel when members join or leave.",
        },
      )
      .setTimestamp()
      .setFooter({ text: "Moderator permissions required for most commands" });

    await message.reply({ embeds: [embed] });
  },
};

export default help;
