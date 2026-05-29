import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";

const kick: Command = {
  name: "kick",
  description: "Kick a member from the server",
  usage: "!kick @user [reason]",
  requiredPermissions: ["KickMembers"],

  async execute({ message, args }: CommandContext) {
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
        embeds: [errorEmbed("Invalid Usage", `Usage: \`${kick.usage}\``)],
      });
      return;
    }

    if (!target.kickable) {
      await message.reply({
        embeds: [errorEmbed("Cannot Kick", "I cannot kick this user. They may have higher permissions than me.")],
      });
      return;
    }

    if (target.id === message.author.id) {
      await message.reply({
        embeds: [errorEmbed("Invalid Target", "You cannot kick yourself.")],
      });
      return;
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.send({
        embeds: [errorEmbed("You've Been Kicked", `You were kicked from **${message.guild.name}**.\n**Reason:** ${reason}`)],
      }).catch(() => null);

      await target.kick(`${message.author.tag}: ${reason}`);

      await message.reply({
        embeds: [successEmbed("Member Kicked", `**${target.user.tag}** has been kicked.\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)],
      });
    } catch {
      await message.reply({
        embeds: [errorEmbed("Kick Failed", "An error occurred while trying to kick this member.")],
      });
    }
  },
};

export default kick;
