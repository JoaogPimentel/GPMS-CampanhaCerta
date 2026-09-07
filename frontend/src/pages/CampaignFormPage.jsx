import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCampaign, getCampaignById, updateCampaign } from '../services/campaignService'
import { CHANNELS, STATUSES } from '../utils/campaignOptions'
import { AGE_RANGES, emptyTargetAudience } from '../utils/targetAudienceOptions'

const emptyForm = {
  name: '',
  channel: CHANNELS[0],
  startDate: '',
  endDate: '',
  budget: '',
  goal: '',
  status: 'planejada',
  conversionValue: '',
  targetAudience: emptyTargetAudience,
}

function CampaignFormPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isEditMode) return

    async function loadCampaign() {
      const campaign = await getCampaignById(id)
      if (campaign) {
        setForm({
          ...emptyForm,
          ...campaign,
          targetAudience: { ...emptyTargetAudience, ...campaign.targetAudience },
        })
      }
    }

    loadCampaign()
  }, [id, isEditMode])

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleTargetAudienceChange(field) {
    return (event) =>
      setForm((prev) => ({
        ...prev,
        targetAudience: { ...prev.targetAudience, [field]: event.target.value },
      }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      ...form,
      budget: Number(form.budget),
      conversionValue: Number(form.conversionValue),
    }

    if (isEditMode) {
      await updateCampaign(id, payload)
    } else {
      await createCampaign(payload)
    }

    navigate('/campanhas')
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>{isEditMode ? 'Editar campanha' : 'Nova campanha'}</h1>
          <p className="page-head-sub">
            Defina período, orçamento e público-alvo para acompanhar o desempenho.
          </p>
        </div>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="campaign-name">Nome da campanha</label>
              <input
                id="campaign-name"
                value={form.name}
                onChange={handleChange('name')}
                required
              />
            </div>

            <div>
              <label htmlFor="campaign-channel">Canal</label>
              <select id="campaign-channel" value={form.channel} onChange={handleChange('channel')}>
                {CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="campaign-status">Status</label>
              <select id="campaign-status" value={form.status} onChange={handleChange('status')}>
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="campaign-start">Data de início</label>
              <input
                id="campaign-start"
                type="date"
                value={form.startDate}
                onChange={handleChange('startDate')}
                required
              />
            </div>

            <div>
              <label htmlFor="campaign-end">Data de fim</label>
              <input
                id="campaign-end"
                type="date"
                value={form.endDate}
                onChange={handleChange('endDate')}
                required
              />
            </div>

            <div>
              <label htmlFor="campaign-budget">Orçamento (R$)</label>
              <input
                id="campaign-budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={handleChange('budget')}
                required
              />
            </div>

            <div>
              <label htmlFor="campaign-conversion-value">Valor por conversão (R$)</label>
              <input
                id="campaign-conversion-value"
                type="number"
                min="0"
                value={form.conversionValue}
                onChange={handleChange('conversionValue')}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="campaign-goal">Meta</label>
              <input
                id="campaign-goal"
                value={form.goal}
                onChange={handleChange('goal')}
                required
              />
            </div>
          </div>

          <fieldset>
            <legend>Público-alvo</legend>
            <div className="form-grid">
              <div>
                <label htmlFor="campaign-age-range">Faixa etária</label>
                <select
                  id="campaign-age-range"
                  value={form.targetAudience.ageRange}
                  onChange={handleTargetAudienceChange('ageRange')}
                >
                  {AGE_RANGES.map((ageRange) => (
                    <option key={ageRange} value={ageRange}>
                      {ageRange}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="campaign-region">Região</label>
                <input
                  id="campaign-region"
                  value={form.targetAudience.region}
                  onChange={handleTargetAudienceChange('region')}
                />
              </div>

              <div>
                <label htmlFor="campaign-interest">Interesse</label>
                <input
                  id="campaign-interest"
                  value={form.targetAudience.interest}
                  onChange={handleTargetAudienceChange('interest')}
                />
              </div>
            </div>
          </fieldset>

          <button type="submit">Salvar</button>
        </form>
      </div>
    </main>
  )
}

export default CampaignFormPage
