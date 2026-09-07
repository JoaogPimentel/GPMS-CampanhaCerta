import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusChip from './StatusChip'

describe('StatusChip', () => {
  it('exibe o rótulo e a classe corretos para cada status', () => {
    const { rerender } = render(<StatusChip status="em_andamento" />)
    expect(screen.getByText('Em andamento')).toHaveClass('chip-status-em_andamento')

    rerender(<StatusChip status="planejada" />)
    expect(screen.getByText('Planejada')).toHaveClass('chip-status-planejada')

    rerender(<StatusChip status="pausada" />)
    expect(screen.getByText('Pausada')).toHaveClass('chip-status-pausada')

    rerender(<StatusChip status="concluida" />)
    expect(screen.getByText('Concluída')).toHaveClass('chip-status-concluida')
  })
})
