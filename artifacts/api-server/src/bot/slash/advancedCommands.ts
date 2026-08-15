import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  Role,
  StringSelectMenuBuilder,
  TextChannel,
  SlashCommandBuilder,
} from "discord.js";
import { and, desc, eq } from "drizzle-orm";
import {
  autoResponsesTable,
  db,
  memberReportsTable,
  moderationCasesTable,
  scheduledAnnouncementsTable,
  selfRoleMenusTable,
  staffNotesTable,
  stickyMessagesTable,
  guildSettingsTable,
} from "@workspace/db";
import { errorEmbed, infoEmbed, successEmbed } from "../utils/embeds.js";
import { isAdmin, isModerator } from "../utils/permissions.js";
import {
  getSecuritySettings,
  nextCaseNumber,
  recordAuditLog,
  updateSecuritySettings,
} from "../utils/advancedData.js";
import { invalidateGuildCache } from "../utils/guildSettings.js";

export interface AdvancedSlashCommand {
  data: Pick<SlashCommandBuilder, "name" | "description" | "toJSON">;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

function getAdmin(interaction: ChatInputCommandInteraction): GuildMember | null {
  if (!interaction.guild || !interaction.member) return null;
  const member = interaction.member as GuildMember;
  return isAdmin(member) ? member : null;
}

function getMod(interaction: ChatInputCommandInteraction): GuildMember | null {
  if (!interaction.guild || !interaction.member) return null;
  const member = interaction.member as GuildMember;
  return isModerator(member) ? member : null;
}

async function requireAdmin(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (getAdmin(interaction)) return true;
  await interaction.reply({
    embeds: [errorEmbed("Permission Denied", "Administrator or Manage Server permissions are required.")],
    ephemeral: true,
  });
  return false;
}

async function requireMod(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (getMod(interaction)) return true;
  await interaction.reply({
    embeds: [errorEmbed("Permission Denied", "Moderator permissions are required.")],
    ephemeral: true,
  });
  return false;
}

function formatDate(date: Date): string {
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

const setupCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure SentinelBot with safe defaults for this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;

    await db
      .insert(guildSettingsTable)
      .values({ guildId: interaction.guild.id })
      .onConflictDoNothing();
    await updateSecuritySettings(interaction.guild.id, {});
    invalidateGuildCache(interaction.guild.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          "SentinelBot is ready",
          "Default moderation settings are active. Use `/config` to review them, then enable protection modules as your server needs them.",
        ),
      ],
    });
  },
};

const configCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("View the complete SentinelBot configuration")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const [settings, security] = await Promise.all([
      db.select().from(guildSettingsTable).where(eq(guildSettingsTable.guildId, interaction.guild.id)),
      getSecuritySettings(interaction.guild.id),
    ]);
    const moderation = settings[0];
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`SentinelBot configuration — ${interaction.guild.name}`)
      .addFields(
        {
          name: "Welcome and goodbye",
          value: `Welcome: **${moderation?.welcomeEnabled !== false ? "on" : "off"}**\nGoodbye: **${moderation?.goodbyeEnabled !== false ? "on" : "off"}**\nWelcome DM: **${moderation?.welcomeDmEnabled ? "on" : "off"}**`,
          inline: true,
        },
        {
          name: "AutoMod",
          value: `Enabled: **${moderation?.autoModEnabled !== false ? "on" : "off"}**\nBanned words: **${moderation?.bannedWords?.length ?? 0}**\nMentions: **${moderation?.maxMentions ?? 5}**`,
          inline: true,
        },
        {
          name: "Protection",
          value: `Anti-nuke: **${security.antiNukeEnabled ? "on" : "off"}**\nRole protection: **${security.roleProtectEnabled ? "on" : "off"}**\nMessage logs: **${security.messageLogsEnabled ? "on" : "off"}**`,
          inline: true,
        },
        {
          name: "Automation",
          value: `Cleanup: **${security.cleanupEnabled ? "on" : "off"}**\nCleanup age: **${security.cleanupAfterMinutes} minutes**`,
          inline: true,
        },
      )
      .setFooter({ text: "Use /setup for defaults and the individual commands to change a module." })
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

const caseCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription("Create or manage a moderation case")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Create a moderation case")
        .addUserOption((o) => o.setName("user").setDescription("Member involved").setRequired(true))
        .addStringOption((o) =>
          o.setName("action").setDescription("Moderation action").setRequired(true)
            .addChoices(
              { name: "Warn", value: "warn" },
              { name: "Mute", value: "mute" },
              { name: "Kick", value: "kick" },
              { name: "Ban", value: "ban" },
              { name: "Note", value: "note" },
              { name: "Other", value: "other" },
            ),
        )
        .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("view")
        .setDescription("View a moderation case")
        .addIntegerOption((o) => o.setName("number").setDescription("Case number").setRequired(true).setMinValue(1)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("close")
        .setDescription("Close a moderation case")
        .addIntegerOption((o) => o.setName("number").setDescription("Case number").setRequired(true).setMinValue(1)),
    ),
  async execute(interaction) {
    if (!interaction.guild || !(await requireMod(interaction))) return;
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === "add") {
      const target = interaction.options.getUser("user", true);
      const action = interaction.options.getString("action", true);
      const reason = interaction.options.getString("reason", true);
      const caseNumber = await nextCaseNumber(guildId);
      await db.insert(moderationCasesTable).values({
        guildId,
        caseNumber,
        action,
        userId: target.id,
        moderatorId: interaction.user.id,
        reason,
      });
      await recordAuditLog({
        guildId,
        action: "moderation_case_created",
        actorId: interaction.user.id,
        targetId: target.id,
        details: `Case #${caseNumber}: ${action} — ${reason}`,
      });
      await interaction.reply({
        embeds: [successEmbed("Case created", `Case **#${caseNumber}** recorded for **${target.tag}**.\n**Action:** ${action}\n**Reason:** ${reason}`)],
      });
      return;
    }

    const number = interaction.options.getInteger("number", true);
    const [entry] = await db
      .select()
      .from(moderationCasesTable)
      .where(and(eq(moderationCasesTable.guildId, guildId), eq(moderationCasesTable.caseNumber, number)));
    if (!entry) {
      await interaction.reply({ embeds: [errorEmbed("Case not found", `No case #${number} exists in this server.`)], ephemeral: true });
      return;
    }

    if (sub === "close") {
      await db
        .update(moderationCasesTable)
        .set({ active: false })
        .where(eq(moderationCasesTable.id, entry.id));
      await interaction.reply({ embeds: [successEmbed("Case closed", `Case **#${number}** is now closed.`)] });
      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(entry.active ? 0xfee75c : 0x57f287)
          .setTitle(`Case #${entry.caseNumber}`)
          .addFields(
            { name: "Action", value: entry.action, inline: true },
            { name: "Status", value: entry.active ? "Open" : "Closed", inline: true },
            { name: "Member", value: `<@${entry.userId}>`, inline: true },
            { name: "Reason", value: entry.reason },
            { name: "Moderator", value: `<@${entry.moderatorId}>`, inline: true },
            { name: "Created", value: formatDate(entry.createdAt), inline: true },
          ),
      ],
      ephemeral: true,
    });
  },
};

const modhistoryCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("modhistory")
    .setDescription("View moderation cases for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("user").setDescription("Member to look up").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild || !(await requireMod(interaction))) return;
    const target = interaction.options.getUser("user", true);
    const rows = await db
      .select()
      .from(moderationCasesTable)
      .where(and(eq(moderationCasesTable.guildId, interaction.guild.id), eq(moderationCasesTable.userId, target.id)))
      .orderBy(desc(moderationCasesTable.createdAt))
      .limit(15);
    if (rows.length === 0) {
      await interaction.reply({ embeds: [infoEmbed("No history", `There are no moderation cases for **${target.tag}**.`)], ephemeral: true });
      return;
    }
    const description = rows
      .map((row) => `**#${row.caseNumber}** · ${row.action} · ${row.active ? "open" : "closed"} · ${row.reason} · ${formatDate(row.createdAt)}`)
      .join("\n");
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`Moderation history — ${target.tag}`).setDescription(description)],
      ephemeral: true,
    });
  },
};

const noteCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Add a private staff note about a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("user").setDescription("Member to annotate").setRequired(true))
    .addStringOption((o) => o.setName("note").setDescription("Private staff note").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild || !(await requireMod(interaction))) return;
    const target = interaction.options.getUser("user", true);
    const note = interaction.options.getString("note", true);
    await db.insert(staffNotesTable).values({
      guildId: interaction.guild.id,
      userId: target.id,
      authorId: interaction.user.id,
      note,
    });
    await interaction.reply({ embeds: [successEmbed("Staff note saved", `A private note was added for **${target.tag}**.`)], ephemeral: true });
  },
};

const notesCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("notes")
    .setDescription("View private staff notes for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("user").setDescription("Member to look up").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild || !(await requireMod(interaction))) return;
    const target = interaction.options.getUser("user", true);
    const rows = await db
      .select()
      .from(staffNotesTable)
      .where(and(eq(staffNotesTable.guildId, interaction.guild.id), eq(staffNotesTable.userId, target.id)))
      .orderBy(desc(staffNotesTable.createdAt))
      .limit(15);
    if (rows.length === 0) {
      await interaction.reply({ embeds: [infoEmbed("No staff notes", `There are no private notes for **${target.tag}**.`)], ephemeral: true });
      return;
    }
    const description = rows.map((row) => `• ${row.note}\n  by <@${row.authorId}> · ${formatDate(row.createdAt)}`).join("\n");
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`Staff notes — ${target.tag}`).setDescription(description)],
      ephemeral: true,
    });
  },
};

const reportCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Privately report a member to the moderation team")
    .setDMPermission(false)
    .addUserOption((o) => o.setName("user").setDescription("Member to report").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("What happened?").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) return;
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const channelId = interaction.channel.id;
    const messageId = interaction.id;
    const [report] = await db.insert(memberReportsTable).values({
      guildId: interaction.guild.id,
      reporterId: interaction.user.id,
      targetUserId: target.id,
      channelId,
      messageId,
      reason,
    }).returning();

    const modChannel = interaction.guild.systemChannel;
    if (modChannel?.isTextBased()) {
      await modChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle(`New member report #${report.id}`)
            .setDescription(`**Reported member:** <@${target.id}>\n**Reporter:** <@${interaction.user.id}>\n**Reason:** ${reason}`)
            .setFooter({ text: "Review this report with your moderation workflow." })
            .setTimestamp(),
        ],
      }).catch(() => null);
    }
    await interaction.reply({ embeds: [successEmbed("Report received", "Your report has been sent privately to the moderation team.")], ephemeral: true });
  },
};

const scheduleCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Schedule an announcement")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub.setName("add").setDescription("Schedule a message")
        .addChannelOption((o) => o.setName("channel").setDescription("Destination channel").addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addIntegerOption((o) => o.setName("delay_minutes").setDescription("Minutes from now").setRequired(true).setMinValue(1).setMaxValue(525600))
        .addStringOption((o) => o.setName("message").setDescription("Announcement content").setRequired(true))
        .addIntegerOption((o) => o.setName("repeat_minutes").setDescription("Optional repeat interval").setMinValue(1).setMaxValue(525600)),
    )
    .addSubcommand((sub) => sub.setName("list").setDescription("List scheduled announcements"))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Remove a scheduled announcement").addIntegerOption((o) => o.setName("id").setDescription("Schedule ID").setRequired(true).setMinValue(1))),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const sub = interaction.options.getSubcommand();
    if (sub === "add") {
      const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
      const delay = interaction.options.getInteger("delay_minutes", true);
      const message = interaction.options.getString("message", true);
      const repeatMinutes = interaction.options.getInteger("repeat_minutes");
      const [row] = await db.insert(scheduledAnnouncementsTable).values({
        guildId: interaction.guild.id,
        channelId: channel.id,
        message,
        sendAt: new Date(Date.now() + delay * 60_000),
        repeatMinutes,
        createdBy: interaction.user.id,
      }).returning();
      await interaction.reply({ embeds: [successEmbed("Announcement scheduled", `Schedule **#${row.id}** will post in <#${channel.id}> ${formatDate(row.sendAt)}.`)], ephemeral: true });
      return;
    }
    if (sub === "remove") {
      const id = interaction.options.getInteger("id", true);
      await db.update(scheduledAnnouncementsTable).set({ active: false }).where(and(eq(scheduledAnnouncementsTable.id, id), eq(scheduledAnnouncementsTable.guildId, interaction.guild.id)));
      await interaction.reply({ embeds: [successEmbed("Schedule removed", `Schedule **#${id}** has been disabled.`)], ephemeral: true });
      return;
    }
    const rows = await db.select().from(scheduledAnnouncementsTable)
      .where(and(eq(scheduledAnnouncementsTable.guildId, interaction.guild.id), eq(scheduledAnnouncementsTable.active, true)))
      .orderBy(scheduledAnnouncementsTable.sendAt);
    const description = rows.length === 0 ? "No announcements are scheduled." : rows.map((row) => `**#${row.id}** · <#${row.channelId}> · ${formatDate(row.sendAt)}${row.repeatMinutes ? ` · repeats every ${row.repeatMinutes}m` : ""}\n${row.message}`).join("\n\n");
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("Scheduled announcements").setDescription(description)], ephemeral: true });
  },
};

const stickyCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("sticky")
    .setDescription("Manage a sticky message in a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("set").setDescription("Set or replace a sticky message").addChannelOption((o) => o.setName("channel").setDescription("Target channel").addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption((o) => o.setName("message").setDescription("Sticky content").setRequired(true)))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Remove the sticky message").addChannelOption((o) => o.setName("channel").setDescription("Target channel").addChannelTypes(ChannelType.GuildText).setRequired(true))),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
    const existing = await db.select().from(stickyMessagesTable).where(and(eq(stickyMessagesTable.guildId, interaction.guild.id), eq(stickyMessagesTable.channelId, channel.id), eq(stickyMessagesTable.active, true)));
    const sub = interaction.options.getSubcommand();
    if (sub === "remove") {
      await db.update(stickyMessagesTable).set({ active: false }).where(and(eq(stickyMessagesTable.guildId, interaction.guild.id), eq(stickyMessagesTable.channelId, channel.id)));
      if (existing[0]?.messageId) await channel.messages.fetch(existing[0].messageId).then((msg) => msg.delete()).catch(() => null);
      await interaction.reply({ embeds: [successEmbed("Sticky removed", `The sticky message was removed from <#${channel.id}>.`)], ephemeral: true });
      return;
    }
    const content = interaction.options.getString("message", true);
    if (existing[0]) {
      await db.update(stickyMessagesTable).set({ content, messageId: null, active: true, updatedAt: new Date() }).where(eq(stickyMessagesTable.id, existing[0].id));
    } else {
      await db.insert(stickyMessagesTable).values({ guildId: interaction.guild.id, channelId: channel.id, content });
    }
    const posted = await channel.send({ content });
    await db.update(stickyMessagesTable).set({ messageId: posted.id }).where(and(eq(stickyMessagesTable.guildId, interaction.guild.id), eq(stickyMessagesTable.channelId, channel.id), eq(stickyMessagesTable.active, true)));
    await interaction.reply({ embeds: [successEmbed("Sticky set", `The message will stay at the bottom of <#${channel.id}>.`)], ephemeral: true });
  },
};

const autoresponseCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("autoresponse")
    .setDescription("Manage custom automatic responses")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("add").setDescription("Add a response").addStringOption((o) => o.setName("trigger").setDescription("Trigger text").setRequired(true)).addStringOption((o) => o.setName("response").setDescription("Response text").setRequired(true)))
    .addSubcommand((sub) => sub.setName("list").setDescription("List responses"))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Remove a response").addIntegerOption((o) => o.setName("id").setDescription("Response ID").setRequired(true).setMinValue(1))),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const sub = interaction.options.getSubcommand();
    if (sub === "add") {
      const trigger = interaction.options.getString("trigger", true).trim().toLowerCase();
      const response = interaction.options.getString("response", true);
      const [row] = await db.insert(autoResponsesTable).values({ guildId: interaction.guild.id, trigger, response }).returning();
      await interaction.reply({ embeds: [successEmbed("Auto-response added", `Response **#${row.id}** will trigger when a message contains \`${trigger}\`.`)], ephemeral: true });
      return;
    }
    if (sub === "remove") {
      const id = interaction.options.getInteger("id", true);
      await db.update(autoResponsesTable).set({ enabled: false }).where(and(eq(autoResponsesTable.id, id), eq(autoResponsesTable.guildId, interaction.guild.id)));
      await interaction.reply({ embeds: [successEmbed("Auto-response removed", `Response **#${id}** has been disabled.`)], ephemeral: true });
      return;
    }
    const rows = await db.select().from(autoResponsesTable).where(and(eq(autoResponsesTable.guildId, interaction.guild.id), eq(autoResponsesTable.enabled, true))).orderBy(autoResponsesTable.id);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle("Auto-responses").setDescription(rows.length ? rows.map((row) => `**#${row.id}** · \`${row.trigger}\` → ${row.response}`).join("\n") : "No auto-responses configured.")], ephemeral: true });
  },
};

function toggleCommand(
  name: string,
  description: string,
  key: "antiNukeEnabled" | "roleProtectEnabled" | "messageLogsEnabled",
): AdvancedSlashCommand {
  const builder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("enable").setDescription("Enable this protection"))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable this protection"))
    .addSubcommand((sub) => sub.setName("status").setDescription("View the current status"));
  return {
    data: builder,
    async execute(interaction) {
      if (!interaction.guild || !(await requireAdmin(interaction))) return;
      const sub = interaction.options.getSubcommand();
      if (sub !== "status") {
        await updateSecuritySettings(interaction.guild.id, { [key]: sub === "enable" });
      }
      const settings = await getSecuritySettings(interaction.guild.id);
      await interaction.reply({
        embeds: [
          sub === "status"
            ? infoEmbed(`${name} status`, `${description}\n\nCurrent status: **${settings[key] ? "enabled" : "disabled"}**`)
            : successEmbed(`${name} updated`, `The module is now **${sub === "enable" ? "enabled" : "disabled"}**.`),
        ],
        ephemeral: true,
      });
    },
  };
}

const messageLogsCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("messagelogs")
    .setDescription("Configure message edit and delete audit logs")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("enable").setDescription("Enable logs").addChannelOption((o) => o.setName("channel").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable logs"))
    .addSubcommand((sub) => sub.setName("status").setDescription("View log status")),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const sub = interaction.options.getSubcommand();
    if (sub === "enable") {
      const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
      await updateSecuritySettings(interaction.guild.id, { messageLogsEnabled: true, messageLogChannelId: channel.id });
      await interaction.reply({ embeds: [successEmbed("Message logs enabled", `Audit messages will be sent to <#${channel.id}>.`)], ephemeral: true });
      return;
    }
    if (sub === "disable") {
      await updateSecuritySettings(interaction.guild.id, { messageLogsEnabled: false });
      await interaction.reply({ embeds: [successEmbed("Message logs disabled", "Message edit and delete logs are now off.")], ephemeral: true });
      return;
    }
    const settings = await getSecuritySettings(interaction.guild.id);
    await interaction.reply({ embeds: [infoEmbed("Message logs status", `Status: **${settings.messageLogsEnabled ? "enabled" : "disabled"}**\nChannel: ${settings.messageLogChannelId ? `<#${settings.messageLogChannelId}>` : "not set"}`)], ephemeral: true });
  },
};

const selfroleCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("selfrole")
    .setDescription("Create a self-role menu")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub.setName("create").setDescription("Post a self-role menu")
        .addStringOption((o) => o.setName("prompt").setDescription("Menu prompt").setRequired(true))
        .addRoleOption((o) => o.setName("role1").setDescription("First role").setRequired(true))
        .addRoleOption((o) => o.setName("role2").setDescription("Second role"))
        .addRoleOption((o) => o.setName("role3").setDescription("Third role"))
        .addRoleOption((o) => o.setName("role4").setDescription("Fourth role"))
        .addRoleOption((o) => o.setName("role5").setDescription("Fifth role")),
    ),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const channel = interaction.channel;
    if (!channel?.isTextBased() || channel.isDMBased()) {
      await interaction.reply({ embeds: [errorEmbed("Invalid channel", "Run this command in a server text channel.")], ephemeral: true });
      return;
    }
    const roles = ["role1", "role2", "role3", "role4", "role5"]
      .map((name) => interaction.options.getRole(name))
      .filter((role): role is Role => role !== null);
    if (roles.some((role) => role.managed || role.position >= (interaction.guild!.members.me?.roles.highest.position ?? 0))) {
      await interaction.reply({ embeds: [errorEmbed("Role hierarchy", "I can only assign roles below my highest role.")], ephemeral: true });
      return;
    }
    const [menu] = await db.insert(selfRoleMenusTable).values({
      guildId: interaction.guild.id,
      channelId: channel.id,
      prompt: interaction.options.getString("prompt", true),
      roleIds: roles.map((role) => role.id),
    }).returning();
    const select = new StringSelectMenuBuilder()
      .setCustomId(`selfrole:${menu.id}`)
      .setPlaceholder("Choose your roles")
      .setMinValues(0)
      .setMaxValues(roles.length)
      .addOptions(roles.map((role) => ({ label: role.name.slice(0, 100), value: role.id })));
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const posted = await (channel as TextChannel).send({ content: menu.prompt, components: [row] });
    await db.update(selfRoleMenusTable).set({ messageId: posted.id }).where(eq(selfRoleMenusTable.id, menu.id));
    await interaction.reply({ embeds: [successEmbed("Self-role menu created", `The menu is live in <#${channel.id}>.`)], ephemeral: true });
  },
};

const welcomedmCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("welcomedm")
    .setDescription("Configure welcome direct messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("set").setDescription("Set and enable the welcome DM").addStringOption((o) => o.setName("message").setDescription("Use {user} and {server} placeholders").setRequired(true)))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable welcome DMs"))
    .addSubcommand((sub) => sub.setName("status").setDescription("View welcome DM status")),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const sub = interaction.options.getSubcommand();
    if (sub === "set") {
      const message = interaction.options.getString("message", true);
      await db.insert(guildSettingsTable).values({ guildId: interaction.guild.id, welcomeDmEnabled: true, welcomeDmMessage: message }).onConflictDoUpdate({ target: guildSettingsTable.guildId, set: { welcomeDmEnabled: true, welcomeDmMessage: message, updatedAt: new Date() } });
      invalidateGuildCache(interaction.guild.id);
      await interaction.reply({ embeds: [successEmbed("Welcome DM enabled", "New members will receive the configured direct message.")], ephemeral: true });
      return;
    }
    if (sub === "disable") {
      await db.update(guildSettingsTable).set({ welcomeDmEnabled: false, updatedAt: new Date() }).where(eq(guildSettingsTable.guildId, interaction.guild.id));
      invalidateGuildCache(interaction.guild.id);
      await interaction.reply({ embeds: [successEmbed("Welcome DM disabled", "New members will no longer receive a welcome DM.")], ephemeral: true });
      return;
    }
    const [settings] = await db.select().from(guildSettingsTable).where(eq(guildSettingsTable.guildId, interaction.guild.id));
    await interaction.reply({ embeds: [infoEmbed("Welcome DM status", `Status: **${settings?.welcomeDmEnabled ? "enabled" : "disabled"}**\nMessage: ${settings?.welcomeDmMessage ?? "not configured"}`)], ephemeral: true });
  },
};

