import type { Metadata } from "next";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@root/actions/profile";
import { getAuditLogs } from "@root/lib/audit";
import { prisma } from "@root/lib/prisma";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Профіль | 23 ОМБр",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const [lastName, ...rest] = parts;
  const initials = rest.map((p) => `${p[0]}.`).join("");
  return `${lastName} ${initials}`;
}

const entityLabels: Record<string, string> = {
  MilitaryPersonnel: "Військовий",
  BzvpPersonnel: "БЗВП",
  User: "Користувач",
};

export default async function ProfilePage(props: Props) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.id) redirect("/");

  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const userId = Number(session.user.id);

  const user = await getProfile();

  const { logs, total, totalPages } = await getAuditLogs(page, 10, {
    userId,
  });

  const entityNames = new Map<string, { name: string }>();

  const militaryIds = logs
    .filter((l) => l.entityType === "MilitaryPersonnel" && l.entityId != null)
    .map((l) => l.entityId!);

  const bzvpIds = logs
    .filter((l) => l.entityType === "BzvpPersonnel" && l.entityId != null)
    .map((l) => l.entityId!);

  if (militaryIds.length > 0) {
    const personnel = await prisma.militaryPersonnel.findMany({
      where: { id: { in: militaryIds } },
      select: { id: true, fullName: true },
    });
    for (const p of personnel) {
      entityNames.set(`MilitaryPersonnel:${p.id}`, {
        name: formatShortName(p.fullName),
      });
    }
  }

  if (bzvpIds.length > 0) {
    const personnel = await prisma.bzvpPersonnel.findMany({
      where: { id: { in: bzvpIds } },
      select: { id: true, fullName: true },
    });
    for (const p of personnel) {
      entityNames.set(`BzvpPersonnel:${p.id}`, {
        name: formatShortName(p.fullName),
      });
    }
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      }}
      logs={logs.map((log) => {
        const key = `${log.entityType}:${log.entityId}`;
        const info = entityNames.get(key);
        return {
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          description: log.description,
          changes: log.changes,
          createdAt: log.createdAt.toISOString(),
          entityName: info?.name,
          entityLabel: entityLabels[log.entityType] ?? log.entityType,
        };
      })}
      totalLogs={total}
      totalLogPages={totalPages}
      currentLogPage={page}
    />
  );
}
