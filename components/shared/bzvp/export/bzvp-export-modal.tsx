"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
  Calendar,
  RotateCcw,
  X,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@root/lib/utils";
import { toast } from "sonner";
import {
  FIELD_LABELS,
  SECTIONS,
  ALL_FIELDS,
  type BzvpFieldKey,
} from "@/components/shared/bzvp/fields";

export function BzvpExportModal() {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<BzvpFieldKey>>(
    new Set(ALL_FIELDS),
  );
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.title)),
  );

  const toggleField = useCallback((field: BzvpFieldKey) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  const toggleSectionFields = useCallback((sectionFields: BzvpFieldKey[]) => {
    setSelectedFields((prev) => {
      const allSelected = sectionFields.every((f) => prev.has(f));
      const next = new Set(prev);
      for (const f of sectionFields) {
        if (allSelected) next.delete(f);
        else next.add(f);
      }
      return next;
    });
  }, []);

  const toggleSectionCollapse = useCallback((title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedFields.size === ALL_FIELDS.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(ALL_FIELDS));
    }
  }, [selectedFields.size]);

  const resetAll = useCallback(() => {
    setSelectedFields(new Set(ALL_FIELDS));
    setCreatedFrom("");
    setCreatedTo("");
  }, []);

  const hasDateFilter = createdFrom || createdTo;

  const handleExport = useCallback(async () => {
    if (selectedFields.size === 0) {
      toast.error("Виберіть хоча б одне поле");
      return;
    }

    if (createdFrom && createdTo && createdFrom > createdTo) {
      toast.error("Дата «Від» не може бути пізніше «До»");
      return;
    }

    setExporting(true);
    try {
      const { exportBzvpData } = await import("@root/actions/export-bzvp");
      const data = await exportBzvpData(
        [...selectedFields],
        createdFrom || undefined,
        createdTo || undefined,
      );

      if (data.length === 0) {
        toast.error("Немає даних для експорту");
        setExporting(false);
        return;
      }

      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(
        data.map((row) => {
          const obj: Record<string, string> = {};
          for (const key of selectedFields) {
            obj[FIELD_LABELS[key] ?? key] = String(row[key] ?? "");
          }
          return obj;
        }),
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BZVP");
      XLSX.writeFile(
        wb,
        `bzvp-export-${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      toast.success(`Експортовано ${data.length} записів`);
      setOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Помилка експорту");
    } finally {
      setExporting(false);
    }
  }, [selectedFields, createdFrom, createdTo]);

  const selectedCount = selectedFields.size;
  const allSelected = selectedCount === ALL_FIELDS.length;

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
              <DialogDescription>
                Виберіть поля та налаштуйте фільтри для вивантаження у Excel
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-[360px] border-y border-border/40">
          <div className="p-5 space-y-5">
            <div className="rounded-xl border bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Фільтр за датою створення
                </span>
                {hasDateFilter && (
                  <button
                    type="button"
                    aria-label="Скинути фільтр дати"
                    onClick={() => {
                      setCreatedFrom("");
                      setCreatedTo("");
                    }}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                    Скинути
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground [color-scheme:dark]"
                />
                <input
                  type="date"
                  value={createdTo}
                  onChange={(e) => setCreatedTo(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Вибір полів
              </span>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                {allSelected ? "Скасувати всі" : "Вибрати всі"}
              </button>
            </div>

            <div className="space-y-2">
              {SECTIONS.map((section) => {
                const allSel = section.fields.every((f) =>
                  selectedFields.has(f),
                );
                const someSel = section.fields.some((f) =>
                  selectedFields.has(f),
                );
                const collapsed = collapsedSections.has(section.title);
                const selCount = section.fields.filter((f) =>
                  selectedFields.has(f),
                ).length;

                return (
                  <div
                    key={section.title}
                    className="rounded-xl border bg-card transition-colors"
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse(section.title)}
                        className="flex flex-1 items-center gap-2 text-left cursor-pointer"
                      >
                        <ChevronDown
                          className={cn(
                            "size-3.5 text-muted-foreground transition-transform duration-200",
                            collapsed && "-rotate-90",
                          )}
                        />
                        <span className="text-sm font-medium">
                          {section.title}
                        </span>
                        <span className="ml-auto mr-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                          {selCount}/{section.fields.length}
                        </span>
                      </button>
                      <Checkbox
                        checked={allSel}
                        data-state={
                          allSel
                            ? "checked"
                            : someSel
                              ? "indeterminate"
                              : "unchecked"
                        }
                        onCheckedChange={() =>
                          toggleSectionFields(section.fields)
                        }
                      />
                    </div>

                    {!collapsed && (
                      <div className="px-3 pb-3 pt-0.5 border-t border-border/40">
                        <div className="grid grid-cols-2 gap-1 pt-2">
                          {section.fields.map((field) => (
                            <label
                              key={field}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors"
                            >
                              <Checkbox
                                checked={selectedFields.has(field)}
                                onCheckedChange={() => toggleField(field)}
                              />
                              <span className="text-xs">
                                {FIELD_LABELS[field]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-3 p-5 pt-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary tabular-nums">
              {selectedCount}/{ALL_FIELDS.length}
            </span>
            <span className="text-[11px] text-muted-foreground/60">полів</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Скинути всі налаштування"
              onClick={resetAll}
              className="gap-1.5 text-xs h-8 text-muted-foreground/60 hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Скинути
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting || selectedFields.size === 0}
              className="gap-2 h-8 text-sm"
            >
              {exporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {exporting ? "Експорт..." : "Експортувати"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
