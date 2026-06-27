import { Client, Collection, GatewayIntentBits, Partials, REST, Routes, Events } from "discord.js";
import { config } from "./config.js";
import { logger } from "../lib/logger.js";
import type { Command } from "./types.js";
import { SLASH_COMMANDS } from "./slash/slashCommands.js";

import { onMessageCreate } from "./events/messageCreate.js";
import { onGuildMemberAdd } from "./events/guildMemberAdd.js";
import { onGuildMemberRemove } from "./events/guildMemberRemove.js";
import { onReactionAdd, onReactionRemove } from "./events/reactionRoles.js";

import ban from "./commands/ban.js";
import kick from "./commands/kick.js";
import warn from "./commands/warn.js";
import warnings from "./commands/warnings.js";
import clearwarnings from "./commands/clearwarnings.js";
import purge from "./commands/purge.js";
import mute from "./commands/mute.js";
import unmute from "./commands/unmute.js";
import userinfo from "./commands/userinfo.js";
import slowmode from "./commands/slowmode.js";
import reactionrole from "./commands/reactionrole.js";
import help from "./commands/help.js";
import setwelcome from "./commands/setwelcome.js";
import setgoodbye from "./commands/setgoodbye.js";

const PREFIX_COMMANDS: Command[] = [
  ban, kick, warn, warnings, clearwarnings, purge,
  mute, unmute, userinfo, slowmode,
  reactionrole, help,
  setwelcome, setgoodbye,
];

const CLIENT_ID = "1509885542966366319";

async function registerSlashCommands(token: string): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(token);
  const body = SLASH_COMMANDS.map((cmd) => cmd.data.toJSON());
  try {
    logger.info({ count: body.length }, "Registering slash commands globally...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
    logger.info("Slash commands registered successfully");
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands");
  }
}

export function startBot(): void {
  if (!config.token) {
    logger.warn("DISCORD_TOKEN not set — bot will not start");
    return;
  }

  const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  

client.on("disconnect", () => {
  console.log("Bot disconnected");
});

client.on("error", console.error);

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.once("ready", () => {
  console.log(`U-bot logged in as ${client.user?.tag}`);
});
    partials: [Partials.GuildMember, Partials.User, Partials.Message, Partials.Channel, Partials.Reaction],
  });

  client.botState = {
    warnings: new Map(),
    duplicateMessages: new Map(),
    reactionRoles: [],
  };

  // Register prefix commands
  client.commands = new Collection<string, Command>();
  for (const cmd of PREFIX_COMMANDS) {
    client.commands.set(cmd.name, cmd);
  }

  // Register slash command handlers in a Map for fast lookup
  const slashMap = new Map(SLASH_COMMANDS.map((c) => [c.data.name, c]));

  client.once(Events.ClientReady, () => {
    logger.info({ tag: client.user?.tag }, "Discord bot is online");
    client.user?.setActivity("your server 👀", { type: 3 });

    // Register slash commands with Discord after login
    void registerSlashCommands(config.token);
  });

  // ── Prefix commands ──────────────────────────────────────────────────────────
  client.on(Events.MessageCreate, (msg) => {
    onMessageCreate(msg).catch((err) => logger.error({ err }, "messageCreate error"));
  });

  // ── Slash commands ───────────────────────────────────────────────────────────
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handler = slashMap.get(interaction.commandName);
    if (!handler) return;

    try {
      await handler.execute(interaction);
    } catch (err) {
      logger.error({ err, command: interaction.commandName }, "Slash command error");
      const payload = { content: "An error occurred while running this command.", ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  });

  // ── Guild events ─────────────────────────────────────────────────────────────
  client.on(Events.GuildMemberAdd, (member) => {
    onGuildMemberAdd(member).catch((err) => logger.error({ err }, "guildMemberAdd error"));
  });

  client.on(Events.GuildMemberRemove, (member) => {
    onGuildMemberRemove(member).catch((err) => logger.error({ err }, "guildMemberRemove error"));
  });

  client.on(Events.MessageReactionAdd, (reaction, user) => {
    onReactionAdd(reaction, user).catch((err) => logger.error({ err }, "messageReactionAdd error"));
  });

  client.on(Events.MessageReactionRemove, (reaction, user) => {
    onReactionRemove(reaction, user).catch((err) => logger.error({ err }, "messageReactionRemove error"));
  });

  client.login(config.token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
  });
}
