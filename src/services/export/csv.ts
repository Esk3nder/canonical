/**
 * CSV Export Service
 *
 * Generates CSV exports for portfolio reports, validator schedules,
 * and custodian breakdowns.
 */

import type {
  PortfolioSummary,
  ValidatorPerformance,
  CustodianAllocation,
  MonthlyStatement,
} from '@/domain/types'

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: string | number | bigint | undefined | null): string {
  if (value === undefined || value === null) {
    return ''
  }
  const str = String(value)
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converts an array of values to a CSV row
 */
function toCSVRow(values: (string | number | bigint | undefined | null)[]): string {
  return values.map(escapeCSV).join(',')
}

/**
 * Generates CSV for portfolio summary
 */
export function generatePortfolioCSV(
  summary: PortfolioSummary,
  methodologyVersion?: string
): string {
  const lines: string[] = []

  // Summary header row for quick scan
  lines.push(toCSVRow(['Total Value', 'Trailing APY', 'Validator Count']))
  lines.push(toCSVRow([summary.totalValue, summary.trailingApy30d, summary.validatorCount]))
  lines.push(`Generated At,${new Date().toISOString()}`)
  lines.push(`As Of,${summary.asOfTimestamp.toISOString()}`)
  if (methodologyVersion) {
    lines.push(`Methodology Version,${methodologyVersion}`)
  }
  lines.push('')

  // State buckets section
  lines.push('State Buckets')
  lines.push(toCSVRow(['State', 'Value (gwei)', 'Percentage']))
  const total = summary.totalValue > 0n ? summary.totalValue : 1n

  lines.push(toCSVRow([
    'Active',
    summary.stateBuckets.active,
    (Number(summary.stateBuckets.active) / Number(total) * 100).toFixed(2) + '%',
  ]))
  lines.push(toCSVRow([
    'In Transit',
    summary.stateBuckets.inTransit,
    (Number(summary.stateBuckets.inTransit) / Number(total) * 100).toFixed(2) + '%',
  ]))
  lines.push(toCSVRow([
    'Rewards',
    summary.stateBuckets.rewards,
    (Number(summary.stateBuckets.rewards) / Number(total) * 100).toFixed(2) + '%',
  ]))
  lines.push(toCSVRow([
    'Exiting',
    summary.stateBuckets.exiting,
    (Number(summary.stateBuckets.exiting) / Number(total) * 100).toFixed(2) + '%',
  ]))

  return lines.join('\n')
}

/**
 * Generates CSV for validator schedule
 */
export function generateValidatorScheduleCSV(
  validators: ValidatorPerformance[]
): string {
  const lines: string[] = []

  // Header
  lines.push(toCSVRow([
    'Validator ID',
    'Pubkey',
    'Operator',
    'Custodian',
    'Status',
    'Stake State',
    'Balance (gwei)',
    'Effective Balance (gwei)',
    'Trailing APY (30d)',
    'Total Rewards (gwei)',
    'Penalties (gwei)',
    'Last Activity',
  ]))

  // Data rows
  for (const v of validators) {
    lines.push(toCSVRow([
      v.validatorId,
      v.pubkey,
      v.operatorName,
      v.custodianName,
      v.status,
      v.stakeState,
      v.balance,
      v.effectiveBalance,
      v.trailingApy30d,
      v.rewardsTotal,
      v.penalties,
      v.lastActivityTimestamp.toISOString(),
    ]))
  }

  return lines.join('\n')
}

/**
 * Generates CSV for custodian breakdown
 */
export function generateCustodianBreakdownCSV(
  custodians: CustodianAllocation[]
): string {
  const lines: string[] = []

  // Header
  lines.push(toCSVRow([
    'Custodian ID',
    'Custodian',
    'Value (gwei)',
    'Percentage',
    'APY (30d)',
    'Validator Count',
    '7d Change',
    '30d Change',
  ]))

  // Data rows
  for (const c of custodians) {
    lines.push(toCSVRow([
      c.custodianId,
      c.custodianName,
      c.value,
      (c.percentage * 100).toFixed(2) + '%',
      (c.trailingApy30d * 100).toFixed(2) + '%',
      c.validatorCount,
      c.change7d !== undefined ? (c.change7d * 100).toFixed(2) + '%' : '',
      c.change30d !== undefined ? (c.change30d * 100).toFixed(2) + '%' : '',
    ]))
  }

  return lines.join('\n')
}

/**
 * Generates a complete monthly statement CSV
 */
export function generateMonthlyStatementCSV(statement: MonthlyStatement): string {
  const lines: string[] = []

  // Header
  lines.push('Monthly Statement Report')
  lines.push(`Report ID,${statement.reportId}`)
  if (statement.entityId) {
    lines.push(`Entity ID,${statement.entityId}`)
  }
  lines.push(`Period,${statement.periodStart.toISOString()} to ${statement.periodEnd.toISOString()}`)
  lines.push(`Methodology Version,${statement.methodologyVersion}`)
  lines.push(`Generated At,${statement.generatedAt.toISOString()}`)
  lines.push('')

  // Portfolio summary
  lines.push(generatePortfolioCSV(statement.summary, statement.methodologyVersion))
  lines.push('')

  // Custodian breakdown
  lines.push('Custodian Breakdown')
  lines.push(generateCustodianBreakdownCSV(statement.custodianBreakdown))
  lines.push('')

  // Validator schedule
  lines.push('Validator Schedule')
  lines.push(generateValidatorScheduleCSV(statement.validatorSchedule))

  // Reconciliation (if present)
  if (statement.reconciliation) {
    lines.push('')
    lines.push('Reconciliation Summary')
    lines.push(toCSVRow(['Metric', 'Value']))
    lines.push(toCSVRow(['Internal Total (gwei)', statement.reconciliation.internalTotal]))
    lines.push(toCSVRow(['External Total (gwei)', statement.reconciliation.externalTotal ?? 'N/A']))
    lines.push(toCSVRow(['Variance (gwei)', statement.reconciliation.variance]))
    lines.push(toCSVRow(['Variance Percentage', (statement.reconciliation.variancePercentage * 100).toFixed(4) + '%']))
  }

  return lines.join('\n')
}
