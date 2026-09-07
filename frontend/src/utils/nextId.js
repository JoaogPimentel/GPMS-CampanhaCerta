export function nextId(items) {
  if (items.length === 0) return 1
  return Math.max(...items.map((item) => item.id)) + 1
}
