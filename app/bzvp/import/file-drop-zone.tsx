"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@root/lib/utils";

interface Props {
  onFile: (file: File) => void;
}

export function FileDropZone({ onFile }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.name.match(/\.(xlsx|xls|csv)$/i)) onFile(f);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "flex flex-col items-center justify-center py-16 gap-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30",
          )}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-base font-medium">
              {dragOver ? "Відпустіть файл" : "Перетягніть Excel-файл сюди"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">або натисніть, щоб вибрати файл</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>.xlsx</span><span>·</span><span>.xls</span><span>·</span><span>.csv</span>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
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
