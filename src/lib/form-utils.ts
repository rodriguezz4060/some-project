export function parseZodErrorMessages(err: unknown): string[] | null {
  const message = err instanceof Error ? err.message : "";
  if (!message) return null;

  const parts = message.split("; ");
  return parts.map((p) => {
    const colonIdx = p.indexOf(": ");
    return colonIdx > 0 ? p.slice(colonIdx + 2) : p;
  });
}
