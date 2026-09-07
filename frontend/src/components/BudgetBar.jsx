import { getBudgetStatus } from '../utils/budgetStatus'
import { formatCurrency } from '../utils/format'

const RISK_LABELS = {
  risk: 'Perto do limite',
  over: 'Orçamento estourado',
}

function BudgetBar({ spent, budget }) {
  const { level, percentage } = getBudgetStatus(spent, budget)

  return (
    <div className="budget-bar">
      {level !== 'healthy' && (
        <span className={`chip chip-risk-${level}`}>
          <span className="chip-dot" />
          {RISK_LABELS[level]}
        </span>
      )}
      <div className="budget-bar-track">
        <div
          className={`budget-bar-fill is-${level}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="budget-bar-figures">
        <strong>{formatCurrency(spent)}</strong> de {formatCurrency(budget)} · {percentage}%
      </span>
    </div>
  )
}

export default BudgetBar
