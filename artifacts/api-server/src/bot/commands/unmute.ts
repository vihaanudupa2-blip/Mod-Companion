import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";

const unmute: Command = {
  name: "unmute",
  description: "Remove timeout (unmute) from a member",
  usage: "!unmute @user",
  requiredPermissions: ["ModerateMembers"],

  async execute({ message }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isModerator(message.member)) {
      await message.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions to use this command.")] });
      return;
    }

    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply({ embeds: [errorEmbed("Invalid Usage", `Usage: \`${unmute.usage}\``)] });
      return;
    }

    if (!target.isCommunicationDisabled()) {
      await message.reply({ embeds: [errorEmbed("Not Muted", `**${target.user.tag}** is not currently timed out.`)] });
      return;
    }

    try {
      await target.timeout(null, `Unmuted by ${message.author.tag}`);

      await message.reply({
        embeds: [successEmbed("Member Unmuted", `**${target.user.tag}**'s timeout has been removed.\n**Moderator:** ${message.author.tag}`)],
      });
    } catch {
      await message.reply({ embeds: [errorEmbed("Unmute Failed", "An error occurred while trying to remove the timeout.")] });
    }
  },
};

export default unmute;
