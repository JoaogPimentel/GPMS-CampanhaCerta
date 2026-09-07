import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCampaign } from '../services/campaignService'
import { createExpense } from '../services/expenseService'
import { createMetric } from '../services/metricService'
import { downloadCsv } from '../utils/downloadFile'
import CampaignDetailPage from './CampaignDetailPage'

vi.mock('../utils/downloadFile', () => ({ downloadCsv: vi.fn() }))

function renderDetail(campaignId) {
  return render(
    <MemoryRouter initialEntries={[`/campanhas/${campaignId}`]}>
      <Routes>
        <Route path="/campanhas/:id" element={<CampaignDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CampaignDetailPage - exportação de relatório (RF10)', () => {
  beforeEach(() => {
    localStorage.clear()
    downloadCsv.mockClear()
  })

  it('exporta um CSV com os dados da campanha ao clicar em Exportar CSV', async () => {
    const campaign = await createCampaign({
      name: 'Campanha para Exportar',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'planejada',
      conversionValue: 50,
    })
    await createMetric({
      campaignId: campaign.id,
      date: '2026-01-05',
      reach: 500,
      clicks: 40,
      conversions: 5,
    })
    await createExpense({
      campaignId: campaign.id,
      description: 'Anúncio',
      amount: 300,
      date: '2026-01-05',
    })
    const user = userEvent.setup()
    renderDetail(campaign.id)
    await screen.findByRole('heading', { name: 'Campanha para Exportar' })

    await user.click(screen.getByRole('button', { name: /exportar csv/i }))

    expect(downloadCsv).toHaveBeenCalledTimes(1)
    const [filename, content] = downloadCsv.mock.calls[0]
    expect(filename).toContain(String(campaign.id))
    expect(content).toContain('Campanha para Exportar')
    expect(content).toContain('Gasto total,300')
  })
})
