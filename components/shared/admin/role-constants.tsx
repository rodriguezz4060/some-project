import { Shield, ShieldCheck, User, type LucideIcon } from "lucide-react";

export interface RoleInfo {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const ROLES: RoleInfo[] = [
  {
    value: "admin",
    label: "Адмін",
    description: "Повний доступ, управління користувачами",
    icon: ShieldCheck,
    color: "text-amber-400",
  },
  {
    value: "moderator",
    label: "Модератор",
    description: "Може створювати та редагувати анкети",
    icon: Shield,
    color: "text-blue-400",
  },
  {
    value: "user",
    label: "Користувач",
    description: "Тільки перегляд даних",
    icon: User,
    color: "text-muted-foreground",
  },
];

export function getRoleInfo(value: string): RoleInfo {
  return ROLES.find((r) => r.value === value) ?? ROLES[2];
}

export function RoleBadge({ role }: { role: string }) {
  const info = getRoleInfo(role);
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${info.color}`}>
      <Icon className="size-3.5" />
      {info.label}
    </span>
  );
}
