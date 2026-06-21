import { Star } from "lucide-react";

interface Props {
  missions: number;
}

export function MilitaryMissionCount({ missions }: Props) {
  return (
    <div className="text-right">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-foreground">{missions}</span>
        <span className="text-xs">місій</span>
      </div>
    </div>
  );
}
