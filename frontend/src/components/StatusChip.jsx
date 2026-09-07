import { STATUS_LABELS } from '../utils/campaignOptions'

function StatusChip({ status }) {
  return (
    <span className={`chip chip-status-${status}`}>
      <span className="chip-dot" />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default StatusChip
