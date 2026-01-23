/**
 * Exception Detection Service
 *
 * Monitors staking portfolio for anomalies and creates exceptions
 * that require investigation or action.
 */

import { randomUUID } from 'crypto'
import type {
  Exception,
  ExceptionType,
  ExceptionStatus,
  EvidenceLink,
  StakeState,
} from '@/domain/types'

// ============================================================================
// Types
// ============================================================================

export interface ExceptionConfig {
  portfolioValueChangeThreshold?: number // Default: 0.05 (5%)
  validatorCountChangeThreshold?: number // Default: 0.1 (10%)
  inTransitStuckDays?: number // Default: 7
  rewardsAnomalyThreshold?: number // Default: 0.3 (30%)
  performanceDivergenceThreshold?: number // Default: 0.2 (20%)
}

export interface PortfolioSnapshot {
  totalValue: bigint
  validatorCount?: number
  timestamp: Date
}

export interface ValidatorWithTransit {
  id: string
  stakeState: StakeState
  transitStartDate?: Date
}

export interface CustodianPerformance {
  custodianId: string
  custodianName: string
  trailingApy30d: number
}

export interface DetectionState {
  previousSnapshot: PortfolioSnapshot
  currentSnapshot: PortfolioSnapshot
  validators: ValidatorWithTransit[]
  rewardHistory: Array<{ date: Date; amount: bigint }>
  custodianPerformance: CustodianPerformance[]
}

