"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, FileSpreadsheet, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FIELD_LABELS, SECTIONS, ALL_FIELDS, type BzvpFieldKey } from "@/components/shared/bzvp/fields";
import { ExportDateFilter } from "./export-date-filter";
import { FieldSelectionTree } from "./field-selection-tree";

export function BzvpExportModal() {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<BzvpFieldKey>>(new Set(ALL_FIELDS));
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.title)),
  );

  const toggleField = useCallback((field: BzvpFieldKey) => {
    setSelectedFields((prev) => { const next = new Set(prev); if (next.has(field)) next.delete(field); else next.add(field); return next; });
  }, []);

  const toggleSectionFields = useCallback((sectionFields: BzvpFieldKey[]) => {
    setSelectedFields((prev) => {
      const allSelected = sectionFields.every((f) => prev.has(f));
      const next = new Set(prev);
      for (const f of sectionFields) { if (allSelected) next.delete(f); else next.add(f); }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedFields((prev) => prev.size === ALL_FIELDS.length ? new Set() : new Set(ALL_FIELDS));
  }, []);

  const resetAll = useCallback(() => {
    setSelectedFields(new Set(ALL_FIELDS));
    setCreatedFrom("");
    setCreatedTo("");
  }, []);

  const handleExport = useCallback(async () => {
    if (selectedFields.size === 0) { toast.error("Виберіть хоча б одне поле"); return; }
    if (createdFrom && createdTo && createdFrom > createdTo) { toast.error("Дата «Від» не може бути пізніше «До»"); return; }
    setExporting(true);
    try {
      const { exportBzvpData } = await import("@root/actions/bzvp/export");
      const data = await exportBzvpData([...selectedFields], createdFrom || undefined, createdTo || undefined);
      if (data.length === 0) { toast.error("Немає даних для експорту"); setExporting(false); return; }
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(data.map((row) => {
        const obj: Record<string, string> = {};
        for (const key of selectedFields) obj[FIELD_LABELS[key] ?? key] = String(row[key] ?? "");
        return obj;
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BZVP");
      XLSX.writeFile(wb, `bzvp-export-${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`Експортовано ${data.length} записів`);
      setOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Помилка експорту");
    } finally {
      setExporting(false);
    }
  }, [selectedFields, createdFrom, createdTo]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileSpreadsheet className="size-4" />
          Експорт
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden h-[85vh]">
        <DialogHeader className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="size-4.5" />
            </div>
            <div>
              <DialogTitle>Експорт даних</DialogTitle>
              <DialogDescription>Виберіть поля та налаштуйте фільтри для вивантаження у Excel</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-[360px] border-y border-border/40">
          <div className="p-5 space-y-5">
            <ExportDateFilter
              createdFrom={createdFrom}
              createdTo={createdTo}
              onFromChange={setCreatedFrom}
              onToChange={setCreatedTo}
              onReset={() => { setCreatedFrom(""); setCreatedTo(""); }}
            />
            <FieldSelectionTree
              selectedFields={selectedFields}
              collapsedSections={collapsedSections}
              onToggleField={toggleField}
              onToggleSection={toggleSectionFields}
              onToggleCollapse={(title) => setCollapsedSections((prev) => { const next = new Set(prev); if (next.has(title)) next.delete(title); else next.add(title); return next; })}
              onToggleAll={toggleAll}
            />
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-3 p-5 pt-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary tabular-nums">
              {selectedFields.size}/{ALL_FIELDS.length}
            </span>
            <span className="text-[11px] text-muted-foreground/60">полів</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1.5 text-xs h-8 text-muted-foreground/60 hover:text-foreground">
              <RotateCcw className="size-3.5" />Скинути
            </Button>
            <Button onClick={handleExport} disabled={exporting || selectedFields.size === 0} className="gap-2 h-8 text-sm">
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {exporting ? "Експорт..." : "Експортувати"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
