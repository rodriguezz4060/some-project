import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props<T extends Record<string, unknown>> {
  title: string;
  fields: { id: string }[];
  onAdd: (value: T | T[]) => void;
  remove: (index: number) => void;
  renderItem: (index: number) => React.ReactNode;
  defaultItem?: T;
}

export function ArraySection<T extends Record<string, unknown>>({ title, fields, onAdd, remove, renderItem, defaultItem }: Props<T>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => onAdd(defaultItem ?? ({} as T))} className="gap-1">
          <Plus className="size-3.5" /> Додати
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="relative border border-border/40 rounded-lg p-4 pt-7">
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
          {renderItem(index)}
        </div>
      ))}
    </div>
  );
}
