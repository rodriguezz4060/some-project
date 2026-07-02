const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DD_MM_YYYY = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const MM_YYYY = /^(\d{2})\.(\d{4})$/;

export function formatDisplay(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (typeof date === "string") {
    const iso = date.match(ISO_DATE);
    if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
    const ddmmyyyy = date.match(DD_MM_YYYY);
    if (ddmmyyyy) return date;
    return date;
  }
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (typeof date === "string") {
    const m = date.match(MM_YYYY);
    if (m) return `${m[2]}-${m[1]}-01`;
    const ddmmyyyy = date.match(DD_MM_YYYY);
    if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
    return date;
  }
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (ISO_DATE.test(value)) return new Date(value);
  const ddmmyyyy = value.match(DD_MM_YYYY);
  if (ddmmyyyy) return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
  const mmyyyy = value.match(MM_YYYY);
  if (mmyyyy) return new Date(`${mmyyyy[2]}-${mmyyyy[1]}-01`);
  return null;
}

export function formatDate(dateStr: Date | string | null | undefined): string {
  return formatDisplay(dateStr);
}

export function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  const ddmmyyyy = dateStr.match(DD_MM_YYYY);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  return dateStr;
}

export function toDateInput(date: string): string {
  return toDateInputValue(date);
}

export function fromDateInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseDate(dateStr: string): number {
  if (!dateStr) return 0;
  const iso = dateStr.match(ISO_DATE);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).getTime();
  const ddmmyyyy = dateStr.match(DD_MM_YYYY);
  if (ddmmyyyy) return new Date(+ddmmyyyy[3], +ddmmyyyy[2] - 1, +ddmmyyyy[1]).getTime();
  const ukr = dateStr.match(MM_YYYY);
  if (ukr) return new Date(+ukr[2], +ukr[1] - 1, 1).getTime();
  return new Date(dateStr).getTime() || 0;
}
