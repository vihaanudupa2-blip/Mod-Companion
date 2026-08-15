import type { StringSelectMenuInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { db, selfRoleMenusTable } from "@workspace/db";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export async function onStringSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  if (!interaction.customId.startsWith("selfrole:") || !interaction.guild) return;
  const menuId = Number(interaction.customId.slice("selfrole:".length));
  if (!Number.isInteger(menuId)) return;

  const [menu] = await db.select().from(selfRoleMenusTable).where(and(eq(selfRoleMenusTable.id, menuId), eq(selfRoleMenusTable.guildId, interaction.guild.id), eq(selfRoleMenusTable.active, true)));
  if (!menu) {
    await interaction.reply({ embeds: [errorEmbed("Menu unavailable", "This self-role menu is no longer active.")], ephemeral: true });
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const selected = new Set(interaction.values);
  const configured = new Set(menu.roleIds);
  for (const roleId of configured) {
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role || role.managed || role.position >= (interaction.guild.members.me?.roles.highest.position ?? 0)) continue;
    if (selected.has(roleId)) await member.roles.add(role, "Self-role menu selection").catch(() => null);
    else await member.roles.remove(role, "Self-role menu selection").catch(() => null);
  }

  await interaction.reply({
    embeds: [successEmbed("Roles updated", "Your self-selected roles have been updated.")],
    ephemeral: true,
  });
}