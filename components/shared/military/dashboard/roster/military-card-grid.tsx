import type { MilitaryPersonnel } from "../../types";
import { MilitaryCard } from "./military-card";

interface Props {
  personnel: MilitaryPersonnel[];
}

export function MilitaryCardGrid({ personnel }: Props) {
  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-4" />
        <p className="text-lg font-medium">Картки не знайдено</p>
        <p className="text-sm text-muted-foreground">
          Спробуйте змінити параметри фільтрації
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 auto-rows-fr grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
      {personnel.map((person) => (
        <MilitaryCard key={person.id} {...person} />
      ))}
    </div>
  );
}
