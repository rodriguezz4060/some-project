"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageError({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6">
      <div className="rounded-full bg-destructive/10 p-4">
        <div className="size-6 text-destructive">!</div>
      </div>
      <h2 className="text-lg font-semibold">Щось пішло не так</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message || "Сталася неочікувана помилка. Спробуйте оновити сторінку."}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Спробувати знову
      </button>
    </div>
  );
}
