import type { MilitaryPersonnel } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusConfig } from "../../constants";
import { Badge } from "@/components/ui/badge";

interface Props {
  personnel: MilitaryPersonnel[];
}

function getRowClass(days?: number): string {
  if (days === undefined || days === null) return "";
  if (days > 30) return "bg-red-50 dark:bg-red-950/20";
  if (days > 14) return "bg-amber-50 dark:bg-amber-950/20";
  if (days > 7) return "bg-yellow-50/50 dark:bg-yellow-950/10";
  return "";
}

function getDaysLabel(days?: number): string {
  if (days === undefined || days === null) return "—";
  if (days === 0) return "сьогодні";
  if (days === 1) return "вчора";
  return `${days} дн. тому`;
}

function getUrgencyDot(days?: number): string {
  if (days === undefined || days === null) return "bg-gray-300";
  if (days > 30) return "bg-red-500";
  if (days > 14) return "bg-amber-500";
  if (days > 7) return "bg-yellow-500";
  return "bg-emerald-400";
}

function getDaysColor(days?: number): string {
  if (days === undefined || days === null) return "text-muted-foreground";
  if (days > 30) return "text-red-600 font-semibold dark:text-red-400";
  if (days > 14) return "text-amber-600 font-semibold dark:text-amber-400";
  if (days > 7) return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

export function ReportRotationTable({ personnel }: Props) {
  const sorted = [...personnel].sort(
    (a, b) => (b.lastActiveDays ?? 0) - (a.lastActiveDays ?? 0),
  );

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Немає даних для відображення
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
              <TableHead className="w-8 text-xs text-muted-foreground">#</TableHead>
              <TableHead className="text-xs">ПІБ</TableHead>
              <TableHead className="text-xs text-muted-foreground">Звання</TableHead>
              <TableHead className="text-xs">Статус</TableHead>
              <TableHead className="text-xs text-muted-foreground">Місії</TableHead>
              <TableHead className="text-right text-xs">
                Останнє завдання
              </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((person, i) => {
          const status = statusConfig[person.status];
          return (
            <TableRow
              key={person.id}
              className={getRowClass(person.lastActiveDays)}
            >
              <TableCell className="text-xs text-muted-foreground">
                {i + 1}
              </TableCell>
              <TableCell className="text-sm font-medium">
                {person.fullName}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {person.rank}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm tabular-nums">
                {person.missions ?? "—"}
              </TableCell>
              <TableCell
                className={`text-right text-sm tabular-nums ${getDaysColor(person.lastActiveDays)}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`inline-block size-2 rounded-full ${getUrgencyDot(person.lastActiveDays)}`}
                  />
                  {getDaysLabel(person.lastActiveDays)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
