interface Props {
  activeCount: number;
  shownCount: number;
  totalDbCount: number;
}

export function MilitaryPageHeader({
  activeCount,
  shownCount,
  totalDbCount,
}: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Активний склад</h2>
        <p className="text-sm text-muted-foreground">
          Управління особовим складом підрозділу
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-muted-foreground">
            Активних:{" "}
            <span className="font-medium text-foreground">{activeCount}</span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Показано:{" "}
          <span className="font-medium text-foreground">{shownCount}</span> з{" "}
          {totalDbCount}
        </div>
      </div>
    </div>
  );
}
