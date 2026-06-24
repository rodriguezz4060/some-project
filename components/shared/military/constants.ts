import type { RankType, StatusType } from "./types";

export const rankColors: Record<RankType, string> = {
  "старший лейтенант": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  капітан: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  сержант: "bg-green-500/15 text-green-400 border-green-500/30",
  майор: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  полковник: "bg-red-500/15 text-red-400 border-red-500/30",
  лейтенант: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

export const STATUS_SELECTED_CLASSES: Record<StatusType, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  "on-mission": "bg-amber-500/20 text-amber-400 border-amber-500/50",
  wounded: "bg-rose-500/20 text-rose-400 border-rose-500/50",
  vacation: "bg-sky-500/20 text-sky-400 border-sky-500/50",
  reserve: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

export type StatusIconName = "Activity" | "Shield" | "Calendar";

export interface StatusConfigEntry {
  color: string;
  label: string;
  iconName: StatusIconName;
}

export const statusConfig: Record<StatusType, StatusConfigEntry> = {
  active: {
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    label: "Активний",
    iconName: "Activity",
  },
  "on-mission": {
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    label: "На завданні",
    iconName: "Shield",
  },
  wounded: {
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    label: "Поранений",
    iconName: "Activity",
  },
  vacation: {
    color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    label: "Відпустка",
    iconName: "Calendar",
  },
  reserve: {
    color: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    label: "Резерв",
    iconName: "Shield",
  },
};
