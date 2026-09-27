import { seedPublications } from '../mocks/publications'
import { nextId } from '../utils/nextId'
import { apiFetch, hasApi } from './apiClient'

const PUBLICATIONS_KEY = 'campanhacerta_publications'

// ---- adaptador mock (localStorage) — usado em testes e sem backend configurado ----

function loadPublications() {
  const raw = localStorage.getItem(PUBLICATIONS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(seedPublications))
  return seedPublications
}

function savePublications(publications) {
  localStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(publications))
}

async function mockGetPublications() {
  return loadPublications()
}

async function mockGetPublicationById(id) {
  return loadPublications().find((publication) => publication.id === Number(id)) ?? null
}

async function mockGetPublicationsByMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return loadPublications().filter((publication) => publication.date.startsWith(prefix))
}

async function mockCreatePublication(data) {
  const publications = loadPublications()
  const publication = { ...data, id: nextId(publications), campaignId: Number(data.campaignId) }
  savePublications([...publications, publication])
  return publication
}

async function mockUpdatePublication(id, updates) {
  const publications = loadPublications()
  const index = publications.findIndex((publication) => publication.id === Number(id))

  if (index === -1) throw new Error('Publicação não encontrada')

  const updated = {
    ...publications[index],
    ...updates,
    id: publications[index].id,
    campaignId: Number(updates.campaignId ?? publications[index].campaignId),
  }
  const nextPublications = [...publications]
  nextPublications[index] = updated
  savePublications(nextPublications)
  return updated
}

// ---- adaptador HTTP — usado quando VITE_API_URL aponta para o backend Flask ----

async function httpGetPublications() {
  return apiFetch('/publications')
}

async function httpGetPublicationById(id) {
  return apiFetch(`/publications/${id}`)
}

async function httpGetPublicationsByMonth(year, month) {
  return apiFetch(`/publications/month/${year}/${month}`)
}

async function httpCreatePublication(data) {
  return apiFetch('/publications', { method: 'POST', json: data })
}

async function httpUpdatePublication(id, updates) {
  return apiFetch(`/publications/${id}`, { method: 'PUT', json: updates })
}

export async function getPublications() {
  return hasApi ? httpGetPublications() : mockGetPublications()
}

export async function getPublicationById(id) {
  return hasApi ? httpGetPublicationById(id) : mockGetPublicationById(id)
}

export async function getPublicationsByMonth(year, month) {
  return hasApi ? httpGetPublicationsByMonth(year, month) : mockGetPublicationsByMonth(year, month)
}

export async function createPublication(data) {
  return hasApi ? httpCreatePublication(data) : mockCreatePublication(data)
}

export async function updatePublication(id, updates) {
  return hasApi ? httpUpdatePublication(id, updates) : mockUpdatePublication(id, updates)
}
