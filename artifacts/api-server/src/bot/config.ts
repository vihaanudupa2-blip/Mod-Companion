export const config = {
  token: process.env["DISCORD_TOKEN"] ?? "",
  prefix: "!",

  autoMod: {
    bannedWords: ["spam", "scam", "nsfw", "hate"],
    maxMentions: 5,
    maxEmojis: 10,
    maxCaps: 0.7,
    minCapsLength: 10,
    duplicateMessageThreshold: 3,
    duplicateMessageWindow: 5000,
    invitePattern: /discord\.gg\/[a-zA-Z0-9]+/gi,
    urlPattern: /https?:\/\/[^\s]+/gi,
  },

  colors: {
    success: 0x57f287,
    error: 0xed4245,
    warning: 0xfee75c,
    info: 0x5865f2,
    welcome: 0x57f287,
    goodbye: 0xed4245,
  },

  messages: {
    welcome: (username: string, serverName: string) =>
      `Welcome to **${serverName}**, **${username}**! We're glad to have you here.`,
    goodbye: (username: string, serverName: string) =>
      `**${username}** has left **${serverName}**. We'll miss you!`,
  },
};
