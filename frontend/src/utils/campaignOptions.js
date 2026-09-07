export const CHANNELS = ['Instagram', 'Facebook', 'Google Ads', 'E-mail', 'TikTok']

export const STATUSES = [
  { value: 'planejada', label: 'Planejada' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'concluida', label: 'Concluída' },
]

export const STATUS_LABELS = STATUSES.reduce((labels, status) => {
  labels[status.value] = status.label
  return labels
}, {})
