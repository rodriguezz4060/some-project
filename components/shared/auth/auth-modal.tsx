"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogIn, LogOut, Shield, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";

export function AuthModal() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (status === "loading" && !mounted) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        <div className="hidden sm:flex flex-col items-end gap-1.5">
          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-[74px] animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (session?.user) {
    const role = session.user.role;
    const canAdmin = role === "admin" || role === "moderator";

    const roleConfig = {
      admin: { icon: ShieldCheck, iconClass: "text-amber-400", label: "Адмін" },
      moderator: { icon: Shield, iconClass: "text-blue-400", label: "Модератор" },
      user: { icon: User, iconClass: "text-muted-foreground", label: "Користувач" },
    } as const;

    const cfg = roleConfig[role as keyof typeof roleConfig] ?? roleConfig.user;
    const RoleIcon = cfg.icon;

    return (
      <div className="flex items-center gap-3">
        {canAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShieldCheck className="size-4 text-amber-400" />
            <span className="hidden sm:inline">{role === "admin" ? "Адмін" : "Модер."}</span>
          </Link>
        )}
        <div className="hidden sm:flex flex-col items-end text-xs">
          <span className="font-medium text-foreground">
            {session.user.name ?? session.user.email}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <RoleIcon className={`size-3 ${cfg.iconClass}`} />
            {cfg.label}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="gap-1.5"
        >
          <LogOut className="size-4" />
          Вийти
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <LogIn className="size-4" />
          Вхід
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="max-w-180 grid grid-cols-1 md:grid-cols-[38%_62%] gap-0 p-0 overflow-hidden"
      >
        <div className="flex flex-col justify-center gap-6 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Вхід
            </h2>
            <p className="text-sm text-zinc-400">
              Увійдіть у свій обліковий запис
            </p>
          </div>

          <AuthForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
