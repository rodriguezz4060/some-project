"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Download, Loader2, AlertTriangle, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@root/lib/utils";
import { toast } from "sonner";
import { parseExcelBzvp, importBzvp } from "@root/actions/import-bzvp";
import type { ParsedRow, ParseResult } from "@root/actions/import-bzvp";

const FIELD_LABELS: Record<string, string> = {
  fullName: "ПІБ",
  rank: "Звання",
  birthDate: "Дата народження",
  birthPlace: "Місце народження",
  photo: "Фото",
  passport: "Паспорт",
  passportIssued: "Паспорт видано",
  tin: "ІПН",
  militaryId: "Військовий квиток",
  militaryIdIssued: "В/к видано",
  ubd: "УБД",
  ubdDate: "Дата УБД",
  serviceUnit: "В/ч",
  serviceYears: "Роки служби",
  civilianJob: "Цивільна робота",
  education: "Освіта",
  actualAddress: "Фактична адреса",
  registrationAddress: "Прописка",
  driverLicense: "Посвідчення водія",
  criminalRecord: "Судимість",
  policeRecords: "Поліція",
  family: "Склад сім'ї",
  phone: "Телефон",
  relativePhones: "Телефони рідних",
  personalOrder: "Особисте розпорядження",
  conscription: "Призваний",
  health: "Стан здоров'я",
  healthComplaints: "Скарги",
  moralState: "Моральний стан",
  bloodType: "Група крові",
  shoeSize: "Розмір взуття",
  notes: "Примітки",
  status: "Статус",
  arrivalDate: "Дата прибуття",
  trainingPeriod: "Період навчання",
  specialization: "Спеціалізація",
};

const REQUIRED_FIELDS = ["fullName", "rank", "birthDate", "status", "arrivalDate", "trainingPeriod"];

const VISIBLE_FIELDS = ["fullName", "rank", "birthDate", "status", "phone", "arrivalDate", "specialization"];

type Decision = "skip" | "update" | "add";

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
                  <Badge variant="outline" className="gap-1 border-amber-300">
                    <AlertTriangle className="size-3.5 text-amber-500" />
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
                    <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium whitespace-nowrap w-8">#</th>
                    {VISIBLE_FIELDS.map((f) => (
                      <th key={f} className="text-left px-3 py-2 text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {FIELD_LABELS[f]}
                        {REQUIRED_FIELDS.includes(f) && <span className="text-rose-500 ml-0.5">*</span>}
                      </th>
                    ))}
                    <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium whitespace-nowrap min-w-[140px]">
                      {result.duplicateCount > 0 ? "Дія" : "Статус"}
                    </th>
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
                          "border-b border-border/50 transition-colors",
                          isError && "bg-rose-500/5",
                          isDuplicate && !isError && "bg-amber-500/5",
                          !isError && !isDuplicate && "hover:bg-muted/30",
                        )}
                      >
                        <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                          {row.index + 1}
                        </td>
                        {VISIBLE_FIELDS.map((f) => (
                          <td
                            key={f}
                            className={cn(
                              "px-3 py-2 text-sm max-w-[200px] truncate",
                              !row.data[f] && REQUIRED_FIELDS.includes(f) && "text-rose-500",
                              !row.data[f] && !REQUIRED_FIELDS.includes(f) && "text-muted-foreground/50",
                            )}
                            title={row.data[f]}
                          >
                            {row.data[f] || "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          {isError ? (
                            <span className="text-xs text-rose-500" title={row.errors.join("; ")}>
                              Помилка
                            </span>
                          ) : isDuplicate ? (
                            <select
                              value={decision}
                              onChange={(e) => setDecision(row.index, e.target.value as Decision)}
                              className="text-xs rounded border border-border bg-background px-2 py-1 cursor-pointer"
                            >
                              <option value="skip">Пропустити</option>
                              <option value="update">Оновити</option>
                              <option value="add">Додати як новий</option>
                            </select>
                          ) : (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Додати
                            </span>
                          )}
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
