"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageError({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 p-6">
      <div className="flex items-center justify-center size-14 rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Щось пішло не так</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || "Сталася неочікувана помилка. Спробуйте оновити сторінку."}
        </p>
      </div>
      <Button onClick={reset} variant="outline" className="gap-1.5">
        <RotateCcw className="size-4" />
        Спробувати знову
      </Button>
    </div>
  );
}
