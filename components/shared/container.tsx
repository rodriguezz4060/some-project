import { cn } from "@root/lib/utils";
import React from "react";

interface Props {
  className?: string;
}

export const Container: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  children,
}) => {
  return (
    <div className={cn("mx-auto max-w-290 dark:bg-[#0a0a0a] ", className)}>
      {children}
    </div>
  );
};
