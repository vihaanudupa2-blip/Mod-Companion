import type { Message } from "discord.js";
import { warningEmbed } from "../utils/embeds.js";
import { getGuildSettings } from "../utils/guildSettings.js";

// ─── Built-in bad words (always enforced, regardless of per-guild list) ──────
const BUILTIN_BAD_WORDS: string[] = [
  // Profanity
  "fuck", "shit", "cunt", "motherfucker", "asshole", "dickhead", "bastard",
  // Slurs — racial, sexual, ableist
  "nigger", "nigga", "faggot", "retard", "spic", "chink", "kike",
  "wetback", "tranny", "dyke",
  // Common Discord/social scams
  "free nitro", "free discord nitro", "claim your nitro",
  "steam gift card", "click here to claim",
];

// ─── Anti-spam: rate limiter ──────────────────────────────────────────────────
// Tracks message timestamps per user per guild
const messageLog = new Map<string, number[]>();

const SPAM_LIMIT = 5;         // max messages
const SPAM_WINDOW_MS = 4_000; // within this time window

function isSpamming(message: Message): boolean {
  const key = `${message.guild!.id}-${message.author.id}`;
  const now = Date.now();
  const timestamps = messageLog.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < SPAM_WINDOW_MS);
  recent.push(now);
  messageLog.set(key, recent);
  return recent.length > SPAM_LIMIT;
}

// Clean up old entries every 2 minutes to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - SPAM_WINDOW_MS * 2;
  for (const [key, ts] of messageLog) {
    const cleaned = ts.filter((t) => t > cutoff);
    if (cleaned.length === 0) messageLog.delete(key);
    else messageLog.set(key, cleaned);
  }
}, 120_000);

// ─── Duplicate message spam ───────────────────────────────────────────────────
interface DuplicateEntry { message: string; count: number; lastSeen: number }
const DUPLICATE_THRESHOLD = 3;
const DUPLICATE_WINDOW_MS = 5_000;

function isSpammingDuplicates(message: Message): boolean {
  const key = `${message.guild?.id}-${message.author.id}`;
  const tracker = message.client.botState.duplicateMessages as Map<string, DuplicateEntry>;
  const now = Date.now();
  const content = message.content.toLowerCase().trim();

  const existing = tracker.get(key);
  if (existing && existing.message === content && now - existing.lastSeen < DUPLICATE_WINDOW_MS) {
    existing.count++;
    existing.lastSeen = now;
    return existing.count >= DUPLICATE_THRESHOLD;
  }

  tracker.set(key, { message: content, count: 1, lastSeen: now });
  return false;
}

// ─── Invite link ──────────────────────────────────────────────────────────────
const INVITE_RE = /discord\.gg\/[a-zA-Z0-9]+/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function containsBannedWord(content: string, extraWords: string[]): boolean {
  const lower = content.toLowerCase();
  const allWords = [...BUILTIN_BAD_WORDS, ...extraWords];
  return allWords.some((w) => lower.includes(w.toLowerCase()));
}

function hasTooManyMentions(message: Message, max: number): boolean {
  return message.mentions.users.size + message.mentions.roles.size > max;
}

function hasTooManyEmojis(content: string, max: number): boolean {
  const matches = content.match(/\p{Emoji}/gu) ?? [];
  return matches.length > max;
}

function hasTooManyCaps(content: string, maxRatio: number): boolean {
  if (content.length < 10) return false;
  const letters = content.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return false;
  const caps = letters.replace(/[^A-Z]/g, "");
  return (caps.length / letters.length) * 100 > maxRatio;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
type Violation = { reason: string; warnUser: boolean };

export async function handleAutoMod(message: Message): Promise<void> {
  if (!message.guild || message.author.bot) return;

  const member = message.guild.members.cache.get(message.author.id);
  if (!member) return;

  // Skip mods & admins
  if (
    member.permissions.has("ManageMessages") ||
    member.permissions.has("Administrator")
  ) return;

  // Load per-guild settings
  const settings = await getGuildSettings(message.guild.id);
  if (!settings.autoModEnabled) return;

  const content = message.content;
  let violation: Violation | null = null;

  if (containsBannedWord(content, settings.bannedWords)) {
    violation = { reason: "Use of banned words", warnUser: true };
  } else if (INVITE_RE.test(content)) {
    violation = { reason: "Discord invite links are not allowed", warnUser: false };
  } else if (hasTooManyMentions(message, settings.maxMentions)) {
    violation = { reason: `Excessive mentions (max ${settings.maxMentions})`, warnUser: true };
  } else if (isSpamming(message)) {
    violation = { reason: "Sending messages too fast (spam)", warnUser: false };
  } else if (isSpammingDuplicates(message)) {
    violation = { reason: "Spamming duplicate messages", warnUser: false };
  } else if (hasTooManyCaps(content, settings.maxCapsRatio)) {
    violation = { reason: "Excessive use of capital letters", warnUser: false };
  } else if (hasTooManyEmojis(content, settings.maxEmojis)) {
    violation = { reason: "Excessive use of emojis", warnUser: false };
  }

  if (!violation) return;

  try {
    await message.delete();
  } catch {
    // already deleted
  }

  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  const embed = warningEmbed(
    "Message Removed",
    `${message.author}, your message was removed.\n**Reason:** ${violation.reason}`,
  );
  const notice = await message.channel.send({ embeds: [embed] });
  setTimeout(() => notice.delete().catch(() => null), 7000);

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
