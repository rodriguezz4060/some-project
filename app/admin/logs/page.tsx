import type { Metadata } from "next";
import { getAuditLogs, getAllAuditUsers } from "@root/lib/audit";
import { prisma } from "@root/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@root/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Журнал дій | 23 ОМБр",
};
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogFilterClient } from "../log-filter-client";
import { LogRowClient } from "./log-row-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  Vehicle: "Автомобіль",
  FuelRecord: "Заправка",
};

const actionConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  CREATE: { label: "Створення", variant: "default" },
  UPDATE: { label: "Зміна", variant: "secondary" },
  DELETE: { label: "Видалення", variant: "destructive" },
};

export default async function AdminLogsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const action = typeof sp.action === "string" && sp.action !== " " ? sp.action : undefined;
  const entityType = typeof sp.entityType === "string" && sp.entityType !== " " ? sp.entityType : undefined;
  const userEmail = typeof sp.userEmail === "string" && sp.userEmail !== " " ? sp.userEmail : undefined;

  const pageParams = new URLSearchParams();
  if (action) pageParams.set("action", action);
  if (entityType) pageParams.set("entityType", entityType);
  if (userEmail) pageParams.set("userEmail", userEmail);
  const querySuffix = pageParams.toString();

  const { logs, total, totalPages } = await getAuditLogs(page, 20, {
    action,
    entityType,
    userEmail,
  });

  const users = await getAllAuditUsers();

  const entityNames = new Map<string, { name: string; url: string }>();

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
        url: `/military/${p.id}`,
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
        url: `/bzvp/${p.id}`,
      });
    }
  }

  const vehicleIds = logs
    .filter((l) => l.entityType === "Vehicle" && l.entityId != null)
    .map((l) => l.entityId!);

  const fuelRecordIds = logs
    .filter((l) => l.entityType === "FuelRecord" && l.entityId != null)
    .map((l) => l.entityId!);

  if (vehicleIds.length > 0) {
    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, brand: true, model: true, licensePlate: true },
    });
    for (const v of vehicles) {
      entityNames.set(`Vehicle:${v.id}`, {
        name: `${v.brand} ${v.model} (${v.licensePlate})`,
        url: `/fuel/vehicles/${v.id}`,
      });
    }
  }

  if (fuelRecordIds.length > 0) {
    const records = await prisma.fuelRecord.findMany({
      where: { id: { in: fuelRecordIds } },
      select: { id: true, vehicle: { select: { id: true, brand: true, model: true, licensePlate: true } }, liters: true },
    });
    for (const r of records) {
      const vehicleName = `${r.vehicle.brand} ${r.vehicle.model} (${r.vehicle.licensePlate})`;
      entityNames.set(`FuelRecord:${r.id}`, {
        name: vehicleName,
        url: `/fuel/records/${r.id}`,
      });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ChevronLeft className="size-4" />
          Назад
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Лог дій</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Всі зміни в системі: хто, що і коли зробив
        </p>
      </div>

      <LogFilterClient users={users} />

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36 px-1.5">Дата / Час</TableHead>
              <TableHead className="w-28 px-1.5">Дія</TableHead>
              <TableHead className="w-32 px-1.5">Сутність</TableHead>
              <TableHead className="w-36 px-1.5">Користувач</TableHead>
              <TableHead className="px-1.5">Опис</TableHead>
              <TableHead className="w-10 px-1.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Немає записів логів
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const key = `${log.entityType}:${log.entityId}`;
                const info = entityNames.get(key);
                return (
                  <LogRowClient
                    key={log.id}
                    log={{
                      id: log.id,
                      action: log.action,
                      entityType: log.entityType,
                      entityId: log.entityId,
                      description: log.description,
                      changes: log.changes,
                      createdAt: log.createdAt.toISOString(),
                      userName: log.user.name ?? log.user.email,
                    }}
                    actionConfig={actionConfig[log.action] ?? { label: log.action, variant: "secondary" }}
                    entityLabel={entityLabels[log.entityType] ?? log.entityType}
                    entityName={info?.name}
                    entityUrl={info?.url}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Сторінка {page} з {totalPages} (всього {total} записів)
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/logs?page=${page - 1}${querySuffix ? `&${querySuffix}` : ""}`}>
                  <ChevronLeft className="size-4" />
                  Попередня
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/logs?page=${page + 1}${querySuffix ? `&${querySuffix}` : ""}`}>
                  Наступна
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
