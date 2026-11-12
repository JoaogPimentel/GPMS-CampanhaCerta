import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv } from './downloadFile'

describe('downloadCsv', () => {
  const { createObjectURL, revokeObjectURL } = URL

  afterEach(() => {
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    vi.restoreAllMocks()
  })

  it('grava o CSV com BOM UTF-8 para o Excel exibir os acentos', async () => {
    let savedBlob
    URL.createObjectURL = vi.fn((blob) => {
      savedBlob = blob
      return 'blob:relatorio'
    })
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadCsv('relatorio.csv', 'Campo,Valor\nPeríodo,Orçamento')

    const bytes = new Uint8Array(await savedBlob.arrayBuffer())
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
    expect(new TextDecoder().decode(bytes)).toBe('Campo,Valor\nPeríodo,Orçamento')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:relatorio')
  })
})
