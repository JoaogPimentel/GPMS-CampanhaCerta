import { seedCampaigns } from '../mocks/campaigns'
import { nextId } from '../utils/nextId'
import { apiFetch, hasApi } from './apiClient'

const CAMPAIGNS_KEY = 'campanhacerta_campaigns'

// ---- adaptador mock (localStorage) — usado em testes e sem backend configurado ----

function loadCampaigns() {
  const raw = localStorage.getItem(CAMPAIGNS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(seedCampaigns))
  return seedCampaigns
}

function saveCampaigns(campaigns) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns))
}

async function mockGetCampaigns() {
  return loadCampaigns()
}

async function mockGetCampaignById(id) {
  const campaigns = loadCampaigns()
  return campaigns.find((campaign) => campaign.id === Number(id)) ?? null
}

async function mockCreateCampaign(data) {
  const campaigns = loadCampaigns()
  const campaign = { ...data, id: nextId(campaigns) }
  saveCampaigns([...campaigns, campaign])
  return campaign
}

async function mockUpdateCampaign(id, updates) {
  const campaigns = loadCampaigns()
  const index = campaigns.findIndex((campaign) => campaign.id === Number(id))

  if (index === -1) throw new Error('Campanha não encontrada')

  const updated = { ...campaigns[index], ...updates, id: campaigns[index].id }
  const nextCampaigns = [...campaigns]
  nextCampaigns[index] = updated
  saveCampaigns(nextCampaigns)
  return updated
}

async function mockDeleteCampaign(id) {
  const campaigns = loadCampaigns()
  saveCampaigns(campaigns.filter((campaign) => campaign.id !== Number(id)))
}

// ---- adaptador HTTP — usado quando VITE_API_URL aponta para o backend Flask ----

async function httpGetCampaigns() {
  return apiFetch('/campaigns')
}

async function httpGetCampaignById(id) {
  return apiFetch(`/campaigns/${id}`)
}

async function httpCreateCampaign(data) {
  return apiFetch('/campaigns', { method: 'POST', json: data })
}

async function httpUpdateCampaign(id, updates) {
  return apiFetch(`/campaigns/${id}`, { method: 'PUT', json: updates })
}

async function httpDeleteCampaign(id) {
  return apiFetch(`/campaigns/${id}`, { method: 'DELETE' })
}

export async function getCampaigns() {
  return hasApi ? httpGetCampaigns() : mockGetCampaigns()
}

export async function getCampaignById(id) {
  return hasApi ? httpGetCampaignById(id) : mockGetCampaignById(id)
}

export async function createCampaign(data) {
  return hasApi ? httpCreateCampaign(data) : mockCreateCampaign(data)
}

export async function updateCampaign(id, updates) {
  return hasApi ? httpUpdateCampaign(id, updates) : mockUpdateCampaign(id, updates)
}

export async function deleteCampaign(id) {
  return hasApi ? httpDeleteCampaign(id) : mockDeleteCampaign(id)
}
