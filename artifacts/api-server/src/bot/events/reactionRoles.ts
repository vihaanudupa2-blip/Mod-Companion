import type { MessageReaction, PartialMessageReaction, User, PartialUser } from "discord.js";

function normalizeEmoji(emoji: MessageReaction["emoji"]): string {
  return emoji.id ? `<:${emoji.name}:${emoji.id}>` : (emoji.name ?? "");
}

export async function onReactionAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
): Promise<void> {
  if (user.bot) return;

  // Fetch partial data if needed
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  const guild = reaction.message.guild;
  if (!guild) return;

  const reactionStr = normalizeEmoji(reaction.emoji);

  const entry = reaction.client.botState.reactionRoles.find(
    (r) =>
      r.messageId === reaction.message.id &&
      r.guildId === guild.id &&
      r.emoji === reactionStr,
  );

  if (!entry) return;

  try {
    const member = await guild.members.fetch(user.id);
    await member.roles.add(entry.roleId);
  } catch {
    // Member may have left or role may be invalid
  }
}

export async function onReactionRemove(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
): Promise<void> {
  if (user.bot) return;

  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  const guild = reaction.message.guild;
  if (!guild) return;

  const reactionStr = normalizeEmoji(reaction.emoji);

  const entry = reaction.client.botState.reactionRoles.find(
    (r) =>
      r.messageId === reaction.message.id &&
      r.guildId === guild.id &&
      r.emoji === reactionStr,
  );

  if (!entry) return;

  try {
    const member = await guild.members.fetch(user.id);
    await member.roles.remove(entry.roleId);
  } catch {
    // Member may have left or role may be invalid
  }
}
