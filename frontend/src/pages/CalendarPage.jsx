import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCampaigns } from '../services/campaignService'
import { getPublicationsByMonth } from '../services/publicationService'
import { buildMonthGrid } from '../utils/calendarGrid'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [publications, setPublications] = useState([])
  const [campaigns, setCampaigns] = useState([])

  async function loadData() {
    setPublications(await getPublicationsByMonth(year, month))
    setCampaigns(await getCampaigns())
  }

  useEffect(() => {
    loadData()
  }, [year, month])

  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(12)
      setYear((prev) => prev - 1)
    } else {
      setMonth((prev) => prev - 1)
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1)
      setYear((prev) => prev + 1)
    } else {
      setMonth((prev) => prev + 1)
    }
  }

  function campaignName(campaignId) {
    return campaigns.find((campaign) => campaign.id === Number(campaignId))?.name ?? ''
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1
  const weeks = buildMonthGrid(year, month)
  const publicationsByDay = publications.reduce((map, publication) => {
    const day = Number(publication.date.slice(8, 10))
    map[day] = map[day] ?? []
    map[day].push(publication)
    return map
  }, {})

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Calendário de publicações</h1>
          <p className="page-head-sub">Planeje e acompanhe as publicações de cada campanha.</p>
        </div>
        <div className="page-head-actions">
          <Link to="/calendario/nova" className="btn-primary">
            + Nova publicação
          </Link>
        </div>
      </div>

      <div className="calendar-controls">
        <button onClick={goToPreviousMonth}>Mês anterior</button>
        <span className="calendar-month-label">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button onClick={goToNextMonth}>Próximo mês</button>
      </div>

      {publications.length === 0 && <p className="empty-state">Nenhuma publicação neste mês.</p>}

      <div className="calendar-wrapper">
        <div className="calendar-grid">
          <div className="calendar-weekday-header">
            {WEEKDAY_LABELS.map((label) => (
              <div className="calendar-weekday" key={label}>
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div className="calendar-week" key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <div className="calendar-day calendar-day-empty" key={dayIndex} />
                }

                const isToday = isCurrentMonth && day === today.getDate()
                const dayPublications = publicationsByDay[day] ?? []

                return (
                  <div
                    className={`calendar-day${isToday ? ' calendar-day-today' : ''}`}
                    key={dayIndex}
                  >
                    <span className="calendar-day-number">{day}</span>
                    <ul className="calendar-day-publications">
                      {dayPublications.map((publication) => (
                        <li key={publication.id}>
                          <Link
                            to={`/calendario/${publication.id}/editar`}
                            aria-label={`Editar ${publication.title}`}
                            title={`${publication.title} — ${campaignName(publication.campaignId)}`}
                          >
                            {publication.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default CalendarPage
