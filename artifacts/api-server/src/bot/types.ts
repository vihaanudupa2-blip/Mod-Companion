import type { Collection, Message } from "discord.js";

export interface WarnEntry {
  userId: string;
  guildId: string;
  reason: string;
  moderatorId: string;
  timestamp: Date;
}

export interface DuplicateTracker {
  message: string;
  count: number;
  lastSeen: number;
}

export interface ReactionRoleEntry {
  messageId: string;
  channelId: string;
  guildId: string;
  emoji: string;
  roleId: string;
}

export interface BotState {
  warnings: Map<string, WarnEntry[]>;
  duplicateMessages: Map<string, DuplicateTracker>;
  reactionRoles: ReactionRoleEntry[];
}

declare module "discord.js" {
  interface Client {
    botState: BotState;
    commands: Collection<string, Command>;
  }
}

export interface CommandContext {
  message: Message;
  args: string[];
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  requiredPermissions: string[];
  execute(ctx: CommandContext): Promise<void>;
}
