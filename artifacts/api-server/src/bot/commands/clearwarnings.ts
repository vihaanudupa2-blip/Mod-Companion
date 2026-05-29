import type { Command, CommandContext } from "../types.js";
import { isAdmin } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";

const clearwarnings: Command = {
  name: "clearwarnings",
  description: "Clear all warnings for a member",
  usage: "!clearwarnings @user",
  requiredPermissions: ["Administrator"],

  async execute({ message }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isAdmin(message.member)) {
      await message.reply({
        embeds: [errorEmbed("Permission Denied", "You need administrator permissions to use this command.")],
      });
      return;
    }

    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply({
        embeds: [errorEmbed("Invalid Usage", `Usage: \`${clearwarnings.usage}\``)],
      });
      return;
    }

    const key = `${message.guild.id}-${target.id}`;
    message.client.botState.warnings.delete(key);

    await message.reply({
      embeds: [successEmbed("Warnings Cleared", `All warnings for **${target.user.tag}** have been cleared.`)],
    });
  },
};

export default clearwarnings;
