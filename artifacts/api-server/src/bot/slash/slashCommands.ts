import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  GuildMember,
} from "discord.js";
import { successEmbed, errorEmbed, infoEmbed } from "../utils/embeds.js";
import { isModerator, isAdmin } from "../utils/permissions.js";
import { config } from "../config.js";
import { db, guildSettingsTable } from "@workspace/db";
import { invalidateGuildCache } from "../utils/guildSettings.js";

export interface SlashCommand {
  data: Pick<SlashCommandBuilder, "name" | "description" | "toJSON">;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

// ─── /ban ─────────────────────────────────────────────────────────────────────
const banCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Permanently ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to ban").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the ban")
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const target = interaction.options.getMember("user") as GuildMember | null;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      await interaction.reply({ embeds: [errorEmbed("Not Found", "That member was not found in this server.")], ephemeral: true });
      return;
    }
    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed("Invalid Target", "You cannot ban yourself.")], ephemeral: true });
      return;
    }
    if (!target.bannable) {
      await interaction.reply({ embeds: [errorEmbed("Cannot Ban", "I cannot ban this user — they may have higher permissions than me.")], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    await target.send({ embeds: [errorEmbed("You've Been Banned", `You were banned from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => null);
    await target.ban({ reason: `${interaction.user.tag}: ${reason}` });
    await interaction.editReply({ embeds: [successEmbed("Member Banned", `**${target.user.tag}** has been banned.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)] });
  },
};

// ─── /kick ────────────────────────────────────────────────────────────────────
const kickCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to kick").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the kick")
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const target = interaction.options.getMember("user") as GuildMember | null;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      await interaction.reply({ embeds: [errorEmbed("Not Found", "That member was not found.")], ephemeral: true });
      return;
    }
    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed("Invalid Target", "You cannot kick yourself.")], ephemeral: true });
      return;
    }
    if (!target.kickable) {
      await interaction.reply({ embeds: [errorEmbed("Cannot Kick", "I cannot kick this user.")], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    await target.send({ embeds: [errorEmbed("You've Been Kicked", `You were kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => null);
    await target.kick(`${interaction.user.tag}: ${reason}`);
    await interaction.editReply({ embeds: [successEmbed("Member Kicked", `**${target.user.tag}** has been kicked.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)] });
  },
};

// ─── /mute ────────────────────────────────────────────────────────────────────
const muteCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to mute").setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName("minutes").setDescription("Duration in minutes (default: 10, max: 40320)").setMinValue(1).setMaxValue(40320)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the mute")
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const target = interaction.options.getMember("user") as GuildMember | null;
    const minutes = interaction.options.getInteger("minutes") ?? 10;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      await interaction.reply({ embeds: [errorEmbed("Not Found", "That member was not found.")], ephemeral: true });
      return;
    }
    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed("Invalid Target", "You cannot mute yourself.")], ephemeral: true });
      return;
    }
    if (!target.moderatable) {
      await interaction.reply({ embeds: [errorEmbed("Cannot Mute", "I cannot timeout this user.")], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    await target.timeout(minutes * 60 * 1000, `${interaction.user.tag}: ${reason}`);
    await target.send({ embeds: [errorEmbed("You've Been Muted", `You were timed out in **${interaction.guild.name}** for **${minutes} minute(s)**.\n**Reason:** ${reason}`)] }).catch(() => null);
    await interaction.editReply({ embeds: [successEmbed("Member Muted", `**${target.user.tag}** has been timed out for **${minutes} minute(s)**.\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)] });
  },
};

// ─── /unmute ──────────────────────────────────────────────────────────────────
const unmuteCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove a timeout (unmute) from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to unmute").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const target = interaction.options.getMember("user") as GuildMember | null;
    if (!target) {
      await interaction.reply({ embeds: [errorEmbed("Not Found", "That member was not found.")], ephemeral: true });
      return;
    }
    if (!target.isCommunicationDisabled()) {
      await interaction.reply({ embeds: [errorEmbed("Not Muted", `**${target.user.tag}** is not currently timed out.`)], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    await target.timeout(null, `Unmuted by ${interaction.user.tag}`);
    await interaction.editReply({ embeds: [successEmbed("Member Unmuted", `**${target.user.tag}**'s timeout has been removed.\n**Moderator:** ${interaction.user.tag}`)] });
  },
};

// ─── /warn ────────────────────────────────────────────────────────────────────
const warnCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue a warning to a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to warn").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the warning").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed("Invalid Target", "You cannot warn yourself.")], ephemeral: true });
      return;
    }

    const key = `${interaction.guild.id}-${target.id}`;
    const warnings = interaction.client.botState.warnings;
    if (!warnings.has(key)) warnings.set(key, []);
    warnings.get(key)!.push({
      userId: target.id,
      guildId: interaction.guild.id,
      reason,
      moderatorId: interaction.user.id,
      timestamp: new Date(),
    });

    const count = warnings.get(key)!.length;
    await target.send({ embeds: [errorEmbed("Warning Received", `You received a warning in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${count}`)] }).catch(() => null);
    await interaction.reply({ embeds: [successEmbed("Warning Issued", `**${target.tag}** has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${count}\n**Moderator:** ${interaction.user.tag}`)] });
  },
};

