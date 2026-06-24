import { Activity, GraduationCap, UserCheck, XCircle, type LucideIcon } from "lucide-react";
import type { BzvpStatus } from "./types";

export const statusIconMap: Record<string, LucideIcon> = {
  Activity,
  GraduationCap,
  UserCheck,
  XCircle,
};

export const BZVP_STATUS_CONFIG: Record<BzvpStatus, {
  label: string;
  color: string;
  badge: string;
  iconName: string;
}> = {
  training: {
    label: "Навчання",
    color: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    iconName: "Activity",
  },
  graduated: {
    label: "Випущено",
    color: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    iconName: "GraduationCap",
  },
  transferred: {
    label: "Переведено",
    color: "bg-violet-500",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    iconName: "UserCheck",
  },
  failed: {
    label: "Не склав",
    color: "bg-red-500",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    iconName: "XCircle",
  },
};

export const BZVP_STATUSES: BzvpStatus[] = [
  "training",
  "graduated",
  "transferred",
  "failed",
];

export const STATUS_SELECTED_CLASSES: Record<BzvpStatus, string> = {
  training: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  graduated: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  transferred: "bg-violet-500/20 text-violet-400 border-violet-500/50",
  failed: "bg-red-500/20 text-red-400 border-red-500/50",
};
