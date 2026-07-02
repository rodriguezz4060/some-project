export async function syncItems<TData extends Record<string, unknown>>(
  deleteMany: (ids: number[]) => Promise<unknown>,
  createMany: (data: TData[]) => Promise<unknown>,
  update: (id: number, data: Partial<TData>) => Promise<unknown>,
  oldItems: ({ id: number } & Record<string, unknown>)[],
  newItems: TData[],
) {
  const newIds = new Set(newItems.map((item) => item.id).filter(Boolean) as number[]);
  const toDelete = oldItems.filter((item) => !newIds.has(item.id)).map((item) => item.id);

  if (toDelete.length > 0) {
    await deleteMany(toDelete);
  }

  for (const item of newItems) {
    const { id: itemId, ...fields } = item;
    if (itemId && oldItems.some((o) => o.id === itemId)) {
      await update(itemId as number, fields as Partial<TData>);
    }
  }

  const toCreate = newItems.filter((item) => !item.id);
  if (toCreate.length > 0) {
    await createMany(toCreate);
  }
}
