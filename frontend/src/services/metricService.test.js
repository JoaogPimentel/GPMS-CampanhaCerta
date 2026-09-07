import { beforeEach, describe, expect, it } from 'vitest'
import {
  createMetric,
  getMetricsByCampaign,
  importMetricsCsv,
  parseMetricsCsv,
} from './metricService'

describe('metricService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('createMetric / getMetricsByCampaign', () => {
    it('cria uma métrica vinculada à campanha com id gerado', async () => {
      const metric = await createMetric({
        campaignId: 1,
        date: '2026-01-05',
        reach: 1000,
        clicks: 80,
        conversions: 10,
      })

      expect(metric).toMatchObject({
        campaignId: 1,
        date: '2026-01-05',
        reach: 1000,
        clicks: 80,
        conversions: 10,
      })
      expect(metric.id).toBeDefined()
    })

    it('retorna apenas as métricas da campanha informada', async () => {
      await createMetric({
        campaignId: 1,
        date: '2026-01-05',
        reach: 100,
        clicks: 10,
        conversions: 1,
      })
      await createMetric({
        campaignId: 2,
        date: '2026-01-06',
        reach: 200,
        clicks: 20,
        conversions: 2,
      })

      const metrics = await getMetricsByCampaign(1)

      expect(metrics.every((metric) => metric.campaignId === 1)).toBe(true)
    })

    it('retorna array vazio quando a campanha não possui métricas', async () => {
      const metrics = await getMetricsByCampaign(999999)

      expect(metrics).toEqual([])
    })
  })

  describe('parseMetricsCsv', () => {
    it('interpreta linhas válidas de um CSV', () => {
      const csv = 'date,reach,clicks,conversions\n2026-01-01,500,40,5\n2026-01-02,600,50,6'

      const { parsed, errors } = parseMetricsCsv(csv)

      expect(errors).toEqual([])
      expect(parsed).toEqual([
        { date: '2026-01-01', reach: 500, clicks: 40, conversions: 5 },
        { date: '2026-01-02', reach: 600, clicks: 50, conversions: 6 },
      ])
    })

    it('reporta erro para linha com campo ausente sem descartar as válidas', () => {
      const csv = 'date,reach,clicks,conversions\n2026-01-01,500,40,5\n2026-01-02,,50,6'

      const { parsed, errors } = parseMetricsCsv(csv)

      expect(parsed).toEqual([{ date: '2026-01-01', reach: 500, clicks: 40, conversions: 5 }])
      expect(errors).toHaveLength(1)
      expect(errors[0]).toMatch(/linha 3/i)
    })

    it('reporta erro para valores numéricos inválidos', () => {
      const csv = 'date,reach,clicks,conversions\n2026-01-01,abc,40,5'

      const { parsed, errors } = parseMetricsCsv(csv)

      expect(parsed).toEqual([])
      expect(errors).toHaveLength(1)
    })
  })

  describe('importMetricsCsv', () => {
    it('importa as linhas válidas e retorna a contagem e os erros', async () => {
      const csv = 'date,reach,clicks,conversions\n2026-01-01,500,40,5\n2026-01-02,,50,6'

      const result = await importMetricsCsv(1, csv)

      expect(result.imported).toBe(1)
      expect(result.errors).toHaveLength(1)

      const metrics = await getMetricsByCampaign(1)
      expect(metrics.some((metric) => metric.date === '2026-01-01')).toBe(true)
    })
  })
})
