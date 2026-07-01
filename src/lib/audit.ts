import { prisma } from "@root/lib/prisma";
import { auth } from "@root/lib/auth";
import type { Session } from "next-auth";

interface ChangeEntry {
  old: string | null;
  new: string | null;
}

async function resolveUserId(session: Session | null): Promise<number | null> {
  const id = Number(session?.user?.id);
  return Number.isNaN(id) ? null : id;
}

async function writeLog(
  userId: number,
  action: string,
  entityType: string,
  entityId: number,
  description: string,
  changes?: Record<string, ChangeEntry>,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        changes:
          changes && Object.keys(changes).length > 0
            ? JSON.parse(JSON.stringify(changes))
            : undefined,
      },
    });
  } catch {
    console.warn("Audit log skipped:", { action, entityType, entityId });
  }
}

export function logCreate(
  entityType: string,
  entityId: number,
  description: string,
  userId?: number,
) {
  if (!userId) {
    auth().then(async (session) => {
      const uid = await resolveUserId(session);
      if (uid) writeLog(uid, "CREATE", entityType, entityId, description);
    });
    return;
  }

  writeLog(userId, "CREATE", entityType, entityId, description);
}

export function logUpdate(
  entityType: string,
  entityId: number,
  description: string,
  changes?: Record<string, ChangeEntry>,
  userId?: number,
) {
  if (!userId) {
    auth().then(async (session) => {
      const uid = await resolveUserId(session);
      if (uid) writeLog(uid, "UPDATE", entityType, entityId, description, changes);
    });
    return;
  }

  writeLog(userId, "UPDATE", entityType, entityId, description, changes);
}

export function logDelete(
  entityType: string,
  entityId: number,
  description: string,
  userId?: number,
) {
  if (!userId) {
    auth().then(async (session) => {
      const uid = await resolveUserId(session);
      if (uid) writeLog(uid, "DELETE", entityType, entityId, description);
    });
    return;
  }

  writeLog(userId, "DELETE", entityType, entityId, description);
}

export interface AuditLogFilter {
  action?: string;
  entityType?: string;
  userId?: number;
  userEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAuditLogs(
  page = 1,
  pageSize = 20,
  filters?: AuditLogFilter,
) {
  const where: Record<string, unknown> = {};

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.userEmail) {
    const user = await prisma.user.findUnique({ where: { email: filters.userEmail } });
    if (user) {
      where.userId = user.id;
    }
  }

  if (filters?.dateFrom || filters?.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (filters.dateFrom) {
      createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      createdAt.lte = new Date(filters.dateTo);
    }
    where.createdAt = createdAt;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getAllAuditUsers() {
  const result = await prisma.auditLog.findMany({
    select: { userId: true, user: { select: { name: true, email: true, id: true } } },
    distinct: ["userId"],
  });
  return result.map((r) => r.user);
}
