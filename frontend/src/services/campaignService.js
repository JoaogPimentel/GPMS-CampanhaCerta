import { seedCampaigns } from '../mocks/campaigns'
import { nextId } from '../utils/nextId'

const CAMPAIGNS_KEY = 'campanhacerta_campaigns'

function loadCampaigns() {
  const raw = localStorage.getItem(CAMPAIGNS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(seedCampaigns))
  return seedCampaigns
}

function saveCampaigns(campaigns) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns))
}

export async function getCampaigns() {
  return loadCampaigns()
}

export async function getCampaignById(id) {
  const campaigns = loadCampaigns()
  return campaigns.find((campaign) => campaign.id === Number(id)) ?? null
}

export async function createCampaign(data) {
  const campaigns = loadCampaigns()
  const campaign = { ...data, id: nextId(campaigns) }
  saveCampaigns([...campaigns, campaign])
  return campaign
}

export async function updateCampaign(id, updates) {
  const campaigns = loadCampaigns()
  const index = campaigns.findIndex((campaign) => campaign.id === Number(id))

  if (index === -1) throw new Error('Campanha não encontrada')

  const updated = { ...campaigns[index], ...updates, id: campaigns[index].id }
  const nextCampaigns = [...campaigns]
  nextCampaigns[index] = updated
  saveCampaigns(nextCampaigns)
  return updated
}

export async function deleteCampaign(id) {
  const campaigns = loadCampaigns()
  saveCampaigns(campaigns.filter((campaign) => campaign.id !== Number(id)))
}
