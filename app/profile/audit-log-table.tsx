"use client";

import { History } from "lucide-react";
import { ClientPagination } from "@/components/shared/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LogEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  changes: unknown;
  createdAt: string;
  entityName?: string;
  entityLabel: string;
}

const actionConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  CREATE: { label: "Створення", variant: "default" },
  UPDATE: { label: "Зміна", variant: "secondary" },
  DELETE: { label: "Видалення", variant: "destructive" },
};

interface Props {
  logs: LogEntry[];
  totalLogs: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({ logs, totalLogs, totalPages, currentPage, onPageChange }: Props) {
  return (
    <div className="rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36 px-3 text-xs">Дата / Час</TableHead>
            <TableHead className="w-24 px-3 text-xs">Дія</TableHead>
            <TableHead className="w-28 px-3 text-xs">Сутність</TableHead>
            <TableHead className="px-3 text-xs">Опис</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                <div className="flex flex-col items-center gap-2">
                  <History className="size-8 text-muted-foreground/30" />
                  <span>Ви ще не зробили жодної дії</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const cfg = actionConfig[log.action] ?? { label: log.action, variant: "secondary" as const };
              return (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground px-3 tabular-nums">
                    {new Date(log.createdAt).toLocaleString("uk-UA", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="px-3">
                    <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground px-3">
                    {log.entityLabel}
                    {log.entityName && <span className="ml-1">· {log.entityName}</span>}
                    {log.entityId != null && !log.entityName && <span className="ml-1 text-[11px]">#{log.entityId}</span>}
                  </TableCell>
                  <TableCell className="text-xs px-3 min-w-0 break-words whitespace-pre-wrap">
                    {log.description}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <ClientPagination
        page={currentPage}
        totalPages={totalPages}
        total={totalLogs}
        label="записів"
        onPageChange={onPageChange}
      />
    </div>
  );
}