interface ExceptionInput {
  type: ExceptionType
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidenceLinks?: EvidenceLink[]
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<ExceptionConfig> = {
  portfolioValueChangeThreshold: 0.05,
  validatorCountChangeThreshold: 0.1,
  inTransitStuckDays: 7,
  rewardsAnomalyThreshold: 0.3,
  performanceDivergenceThreshold: 0.2,
}

// ============================================================================
// Exception Factory
// ============================================================================

/**
 * Creates an exception record with generated ID and timestamps.
 */
export function createException(input: ExceptionInput): Exception {
  const now = new Date()

  return {
    id: randomUUID(),
    type: input.type,
    status: 'new' as ExceptionStatus,
    title: input.title,
    description: input.description,
    severity: input.severity,
    evidenceLinks: input.evidenceLinks || [],
    detectedAt: now,
    createdAt: now,
    updatedAt: now,
  }
}

// ============================================================================
// Portfolio Value Change Detection
// ============================================================================

/**
 * Detects material changes in portfolio value between snapshots.
 */
export function detectPortfolioValueChange(
  previous: PortfolioSnapshot,
  current: PortfolioSnapshot,
  config: ExceptionConfig
): Exception | null {
  const threshold = config.portfolioValueChangeThreshold ?? DEFAULT_CONFIG.portfolioValueChangeThreshold

  if (previous.totalValue === 0n) {
    return null
  }

  const change = current.totalValue - previous.totalValue
  const changePercent = Math.abs(Number(change)) / Number(previous.totalValue)

  if (changePercent <= threshold) {
    return null
  }

  const direction = change > 0n ? 'increased' : 'decreased'
  const percentStr = (changePercent * 100).toFixed(2)

  // Determine severity based on magnitude
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  if (changePercent > 0.2) severity = 'critical'
  else if (changePercent > 0.1) severity = 'high'

  return createException({
    type: 'portfolio_value_change',
    title: `Portfolio value ${direction} ${percentStr}%`,
    description: `Portfolio value changed from ${previous.totalValue.toString()} to ${current.totalValue.toString()} (${direction} ${percentStr}%) between ${previous.timestamp.toISOString()} and ${current.timestamp.toISOString()}`,
    severity,
    evidenceLinks: [],
  })
}

// ============================================================================
// Validator Count Change Detection
// ============================================================================

/**
 * Detects unexpected changes in validator count.
 */
export function detectValidatorCountChange(
  previousCount: number,
  currentCount: number,
  config: ExceptionConfig
): Exception | null {
  const threshold = config.validatorCountChangeThreshold ?? DEFAULT_CONFIG.validatorCountChangeThreshold

  if (previousCount === 0) {
    return null
  }

  const change = currentCount - previousCount
  const changePercent = Math.abs(change) / previousCount

  if (changePercent <= threshold) {
    return null
  }

  const direction = change > 0 ? 'increased' : 'decreased'
  const percentStr = (changePercent * 100).toFixed(2)

  return createException({
    type: 'validator_count_change',
    title: `Validator count ${direction} ${percentStr}%`,
    description: `Validator count changed from ${previousCount} to ${currentCount} (${direction} by ${Math.abs(change)} validators)`,
    severity: changePercent > 0.2 ? 'high' : 'medium',
  })
}

// ============================================================================
// In-Transit Stuck Detection
// ============================================================================

/**
 * Detects validators stuck in transit state beyond threshold.
 */
export function detectInTransitStuck(
  validators: ValidatorWithTransit[],
  now: Date,
  config: ExceptionConfig
): Exception[] {
  const thresholdDays = config.inTransitStuckDays ?? DEFAULT_CONFIG.inTransitStuckDays
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000
  const exceptions: Exception[] = []

  const inTransitStates: StakeState[] = ['in_transit', 'pending_activation']

  for (const validator of validators) {
    if (!inTransitStates.includes(validator.stakeState)) {
      continue
    }

    if (!validator.transitStartDate) {
      continue
    }

    const transitDuration = now.getTime() - validator.transitStartDate.getTime()

    if (transitDuration > thresholdMs) {
      const daysStuck = Math.floor(transitDuration / (24 * 60 * 60 * 1000))

      exceptions.push(
        createException({
          type: 'in_transit_stuck',
          title: `Validator ${validator.id.slice(0, 8)}... stuck in transit`,
          description: `Validator has been in '${validator.stakeState}' state for ${daysStuck} days (threshold: ${thresholdDays} days)`,
          severity: daysStuck > thresholdDays * 2 ? 'high' : 'medium',
          evidenceLinks: [
            {
              type: 'validator',
              id: validator.id,
              label: `Validator ${validator.id.slice(0, 8)}...`,
            },
          ],
        })
      )
    }
  }

  return exceptions
}

// ============================================================================
// Rewards Anomaly Detection
// ============================================================================

/**
 * Detects anomalies in reward patterns (drops or spikes).
 */
export function detectRewardsAnomaly(
  rewardHistory: Array<{ date: Date; amount: bigint }>,
  config: ExceptionConfig
): Exception | null {
  const threshold = config.rewardsAnomalyThreshold ?? DEFAULT_CONFIG.rewardsAnomalyThreshold

  if (rewardHistory.length < 3) {
    return null // Not enough data
  }

  // Sort by date
  const sorted = [...rewardHistory].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )

  // Calculate average of all but the last entry
  const historical = sorted.slice(0, -1)
  const latest = sorted[sorted.length - 1]

  const historicalSum = historical.reduce((sum, r) => sum + r.amount, 0n)
  const historicalAvg = Number(historicalSum) / historical.length
  const latestAmount = Number(latest.amount)

  if (historicalAvg === 0) {
    return null
  }

  const deviation = Math.abs(latestAmount - historicalAvg) / historicalAvg

  if (deviation <= threshold) {
    return null
  }

  const direction = latestAmount > historicalAvg ? 'spike' : 'drop'
  const percentStr = (deviation * 100).toFixed(2)

  return createException({
    type: 'rewards_anomaly',
    title: `Rewards ${direction} detected (${percentStr}% deviation)`,
    description: `Latest reward of ${latest.amount.toString()} deviates ${percentStr}% from historical average of ${historicalAvg.toFixed(0)}`,
    severity: deviation > threshold * 2 ? 'high' : 'medium',
  })
}

// ============================================================================
// Performance Divergence Detection
// ============================================================================

/**
 * Detects custodians underperforming relative to peers.
 */
