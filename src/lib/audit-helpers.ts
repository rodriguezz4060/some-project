import type { Changes } from "./diff";

export function buildChangeLines(changes: Changes): string[] {
  return Object.entries(changes).map(
    ([key, val]) => `змінив «${key}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
  );
}

export function formatDescription(
  descriptions: string[],
  entityLabel: string,
  entityName: string,
  noChangesText?: string,
): string {
  if (descriptions.length === 0) {
    return noChangesText ?? `${entityLabel} «${entityName}» (без змін у даних)`;
  }

  if (descriptions.length <= 3) {
    return `${entityLabel} «${entityName}»: ${descriptions.join("; ")}`;
  }

  return `${entityLabel} «${entityName}»: ${descriptions.slice(0, 3).join("; ")} та ще ${descriptions.length - 3} змін`;
}
