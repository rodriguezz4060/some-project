"use client";

import { useRouter } from "next/navigation";
import { Mail, Shield, ShieldCheck, ShieldAlert, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableNameField } from "./editable-name-field";
import { PasswordChangeCard } from "./password-change-form";
import { AuditLogTable } from "./audit-log-table";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface LogEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  changes: unknown;
  createdAt: string;
  entityName?: string;
  entityLabel: string;
}

interface Props {
  user: UserData;
  logs: LogEntry[];
  totalLogs: number;
  totalLogPages: number;
  currentLogPage: number;
}

const roleConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  admin: { label: "Адміністратор", icon: ShieldCheck, className: "text-amber-400" },
  moderator: { label: "Модератор", icon: ShieldAlert, className: "text-blue-400" },
  user: { label: "Користувач", icon: User, className: "text-muted-foreground" },
};

export function ProfileClient({
  user: initialUser,
  logs,
  totalLogs,
  totalLogPages,
  currentLogPage,
}: Props) {
  const router = useRouter();

  const roleCfg = roleConfig[initialUser.role] ?? roleConfig.user;
  const RoleIcon = roleCfg.icon;

  function navigateToLogPage(page: number) {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    router.replace(`/profile${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Profile header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Профіль</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Керування обліковим записом та перегляд активності
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        {/* Profile info card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Обліковий запис</CardTitle>
            <CardDescription>Основна інформація та налаштування</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Електронна пошта
              </label>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground/60" />
                <span>{initialUser.email}</span>
              </div>
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Роль
              </label>
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${roleCfg.className}`}
              >
                <RoleIcon className="size-4" />
                {roleCfg.label}
              </span>
            </div>

            <EditableNameField name={initialUser.name} />
          </CardContent>
        </Card>

        <PasswordChangeCard />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Мої дії</CardTitle>
          <CardDescription>Останні зміни, які ви зробили в системі</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AuditLogTable
            logs={logs}
            totalLogs={totalLogs}
            totalPages={totalLogPages}
            currentPage={currentLogPage}
            onPageChange={navigateToLogPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
