"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LogData {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  changes: unknown;
  createdAt: string;
  userName: string;
}

interface ActionCfg {
  label: string;
  variant: "default" | "secondary" | "destructive";
}

interface LogRowClientProps {
  log: LogData;
  actionConfig: ActionCfg;
  entityLabel: string;
  entityName?: string;
  entityUrl?: string;
}

export function LogRowClient({ log, actionConfig, entityLabel, entityName, entityUrl }: LogRowClientProps) {
  const [expanded, setExpanded] = useState(false);

  const changesObj = log.changes && typeof log.changes === "object" ? (log.changes as Record<string, unknown>) : null;
  const hasChanges = changesObj !== null && Object.keys(changesObj).length > 0;

  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={() => hasChanges && setExpanded(!expanded)}
      >
        <TableCell className="text-xs text-muted-foreground px-1.5">
          {new Date(log.createdAt).toLocaleString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </TableCell>
        <TableCell className="px-1.5">
          <Badge variant={actionConfig.variant} className="text-xs">
            {actionConfig.label}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground px-1.5">
          {entityUrl ? (
            <Link href={entityUrl} className="hover:text-primary hover:underline transition-colors">
              {entityLabel} · {entityName}
            </Link>
          ) : (
            <>
              {entityLabel}
              {log.entityId != null && (
                <span className="ml-1 text-[11px]">#{log.entityId}</span>
              )}
            </>
          )}
        </TableCell>
        <TableCell className="text-xs px-1.5">{log.userName}</TableCell>
        <TableCell className="text-xs min-w-0 break-words whitespace-pre-wrap px-1.5">
          {log.description}
        </TableCell>
        <TableCell className="px-1.5">
          {hasChanges && (
            <span className="text-muted-foreground">
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </span>
          )}
        </TableCell>
      </TableRow>
      {expanded && hasChanges && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Деталі змін:</div>
            <div className="grid grid-cols-[200px_1fr_1fr] gap-x-0.5 text-xs mb-1.5 px-0.5">
              <span className="font-medium text-muted-foreground">Поле</span>
              <span className="text-red-500 font-medium">Було</span>
              <span className="text-emerald-500 font-medium">Стало</span>
            </div>
            <div className="space-y-1">
              {changesObj && Object.entries(changesObj).map(
                ([field, vals]) => {
                  const v = vals as { old: string | null; new: string | null };
                  return (
                    <div key={field} className="grid grid-cols-[200px_1fr_1fr] gap-x-0.5 text-xs">
                      <span className="font-medium text-foreground">{field}</span>
                      <span className="text-red-500 line-through break-words whitespace-pre-wrap">{v.old ?? "—"}</span>
                      <span className="text-emerald-500 break-words whitespace-pre-wrap">{v.new ?? "—"}</span>
                    </div>
                  );
                },
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
