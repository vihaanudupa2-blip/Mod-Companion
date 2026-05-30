import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";
import type { TextChannel } from "discord.js";

const slowmode: Command = {
  name: "slowmode",
  description: "Set slowmode on the current channel (0 to disable)",
  usage: "!slowmode <seconds 0-21600>",
  requiredPermissions: ["ManageChannels"],

  async execute({ message, args }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isModerator(message.member)) {
      await message.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions to use this command.")] });
      return;
    }

    const seconds = parseInt(args[0] ?? "");
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      await message.reply({ embeds: [errorEmbed("Invalid Amount", "Please provide a number between 0 and 21600 seconds (6 hours). Use 0 to disable.")] });
      return;
    }

    if (!message.channel.isTextBased() || message.channel.isDMBased()) {
      await message.reply({ embeds: [errorEmbed("Invalid Channel", "This command can only be used in server text channels.")] });
      return;
    }

    try {
      const channel = message.channel as TextChannel;
      await channel.setRateLimitPerUser(seconds, `Set by ${message.author.tag}`);

      if (seconds === 0) {
        await message.reply({ embeds: [successEmbed("Slowmode Disabled", `Slowmode has been turned off in <#${channel.id}>.`)] });
      } else {
        const display = seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.floor(seconds / 60)}m` : `${Math.floor(seconds / 3600)}h`;
        await message.reply({ embeds: [successEmbed("Slowmode Set", `Slowmode in <#${channel.id}> set to **${display}**.\n**Moderator:** ${message.author.tag}`)] });
      }
    } catch {
      await message.reply({ embeds: [errorEmbed("Failed", "Could not set slowmode. Make sure I have the Manage Channels permission.")] });
    }
  },
};

export default slowmode;
