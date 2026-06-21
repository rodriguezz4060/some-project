import type { RankType, StatusType } from "./types";

export const rankColors: Record<RankType, string> = {
  "старший лейтенант": "bg-blue-100 text-blue-700 border-blue-200",
  капітан: "bg-indigo-100 text-indigo-700 border-indigo-200",
  сержант: "bg-green-100 text-green-700 border-green-200",
  майор: "bg-purple-100 text-purple-700 border-purple-200",
  полковник: "bg-red-100 text-red-700 border-red-200",
  лейтенант: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export type StatusIconName = "Activity" | "Shield" | "Calendar";

export interface StatusConfigEntry {
  color: string;
  label: string;
  iconName: StatusIconName;
}

export const statusConfig: Record<StatusType, StatusConfigEntry> = {
  active: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Активний",
    iconName: "Activity",
  },
  "on-mission": {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "На завданні",
    iconName: "Shield",
  },
  wounded: {
    color: "bg-rose-100 text-rose-700 border-rose-200",
    label: "Поранений",
    iconName: "Activity",
  },
  vacation: {
    color: "bg-sky-100 text-sky-700 border-sky-200",
    label: "Відпустка",
    iconName: "Calendar",
  },
  reserve: {
    color: "bg-gray-100 text-gray-700 border-gray-200",
    label: "Резерв",
    iconName: "Shield",
  },
};
