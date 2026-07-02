import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  id: number;
}

export function MilitaryDetailsButton({ id }: Props) {
  return (
    <Button asChild variant="outline" className="w-full gap-1.5">
      <Link href={`/military/${id}`}>
        Детальніше
        <ChevronRight className="size-4" />
      </Link>
    </Button>
  );
}
