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

export function compareItemArrays<T extends Record<string, unknown>>(
  oldItems: T[],
  newItems: T[],
  label: string,
  fieldLabels: Record<string, string>,
): { changes: Changes; descriptions: string[] } {
  const changes: Changes = {};
  const descriptions: string[] = [];
  const excludeKeys = new Set(["id", "personnelId"]);

  if (oldItems.length < newItems.length) {
    descriptions.push(`додано ${newItems.length - oldItems.length} записів у «${label}»`);
  } else if (oldItems.length > newItems.length) {
    descriptions.push(`видалено ${oldItems.length - newItems.length} записів з «${label}»`);
  }

  const compareCount = Math.min(oldItems.length, newItems.length);
  for (let i = 0; i < compareCount; i++) {
    const oldItem = oldItems[i] ?? {};
    const newItem = newItems[i] ?? {};
    const allKeys = [...new Set([...Object.keys(oldItem), ...Object.keys(newItem)])];
    for (const key of allKeys) {
      if (excludeKeys.has(key)) continue;
      const oldVal = String(oldItem[key] ?? "");
      const newVal = String(newItem[key] ?? "");
      if (oldVal !== newVal) {
        const changeKey = `${label} №${i + 1} / ${fieldLabels[key] ?? key}`;
        changes[changeKey] = { old: oldVal || null, new: newVal || null };
        descriptions.push(
          `змінив «${fieldLabels[key] ?? key}» в «${label}» №${i + 1} з «${oldVal}» на «${newVal}»`,
        );
      }
    }
  }

  return { changes, descriptions };
}
