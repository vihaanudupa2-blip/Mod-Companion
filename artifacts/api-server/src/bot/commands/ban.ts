import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";

const ban: Command = {
  name: "ban",
  description: "Ban a member from the server",
  usage: "!ban @user [reason]",
  requiredPermissions: ["BanMembers"],

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
        embeds: [errorEmbed("Invalid Usage", `Usage: \`${ban.usage}\``)],
      });
      return;
    }

    if (!target.bannable) {
      await message.reply({
        embeds: [errorEmbed("Cannot Ban", "I cannot ban this user. They may have higher permissions than me.")],
      });
      return;
    }

    if (target.id === message.author.id) {
      await message.reply({
        embeds: [errorEmbed("Invalid Target", "You cannot ban yourself.")],
      });
      return;
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.send({
        embeds: [errorEmbed("You've Been Banned", `You were banned from **${message.guild.name}**.\n**Reason:** ${reason}`)],
      }).catch(() => null);

      await target.ban({ reason: `${message.author.tag}: ${reason}` });

      await message.reply({
        embeds: [successEmbed("Member Banned", `**${target.user.tag}** has been banned.\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)],
      });
    } catch {
      await message.reply({
        embeds: [errorEmbed("Ban Failed", "An error occurred while trying to ban this member.")],
      });
    }
  },
};

export default ban;
