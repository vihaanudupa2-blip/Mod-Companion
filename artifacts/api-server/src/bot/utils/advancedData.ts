import {
  db,
  auditLogsTable,
  moderationCasesTable,
  securitySettingsTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";

export const DEFAULT_SECURITY_SETTINGS = {
  antiNukeEnabled: false,
  roleProtectEnabled: false,
  messageLogsEnabled: false,
  messageLogChannelId: null,
  cleanupEnabled: false,
  cleanupChannelId: null,
  cleanupAfterMinutes: 1440,
  antiNukeThreshold: 3,
  trustedUsers: [] as string[],
};

export async function getSecuritySettings(guildId: string) {
  const [row] = await db
    .select()
    .from(securitySettingsTable)
    .where(eq(securitySettingsTable.guildId, guildId));

  return row ?? {
    ...DEFAULT_SECURITY_SETTINGS,
    guildId,
    updatedAt: new Date(),
  };
}

export async function updateSecuritySettings(
  guildId: string,
  values: Partial<typeof securitySettingsTable.$inferInsert>,
) {
  const [row] = await db
    .insert(securitySettingsTable)
    .values({ guildId, ...values })
    .onConflictDoUpdate({
      target: securitySettingsTable.guildId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();
  return row;
}

export async function isTrustedUser(guildId: string, userId: string): Promise<boolean> {
  const settings = await getSecuritySettings(guildId);
  return settings.trustedUsers.includes(userId);
}

export async function recordAuditLog(values: typeof auditLogsTable.$inferInsert): Promise<void> {
  await db.insert(auditLogsTable).values(values);
}

export async function nextCaseNumber(guildId: string): Promise<number> {
  const [latest] = await db
    .select({ caseNumber: moderationCasesTable.caseNumber })
    .from(moderationCasesTable)
    .where(eq(moderationCasesTable.guildId, guildId))
    .orderBy(desc(moderationCasesTable.caseNumber))
    .limit(1);
  return (latest?.caseNumber ?? 0) + 1;
}

export async function createModerationCase(values: {
  guildId: string;
  action: string;
  userId: string;
  moderatorId: string;
  reason: string;
}): Promise<number> {
  const caseNumber = await nextCaseNumber(values.guildId);
  await db.insert(moderationCasesTable).values({ ...values, caseNumber });
  await recordAuditLog({
    guildId: values.guildId,
    action: "moderation_case_created",
    actorId: values.moderatorId,
    targetId: values.userId,
    details: `Case #${caseNumber}: ${values.action} — ${values.reason}`,
  });
  return caseNumber;
}