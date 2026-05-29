import type { Message } from "discord.js";
import { config } from "../config.js";
import { warningEmbed } from "../utils/embeds.js";

function containsBannedWords(content: string): boolean {
  const lower = content.toLowerCase();
  return config.autoMod.bannedWords.some((word) => lower.includes(word));
}

function hasExcessiveMentions(message: Message): boolean {
  return message.mentions.users.size > config.autoMod.maxMentions;
}

function hasExcessiveEmojis(content: string): boolean {
  const emojiPattern = /\p{Emoji}/gu;
  const matches = content.match(emojiPattern) ?? [];
  return matches.length > config.autoMod.maxEmojis;
}

function hasExcessiveCaps(content: string): boolean {
  if (content.length < config.autoMod.minCapsLength) return false;
  const letters = content.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return false;
  const caps = letters.replace(/[^A-Z]/g, "");
  return caps.length / letters.length > config.autoMod.maxCaps;
}

function hasInviteLink(content: string): boolean {
  config.autoMod.invitePattern.lastIndex = 0;
  return config.autoMod.invitePattern.test(content);
}

function isSpammingDuplicates(message: Message): boolean {
  const key = `${message.guild?.id}-${message.author.id}`;
  const tracker = message.client.botState.duplicateMessages;
  const now = Date.now();
  const content = message.content.toLowerCase().trim();

  const existing = tracker.get(key);
  if (existing && existing.message === content && now - existing.lastSeen < config.autoMod.duplicateMessageWindow) {
    existing.count++;
    existing.lastSeen = now;
    return existing.count >= config.autoMod.duplicateMessageThreshold;
  }

  tracker.set(key, { message: content, count: 1, lastSeen: now });
  return false;
}

type ViolationReason = {
  reason: string;
  warnUser: boolean;
};

export async function handleAutoMod(message: Message): Promise<void> {
  if (!message.guild || message.author.bot) return;

  const member = message.guild.members.cache.get(message.author.id);
  if (!member) return;

  // Don't auto-mod admins/mods
  if (
    member.permissions.has("ManageMessages") ||
    member.permissions.has("Administrator")
  ) {
    return;
  }

  let violation: ViolationReason | null = null;

  if (containsBannedWords(message.content)) {
    violation = { reason: "Use of banned words", warnUser: true };
  } else if (hasInviteLink(message.content)) {
    violation = { reason: "Discord invite links are not allowed", warnUser: false };
  } else if (hasExcessiveMentions(message)) {
    violation = { reason: "Excessive mentions (potential spam)", warnUser: true };
  } else if (isSpammingDuplicates(message)) {
    violation = { reason: "Spamming duplicate messages", warnUser: false };
  } else if (hasExcessiveCaps(message.content)) {
    violation = { reason: "Excessive use of capital letters", warnUser: false };
  } else if (hasExcessiveEmojis(message.content)) {
    violation = { reason: "Excessive use of emojis", warnUser: false };
  }

  if (!violation) return;

  try {
    await message.delete();
  } catch {
    // message may have already been deleted
  }

  const embed = warningEmbed(
    "Message Removed",
    `${message.author}, your message was removed.\n**Reason:** ${violation.reason}`,
  );

  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;
  const notice = await message.channel.send({ embeds: [embed] });
  setTimeout(() => notice.delete().catch(() => null), 6000);

  if (violation.warnUser) {
    const key = `${message.guild.id}-${message.author.id}`;
    const warnings = message.client.botState.warnings;
    if (!warnings.has(key)) warnings.set(key, []);
    warnings.get(key)!.push({
      userId: message.author.id,
      guildId: message.guild.id,
      reason: `[Auto-Mod] ${violation.reason}`,
      moderatorId: message.client.user?.id ?? "bot",
      timestamp: new Date(),
    });

    await member.send({
      embeds: [
        warningEmbed(
          "Auto-Mod Warning",
          `You received an automatic warning in **${message.guild.name}**.\n**Reason:** ${violation.reason}`,
        ),
      ],
    }).catch(() => null);
  }
}
