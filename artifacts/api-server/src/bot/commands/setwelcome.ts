import type { Command, CommandContext } from "../types.js";
import { isAdmin } from "../utils/permissions.js";
import { successEmbed, errorEmbed } from "../utils/embeds.js";
import { db, guildSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { invalidateGuildCache } from "../utils/guildSettings.js";

const setwelcome: Command = {
  name: "setwelcome",
  description: "Set the welcome channel and optional custom message",
  usage: "!setwelcome #channel [message with {user} and {server} placeholders]",
  requiredPermissions: ["ManageGuild"],

  async execute({ message, args }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isAdmin(message.member)) {
      await message.reply({
        embeds: [errorEmbed("Permission Denied", "You need Administrator permissions to use this command.")],
      });
      return;
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      await message.reply({
        embeds: [errorEmbed("Missing Channel", `Usage: \`${setwelcome.usage}\`\n\nExample: \`!setwelcome #welcome Welcome to {server}, {user}!\``)],
      });
      return;
    }

    if (!channel.isTextBased() || channel.isDMBased()) {
      await message.reply({
        embeds: [errorEmbed("Invalid Channel", "Please mention a text channel.")],
      });
      return;
    }

    // Everything after the channel mention is the custom message
    const rawArgs = args.slice(1); // skip the channel mention arg
    const customMessage = rawArgs.join(" ").trim() || null;

    await db
      .insert(guildSettingsTable)
      .values({ guildId: message.guild.id, welcomeChannelId: channel.id, welcomeMessage: customMessage })
      .onConflictDoUpdate({
        target: guildSettingsTable.guildId,
        set: { welcomeChannelId: channel.id, welcomeMessage: customMessage },
      });

    invalidateGuildCache(message.guild.id);

    const desc = customMessage
      ? `Welcome channel set to ${channel}.\n**Custom message:** ${customMessage}\n\n*Placeholders: \`{user}\` = member name, \`{server}\` = server name*`
      : `Welcome channel set to ${channel}.\nThe default welcome embed will be used.`;

    await message.reply({
      embeds: [successEmbed("Welcome Channel Set", desc)],
    });
  },
};

export default setwelcome;
