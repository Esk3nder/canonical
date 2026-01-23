/**
 * Reconciliation Service
 *
 * Compares internal computed totals against external statements
 * to identify and categorize variances for audit support.
 */

import type { EvidenceLink, VarianceCategory, ReconciliationSummary } from '@/domain/types'

// ============================================================================
// Types
// ============================================================================

export interface InternalTotal {
  totalValue: bigint
  validatorCount: number
  asOfDate: Date
  validatorBreakdown?: Array<{
    validatorId: string
    balance: bigint
  }>
}

export interface ExternalStatement {
  source: string
  totalValue: bigint
  reportDate: Date
  reference?: string
}

export interface Variance {
  amount: bigint
  percentage: number
  direction: 'internal_higher' | 'external_higher' | 'match'
}

export interface VarianceBreakdown {
  timingDifference?: bigint
  rewardAccrual?: bigint
  feesDifference?: bigint
  pendingTransactions?: bigint
  unexplained?: bigint
}

export interface VarianceEvidence {
  timingDifference?: Array<{ validatorId: string; label: string }>
  rewardAccrual?: Array<{ validatorId: string; label: string }>
  feesDifference?: Array<{ validatorId: string; label: string }>
  pendingTransactions?: Array<{ validatorId: string; label: string }>
  unexplained?: Array<{ validatorId: string; label: string }>
}

export interface ReconciliationReport extends ReconciliationSummary {
  status: 'reconciled' | 'variance_detected' | 'requires_investigation'
  source: string
  reportDate: Date
  internalAsOfDate: Date
}

// ============================================================================
// Variance Detection
// ============================================================================

/**
 * Detects variance between internal computed total and external statement.
 */
export function detectVariance(
  internal: InternalTotal,
  external: ExternalStatement
): Variance {
  const diff = internal.totalValue - external.totalValue

  if (diff === 0n) {
    return {
      amount: 0n,
      percentage: 0,
      direction: 'match',
    }
  }

  const amount = diff > 0n ? diff : -diff
  const percentage = Number(amount) / Number(internal.totalValue)
  const direction = diff > 0n ? 'internal_higher' : 'external_higher'

  return {
    amount,
    percentage,
    direction,
  }
}

// ============================================================================
// Variance Categorization
// ============================================================================

/**
 * Categorizes variance by type with evidence links.
 */
export function categorizeVariance(
  totalVariance: bigint,
  breakdown: VarianceBreakdown,
  evidence: VarianceEvidence = {}
): VarianceCategory[] {
  const categories: VarianceCategory[] = []

  const categoryMap: Array<{
    key: keyof VarianceBreakdown
    category: string
    explanation: string
  }> = [
    {
      key: 'timingDifference',
      category: 'timing_difference',
      explanation: 'Transactions processed at different times between systems',
    },
    {
      key: 'rewardAccrual',
      category: 'reward_accrual',
      explanation: 'Difference in reward calculation timing or methodology',
    },
    {
      key: 'feesDifference',
      category: 'fees_difference',
      explanation: 'Variance due to fee calculation or deduction timing',
    },
    {
      key: 'pendingTransactions',
      category: 'pending_transactions',
      explanation: 'Transactions pending finalization',
    },
    {
      key: 'unexplained',
      category: 'unexplained',
      explanation: 'Variance requiring further investigation',
    },
  ]

  for (const { key, category, explanation } of categoryMap) {
    const amount = breakdown[key]
    if (amount !== undefined && amount > 0n) {
      const evidenceItems = evidence[key] || []
      const evidenceLinks: EvidenceLink[] = evidenceItems.map((e) => ({
        type: 'validator' as const,
        id: e.validatorId,
        label: e.label,
      }))

      categories.push({
        category,
        amount,
        explanation,
        evidenceLinks,
      })
    }
  }

  return categories
}

// ============================================================================
// Reconciliation Report
// ============================================================================

/**
 * Creates a full reconciliation report comparing internal and external totals.
 */
export function createReconciliationReport(
  internal: InternalTotal,
  external: ExternalStatement,
  breakdown?: VarianceBreakdown,
  evidence?: VarianceEvidence
): ReconciliationReport {
  const variance = detectVariance(internal, external)

  // Determine status based on variance threshold
  // 0.1% is typically acceptable for timing differences
  const ACCEPTABLE_VARIANCE_THRESHOLD = 0.001

  let status: ReconciliationReport['status']
  if (variance.amount === 0n) {
    status = 'reconciled'
  } else if (variance.percentage <= ACCEPTABLE_VARIANCE_THRESHOLD) {
    status = 'reconciled'
  } else if (variance.percentage <= 0.01) {
    status = 'variance_detected'
  } else {
    status = 'requires_investigation'
  }

  // Build variance categories
  let varianceCategories: VarianceCategory[] = []
  if (breakdown) {
    varianceCategories = categorizeVariance(variance.amount, breakdown, evidence)
  } else if (variance.amount > 0n) {
    // Default categorization if no breakdown provided
    varianceCategories = [
      {
        category: 'unexplained',
        amount: variance.amount,
        explanation: 'Variance requires categorization',
        evidenceLinks: internal.validatorBreakdown?.map((v) => ({
          type: 'validator' as const,
          id: v.validatorId,
          label: `Validator ${v.validatorId.slice(0, 8)}...`,
        })) || [],
      },
    ]
  }

  return {
    internalTotal: internal.totalValue,
    externalTotal: external.totalValue,
    variance: variance.amount,
    variancePercentage: variance.percentage,
    varianceCategories,
    status,
    source: external.source,
    reportDate: external.reportDate,
    internalAsOfDate: internal.asOfDate,
  }
}

// ============================================================================
// Batch Reconciliation
// ============================================================================

/**
 * Reconciles multiple custodian statements against internal totals.
 */
export function reconcileAllCustodians(
  internalTotals: Map<string, InternalTotal>,
  externalStatements: ExternalStatement[]
): Map<string, ReconciliationReport> {
  const reports = new Map<string, ReconciliationReport>()

  for (const external of externalStatements) {
    const internal = internalTotals.get(external.source)

    if (!internal) {
      // No internal data for this source - flag for investigation
      reports.set(external.source, {
        internalTotal: 0n,
        externalTotal: external.totalValue,
        variance: external.totalValue,
        variancePercentage: 1,
        varianceCategories: [
          {
            category: 'missing_internal_data',
            amount: external.totalValue,
            explanation: 'No internal data found for this custodian',
            evidenceLinks: [],
          },
        ],
        status: 'requires_investigation',
        source: external.source,
        reportDate: external.reportDate,
        internalAsOfDate: new Date(),
      })
      continue
    }

    reports.set(external.source, createReconciliationReport(internal, external))
  }

  return reports
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if reconciliation is within acceptable variance.
 */
export function isReconciled(report: ReconciliationReport): boolean {
  return report.status === 'reconciled'
}

/**
 * Gets total unexplained variance across all reports.
 */
export function getTotalUnexplainedVariance(
  reports: Map<string, ReconciliationReport>
): bigint {
  let total = 0n

  for (const report of reports.values()) {
    const unexplained = report.varianceCategories.find(
      (c) => c.category === 'unexplained'
    )
    if (unexplained) {
      total += unexplained.amount
    }
  }

  return total
}