// ─── /warnings ────────────────────────────────────────────────────────────────
const warningsCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to check").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("user", true);
    const key = `${interaction.guild.id}-${target.id}`;
    const list = interaction.client.botState.warnings.get(key) ?? [];

    if (list.length === 0) {
      await interaction.reply({ embeds: [infoEmbed("No Warnings", `**${target.tag}** has no warnings on record.`)] });
      return;
    }

    const lines = list.map((w, i) =>
      `**${i + 1}.** ${w.reason} — <t:${Math.floor(w.timestamp.getTime() / 1000)}:R>`
    );
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.warning)
          .setTitle(`⚠️ Warnings for ${target.tag}`)
          .setDescription(lines.join("\n"))
          .setFooter({ text: `${list.length} total warning(s)` })
          .setTimestamp(),
      ],
    });
  },
};

// ─── /clearwarnings ───────────────────────────────────────────────────────────
const clearwarningsCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings for a member (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to clear").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    if (!isAdmin(interaction.member as GuildMember)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "Only administrators can clear warnings.")], ephemeral: true });
      return;
    }

    const target = interaction.options.getUser("user", true);
    const key = `${interaction.guild.id}-${target.id}`;
    interaction.client.botState.warnings.delete(key);
    await interaction.reply({ embeds: [successEmbed("Warnings Cleared", `All warnings for **${target.tag}** have been cleared.`)] });
  },
};

// ─── /purge ───────────────────────────────────────────────────────────────────
const purgeCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk-delete messages in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((o) =>
      o.setName("amount").setDescription("Number of messages to delete (1–100)").setRequired(true).setMinValue(1).setMaxValue(100)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });
    const deleted = await channel.bulkDelete(amount, true).catch(() => null);
    const count = deleted?.size ?? 0;
    await interaction.editReply({ embeds: [successEmbed("Messages Deleted", `Deleted **${count}** message(s).`)] });
  },
};

// ─── /slowmode ────────────────────────────────────────────────────────────────
const slowmodeCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode on this channel (0 = off, max 21600s = 6h)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addIntegerOption((o) =>
      o.setName("seconds").setDescription("Slowmode delay in seconds (0 to disable)").setRequired(true).setMinValue(0).setMaxValue(21600)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isModerator(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need moderator permissions.")], ephemeral: true });
      return;
    }

    const seconds = interaction.options.getInteger("seconds", true);
    const channel = interaction.channel as TextChannel;

    await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);

    if (seconds === 0) {
      await interaction.reply({ embeds: [successEmbed("Slowmode Disabled", `Slowmode has been turned off in <#${channel.id}>.`)] });
    } else {
      const display = seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.floor(seconds / 60)}m` : `${Math.floor(seconds / 3600)}h`;
      await interaction.reply({ embeds: [successEmbed("Slowmode Set", `Slowmode in <#${channel.id}> set to **${display}**.\n**Moderator:** ${interaction.user.tag}`)] });
    }
  },
};

// ─── /userinfo ────────────────────────────────────────────────────────────────
const userinfoCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about a member")
    .setDMPermission(false)
    .addUserOption((o) =>
      o.setName("user").setDescription("The member to look up (defaults to you)")
    ),

  async execute(interaction) {
    if (!interaction.guild) return;
    const targetMember = (interaction.options.getMember("user") as GuildMember | null) ??
      (interaction.member as GuildMember);
    const user = targetMember.user;
    const key = `${interaction.guild.id}-${user.id}`;
    const warnCount = interaction.client.botState.warnings.get(key)?.length ?? 0;

    const roles = targetMember.roles.cache
      .filter((r) => r.id !== interaction.guild!.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `<@&${r.id}>`)
      .slice(0, 10);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.info)
          .setTitle(`👤 ${user.tag}`)
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .addFields(
            { name: "User ID", value: user.id, inline: true },
            { name: "Nickname", value: targetMember.nickname ?? "None", inline: true },
            { name: "Bot?", value: user.bot ? "Yes" : "No", inline: true },
            { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)` },
            { name: "Joined Server", value: targetMember.joinedTimestamp ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:D> (<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>)` : "Unknown" },
            { name: `Roles (${roles.length})`, value: roles.length > 0 ? roles.join(" ") : "None" },
            { name: "Warnings", value: `${warnCount}`, inline: true },
            { name: "Status", value: targetMember.isCommunicationDisabled() ? "🔇 Muted" : "✅ Active", inline: true },
          )
          .setTimestamp()
          .setFooter({ text: `Requested by ${interaction.user.tag}` }),
      ],
    });
  },
};

