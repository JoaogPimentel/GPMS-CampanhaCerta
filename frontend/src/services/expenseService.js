import { seedExpenses } from '../mocks/expenses'
import { nextId } from '../utils/nextId'

const EXPENSES_KEY = 'campanhacerta_expenses'

function loadExpenses() {
  const raw = localStorage.getItem(EXPENSES_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(EXPENSES_KEY, JSON.stringify(seedExpenses))
  return seedExpenses
}

function saveExpenses(expenses) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
}

export async function getExpensesByCampaign(campaignId) {
  return loadExpenses().filter((expense) => expense.campaignId === Number(campaignId))
}

export async function createExpense({ campaignId, description, amount, date }) {
  const expenses = loadExpenses()
  const expense = {
    id: nextId(expenses),
    campaignId: Number(campaignId),
    description,
    amount: Number(amount),
    date,
  }
  saveExpenses([...expenses, expense])
  return expense
}
