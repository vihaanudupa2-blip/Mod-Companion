import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";

const mute: Command = {
  name: "mute",
  description: "Timeout (mute) a member",
  usage: "!mute @user [minutes] [reason]",
  requiredPermissions: ["ModerateMembers"],

  async execute({ message, args }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isModerator(message.member)) {
      await message.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions to use this command.")] });
      return;
    }

    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply({ embeds: [errorEmbed("Invalid Usage", `Usage: \`${mute.usage}\``)] });
      return;
    }

    if (target.id === message.author.id) {
      await message.reply({ embeds: [errorEmbed("Invalid Target", "You cannot mute yourself.")] });
      return;
    }

    if (!target.moderatable) {
      await message.reply({ embeds: [errorEmbed("Cannot Mute", "I cannot timeout this user. They may have higher permissions than me.")] });
      return;
    }

    const minutesRaw = args[1];
    const minutes = minutesRaw && !isNaN(Number(minutesRaw)) ? Math.min(Math.max(parseInt(minutesRaw), 1), 40320) : 10;
    const reason = args.slice(minutesRaw && !isNaN(Number(minutesRaw)) ? 2 : 1).join(" ") || "No reason provided";

    try {
      await target.timeout(minutes * 60 * 1000, `${message.author.tag}: ${reason}`);

      await target.send({
        embeds: [errorEmbed("You've Been Muted", `You were timed out in **${message.guild.name}** for **${minutes} minute(s)**.\n**Reason:** ${reason}`)],
      }).catch(() => null);

      await message.reply({
        embeds: [successEmbed("Member Muted", `**${target.user.tag}** has been timed out for **${minutes} minute(s)**.\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)],
      });
    } catch {
      await message.reply({ embeds: [errorEmbed("Mute Failed", "An error occurred while trying to timeout this member.")] });
    }
  },
};

export default mute;
