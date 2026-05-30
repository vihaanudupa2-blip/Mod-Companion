import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config.js";
import { logger } from "../lib/logger.js";
import type { Command } from "./types.js";

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

const COMMANDS: Command[] = [
  ban, kick, warn, warnings, clearwarnings, purge,
  mute, unmute, userinfo, slowmode,
  reactionrole, help,
];

export function startBot(): void {
  if (!config.token) {
    logger.warn("DISCORD_TOKEN not set — bot will not start");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,        // Privileged — must be enabled in Dev Portal
      GatewayIntentBits.MessageContent,      // Privileged — must be enabled in Dev Portal
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.GuildMember, Partials.User, Partials.Message, Partials.Channel, Partials.Reaction],
  });

  client.botState = {
    warnings: new Map(),
    duplicateMessages: new Map(),
    reactionRoles: [],
  };
  client.commands = new Collection<string, Command>();

  for (const cmd of COMMANDS) {
    client.commands.set(cmd.name, cmd);
  }

  client.once("ready", () => {
    logger.info({ tag: client.user?.tag }, "Discord bot is online");
    client.user?.setActivity("your server 👀", { type: 3 });
  });

  client.on("messageCreate", (msg) => {
    onMessageCreate(msg).catch((err) => logger.error({ err }, "messageCreate error"));
  });

  client.on("guildMemberAdd", (member) => {
    onGuildMemberAdd(member).catch((err) => logger.error({ err }, "guildMemberAdd error"));
  });

  client.on("guildMemberRemove", (member) => {
    onGuildMemberRemove(member).catch((err) => logger.error({ err }, "guildMemberRemove error"));
  });

  client.on("messageReactionAdd", (reaction, user) => {
    onReactionAdd(reaction, user).catch((err) => logger.error({ err }, "messageReactionAdd error"));
  });

  client.on("messageReactionRemove", (reaction, user) => {
    onReactionRemove(reaction, user).catch((err) => logger.error({ err }, "messageReactionRemove error"));
  });

  client.login(config.token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
  });
}
