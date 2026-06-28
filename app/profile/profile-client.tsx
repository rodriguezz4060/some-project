"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  Key,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateProfile } from "@root/actions/profile";

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

const actionConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  CREATE: { label: "Створення", variant: "default" },
  UPDATE: { label: "Зміна", variant: "secondary" },
  DELETE: { label: "Видалення", variant: "destructive" },
};

export function ProfileClient({
  user: initialUser,
  logs,
  totalLogs,
  totalLogPages,
  currentLogPage,
}: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [name, setName] = useState(initialUser.name ?? "");
  const [editingName, setEditingName] = useState(false);
  const [nameDirty, setNameDirty] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const roleCfg = roleConfig[initialUser.role] ?? roleConfig.user;
  const RoleIcon = roleCfg.icon;

  async function handleSaveName() {
    if (!nameDirty) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name });
      await updateSession({ name });
      toast.success("Ім'я оновлено");
      setEditingName(false);
      setNameDirty(false);
    } catch {
      toast.error("Не вдалося оновити ім'я");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelName() {
    setName(initialUser.name ?? "");
    setEditingName(false);
    setNameDirty(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Введіть поточний пароль");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Новий пароль має бути не менше 6 символів");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Паролі не співпадають");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      toast.success("Пароль змінено");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не вдалося змінити пароль");
    } finally {
      setSaving(false);
    }
  }

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

            {/* Name (editable) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Ім&apos;я
              </label>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameDirty(e.target.value !== (initialUser.name ?? ""));
                    }}
                    className="h-9 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") handleCancelName();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                    onClick={handleSaveName}
                    disabled={saving}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={handleCancelName}
                    disabled={saving}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-muted-foreground/60" />
                    <span>{initialUser.name ?? "—"}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingName(true)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Пароль</CardTitle>
            <CardDescription>
              {showPasswordForm ? "Введіть новий пароль" : "Оновіть пароль для входу"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Поточний пароль"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-9 pr-9 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Новий пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Підтвердіть новий пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 pr-9 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? "Збереження..." : "Зберегти пароль"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={saving}
                  >
                    Скасувати
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowPasswordForm(true)}
              >
                <Key className="size-4" />
                Змінити пароль
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="size-5 text-muted-foreground/60" />
              Мої дії
            </CardTitle>
            <CardDescription>
              Останні зміни, які ви зробили в системі
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36 px-3 text-xs">Дата / Час</TableHead>
                  <TableHead className="w-24 px-3 text-xs">Дія</TableHead>
                  <TableHead className="w-28 px-3 text-xs">Сутність</TableHead>
                  <TableHead className="px-3 text-xs">Опис</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                      <div className="flex flex-col items-center gap-2">
                        <History className="size-8 text-muted-foreground/30" />
                        <span>Ви ще не зробили жодної дії</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const actionCfg = actionConfig[log.action] ?? {
                      label: log.action,
                      variant: "secondary" as const,
                    };
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground px-3 tabular-nums">
                          {new Date(log.createdAt).toLocaleString("uk-UA", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge variant={actionCfg.variant} className="text-xs">
                            {actionCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground px-3">
                          {log.entityLabel}
                          {log.entityName && (
                            <span className="ml-1">· {log.entityName}</span>
                          )}
                          {log.entityId != null && !log.entityName && (
                            <span className="ml-1 text-[11px]">#{log.entityId}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs px-3 min-w-0 break-words whitespace-pre-wrap">
                          {log.description}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalLogPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              {totalLogs}{" "}
              {totalLogs === 1
                ? "запис"
                : totalLogs > 4
                  ? "записів"
                  : "записи"}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentLogPage <= 1}
                onClick={() => navigateToLogPage(currentLogPage - 1)}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline ml-1">Попередня</span>
              </Button>
              <span className="px-3 text-xs text-muted-foreground tabular-nums">
                {currentLogPage} / {totalLogPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentLogPage >= totalLogPages}
                onClick={() => navigateToLogPage(currentLogPage + 1)}
              >
                <span className="hidden sm:inline mr-1">Наступна</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
