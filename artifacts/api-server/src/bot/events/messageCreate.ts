import type { Message } from "discord.js";
import { config } from "../config.js";
import { handleAutoMod } from "./automod.js";

export async function onMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.guild) return;

  // Run auto-mod first
  await handleAutoMod(message);

  // Check if message is a command
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = message.client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute({ message, args });
  } catch (err) {
    console.error(`Error executing command ${commandName}:`, err);
    await message.reply("An error occurred while executing that command.").catch(() => null);
  }
}
