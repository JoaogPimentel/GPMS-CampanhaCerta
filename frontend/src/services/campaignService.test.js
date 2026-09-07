import { beforeEach, describe, expect, it } from 'vitest'
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  getCampaigns,
  updateCampaign,
} from './campaignService'

describe('campaignService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getCampaigns', () => {
    it('retorna as campanhas semeadas por padrão', async () => {
      const campaigns = await getCampaigns()

      expect(campaigns.length).toBeGreaterThan(0)
    })
  })

  describe('createCampaign', () => {
    it('cria uma campanha com os dados informados e um id gerado', async () => {
      const campaign = await createCampaign({
        name: 'Campanha de Teste',
        channel: 'Instagram',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        budget: 1000,
        goal: 'Aumentar seguidores',
        status: 'planejada',
      })

      expect(campaign).toMatchObject({
        name: 'Campanha de Teste',
        channel: 'Instagram',
        status: 'planejada',
      })
      expect(campaign.id).toBeDefined()
    })

    it('persiste a nova campanha na listagem', async () => {
      await createCampaign({
        name: 'Campanha de Teste',
        channel: 'Instagram',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        budget: 1000,
        goal: 'Aumentar seguidores',
        status: 'planejada',
      })

      const campaigns = await getCampaigns()

      expect(campaigns.some((campaign) => campaign.name === 'Campanha de Teste')).toBe(true)
    })
  })

  describe('getCampaignById', () => {
    it('retorna a campanha correspondente ao id', async () => {
      const created = await createCampaign({
        name: 'Busca por Id',
        channel: 'Facebook',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        budget: 500,
        goal: 'Gerar leads',
        status: 'planejada',
      })

      const found = await getCampaignById(created.id)

      expect(found).toMatchObject({ id: created.id, name: 'Busca por Id' })
    })

    it('retorna null quando o id não existe', async () => {
      const found = await getCampaignById(999999)

      expect(found).toBeNull()
    })
  })

  describe('updateCampaign', () => {
    it('atualiza os campos informados mantendo o restante', async () => {
      const created = await createCampaign({
        name: 'Original',
        channel: 'Google Ads',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        budget: 2000,
        goal: 'Vendas',
        status: 'planejada',
      })

      const updated = await updateCampaign(created.id, { status: 'em_andamento', budget: 2500 })

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Original',
        status: 'em_andamento',
        budget: 2500,
      })
    })
  })

  describe('deleteCampaign', () => {
    it('remove a campanha da listagem', async () => {
      const created = await createCampaign({
        name: 'Para Excluir',
        channel: 'TikTok',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        budget: 300,
        goal: 'Awareness',
        status: 'planejada',
      })

      await deleteCampaign(created.id)

      const found = await getCampaignById(created.id)
      expect(found).toBeNull()
    })
  })
})
