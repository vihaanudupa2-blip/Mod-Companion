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
      .setTitle("🤖 SentinelBot Commands")
      .setDescription(`Prefix: \`${config.prefix}\``)
      .addFields(
        {
          name: "🔨 Moderation",
          value: [
            `\`!ban @user [reason]\` — Ban a member`,
            `\`!kick @user [reason]\` — Kick a member`,
            `\`!mute @user [minutes] [reason]\` — Timeout a member`,
            `\`!unmute @user\` — Remove a timeout`,
            `\`!warn @user [reason]\` — Warn a member`,
            `\`!warnings @user\` — View warnings for a member`,
            `\`!clearwarnings @user\` — Clear all warnings (Admin only)`,
            `\`!purge <1-100>\` — Bulk delete messages`,
            `\`!slowmode <0-21600>\` — Set channel slowmode (0 = off)`,
          ].join("\n"),
        },
        {
          name: "🔍 Info",
          value: [
            `\`!userinfo [@user]\` — Show info about a member`,
          ].join("\n"),
        },
        {
          name: "🎭 Reaction Roles",
          value: [
            `\`!reactionrole create\` — Post a reaction role panel`,
            `\`!reactionrole add <emoji> @role <msgId>\` — Link emoji to role`,
            `\`!reactionrole list\` — Show all reaction roles`,
            `\`!reactionrole remove <msgId> <emoji>\` — Remove a mapping`,
          ].join("\n"),
        },
        {
          name: "🛡️ Auto-Moderation",
          value: [
            "Auto-mod handles:",
            "• Banned words/slurs",
            "• Excessive mentions",
            "• Excessive caps",
            "• Excessive emojis",
            "• Discord invite links",
            "• Duplicate/spam messages",
          ].join("\n"),
        },
        {
          name: "😄 Auto-Reactions",
          value: "Reacts to messages with keywords like `gm`, `gg`, `hype`, `lol`, `birthday`, and more!",
        },
        {
          name: "👋 Welcome / Goodbye",
          value: "Automatic messages when members join or leave. Customize text in the Dashboard.",
        },
      )
      .setTimestamp()
      .setFooter({ text: "Moderator permissions required for most commands" });

    await message.reply({ embeds: [embed] });
  },
};

export default help;
