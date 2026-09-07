export function getBudgetStatus(spent, budget) {
  if (budget <= 0) {
    return { level: spent > 0 ? 'over' : 'healthy', percentage: spent > 0 ? 100 : 0 }
  }

  const percentage = Math.round((spent / budget) * 100)

  if (percentage >= 100) return { level: 'over', percentage }
  if (percentage >= 75) return { level: 'risk', percentage }
  return { level: 'healthy', percentage }
}
