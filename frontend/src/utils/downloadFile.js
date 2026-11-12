// BOM UTF-8: sem ele o Excel abre o CSV como Windows-1252 e os acentos do
// relatório aparecem quebrados ("PerÃ­odo", "OrÃ§amento").
const UTF8_BOM = '﻿'

export function downloadCsv(filename, content) {
  const blob = new Blob([UTF8_BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
