export function buildMonthGrid(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startWeekday = firstDayOfMonth.getDay()

  const days = []
  for (let i = 0; i < startWeekday; i++) days.push(null)
  for (let day = 1; day <= daysInMonth; day++) days.push(day)
  while (days.length % 7 !== 0) days.push(null)

  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}
