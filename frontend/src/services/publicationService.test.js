import { beforeEach, describe, expect, it } from 'vitest'
import {
  createPublication,
  getPublicationById,
  getPublicationsByMonth,
  updatePublication,
} from './publicationService'

describe('publicationService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('createPublication / getPublicationById', () => {
    it('cria uma publicação vinculada a uma campanha com id gerado', async () => {
      const publication = await createPublication({
        campaignId: 1,
        title: 'Post de lançamento',
        description: 'Anúncio do produto novo',
        date: '2026-03-10',
      })

      expect(publication).toMatchObject({
        campaignId: 1,
        title: 'Post de lançamento',
        date: '2026-03-10',
      })
      expect(publication.id).toBeDefined()
    })

    it('retorna null quando o id não existe', async () => {
      const publication = await getPublicationById(999999)

      expect(publication).toBeNull()
    })
  })

  describe('getPublicationsByMonth', () => {
    it('retorna apenas as publicações do mês e ano informados', async () => {
      await createPublication({
        campaignId: 1,
        title: 'Post A',
        description: '',
        date: '2026-03-05',
      })
      await createPublication({
        campaignId: 1,
        title: 'Post B',
        description: '',
        date: '2026-04-01',
      })

      const publications = await getPublicationsByMonth(2026, 3)

      expect(publications.some((publication) => publication.title === 'Post A')).toBe(true)
      expect(publications.some((publication) => publication.title === 'Post B')).toBe(false)
    })
  })

  describe('updatePublication', () => {
    it('atualiza os campos informados mantendo o restante', async () => {
      const created = await createPublication({
        campaignId: 1,
        title: 'Post Original',
        description: 'Descrição original',
        date: '2026-03-10',
      })

      const updated = await updatePublication(created.id, { title: 'Post Editado' })

      expect(updated).toMatchObject({ id: created.id, title: 'Post Editado', date: '2026-03-10' })
    })
  })
})
