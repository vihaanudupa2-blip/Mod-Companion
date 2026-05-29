import { EmbedBuilder } from "discord.js";
import type { Command, CommandContext } from "../types.js";
import { isAdmin } from "../utils/permissions.js";
import { successEmbed, errorEmbed, infoEmbed } from "../utils/embeds.js";
import { config } from "../config.js";

const reactionrole: Command = {
  name: "reactionrole",
  description: "Set up reaction roles",
  usage: "!reactionrole create | !reactionrole add <emoji> @role <messageId> | !reactionrole list | !reactionrole remove <messageId> <emoji>",
  requiredPermissions: ["Administrator"],

  async execute({ message, args }: CommandContext) {
    if (!message.guild || !message.member) return;

    if (!isAdmin(message.member)) {
      await message.reply({
        embeds: [errorEmbed("Permission Denied", "You need administrator permissions to manage reaction roles.")],
      });
      return;
    }

    const sub = args[0]?.toLowerCase();

    // !reactionrole create — posts a reaction role panel in the current channel
    if (sub === "create") {
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle("🎭 Reaction Roles")
        .setDescription("React to this message to receive a role!\n\nAn admin needs to add roles using:\n`!reactionrole add <emoji> @role <messageId>`")
        .setFooter({ text: "React below to get your role" })
        .setTimestamp();

      if (!message.channel.isTextBased() || message.channel.isDMBased()) {
        await message.reply({ embeds: [errorEmbed("Invalid Channel", "This command can only be used in server text channels.")] });
        return;
      }
      const panel = await message.channel.send({ embeds: [embed] });

      await message.reply({
        embeds: [successEmbed("Panel Created", `Reaction role panel created!\nMessage ID: \`${panel.id}\`\n\nNow add roles with:\n\`!reactionrole add 🎮 @Gamer ${panel.id}\``)],
      });
      return;
    }

    // !reactionrole add <emoji> @role <messageId>
    if (sub === "add") {
      const emoji = args[1];
      const role = message.mentions.roles.first();
      const messageId = args[3];

      if (!emoji || !role || !messageId) {
        await message.reply({
          embeds: [errorEmbed("Invalid Usage", "Usage: `!reactionrole add <emoji> @role <messageId>`")],
        });
        return;
      }

      // Try to fetch the target message to validate it and add the reaction
      let targetMsg;
      try {
        targetMsg = await message.channel.messages.fetch(messageId);
      } catch {
        await message.reply({
          embeds: [errorEmbed("Message Not Found", "Could not find that message in this channel. Make sure the message ID is correct and is in this channel.")],
        });
        return;
      }

      // Add the reaction to the panel message
      await targetMsg.react(emoji).catch(() => null);

      // Store the mapping
      message.client.botState.reactionRoles.push({
        messageId,
        channelId: message.channel.id,
        guildId: message.guild.id,
        emoji,
        roleId: role.id,
      });

      await message.reply({
        embeds: [successEmbed("Reaction Role Added", `Reacting with ${emoji} on message \`${messageId}\` will now give the **${role.name}** role.`)],
      });
      return;
    }

    // !reactionrole list
    if (sub === "list") {
      const entries = message.client.botState.reactionRoles.filter(
        (r) => r.guildId === message.guild!.id,
      );

      if (entries.length === 0) {
        await message.reply({
          embeds: [infoEmbed("No Reaction Roles", "No reaction roles are set up yet. Use `!reactionrole create` to get started.")],
        });
        return;
      }

      const lines = entries.map((r) => {
        const role = message.guild!.roles.cache.get(r.roleId);
        return `${r.emoji} → **${role?.name ?? "Unknown Role"}** (msg: \`${r.messageId}\`)`;
      });

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle("🎭 Reaction Roles")
            .setDescription(lines.join("\n"))
            .setTimestamp(),
        ],
      });
      return;
    }

    // !reactionrole remove <messageId> <emoji>
    if (sub === "remove") {
      const messageId = args[1];
      const emoji = args[2];

      if (!messageId || !emoji) {
        await message.reply({
          embeds: [errorEmbed("Invalid Usage", "Usage: `!reactionrole remove <messageId> <emoji>`")],
        });
        return;
      }

      const before = message.client.botState.reactionRoles.length;
      message.client.botState.reactionRoles = message.client.botState.reactionRoles.filter(
        (r) => !(r.messageId === messageId && r.emoji === emoji && r.guildId === message.guild!.id),
      );

      if (message.client.botState.reactionRoles.length === before) {
        await message.reply({
          embeds: [errorEmbed("Not Found", "No reaction role found with that message ID and emoji.")],
        });
        return;
      }

      await message.reply({
        embeds: [successEmbed("Removed", `Reaction role for ${emoji} on message \`${messageId}\` has been removed.`)],
      });
      return;
    }

    // Default: show help
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.info)
          .setTitle("🎭 Reaction Role Commands")
          .addFields(
            { name: "Create a panel", value: "`!reactionrole create`" },
            { name: "Add a role", value: "`!reactionrole add <emoji> @role <messageId>`" },
            { name: "List all roles", value: "`!reactionrole list`" },
            { name: "Remove a role", value: "`!reactionrole remove <messageId> <emoji>`" },
          )
          .setTimestamp(),
      ],
    });
  },
};

export default reactionrole;
