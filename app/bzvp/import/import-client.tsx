"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileSpreadsheet, Download, Loader2, AlertTriangle,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@root/lib/utils";
import { toast } from "sonner";
import { parseExcelBzvp, importBzvp } from "@root/actions/import-bzvp";
import type { ParsedRow, ParseResult } from "@root/actions/import-bzvp";
import { FIELD_LABELS, SECTIONS } from "@/components/shared/bzvp/fields";

const STATUS_BADGE: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400",
  graduated: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400",
  transferred: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400",
  failed: "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400",
};

const STATUS_LABEL: Record<string, string> = {
  training: "Навчання",
  graduated: "Випускник",
  transferred: "Переведений",
  failed: "Не склав",
};

type Decision = "skip" | "update" | "add";

function RowDialog({
  row,
  decision,
  onDecisionChange,
  onClose,
}: {
  row: ParsedRow;
  decision: Decision;
  onDecisionChange: (d: Decision) => void;
  onClose: () => void;
}) {
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

export function ImportClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [previewPage, setPreviewPage] = useState(0);
  const [selectedRow, setSelectedRow] = useState<ParsedRow | null>(null);
  const PREVIEW_PAGE_SIZE = 10;

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Непідтримуваний формат. Завантажте .xlsx, .xls або .csv");
      return;
    }
    setFile(f);
    setParsing(true);
    setResult(null);
    setDecisions({});
    setSelectedRow(null);

    try {
      const fd = new FormData();
      fd.append("file", f);
      const parsed = await parseExcelBzvp(fd);
      setResult(parsed);
      const initial: Record<number, Decision> = {};
      for (const row of parsed.rows) {
        if (row.duplicate) {
          initial[row.index] = "skip";
        }
      }
      setDecisions(initial);
      setPreviewPage(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Помилка при парсингу файлу");
    } finally {
      setParsing(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const handleImport = useCallback(async () => {
    if (!result) return;
    setImporting(true);
    try {
      const res = await importBzvp(result.rows, decisions);
      toast.success(`Імпорт завершено: ${res.imported} додано, ${res.updated} оновлено, ${res.skipped} пропущено`);
      router.push("/bzvp");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Помилка при імпорті");
    } finally {
      setImporting(false);
    }
  }, [result, decisions, router]);

  const setDecision = useCallback(
    (index: number, d: Decision) => {
      setDecisions((prev) => ({ ...prev, [index]: d }));
    },
    [],
  );

  const totalPages = result ? Math.ceil(result.rows.length / PREVIEW_PAGE_SIZE) : 0;
  const pageRows = result
    ? result.rows.slice(previewPage * PREVIEW_PAGE_SIZE, (previewPage + 1) * PREVIEW_PAGE_SIZE)
    : [];

  if (parsing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
          <p className="text-base text-muted-foreground">Парсинг файлу...</p>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    const validToImport = result.rows.filter(
      (r) => r.errors.length === 0 && decisions[r.index] !== "skip",
    ).length;

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="size-5 text-primary" />
                <span className="text-sm font-medium">{file?.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  {result.validCount} валідних
                </Badge>
                {result.errorCount > 0 && (
                  <Badge variant="outline" className="gap-1 border-rose-300">
                    <XCircle className="size-3.5 text-rose-500" />
                    {result.errorCount} з помилками
                  </Badge>
                )}
                {result.duplicateCount > 0 && (
                  <Badge variant="outline" className="gap-1 border-orange-300">
                    <AlertTriangle className="size-3.5 text-orange-500" />
                    {result.duplicateCount} дублікатів
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {result.rows.length > 0 && (
          <Card>
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
                        onClick={() => setSelectedRow(row)}
                      >
                        <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                          {row.index + 1}
                        </td>
                        <td className={cn(
                          "px-3 py-2 text-sm font-medium max-w-[200px] truncate",
                          !row.data.fullName && "text-rose-500",
                        )}>
                          {row.data.fullName || "—"}
                        </td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">
                          {row.data.rank || "—"}
                        </td>
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
                            <span className="text-xs text-rose-500 flex items-center gap-1">
                              <XCircle className="size-3" /> Помилка
                            </span>
                          ) : isDuplicate ? (
                            <select
                              value={decision}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setDecision(row.index, e.target.value as Decision)}
                              className="text-xs rounded border border-border bg-background px-2 py-1 cursor-pointer"
                            >
                              <option value="skip">Пропустити</option>
                              <option value="update">Оновити</option>
                              <option value="add">Додати</option>
                            </select>
                          ) : (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Додати
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="icon-sm" className="size-7" onClick={(e) => { e.stopPropagation(); setSelectedRow(row); }}>
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={previewPage <= 0}
                  onClick={() => setPreviewPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {previewPage + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={previewPage >= totalPages - 1}
                  onClick={() => setPreviewPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </Card>
        )}

        {selectedRow && (
          <RowDialog
            row={selectedRow}
            decision={decisions[selectedRow.index] ?? "add"}
            onDecisionChange={(d) => setDecision(selectedRow.index, d)}
            onClose={() => setSelectedRow(null)}
          />
        )}

        <div className="flex items-center gap-3">
          <Button
            size="lg"
            onClick={handleImport}
            disabled={importing || validToImport === 0}
            className="gap-2"
          >
            {importing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {importing
              ? "Імпорт..."
              : `Імпортувати ${validToImport} записів`}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setResult(null);
              setFile(null);
              setDecisions({});
              setSelectedRow(null);
            }}
            disabled={importing}
          >
            Скасувати
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex flex-col items-center justify-center py-16 gap-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30",
          )}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-base font-medium">
              {dragOver ? "Відпустіть файл" : "Перетягніть Excel-файл сюди"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              або натисніть, щоб вибрати файл
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>.xlsx</span>
            <span>·</span>
            <span>.xls</span>
            <span>·</span>
            <span>.csv</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="link" size="sm" className="gap-1.5" asChild>
          <a href="/api/bzvp-template" download>
            <Download className="size-4" />
            Завантажити шаблон Excel
          </a>
        </Button>
      </div>
    </div>
  );
}
