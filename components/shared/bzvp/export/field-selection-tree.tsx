"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@root/lib/utils";
import { FIELD_LABELS, SECTIONS, ALL_FIELDS, type BzvpFieldKey } from "@/components/shared/bzvp/fields";

interface Props {
  selectedFields: Set<BzvpFieldKey>;
  collapsedSections: Set<string>;
  onToggleField: (field: BzvpFieldKey) => void;
  onToggleSection: (fields: BzvpFieldKey[]) => void;
  onToggleCollapse: (title: string) => void;
  onToggleAll: () => void;
}

export function FieldSelectionTree({ selectedFields, collapsedSections, onToggleField, onToggleSection, onToggleCollapse, onToggleAll }: Props) {
  const allSelected = selectedFields.size === ALL_FIELDS.length;

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Вибір полів</span>
        <button type="button" onClick={onToggleAll}
          className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer">
          {allSelected ? "Скасувати всі" : "Вибрати всі"}
        </button>
      </div>

      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const allSel = section.fields.every((f) => selectedFields.has(f));
          const someSel = section.fields.some((f) => selectedFields.has(f));
          const collapsed = collapsedSections.has(section.title);
          const selCount = section.fields.filter((f) => selectedFields.has(f)).length;

          return (
            <div key={section.title} className="rounded-xl border bg-card transition-colors">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button type="button" onClick={() => onToggleCollapse(section.title)}
                  className="flex flex-1 items-center gap-2 text-left cursor-pointer">
                  <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform duration-200", collapsed && "-rotate-90")} />
                  <span className="text-sm font-medium">{section.title}</span>
                  <span className="ml-auto mr-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {selCount}/{section.fields.length}
                  </span>
                </button>
                <Checkbox checked={allSel}
                  data-state={allSel ? "checked" : someSel ? "indeterminate" : "unchecked"}
                  onCheckedChange={() => onToggleSection(section.fields)} />
              </div>

              {!collapsed && (
                <div className="px-3 pb-3 pt-0.5 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-1 pt-2">
                    {section.fields.map((field) => (
                      <label key={field}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors">
                        <Checkbox checked={selectedFields.has(field)} onCheckedChange={() => onToggleField(field)} />
                        <span className="text-xs">{FIELD_LABELS[field]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
