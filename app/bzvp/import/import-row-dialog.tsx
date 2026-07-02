"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@root/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { STATUS_BADGE, STATUS_LABEL, type Decision } from "./import-constants";
import { FIELD_LABELS, SECTIONS } from "@/components/shared/bzvp/fields";
import type { ParsedRow } from "@root/actions/bzvp/import";

interface Props {
  row: ParsedRow;
  decision: Decision;
  onDecisionChange: (d: Decision) => void;
  onClose: () => void;
}

export function ImportRowDialog({ row, decision, onDecisionChange, onClose }: Props) {
  const isError = row.errors.length > 0;
  const isDuplicate = !!row.duplicate;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 flex-wrap text-lg">
            <span className="text-xl">{row.data.fullName || "Без ПІБ"}</span>
            {row.data.rank && (
              <Badge variant="secondary" className="text-xs font-medium px-3 py-0.5">{row.data.rank}</Badge>
            )}
            {row.data.status && (
              <Badge variant="outline" className={cn("text-xs font-medium px-3 py-0.5", STATUS_BADGE[row.data.status])}>
                {STATUS_LABEL[row.data.status] ?? row.data.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-950/30 p-4 mb-6">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle className="size-4" /> Помилки валідації
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-rose-600/80 dark:text-rose-400/80">
              {row.errors.map((e, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 block size-1 rounded-full bg-rose-400 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isDuplicate && (
          <div className="rounded-xl bg-orange-500/10 border border-orange-200 dark:border-orange-950/30 p-4 mb-6">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <AlertTriangle className="size-4" /> Знайдено дублікат
            </p>
            <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mt-1.5">
              {row.duplicate!.fullName} (ID: {row.duplicate!.id}, {row.duplicate!.birthDate})
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Дія для дубліката:</span>
              <select
                value={decision}
                onChange={(e) => onDecisionChange(e.target.value as Decision)}
                className="text-xs rounded-lg border border-border bg-background px-3 py-1.5 cursor-pointer"
              >
                <option value="skip">Пропустити</option>
                <option value="update">Оновити існуючий</option>
                <option value="add">Додати як новий</option>
              </select>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const values = section.fields
              .map((f) => ({ label: FIELD_LABELS[f], value: row.data[f] }))
              .filter((v) => v.value);

            if (values.length === 0) return null;

            return (
              <div key={section.title} className="rounded-xl border border-border/60 bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground/90 mb-4 pb-2 border-b border-border/40">
                  {section.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {values.map((v) => (
                    <div key={v.label} className="text-sm leading-snug">
                      <span className="block text-[11px] text-muted-foreground/70 tracking-wide uppercase mb-0.5">
                        {v.label}
                      </span>
                      <span className="font-medium text-foreground/90">{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!isError && !isDuplicate && (
          <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Буде додано</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
