import type { Detection } from "@/generated/prisma/client";
import { getDetectionColor } from "@root/lib/detection-colors";

interface Props {
  detections: Detection[];
}

export function FindingsPanel({ detections }: Props) {
  const labels = [...new Set(detections.map((d) => d.label))];
  const labelCount = detections.reduce<Record<string, number>>(
    (acc, d) => {
      acc[d.label] = (acc[d.label] ?? 0) + 1;
      return acc;
    },
    {},
  );

  if (detections.length === 0) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
        Об&apos;єктів не знайдено
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card lg:sticky lg:top-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">
          Знайдені об&apos;єкти ({detections.length})
        </h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${getDetectionColor(label)}20`,
                color: getDetectionColor(label),
              }}
            >
              {label}
              <span style={{ opacity: 0.6 }}>{labelCount[label]}</span>
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {detections.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 text-xs rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors"
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: getDetectionColor(d.label) }}
              />
              <span className="font-medium text-foreground min-w-20">{d.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {Math.round(d.confidence * 100)}%
              </span>
              <span className="text-muted-foreground/60 tabular-nums ml-auto font-mono text-[10px]">
                [{Math.round(d.x1)},{Math.round(d.y1)}]
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
