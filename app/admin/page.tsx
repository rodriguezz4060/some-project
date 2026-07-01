import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@root/lib/prisma";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, List, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Адміністрування | 23 ОМБр",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const [byAction, recentLogs] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: { id: true },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const countMap: Record<string, number> = {};
  for (const row of byAction) {
    countMap[row.action] = row._count.id;
  }
  const totalLogs = byAction.reduce((sum, r) => sum + r._count.id, 0);
  const createCount = countMap.CREATE ?? 0;
  const updateCount = countMap.UPDATE ?? 0;
  const deleteCount = countMap.DELETE ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Адміністрування</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Панель керування системою
          </p>
        </div>
        <Link
          href="/admin/logs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Всі логи
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всього дій
            </CardTitle>
            <List className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Створення
            </CardTitle>
            <Plus className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{createCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Зміни
            </CardTitle>
            <Pencil className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{updateCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Видалення
            </CardTitle>
            <Trash2 className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{deleteCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Останні дії</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Поки немає записів</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 text-sm border-b border-border/30 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs text-muted-foreground shrink-0 w-14">
                    {new Date(log.createdAt).toLocaleString("uk-UA", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-medium shrink-0 w-20 text-xs">
                    {log.action === "CREATE" && (
                      <span className="text-emerald-500">Створення</span>
                    )}
                    {log.action === "UPDATE" && (
                      <span className="text-blue-500">Зміна</span>
                    )}
                    {log.action === "DELETE" && (
                      <span className="text-red-500">Видалення</span>
                    )}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {log.user.name ?? log.user.email}
                  </span>
                  <span className="break-words flex-1 min-w-0">{log.description}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
