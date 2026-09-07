import { seedPublications } from '../mocks/publications'
import { nextId } from '../utils/nextId'

const PUBLICATIONS_KEY = 'campanhacerta_publications'

function loadPublications() {
  const raw = localStorage.getItem(PUBLICATIONS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(seedPublications))
  return seedPublications
}

function savePublications(publications) {
  localStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(publications))
}

export async function getPublications() {
  return loadPublications()
}

export async function getPublicationById(id) {
  return loadPublications().find((publication) => publication.id === Number(id)) ?? null
}

export async function getPublicationsByMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return loadPublications().filter((publication) => publication.date.startsWith(prefix))
}

export async function createPublication(data) {
  const publications = loadPublications()
  const publication = { ...data, id: nextId(publications), campaignId: Number(data.campaignId) }
  savePublications([...publications, publication])
  return publication
}

export async function updatePublication(id, updates) {
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
