/**
 * Core domain types for Canonical Staking Portfolio
 *
 * These types define the staking-specific concepts that power the dashboard,
 * sub-ledger, and reporting functionality.
 */

// ============================================================================
// Stake States
// ============================================================================

/**
 * The lifecycle state of staked assets.
 * Maps to the "state buckets" visible on the dashboard.
 */
export type StakeState =
  | 'active'              // Currently staking and earning rewards
  | 'pending_activation'  // Deposited, waiting for activation
  | 'in_transit'          // Moving between custodians/validators
  | 'exiting'             // Exit initiated, waiting for completion
  | 'exited'              // Fully withdrawn from staking

/**
 * Validator operational status (distinct from stake state)
 */
export type ValidatorStatus =
  | 'active'              // Validating normally
  | 'pending'             // Awaiting activation
  | 'slashed'             // Penalized for misbehavior
  | 'exited'              // No longer validating

// ============================================================================
// Rewards
// ============================================================================

/**
 * Classification of reward claims based on operational state
 */
export type RewardType =
  | 'unclaimed'           // Accrued but not yet claimable
  | 'claimable'           // Can be claimed now
  | 'claimed'             // Already withdrawn

// ============================================================================
// Exceptions
// ============================================================================

/**
 * Types of anomalies detected by the exception system
 */
export type ExceptionType =
  | 'portfolio_value_change'      // Unexpected material change
  | 'validator_count_change'      // Unexpected validator addition/removal
  | 'in_transit_stuck'            // Pending > threshold days
  | 'rewards_anomaly'             // Unexpected reward pattern
  | 'performance_divergence'      // Custodian/operator underperformance

/**
 * Workflow status for exceptions
 */
export type ExceptionStatus =
  | 'new'                 // Just detected
  | 'investigating'       // Under review
  | 'resolved'            // Issue addressed

// ============================================================================
// Entity Types
// ============================================================================

export interface Entity {
  id: string
  name: string
  type: 'fund' | 'product' | 'portfolio'
  createdAt: Date
  updatedAt: Date
}

export interface Custodian {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Operator {
  id: string
  name: string
  custodianId: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Validator {
  id: string
  pubkey: string
  operatorId: string
  withdrawalCredential: string
  status: ValidatorStatus
  activationEpoch?: number
  exitEpoch?: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Event Types
// ============================================================================

export interface StakeEvent {
  id: string
  validatorId: string
  eventType: 'deposit' | 'activation' | 'reward' | 'penalty' | 'exit_initiated' | 'exit_completed' | 'withdrawal'
  amount: bigint            // In wei/gwei
  epoch?: number
  slot?: number
  blockNumber?: number
  txHash?: string
  timestamp: Date
  finalized: boolean
  createdAt: Date
}

// ============================================================================
// Exception Types
// ============================================================================

export interface Exception {
  id: string
  type: ExceptionType
  status: ExceptionStatus
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidenceLinks: EvidenceLink[]
  detectedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  resolution?: string
  createdAt: Date
  updatedAt: Date
}

export interface EvidenceLink {
  type: 'validator' | 'custodian' | 'event' | 'external'
  id: string
  label: string
  url?: string
}

// ============================================================================
// Rollup / Aggregate Types
// ============================================================================

export interface PortfolioSummary {
  totalValue: bigint
  trailingApy30d: number    // As decimal (0.05 = 5%)
  validatorCount: number
  stateBuckets: StateBuckets
  custodianBreakdown: CustodianAllocation[]
  asOfTimestamp: Date
}

export interface StateBuckets {
  active: bigint
  inTransit: bigint
  rewards: bigint
  exiting: bigint
}

export interface CustodianAllocation {
  custodianId: string
  custodianName: string
  value: bigint
  percentage: number        // As decimal
  trailingApy30d: number
  validatorCount: number
  change7d?: number         // Percentage change
  change30d?: number
}

export interface ValidatorPerformance {
  validatorId: string
  pubkey: string
  operatorName: string
  custodianName: string
  status: ValidatorStatus
  stakeState: StakeState
  balance: bigint
  effectiveBalance: bigint
  trailingApy30d: number
  rewardsTotal: bigint
  penalties: bigint
  lastActivityTimestamp: Date
}

// ============================================================================
// Reporting Types
// ============================================================================

export interface ReportRequest {
  entityId?: string
  periodStart: Date
  periodEnd: Date
  format: 'json' | 'csv' | 'pdf'
}

export interface MonthlyStatement {
  reportId: string
  entityId?: string
  periodStart: Date
  periodEnd: Date
  methodologyVersion: string
  generatedAt: Date
  summary: PortfolioSummary
  validatorSchedule: ValidatorPerformance[]
  custodianBreakdown: CustodianAllocation[]
  reconciliation?: ReconciliationSummary
}

export interface ReconciliationSummary {
  internalTotal: bigint
  externalTotal?: bigint
  variance: bigint
  variancePercentage: number
  varianceCategories: VarianceCategory[]
}

export interface VarianceCategory {
  category: string
  amount: bigint
  explanation: string
  evidenceLinks: EvidenceLink[]
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T
  timestamp: Date
  cacheHit?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Serialize bigint for JSON transport
 */
export type SerializedBigInt = string

export interface SerializedPortfolioSummary extends Omit<PortfolioSummary, 'totalValue' | 'stateBuckets'> {
  totalValue: SerializedBigInt
  stateBuckets: {
    active: SerializedBigInt
    inTransit: SerializedBigInt
    rewards: SerializedBigInt
    exiting: SerializedBigInt
  }
}
