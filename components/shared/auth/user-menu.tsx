"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const roleConfig: Record<
  string,
  { label: string; icon: typeof Shield; className: string }
> = {
  admin: {
    label: "Адміністратор",
    icon: ShieldCheck,
    className: "text-amber-400",
  },
  moderator: {
    label: "Модератор",
    icon: ShieldAlert,
    className: "text-blue-400",
  },
  user: { label: "Користувач", icon: User, className: "text-muted-foreground" },
};

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;

  const role = user.role ?? "user";
  const canAdmin = role === "admin" || role === "moderator";
  const cfg = roleConfig[role] ?? roleConfig.user;
  const RoleIcon = cfg.icon;
  const initials = getInitials(user.name, user.email ?? "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50 data-[state=open]:bg-muted/50 outline-none"
        >
          <Avatar size="sm">
            <AvatarFallback className="text-[10px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline font-medium max-w-28 truncate">
            {user.name ?? user.email}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground/60 transition-transform data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal " asChild>
          <div className="flex items-start gap-3 p-2 ">
            <Avatar>
              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">
                {user.name ?? "Користувач"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium">
                <RoleIcon className={`size-3 ${cfg.className}`} />
                <span className={cfg.className}>{cfg.label}</span>
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="size-4" />
            Профіль
          </Link>
        </DropdownMenuItem>

        {canAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <ShieldCheck className="size-4 text-amber-400" />
              Адміністрування
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Вийти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
