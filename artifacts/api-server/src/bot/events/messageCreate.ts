import type { Message } from "discord.js";
import { config } from "../config.js";
import { handleAutoMod } from "./automod.js";
import { handleAutoReact } from "./autoreact.js";

const COMMAND_EMOJIS: Record<string, string> = {
  warn:          "⚠️",
  ban:           "🔨",
  kick:          "👢",
  mute:          "🔇",
  unmute:        "🔊",
  purge:         "🗑️",
  warnings:      "📋",
  clearwarnings: "🧹",
  userinfo:      "👤",
  slowmode:      "🐢",
  help:          "🤖",
  reactionrole:  "🎭",
};

export async function onMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.guild) return;

  // Run auto-mod first
  await handleAutoMod(message);

  // Auto-react to keywords (only for non-command messages)
  if (!message.content.startsWith(config.prefix)) {
    await handleAutoReact(message);
  }

  // Check if message is a command
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = message.client.commands.get(commandName);
  if (!command) return;

  // React to the command message with the command's emoji
  const emoji = COMMAND_EMOJIS[commandName];
  if (emoji) {
    await message.react(emoji).catch(() => null);
  }

  try {
    await command.execute({ message, args });
  } catch (err) {
    console.error(`Error executing command ${commandName}:`, err);
    await message.react("❌").catch(() => null);
    await message.reply("An error occurred while executing that command.").catch(() => null);
  }
}
