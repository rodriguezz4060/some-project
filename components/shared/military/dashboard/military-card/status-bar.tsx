import { cn } from "@root/lib/utils";
import type { StatusType } from "../../types";

const statusBarColors: Record<StatusType, string> = {
  active: "bg-emerald-500",
  "on-mission": "bg-amber-500",
  wounded: "bg-rose-500",
  vacation: "bg-sky-500",
  reserve: "bg-gray-400",
};

interface Props {
  status: StatusType;
}

export function MilitaryStatusBar({ status }: Props) {
  return (
    <div
      className={cn(
        "h-1 w-full absolute top-0 left-0",
        statusBarColors[status],
      )}
    />
  );
}