const cleanupCmd: AdvancedSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("cleanup")
    .setDescription("Configure automatic cleanup in a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addSubcommand((sub) => sub.setName("enable").setDescription("Enable cleanup").addChannelOption((o) => o.setName("channel").setDescription("Channel to clean").addChannelTypes(ChannelType.GuildText).setRequired(true)).addIntegerOption((o) => o.setName("after_minutes").setDescription("Delete messages older than this").setRequired(true).setMinValue(5).setMaxValue(43200)))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable cleanup"))
    .addSubcommand((sub) => sub.setName("run").setDescription("Run cleanup now"))
    .addSubcommand((sub) => sub.setName("status").setDescription("View cleanup status")),
  async execute(interaction) {
    if (!interaction.guild || !(await requireAdmin(interaction))) return;
    const sub = interaction.options.getSubcommand();
    if (sub === "enable") {
      const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
      const afterMinutes = interaction.options.getInteger("after_minutes", true);
      await updateSecuritySettings(interaction.guild.id, { cleanupEnabled: true, cleanupChannelId: channel.id, cleanupAfterMinutes: afterMinutes });
      await interaction.reply({ embeds: [successEmbed("Cleanup enabled", `Messages older than **${afterMinutes} minutes** will be cleaned from <#${channel.id}>.`)], ephemeral: true });
      return;
    }
    if (sub === "disable") {
      await updateSecuritySettings(interaction.guild.id, { cleanupEnabled: false });
      await interaction.reply({ embeds: [successEmbed("Cleanup disabled", "Automatic cleanup is now off.")], ephemeral: true });
      return;
    }
    const settings = await getSecuritySettings(interaction.guild.id);
    if (sub === "status") {
      await interaction.reply({ embeds: [infoEmbed("Cleanup status", `Status: **${settings.cleanupEnabled ? "enabled" : "disabled"}**\nChannel: ${settings.cleanupChannelId ? `<#${settings.cleanupChannelId}>` : "not set"}\nAge: **${settings.cleanupAfterMinutes} minutes**`)], ephemeral: true });
      return;
    }
    if (!settings.cleanupChannelId) {
      await interaction.reply({ embeds: [errorEmbed("Cleanup not configured", "Use `/cleanup enable` first.")], ephemeral: true });
      return;
    }
    const channel = interaction.guild.channels.cache.get(settings.cleanupChannelId);
    if (!channel?.isTextBased() || channel.isDMBased()) {
      await interaction.reply({ embeds: [errorEmbed("Channel unavailable", "The configured cleanup channel is unavailable.")], ephemeral: true });
      return;
    }
    const messages = await channel.messages.fetch({ limit: 100 });
    const cutoff = Date.now() - settings.cleanupAfterMinutes * 60_000;
    const old = messages.filter((message) => message.createdTimestamp < cutoff);
    const deleted = await (channel as TextChannel).bulkDelete(old, true).catch(() => null);
    await interaction.reply({ embeds: [successEmbed("Cleanup complete", `Deleted **${deleted?.size ?? 0}** old message(s).`)], ephemeral: true });
  },
};

export const ADVANCED_SLASH_COMMANDS: AdvancedSlashCommand[] = [
  setupCmd,
  configCmd,
  caseCmd,
  modhistoryCmd,
  noteCmd,
  notesCmd,
  reportCmd,
  scheduleCmd,
  stickyCmd,
  autoresponseCmd,
  toggleCommand("antinuke", "Protect the server from destructive admin or bot activity", "antiNukeEnabled"),
  toggleCommand("roleprotect", "Protect important roles from destructive changes", "roleProtectEnabled"),
  messageLogsCmd,
  selfroleCmd,
  welcomedmCmd,
  cleanupCmd,
];