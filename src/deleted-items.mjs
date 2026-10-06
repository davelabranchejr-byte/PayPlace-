export const MAX_DELETED_ITEMS = 20;

export function deletedItems(finance) {
  return (Array.isArray(finance.deletedItems) ? finance.deletedItems : []).filter(entry =>
    entry && ['bills', 'debts'].includes(entry.collection) && typeof entry.key === 'string' &&
    entry.item && typeof entry.item.id === 'string' && typeof entry.item.name === 'string'
  ).slice(0, MAX_DELETED_ITEMS);
}

export function deleteEntry(finance, collection, id, now = Date.now()) {
  if (!['bills', 'debts'].includes(collection)) return finance;
  const items = finance[collection] || [];
  const index = items.findIndex(item => item.id === id);
  if (index < 0) return finance;
  const entry = { key: `${collection}:${id}:${now}`, collection, item: items[index], index, deletedAt: new Date(now).toISOString() };
  return { ...finance, [collection]: items.filter(item => item.id !== id), deletedItems: [entry, ...deletedItems(finance)].slice(0, MAX_DELETED_ITEMS) };
}

export function restoreEntry(finance, key) {
  const entries = deletedItems(finance);
  const entry = entries.find(item => item.key === key);
  if (!entry) return finance;
  const items = [...(finance[entry.collection] || [])];
  // Never replace an existing record with an older deleted copy.
  if (items.some(item => item.id === entry.item.id)) return finance;
  const index = Number.isInteger(entry.index) ? Math.max(0, Math.min(entry.index, items.length)) : items.length;
  items.splice(index, 0, entry.item);
  return { ...finance, [entry.collection]: items, deletedItems: entries.filter(item => item.key !== key) };
}
