"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Plus,
  Shield,
  ShieldCheck,
  User,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserFormDialog } from "./user-form-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  users: User[];
  currentUserId: number;
  total: number;
  totalPages: number;
  currentPage: number;
  currentQuery: string;
}

const roleConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  admin: { label: "Адмін", icon: ShieldCheck, className: "text-amber-400" },
  moderator: { label: "Модератор", icon: Shield, className: "text-blue-400" },
  user: { label: "Користувач", icon: User, className: "text-muted-foreground" },
};

function formatRole(role: string) {
  const cfg = roleConfig[role] ?? roleConfig.user;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.className}`}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

export function UsersTableClient({
  users,
  currentUserId,
  total,
  totalPages,
  currentPage,
  currentQuery,
}: Props) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const committedRef = useRef(currentQuery);
  const [draft, setDraft] = useState(currentQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (currentQuery !== committedRef.current) {
      committedRef.current = currentQuery;
      setDraft(currentQuery);
    }
  }, [currentQuery]);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    const q = params.q ?? draft;
    if (q) sp.set("q", q);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    committedRef.current = q;
    router.replace(`/admin/users${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  function handleSearch(value: string) {
    setDraft(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      committedRef.current = value;
      const sp = new URLSearchParams();
      if (value) sp.set("q", value);
      router.replace(`/admin/users${sp.toString() ? `?${sp.toString()}` : ""}`);
    }, 300);
  }

  function clearSearch() {
    setDraft("");
    committedRef.current = "";
    router.replace("/admin/users");
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none transition-colors ${
              isFocused ? "text-muted-foreground" : "text-muted-foreground/50"
            }`}
          />
          <Input
            value={draft}
            placeholder="Пошук за email або ім'ям..."
            className="pl-9 pr-9 h-10 bg-muted/30 dark:bg-muted/10 border-muted/50 dark:border-muted/30 focus-visible:bg-background focus-visible:border-primary/30 focus-visible:ring-3 focus-visible:ring-primary/10 transition-all"
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") clearSearch();
            }}
          />
          {!draft && !isFocused && (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50 pointer-events-none select-none">
              <span className="text-xs leading-none">⌘</span>
              <span className="leading-none">K</span>
            </kbd>
          )}
          {draft && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5 shrink-0">
          <Plus className="size-4" />
          Додати користувача
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-xs">ID</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Ім&apos;я</TableHead>
              <TableHead className="text-xs">Роль</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Створено</TableHead>
              <TableHead className="w-24 text-xs">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  {currentQuery ? "Нічого не знайдено" : "Немає користувачів"}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {user.id}
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">{user.name ?? "—"}</TableCell>
                  <TableCell>{formatRole(user.role)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell tabular-nums">
                    {new Date(user.createdAt).toLocaleDateString("uk-UA")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {total} {total === 1 ? "користувач" : total > 4 ? "користувачів" : "користувача"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => navigate({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline ml-1">Попередня</span>
            </Button>
            <span className="px-3 text-muted-foreground tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => navigate({ page: String(currentPage + 1) })}
            >
              <span className="hidden sm:inline mr-1">Наступна</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {totalPages <= 1 && total > 0 && (
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "користувач" : total > 4 ? "користувачів" : "користувача"}
        </p>
      )}

      {/* Create dialog */}
      {showCreate && (
        <UserFormDialog
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit dialog */}
      {editingUser && (
        <UserFormDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Delete dialog */}
      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          isSelf={deletingUser.id === currentUserId}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </>
  );
}
