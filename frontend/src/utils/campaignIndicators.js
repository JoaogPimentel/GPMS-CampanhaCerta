export function computeIndicators(campaign, metrics, expenses) {
  const totalReach = metrics.reduce((sum, metric) => sum + metric.reach, 0)
  const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0)
  const totalConversions = metrics.reduce((sum, metric) => sum + metric.conversions, 0)
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const ctr = totalReach > 0 ? (totalClicks / totalReach) * 100 : 0
  const cpa = totalConversions > 0 ? totalSpent / totalConversions : 0
  const roi =
    totalSpent > 0
      ? ((totalConversions * campaign.conversionValue - totalSpent) / totalSpent) * 100
      : 0

  return { totalReach, totalClicks, totalConversions, totalSpent, ctr, cpa, roi }
}
