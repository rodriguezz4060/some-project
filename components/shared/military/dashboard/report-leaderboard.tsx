import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MilitaryPersonnel } from "../types";

interface Props {
  personnel: MilitaryPersonnel[];
}

export function ReportLeaderboard({ personnel }: Props) {
  const sorted = [...personnel]
    .filter((p) => p.missions)
    .sort((a, b) => (b.missions || 0) - (a.missions || 0));

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Немає даних для відображення
      </p>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Топ військовослужбовців за кількістю місій
      </h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-xs">#</TableHead>
            <TableHead className="text-xs">ПІБ</TableHead>
            <TableHead className="hidden text-xs sm:table-cell">
              Звання
            </TableHead>
            <TableHead className="text-right text-xs">Місії</TableHead>
            <TableHead className="hidden text-right text-xs md:table-cell">
              Досвід
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((person, i) => (
            <TableRow key={person.id}>
              <TableCell className="text-xs text-muted-foreground">
                {i + 1}
              </TableCell>
              <TableCell className="text-sm font-medium">
                {person.fullName}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                {person.rank}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {person.missions}
              </TableCell>
              <TableCell className="hidden text-right text-sm text-muted-foreground tabular-nums md:table-cell">
                {person.experience} років
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
