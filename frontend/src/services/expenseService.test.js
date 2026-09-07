import { beforeEach, describe, expect, it } from 'vitest'
import { createExpense, getExpensesByCampaign } from './expenseService'

describe('expenseService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getExpensesByCampaign', () => {
    it('retorna apenas os gastos da campanha informada', async () => {
      await createExpense({
        campaignId: 1,
        description: 'Anúncio A',
        amount: 100,
        date: '2026-01-01',
      })
      await createExpense({
        campaignId: 2,
        description: 'Anúncio B',
        amount: 200,
        date: '2026-01-02',
      })

      const expenses = await getExpensesByCampaign(1)

      expect(expenses.every((expense) => expense.campaignId === 1)).toBe(true)
      expect(expenses.some((expense) => expense.description === 'Anúncio A')).toBe(true)
    })

    it('retorna array vazio quando a campanha não possui gastos', async () => {
      const expenses = await getExpensesByCampaign(999999)

      expect(expenses).toEqual([])
    })
  })

  describe('createExpense', () => {
    it('cria um gasto vinculado à campanha com id gerado', async () => {
      const expense = await createExpense({
        campaignId: 1,
        description: 'Impulsionamento de post',
        amount: 350,
        date: '2026-01-15',
      })

      expect(expense).toMatchObject({
        campaignId: 1,
        description: 'Impulsionamento de post',
        amount: 350,
        date: '2026-01-15',
      })
      expect(expense.id).toBeDefined()
    })

    it('persiste o gasto na listagem da campanha', async () => {
      await createExpense({
        campaignId: 1,
        description: 'Novo gasto',
        amount: 50,
        date: '2026-01-20',
      })

      const expenses = await getExpensesByCampaign(1)

      expect(expenses.some((expense) => expense.description === 'Novo gasto')).toBe(true)
    })
  })
})
