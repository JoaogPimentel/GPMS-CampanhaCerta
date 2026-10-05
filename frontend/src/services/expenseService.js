import { seedExpenses } from '../mocks/expenses'
import { nextId } from '../utils/nextId'
import { apiFetch, hasApi } from './apiClient'

const EXPENSES_KEY = 'campanhacerta_expenses'

// ---- adaptador mock (localStorage) — usado em testes e sem backend configurado ----

function loadExpenses() {
  const raw = localStorage.getItem(EXPENSES_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(EXPENSES_KEY, JSON.stringify(seedExpenses))
  return seedExpenses
}

function saveExpenses(expenses) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
}

async function mockGetExpensesByCampaign(campaignId) {
  return loadExpenses().filter((expense) => expense.campaignId === Number(campaignId))
}

async function mockCreateExpense({ campaignId, description, amount, date }) {
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

// ---- adaptador HTTP — usado quando VITE_API_URL aponta para o backend Flask ----

async function httpGetExpensesByCampaign(campaignId) {
  return apiFetch(`/campaigns/${campaignId}/expenses`)
}

async function httpCreateExpense({ campaignId, description, amount, date }) {
  return apiFetch(`/campaigns/${campaignId}/expenses`, {
    method: 'POST',
    json: { description, amount: Number(amount), date },
  })
}

export async function getExpensesByCampaign(campaignId) {
  return hasApi ? httpGetExpensesByCampaign(campaignId) : mockGetExpensesByCampaign(campaignId)
}

export async function createExpense(data) {
  return hasApi ? httpCreateExpense(data) : mockCreateExpense(data)
}
