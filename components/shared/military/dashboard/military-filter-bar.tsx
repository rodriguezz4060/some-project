"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusConfig } from "../constants";
import type { StatusFilterValue } from "../types";

const STATUS_LABELS: Record<string, string> = {
  all: "Усі військові",
  ...Object.fromEntries(
    Object.entries(statusConfig).map(([key, config]) => [key, config.label]),
  ),
};

const FILTER_OPTIONS: StatusFilterValue[] = [
  "all",
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

interface Props {
  currentFilter: StatusFilterValue;
  activeCount: number;
  shownCount: number;
  totalDbCount: number;
}

export function MilitaryFilterBar({
  currentFilter,
  activeCount,
  shownCount,
  totalDbCount,
}: Props) {
  const router = useRouter();

  const handleFilterChange = useCallback(
    (value: string) => {
      if (value === "all") {
        router.replace("/military");
      } else {
        router.replace(`/military?status=${value}`);
      }
    },
    [router],
  );

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">Активний склад</h2>
        <p className="text-sm text-muted-foreground">
          Управління особовим складом підрозділу
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-44" aria-label="Фільтр за статусом">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-muted-foreground">
              Активних:{" "}
              <span className="font-medium text-foreground">
                {activeCount}
              </span>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Показано:{" "}
            <span className="font-medium text-foreground">{shownCount}</span> з{" "}
            {totalDbCount}
          </div>
        </div>
      </div>
    </div>
  );
}
