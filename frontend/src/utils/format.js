const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Valores com centavos mostram sempre duas casas (R$ 150,50); valores
// inteiros continuam enxutos (R$ 4.200), como no restante da interface.
const currencyWithCentsFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

// Intl usa espaço não-quebrável entre o símbolo e o número; normalizamos para
// espaço comum para que o texto seja previsível em testes e ao copiar da tela.
function normalizeSpaces(text) {
  return text.replace(/ /g, ' ')
}

export function formatCurrency(value) {
  const amount = Number(value) || 0
  const roundedToCents = Math.round(amount * 100) / 100
  const formatter = Number.isInteger(roundedToCents)
    ? currencyFormatter
    : currencyWithCentsFormatter
  return normalizeSpaces(formatter.format(roundedToCents))
}

export function formatNumber(value) {
  return normalizeSpaces(numberFormatter.format(Number(value) || 0))
}

export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
