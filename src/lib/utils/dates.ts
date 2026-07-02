export function toDateInput(date: string): string {
  if (!date) return "";
  const m = date.match(/^(\d{2})\.(\d{4})$/);
  return m ? `${m[2]}-${m[1]}-01` : date;
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
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).getTime();
  const ukr = dateStr.match(/^(\d{2})\.(\d{4})$/);
  if (ukr) return new Date(+ukr[2], +ukr[1] - 1, 1).getTime();
  return new Date(dateStr).getTime() || 0;
}
