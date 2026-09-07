import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCampaigns } from '../services/campaignService'
import {
  createPublication,
  getPublicationById,
  updatePublication,
} from '../services/publicationService'

const emptyForm = { campaignId: '', title: '', description: '', date: '' }

function PublicationFormPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [campaigns, setCampaigns] = useState([])
  const navigate = useNavigate()

  async function loadCampaigns() {
    setCampaigns(await getCampaigns())
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    if (!isEditMode) return

    async function loadPublication() {
      const publication = await getPublicationById(id)
      if (publication) setForm({ ...emptyForm, ...publication })
    }

    loadPublication()
  }, [id, isEditMode])

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isEditMode) {
      await updatePublication(id, form)
    } else {
      await createPublication(form)
    }

    navigate('/calendario')
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>{isEditMode ? 'Editar publicação' : 'Nova publicação'}</h1>
          <p className="page-head-sub">Vincule a publicação a uma campanha e defina a data.</p>
        </div>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="publication-campaign">Campanha</label>
          <select
            id="publication-campaign"
            value={form.campaignId}
            onChange={handleChange('campaignId')}
            required
          >
            <option value="">Selecione</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>

          <label htmlFor="publication-title">Título</label>
          <input
            id="publication-title"
            value={form.title}
            onChange={handleChange('title')}
            required
          />

          <label htmlFor="publication-description">Descrição</label>
          <input
            id="publication-description"
            value={form.description}
            onChange={handleChange('description')}
          />

          <label htmlFor="publication-date">Data</label>
          <input
            id="publication-date"
            type="date"
            value={form.date}
            onChange={handleChange('date')}
            required
          />

          <button type="submit">Salvar</button>
        </form>
      </div>
    </main>
  )
}

export default PublicationFormPage
