"use client";

import { useCallback, useState } from "react";

export function useCollapsed(key: string) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) === "true";
  });

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(key, String(next));
      return next;
    });
  }, [key]);

  return [collapsed, toggle] as const;
}