// ─── /help ────────────────────────────────────────────────────────────────────
const helpCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.info)
          .setTitle("🤖 SentinelBot Commands")
          .setDescription("All commands are available as both `/slash` and `!prefix` commands.")
          .addFields(
            {
              name: "🔨 Moderation",
              value: "`/ban` `/kick` `/mute` `/unmute` `/warn` `/warnings` `/clearwarnings` `/purge` `/slowmode`",
            },
            {
              name: "🔍 Info",
              value: "`/userinfo` `/help`",
            },
            {
              name: "🎭 Reaction Roles",
              value: "`/reactionrole create` `/reactionrole add` `/reactionrole list` `/reactionrole remove`",
            },
            {
              name: "🛡️ Auto-Moderation",
              value: "Runs automatically — bad words, invite links, spam, duplicate messages, excess mentions/caps/emojis.",
            },
            {
              name: "👋 Welcome / Goodbye",
              value: "Automatic messages on join/leave. Customize in the Dashboard.",
            },
          )
          .setTimestamp()
          .setFooter({ text: "Moderator permissions required for most commands" }),
      ],
      ephemeral: true,
    });
  },
};

// ─── /reactionrole ────────────────────────────────────────────────────────────
const reactionroleCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Manage reaction roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub.setName("create").setDescription("Post a reaction role panel in this channel")
    )
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Link an emoji to a role on a panel message")
        .addStringOption((o) => o.setName("emoji").setDescription("The emoji to react with").setRequired(true))
        .addRoleOption((o) => o.setName("role").setDescription("The role to assign").setRequired(true))
        .addStringOption((o) => o.setName("message_id").setDescription("The panel message ID").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List all reaction roles for this server")
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a reaction role mapping")
        .addStringOption((o) => o.setName("message_id").setDescription("The panel message ID").setRequired(true))
        .addStringOption((o) => o.setName("emoji").setDescription("The emoji to remove").setRequired(true))
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    if (!isAdmin(interaction.member as GuildMember)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "Administrator permissions required.")], ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "create") {
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle("🎭 Reaction Roles")
        .setDescription("React to this message to receive a role!\n\nAn admin needs to add roles using:\n`/reactionrole add`")
        .setFooter({ text: "React below to get your role" })
        .setTimestamp();

      const channel = interaction.channel as TextChannel;
      const panel = await channel.send({ embeds: [embed] });
      await interaction.reply({ embeds: [successEmbed("Panel Created", `Reaction role panel created!\nMessage ID: \`${panel.id}\`\n\nNow add roles with:\n\`/reactionrole add 🎮 @Gamer ${panel.id}\``)], ephemeral: true });
      return;
    }

    if (sub === "add") {
      const emoji = interaction.options.getString("emoji", true);
      const role = interaction.options.getRole("role", true);
      const messageId = interaction.options.getString("message_id", true);

      const channel = interaction.channel as TextChannel;
      let targetMsg;
      try {
        targetMsg = await channel.messages.fetch(messageId);
      } catch {
        await interaction.reply({ embeds: [errorEmbed("Message Not Found", "Could not find that message in this channel.")], ephemeral: true });
        return;
      }

      await targetMsg.react(emoji).catch(() => null);
      interaction.client.botState.reactionRoles.push({
        messageId,
        channelId: channel.id,
        guildId: interaction.guild.id,
        emoji,
        roleId: role.id,
      });
      await interaction.reply({ embeds: [successEmbed("Reaction Role Added", `Reacting with ${emoji} on message \`${messageId}\` will now give the **${role.name}** role.`)] });
      return;
    }

    if (sub === "list") {
      const entries = interaction.client.botState.reactionRoles.filter(
        (r) => r.guildId === interaction.guild!.id
      );
      if (entries.length === 0) {
        await interaction.reply({ embeds: [infoEmbed("No Reaction Roles", "No reaction roles set up yet. Use `/reactionrole create` to get started.")], ephemeral: true });
        return;
      }
      const lines = entries.map((r) => {
        const role = interaction.guild!.roles.cache.get(r.roleId);
        return `${r.emoji} → **${role?.name ?? "Unknown Role"}** (msg: \`${r.messageId}\`)`;
      });
      await interaction.reply({
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

    if (sub === "remove") {
      const messageId = interaction.options.getString("message_id", true);
      const emoji = interaction.options.getString("emoji", true);

      const before = interaction.client.botState.reactionRoles.length;
      interaction.client.botState.reactionRoles = interaction.client.botState.reactionRoles.filter(
        (r) => !(r.messageId === messageId && r.emoji === emoji && r.guildId === interaction.guild!.id)
      );

      if (interaction.client.botState.reactionRoles.length === before) {
        await interaction.reply({ embeds: [errorEmbed("Not Found", "No reaction role found with that message ID and emoji.")], ephemeral: true });
        return;
      }
      await interaction.reply({ embeds: [successEmbed("Removed", `Reaction role for ${emoji} on message \`${messageId}\` has been removed.`)] });
      return;
    }
  },
};

// ─── /setwelcome ──────────────────────────────────────────────────────────────
const setwelcomeCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("Set the channel and message for when members join")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addChannelOption((o) =>
      o.setName("channel").setDescription("The channel to send welcome messages in").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("message").setDescription("Custom message ({user} = member name, {server} = server name)")
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isAdmin(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need Administrator permissions.")], ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel("channel", true);
    const customMessage = interaction.options.getString("message") ?? null;

    if (!("send" in channel)) {
      await interaction.reply({ embeds: [errorEmbed("Invalid Channel", "Please choose a text channel.")], ephemeral: true });
      return;
    }

    await db
      .insert(guildSettingsTable)
      .values({ guildId: interaction.guild.id, welcomeChannelId: channel.id, welcomeMessage: customMessage })
      .onConflictDoUpdate({
        target: guildSettingsTable.guildId,
        set: { welcomeChannelId: channel.id, welcomeMessage: customMessage },
      });

    invalidateGuildCache(interaction.guild.id);

    const desc = customMessage
      ? `Welcome channel set to <#${channel.id}>.\n**Custom message:** ${customMessage}\n\n*Placeholders: \`{user}\` = member name, \`{server}\` = server name*`
      : `Welcome channel set to <#${channel.id}>.\nThe default welcome embed will be used.`;

    await interaction.reply({ embeds: [successEmbed("Welcome Channel Set", desc)] });
  },
};

// ─── /setgoodbye ──────────────────────────────────────────────────────────────
const setgoodbyeCmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setgoodbye")
    .setDescription("Set the channel and message for when members leave")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addChannelOption((o) =>
      o.setName("channel").setDescription("The channel to send goodbye messages in").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("message").setDescription("Custom message ({user} = member name, {server} = server name)")
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) return;
    const member = interaction.member as GuildMember;
    if (!isAdmin(member)) {
      await interaction.reply({ embeds: [errorEmbed("Permission Denied", "You need Administrator permissions.")], ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel("channel", true);
    const customMessage = interaction.options.getString("message") ?? null;

    if (!("send" in channel)) {
      await interaction.reply({ embeds: [errorEmbed("Invalid Channel", "Please choose a text channel.")], ephemeral: true });
      return;
    }

    await db
      .insert(guildSettingsTable)
      .values({ guildId: interaction.guild.id, goodbyeChannelId: channel.id, goodbyeMessage: customMessage })
      .onConflictDoUpdate({
        target: guildSettingsTable.guildId,
        set: { goodbyeChannelId: channel.id, goodbyeMessage: customMessage },
      });

    invalidateGuildCache(interaction.guild.id);

    const desc = customMessage
      ? `Goodbye channel set to <#${channel.id}>.\n**Custom message:** ${customMessage}\n\n*Placeholders: \`{user}\` = member name, \`{server}\` = server name*`
      : `Goodbye channel set to <#${channel.id}>.\nThe default goodbye embed will be used.`;

    await interaction.reply({ embeds: [successEmbed("Goodbye Channel Set", desc)] });
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const SLASH_COMMANDS: SlashCommand[] = [
  banCmd, kickCmd, muteCmd, unmuteCmd,
  warnCmd, warningsCmd, clearwarningsCmd,
  purgeCmd, slowmodeCmd,
  userinfoCmd, helpCmd,
  reactionroleCmd,
  setwelcomeCmd, setgoodbyeCmd,
];
