import type { Command, CommandContext } from "../types.js";
import { isModerator } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";
import type { TextChannel } from "discord.js";

const purge: Command = {
  name: "purge",
  description: "Delete a number of messages from the channel",
  usage: "!purge <amount 1-100>",
  requiredPermissions: ["ManageMessages"],

  async execute({ message, args }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isModerator(message.member)) {
      await message.reply({
        embeds: [errorEmbed("Permission Denied", "You need moderator permissions to use this command.")],
      });
      return;
    }

    const amount = parseInt(args[0] ?? "");
    if (isNaN(amount) || amount < 1 || amount > 100) {
      await message.reply({
        embeds: [errorEmbed("Invalid Amount", "Please provide a number between 1 and 100.")],
      });
      return;
    }

    try {
      if (!message.channel.isTextBased() || message.channel.isDMBased()) {
        await message.reply({ embeds: [errorEmbed("Invalid Channel", "This command can only be used in server text channels.")] });
        return;
      }
      const channel = message.channel as TextChannel;
      const deleted = await channel.bulkDelete(amount + 1, true);
      const reply = await message.channel.send({
        embeds: [successEmbed("Messages Purged", `Deleted **${deleted.size - 1}** messages.`)],
      });
      setTimeout(() => reply.delete().catch(() => null), 4000);
    } catch {
      await message.reply({
        embeds: [errorEmbed("Purge Failed", "Could not delete messages. Messages older than 14 days cannot be bulk deleted.")],
      });
    }
  },
};

export default purge;
