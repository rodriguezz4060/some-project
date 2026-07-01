import { memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  id: number;
}

export const MilitaryDetailsButton = memo(function MilitaryDetailsButton({ id }: Props) {
  return (
    <Link
      href={`/military/${id}`}
      className="w-full group/btn flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-primary/10 transition-colors text-base"
    >
      <span className="font-medium text-muted-foreground group-hover/btn:text-primary transition-colors">
        Детальніше
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-0.5 transition-all" />
    </Link>
  );
});
