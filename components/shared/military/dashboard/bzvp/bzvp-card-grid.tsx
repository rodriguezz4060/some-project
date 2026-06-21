import type { BzvpPersonnel } from "../../types";
import { BzvpCard } from "./bzvp-card";

interface Props {
  personnel: BzvpPersonnel[];
}

export function BzvpCardGrid({ personnel }: Props) {
  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Немає даних</p>
        <p className="text-sm">За вказаними фільтрами нічого не знайдено</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {personnel.map((person) => (
        <BzvpCard key={person.id} {...person} />
      ))}
    </div>
  );
}
