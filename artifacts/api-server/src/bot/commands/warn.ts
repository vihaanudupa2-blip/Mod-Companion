import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed, warningEmbed } from "../utils/embeds.js";

const warn: Command = {
  name: "warn",
  description: "Warn a member",
  usage: "!warn @user [reason]",
  requiredPermissions: ["ManageMessages"],

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
        embeds: [errorEmbed("Invalid Usage", `Usage: \`${warn.usage}\``)],
      });
      return;
    }

    if (target.id === message.author.id) {
      await message.reply({
        embeds: [errorEmbed("Invalid Target", "You cannot warn yourself.")],
      });
      return;
    }

    const reason = args.slice(1).join(" ") || "No reason provided";
    const guildWarnings = message.client.botState.warnings;
    const key = `${message.guild.id}-${target.id}`;

    if (!guildWarnings.has(key)) {
      guildWarnings.set(key, []);
    }

    const userWarnings = guildWarnings.get(key)!;
    userWarnings.push({
      userId: target.id,
      guildId: message.guild.id,
      reason,
      moderatorId: message.author.id,
      timestamp: new Date(),
    });

    await target.send({
      embeds: [warningEmbed("Warning Received", `You received a warning in **${message.guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${userWarnings.length}`)],
    }).catch(() => null);

    await message.reply({
      embeds: [successEmbed("Member Warned", `**${target.user.tag}** has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${userWarnings.length}\n**Moderator:** ${message.author.tag}`)],
    });
  },
};

export default warn;