export function detectPerformanceDivergence(
  custodianPerformance: CustodianPerformance[],
  config: ExceptionConfig
): Exception[] {
  const threshold = config.performanceDivergenceThreshold ?? DEFAULT_CONFIG.performanceDivergenceThreshold
  const exceptions: Exception[] = []

  if (custodianPerformance.length < 2) {
    return exceptions // Need at least 2 to compare
  }

  // Calculate average APY
  const avgApy =
    custodianPerformance.reduce((sum, c) => sum + c.trailingApy30d, 0) /
    custodianPerformance.length

  if (avgApy === 0) {
    return exceptions
  }

  for (const custodian of custodianPerformance) {
    const deviation = (avgApy - custodian.trailingApy30d) / avgApy

    // Only flag underperformance (positive deviation means below average)
    if (deviation > threshold) {
      const percentStr = (deviation * 100).toFixed(2)

      exceptions.push(
        createException({
          type: 'performance_divergence',
          title: `${custodian.custodianName} underperforming by ${percentStr}%`,
          description: `${custodian.custodianName} trailing APY of ${(custodian.trailingApy30d * 100).toFixed(2)}% is ${percentStr}% below portfolio average of ${(avgApy * 100).toFixed(2)}%`,
          severity: deviation > threshold * 2 ? 'high' : 'medium',
          evidenceLinks: [
            {
              type: 'custodian',
              id: custodian.custodianId,
              label: custodian.custodianName,
            },
          ],
        })
      )
    }
  }

  return exceptions
}

// ============================================================================
// Main Detection Runner
// ============================================================================

/**
 * Runs all exception detectors and returns collected exceptions.
 */
export function runExceptionDetection(
  state: DetectionState,
  config: ExceptionConfig = {}
): Exception[] {
  const exceptions: Exception[] = []
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // Portfolio value change
  const portfolioException = detectPortfolioValueChange(
    state.previousSnapshot,
    state.currentSnapshot,
    mergedConfig
  )
  if (portfolioException) {
    exceptions.push(portfolioException)
  }

  // Validator count change
  if (
    state.previousSnapshot.validatorCount !== undefined &&
    state.currentSnapshot.validatorCount !== undefined
  ) {
    const countException = detectValidatorCountChange(
      state.previousSnapshot.validatorCount,
      state.currentSnapshot.validatorCount,
      mergedConfig
    )
    if (countException) {
      exceptions.push(countException)
    }
  }

  // In-transit stuck
  const stuckExceptions = detectInTransitStuck(
    state.validators,
    state.currentSnapshot.timestamp,
    mergedConfig
  )
  exceptions.push(...stuckExceptions)

  // Rewards anomaly
  const rewardsException = detectRewardsAnomaly(state.rewardHistory, mergedConfig)
  if (rewardsException) {
    exceptions.push(rewardsException)
  }

  // Performance divergence
  const divergenceExceptions = detectPerformanceDivergence(
    state.custodianPerformance,
    mergedConfig
  )
  exceptions.push(...divergenceExceptions)

  return exceptions
}

// ============================================================================
// Exception Management
// ============================================================================

/**
 * Updates exception status.
 */
export function updateExceptionStatus(
  exception: Exception,
  status: ExceptionStatus,
  resolution?: string,
  resolvedBy?: string
): Exception {
  return {
    ...exception,
    status,
    resolution: resolution ?? exception.resolution,
    resolvedBy: resolvedBy ?? exception.resolvedBy,
    resolvedAt: status === 'resolved' ? new Date() : exception.resolvedAt,
    updatedAt: new Date(),
  }
}

/**
 * Filters exceptions by status.
 */
export function filterExceptionsByStatus(
  exceptions: Exception[],
  status: ExceptionStatus
): Exception[] {
  return exceptions.filter((e) => e.status === status)
}

/**
 * Gets open exceptions (new or investigating).
 */
export function getOpenExceptions(exceptions: Exception[]): Exception[] {
  return exceptions.filter((e) => e.status === 'new' || e.status === 'investigating')
}
