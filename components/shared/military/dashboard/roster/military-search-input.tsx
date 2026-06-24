"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { IconSearch } from "@tabler/icons-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  initialQuery: string;
}

export function MilitarySearchInput({ initialQuery }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const debouncedValue = useDebounce(value, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (debouncedValue.trim()) {
      params.set("q", debouncedValue.trim());
    } else {
      params.delete("q");
    }

    const target = params.size > 0 ? `/military?${params.toString()}` : "/military";
    router.replace(target);
  }, [debouncedValue, router]);

  const clear = useCallback(() => {
    setValue("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative flex-1 max-w-xl">
      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Пошук за ім'ям, посадою, підрозділом..."
        className="flex h-10 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Очистити пошук"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
