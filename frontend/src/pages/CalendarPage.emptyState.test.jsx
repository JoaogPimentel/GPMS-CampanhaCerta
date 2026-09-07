import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CalendarPage from './CalendarPage'

function renderCalendar() {
  return render(
    <MemoryRouter initialEntries={['/calendario']}>
      <Routes>
        <Route path="/calendario" element={<CalendarPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CalendarPage - estado vazio', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe uma mensagem quando o mês não tem publicações', async () => {
    renderCalendar()

    expect(await screen.findByText(/nenhuma publicação neste mês/i)).toBeInTheDocument()
  })
})
