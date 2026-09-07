import { describe, expect, it } from 'vitest'
import { nextId } from './nextId'

describe('nextId', () => {
  it('retorna 1 quando a lista está vazia', () => {
    expect(nextId([])).toBe(1)
  })

  it('retorna o maior id existente mais um', () => {
    expect(nextId([{ id: 1 }, { id: 5 }, { id: 3 }])).toBe(6)
  })

  it('gera ids diferentes para criações sucessivas na mesma lista', () => {
    const items = [{ id: 1 }]
    const first = nextId(items)
    items.push({ id: first })
    const second = nextId(items)

    expect(first).not.toBe(second)
  })
})
