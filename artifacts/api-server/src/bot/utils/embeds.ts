import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";

export function successEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function errorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function warningEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function infoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.colors.info)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function welcomeEmbed(username: string, serverName: string, avatarUrl: string | null): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.colors.welcome)
    .setTitle(`👋 Welcome to ${serverName}!`)
    .setDescription(config.messages.welcome(username, serverName))
    .setThumbnail(avatarUrl)
    .setTimestamp();
}

export function goodbyeEmbed(username: string, serverName: string, avatarUrl: string | null): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.colors.goodbye)
    .setTitle(`👋 Goodbye!`)
    .setDescription(config.messages.goodbye(username, serverName))
    .setThumbnail(avatarUrl)
    .setTimestamp();
}
