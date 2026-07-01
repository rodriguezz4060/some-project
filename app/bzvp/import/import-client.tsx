"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { parseExcelBzvp, importBzvp } from "@root/actions/import-bzvp";
import type { ParsedRow, ParseResult } from "@root/actions/import-bzvp";
import { FileDropZone } from "./file-drop-zone";
import { ImportPreviewTable } from "./import-preview-table";
import { ImportRowDialog } from "./import-row-dialog";
import { type Decision } from "./import-constants";

export function ImportClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [previewPage, setPreviewPage] = useState(0);
  const [selectedRow, setSelectedRow] = useState<ParsedRow | null>(null);

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

  const setDecision = useCallback((index: number, d: Decision) => {
    setDecisions((prev) => ({ ...prev, [index]: d }));
  }, []);

  const totalPages = result ? Math.ceil(result.rows.length / 10) : 0;

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
            <ImportPreviewTable
              rows={result.rows}
              page={previewPage}
              totalPages={totalPages}
              decisions={decisions}
              onPageChange={setPreviewPage}
              onDecisionChange={setDecision}
              onSelectRow={setSelectedRow}
            />
          </Card>
        )}

        {selectedRow && (
          <ImportRowDialog
            row={selectedRow}
            decision={decisions[selectedRow.index] ?? "add"}
            onDecisionChange={(d) => setDecision(selectedRow.index, d)}
            onClose={() => setSelectedRow(null)}
          />
        )}

        <div className="flex items-center gap-3">
          <Button size="lg" onClick={handleImport} disabled={importing || validToImport === 0} className="gap-2">
            {importing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {importing ? "Імпорт..." : `Імпортувати ${validToImport} записів`}
          </Button>
          <Button variant="outline" size="lg" onClick={() => { setResult(null); setFile(null); setDecisions({}); setSelectedRow(null); }} disabled={importing}>
            Скасувати
          </Button>
        </div>
      </div>
    );
  }

  return <FileDropZone onFile={handleFile} />;
}
