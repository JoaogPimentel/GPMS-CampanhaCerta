const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

// Intl usa espaço não-quebrável entre o símbolo e o número; normalizamos para
// espaço comum para que o texto seja previsível em testes e ao copiar da tela.
function normalizeSpaces(text) {
  return text.replace(/ /g, ' ')
}

export function formatCurrency(value) {
  return normalizeSpaces(currencyFormatter.format(Number(value) || 0))
}

export function formatNumber(value) {
  return normalizeSpaces(numberFormatter.format(Number(value) || 0))
}

export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
