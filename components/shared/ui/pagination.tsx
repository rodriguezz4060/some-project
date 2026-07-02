import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ClientPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function ClientPagination({ page, totalPages, total, onPageChange, label }: ClientPaginationProps) {
  if (total <= 0) return null;

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-muted-foreground">{formatCount(total, label)}</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline ml-1">Попередня</span>
        </Button>
        <span className="px-3 text-muted-foreground tabular-nums">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <span className="hidden sm:inline mr-1">Наступна</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

interface LinkPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  queryParams?: Record<string, string>;
  label?: string;
}

export function LinkPagination({ page, totalPages, total, basePath, queryParams, label }: LinkPaginationProps) {
  if (total <= 0) return null;

  function buildUrl(p: number): string {
    const params = new URLSearchParams(queryParams ?? {});
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{formatCount(total, label)}</p>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildUrl(page - 1)}>
              <ChevronLeft className="size-4" />
              Попередня
            </Link>
          </Button>
        )}
        {page < totalPages && (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildUrl(page + 1)}>
              Наступна
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function formatCount(total: number, label?: string): string {
  if (!label) label = "записів";
  const singular = label.replace(/ів$/, "").replace(/і$/, "");
  const few = label.replace(/ів$/, "и").replace(/і$/, "и");
  if (total === 1) return `${total} ${singular}`;
  if (total > 1 && total < 5) return `${total} ${few}`;
  return `${total} ${label}`;
}
