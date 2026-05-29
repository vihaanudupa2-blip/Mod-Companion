import type { GuildMember } from "discord.js";

export function isAdmin(member: GuildMember): boolean {
  return (
    member.permissions.has("Administrator") ||
    member.permissions.has("ManageGuild")
  );
}

export function isModerator(member: GuildMember): boolean {
  return (
    isAdmin(member) ||
    member.permissions.has("KickMembers") ||
    member.permissions.has("BanMembers") ||
    member.permissions.has("ManageMessages") ||
    member.roles.cache.some((r) =>
      ["mod", "moderator", "staff"].includes(r.name.toLowerCase()),
    )
  );
}
