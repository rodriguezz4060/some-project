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
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    iconName: "Activity",
  },
  graduated: {
    label: "Випущено",
    color: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconName: "GraduationCap",
  },
  transferred: {
    label: "Переведено",
    color: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    iconName: "UserCheck",
  },
  failed: {
    label: "Не склав",
    color: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
    iconName: "XCircle",
  },
};

export const BZVP_STATUSES: BzvpStatus[] = [
  "training",
  "graduated",
  "transferred",
  "failed",
];
