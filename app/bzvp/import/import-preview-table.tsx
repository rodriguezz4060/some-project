"use client";

import { ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@root/lib/utils";
import { STATUS_BADGE, STATUS_LABEL, type Decision } from "./import-constants";
import type { ParsedRow } from "@root/actions/import-bzvp";

interface Props {
  rows: ParsedRow[];
  page: number;
  totalPages: number;
  decisions: Record<number, Decision>;
  onPageChange: (page: number) => void;
  onDecisionChange: (index: number, d: Decision) => void;
  onSelectRow: (row: ParsedRow) => void;
}

export function ImportPreviewTable({ rows, page, totalPages, decisions, onPageChange, onDecisionChange, onSelectRow }: Props) {
  const pageRows = rows.slice(page * 10, (page + 1) * 10);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium w-8">#</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">ПІБ</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Звання</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Статус</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium min-w-[140px]">Дія</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const isError = row.errors.length > 0;
              const isDuplicate = !!row.duplicate;
              const decision = decisions[row.index] ?? "add";

              return (
                <tr
                  key={row.index}
                  className={cn(
                    "border-b border-border/50 transition-colors cursor-pointer",
                    isError && "bg-rose-500/5",
                    isDuplicate && !isError && "bg-orange-500/10",
                    !isError && !isDuplicate && "hover:bg-muted/30",
                  )}
                  onClick={() => onSelectRow(row)}
                >
                  <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{row.index + 1}</td>
                  <td className={cn("px-3 py-2 text-sm font-medium max-w-[200px] truncate", !row.data.fullName && "text-rose-500")}>
                    {row.data.fullName || "—"}
                  </td>
                  <td className="px-3 py-2 text-sm text-muted-foreground">{row.data.rank || "—"}</td>
                  <td className="px-3 py-2">
                    {row.data.status ? (
                      <Badge variant="outline" className={cn("text-[10px] font-medium", STATUS_BADGE[row.data.status])}>
                        {STATUS_LABEL[row.data.status] ?? row.data.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isError ? (
                      <span className="text-xs text-rose-500 flex items-center gap-1"><XCircle className="size-3" /> Помилка</span>
                    ) : isDuplicate ? (
                      <select
                        value={decision}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onDecisionChange(row.index, e.target.value as Decision)}
                        className="text-xs rounded border border-border bg-background px-2 py-1 cursor-pointer"
                      >
                        <option value="skip">Пропустити</option>
                        <option value="update">Оновити</option>
                        <option value="add">Додати</option>
                      </select>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="size-3" /> Додати</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon-sm" className="size-7" onClick={(e) => { e.stopPropagation(); onSelectRow(row); }}>
                      <Eye className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-3 py-3 border-t border-border">
          <Button variant="ghost" size="icon-sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="icon-sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}
