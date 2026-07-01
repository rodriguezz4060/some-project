export type Changes = Record<string, { old: string | null; new: string | null }>;

export function compareFields<T extends Record<string, unknown>>(
  oldData: T,
  newData: T,
  fields: string[],
  fieldLabels: Record<string, string>,
  valueLabels?: Record<string, Record<string, string>>,
): Changes {
  const changes: Changes = {};
  for (const field of fields) {
    const oldVal = oldData[field];
    const newVal = newData[field];
    const oldStr = oldVal == null ? "" : String(oldVal);
    const newStr = newVal == null ? "" : String(newVal);
    if (oldStr !== newStr) {
      let displayOld: string | null = oldStr || null;
      let displayNew: string | null = newStr || null;
      if (valueLabels?.[field]) {
        displayOld = valueLabels[field][displayOld ?? ""] ?? displayOld;
        displayNew = valueLabels[field][displayNew ?? ""] ?? displayNew;
      }
      changes[fieldLabels[field] ?? field] = { old: displayOld, new: displayNew };
    }
  }
  return changes;
}

function itemKey(item: Record<string, unknown>): string {
  return item.id != null ? `id:${item.id}` : `idx:${Math.random()}`;
}

export function compareItemArrays<T extends Record<string, unknown>>(
  oldItems: T[],
  newItems: T[],
  label: string,
  fieldLabels: Record<string, string>,
): { changes: Changes; descriptions: string[] } {
  const changes: Changes = {};
  const descriptions: string[] = [];
  const excludeKeys = new Set(["id", "personnelId"]);

  const oldByKey = new Map(oldItems.map((item) => [itemKey(item), item]));
  const newByKey = new Map(newItems.map((item) => [itemKey(item), item]));

  let added = 0, removed = 0;

  for (const [key, newItem] of newByKey) {
    const oldItem = oldByKey.get(key);
    if (!oldItem) {
      added++;
      continue;
    }
    const allKeys = [...new Set([...Object.keys(oldItem), ...Object.keys(newItem)])];
    for (const field of allKeys) {
      if (excludeKeys.has(field)) continue;
      const oldVal = String(oldItem[field] ?? "");
      const newVal = String(newItem[field] ?? "");
      if (oldVal !== newVal) {
        const changeKey = `${label} / ${fieldLabels[field] ?? field}`;
        changes[changeKey] = { old: oldVal || null, new: newVal || null };
        descriptions.push(
          `змінив «${fieldLabels[field] ?? field}» в «${label}» з «${oldVal}» на «${newVal}»`,
        );
      }
    }
  }

  for (const key of oldByKey.keys()) {
    if (!newByKey.has(key)) removed++;
  }

  if (added > 0) descriptions.push(`додано ${added} записів у «${label}»`);
  if (removed > 0) descriptions.push(`видалено ${removed} записів з «${label}»`);

  return { changes, descriptions };
}
