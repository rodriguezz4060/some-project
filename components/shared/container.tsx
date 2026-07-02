import type { PropsWithChildren } from "react";
import { cn } from "@root/lib/utils";

interface Props {
  className?: string;
}

export function Container({ className, children }: PropsWithChildren<Props>) {
  return (
    <div className={cn("mx-auto max-w-290 dark:bg-[#0a0a0a] ", className)}>
      {children}
    </div>
  );
}
