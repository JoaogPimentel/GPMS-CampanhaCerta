import { describe, expect, it } from 'vitest'
import { buildMonthGrid } from './calendarGrid'

describe('buildMonthGrid', () => {
  it('alinha o primeiro dia do mês à posição correta da semana', () => {
    const year = 2026
    const month = 3
    const grid = buildMonthGrid(year, month)
    const expectedStartWeekday = new Date(year, month - 1, 1).getDay()

    expect(grid[0][expectedStartWeekday]).toBe(1)
    for (let i = 0; i < expectedStartWeekday; i++) {
      expect(grid[0][i]).toBeNull()
    }
  })

  it('inclui todos os dias do mês exatamente uma vez', () => {
    const grid = buildMonthGrid(2026, 4)

    const flatDays = grid.flat().filter((day) => day !== null)
    expect(flatDays).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
  })

  it('cada semana possui exatamente 7 posições', () => {
    const grid = buildMonthGrid(2026, 3)

    grid.forEach((week) => expect(week).toHaveLength(7))
  })

  it('lida corretamente com fevereiro em ano bissexto', () => {
    const grid = buildMonthGrid(2028, 2)

    const flatDays = grid.flat().filter((day) => day !== null)
    expect(flatDays).toHaveLength(29)
  })
})
