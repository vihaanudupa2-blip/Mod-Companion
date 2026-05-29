import type { Message } from "discord.js";

interface AutoReactRule {
  keywords: string[];
  emoji: string;
}

const AUTO_REACT_RULES: AutoReactRule[] = [
  { keywords: ["good morning", "gm", "morning"], emoji: "☀️" },
  { keywords: ["good night", "gn", "goodnight"], emoji: "🌙" },
  { keywords: ["lol", "lmao", "lmfao", "haha", "😂"], emoji: "😂" },
  { keywords: ["gg", "well played", "wp"], emoji: "🎮" },
  { keywords: ["happy birthday", "hbd", "birthday"], emoji: "🎂" },
  { keywords: ["hype", "lets go", "let's go", "lesgo"], emoji: "🔥" },
  { keywords: ["win", "winner", "won", "victory"], emoji: "🏆" },
  { keywords: ["sad", "rip", "f in chat", "press f"], emoji: "😢" },
  { keywords: ["love", "❤️", "♥️", "luv"], emoji: "❤️" },
  { keywords: ["poggers", "pog", "pogchamp"], emoji: "😮" },
  { keywords: ["skill issue", "skill"], emoji: "💀" },
  { keywords: ["welcome"], emoji: "👋" },
  { keywords: ["thanks", "thank you", "thx", "ty"], emoji: "🙏" },
  { keywords: ["no way", "impossible", "what"], emoji: "😲" },
  { keywords: ["100", "facts", "facts 🗣"], emoji: "💯" },
];

export async function handleAutoReact(message: Message): Promise<void> {
  if (!message.guild || message.author.bot) return;

  const lower = message.content.toLowerCase();

  for (const rule of AUTO_REACT_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      await message.react(rule.emoji).catch(() => null);
      // Only react with one emoji per message to avoid spam
      break;
    }
  }
}
