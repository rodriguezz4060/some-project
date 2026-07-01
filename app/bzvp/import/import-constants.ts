export type Decision = "skip" | "update" | "add";

export const STATUS_BADGE: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400",
  graduated: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400",
  transferred: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400",
  failed: "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400",
};

export const STATUS_LABEL: Record<string, string> = {
  training: "Навчання",
  graduated: "Випускник",
  transferred: "Переведений",
  failed: "Не склав",
};
