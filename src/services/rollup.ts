/**
 * Rollup Service
 *
 * Provides deterministic aggregation of validator data into portfolio-level summaries.
 * Core computation engine for the staking sub-ledger.
 */

import type {
  StakeState,
  StateBuckets,
  CustodianAllocation,
  PortfolioSummary,
} from '@/domain/types'

// ============================================================================
// Types
// ============================================================================

export interface ValidatorWithContext {
  id: string
  pubkey: string
  operatorId: string
  operatorName: string
  custodianId: string
  custodianName: string
  status: string
  stakeState: StakeState
  balance: bigint
  effectiveBalance: bigint
}

export interface RewardEvent {
  validatorId: string
  amount: bigint
  timestamp: Date
}

// ============================================================================
// State Bucket Aggregation
// ============================================================================

/**
 * Aggregates validator balances by stake state into buckets.
 * Maps stake states to the five lifecycle stages shown on the dashboard.
 */
export function aggregateByStateBucket(
  validators: ValidatorWithContext[]
): StateBuckets {
  const buckets: StateBuckets = {
    deposited: 0n,
    entryQueue: 0n,
    active: 0n,
    exiting: 0n,
    withdrawable: 0n,
  }

  for (const validator of validators) {
    const balance = validator.balance

    switch (validator.stakeState) {
      case 'deposited':
        buckets.deposited += balance
        break
      case 'pending_activation':
        buckets.entryQueue += balance
        break
      case 'active':
        buckets.active += balance
        break
      case 'exiting':
        buckets.exiting += balance
        break
      case 'withdrawable':
        buckets.withdrawable += balance
        break
    }
  }

  return buckets
}

// ============================================================================
// APY Calculation
// ============================================================================

/**
 * Calculates trailing APY from reward events over a time window.
 * Returns annualized yield as a decimal (0.05 = 5%).
 */
export function calculateTrailingApy(
  rewardEvents: RewardEvent[],
  principalBalance: bigint,
  windowStart: Date,
  windowEnd: Date
): number {
  if (principalBalance === 0n) {
    return 0
  }

  // Filter rewards within the time window
  const windowRewards = rewardEvents.filter(
    (event) => event.timestamp >= windowStart && event.timestamp <= windowEnd
  )

  if (windowRewards.length === 0) {
    return 0
  }

  // Sum rewards in the window
  const totalRewards = windowRewards.reduce(
    (sum, event) => sum + event.amount,
    0n
  )

  // Calculate window duration in days
  const windowDays =
    (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)

  if (windowDays <= 0) {
    return 0
  }

  // Calculate yield and annualize
  // yield = rewards / principal
  // apy = yield * (365 / windowDays)
  const yieldRatio = Number(totalRewards) / Number(principalBalance)
  const apy = yieldRatio * (365 / windowDays)

  return apy
}

// ============================================================================
// Custodian Rollup
// ============================================================================

/**
 * Rolls up validators to custodian level with allocation percentages.
 */
export function rollupValidatorsToCustodian(
  validators: ValidatorWithContext[],
  rewardEvents: RewardEvent[] = [],
  windowDays?: number | null
): CustodianAllocation[] {
  // Group validators by custodian
  const custodianMap = new Map<
    string,
    {
      custodianName: string
      validators: ValidatorWithContext[]
      totalValue: bigint
    }
  >()

  for (const validator of validators) {
    const existing = custodianMap.get(validator.custodianId)
    if (existing) {
      existing.validators.push(validator)
      existing.totalValue += validator.balance
    } else {
      custodianMap.set(validator.custodianId, {
        custodianName: validator.custodianName,
        validators: [validator],
        totalValue: validator.balance,
      })
    }
  }

  // Calculate total portfolio value for percentages
  const portfolioTotal = validators.reduce((sum, v) => sum + v.balance, 0n)

  // Build allocations
  const allocations: CustodianAllocation[] = []

  for (const [custodianId, data] of custodianMap) {
    // Calculate custodian-specific APY
    const custodianValidatorIds = new Set(data.validators.map((v) => v.id))
    const custodianRewards = rewardEvents.filter((e) =>
      custodianValidatorIds.has(e.validatorId)
    )

    const now = new Date()
    let windowStart: Date
    if (windowDays === null) {
      const earliest = custodianRewards.reduce(
        (min, e) => (e.timestamp < min ? e.timestamp : min),
        now
      )
      windowStart = custodianRewards.length > 0 ? earliest : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    } else {
      const effectiveDays = windowDays ?? 30
      windowStart = new Date(now.getTime() - effectiveDays * 24 * 60 * 60 * 1000)
    }
    const trailingApy30d = calculateTrailingApy(
      custodianRewards,
      data.totalValue,
      windowStart,
      now
    )

    allocations.push({
      custodianId,
      custodianName: data.custodianName,
      value: data.totalValue,
      percentage:
        portfolioTotal > 0n
          ? Number(data.totalValue) / Number(portfolioTotal)
          : 0,
      trailingApy30d,
      validatorCount: data.validators.length,
    })
  }

  // Sort by value descending
  allocations.sort((a, b) => (b.value > a.value ? 1 : -1))

  return allocations
}

// ============================================================================
// Portfolio Rollup
// ============================================================================

/**
 * Rolls up custodian allocations to portfolio level.
 */
export function rollupCustodiansToPortfolio(
  custodianAllocations: CustodianAllocation[]
): {
  totalValue: bigint
  trailingApy30d: number
  validatorCount: number
} {
  const totalValue = custodianAllocations.reduce((sum, c) => sum + c.value, 0n)
  const validatorCount = custodianAllocations.reduce(
    (sum, c) => sum + c.validatorCount,
    0
  )

  // Weighted average APY
  let weightedApy = 0
  if (totalValue > 0n) {
    for (const allocation of custodianAllocations) {
      const weight = Number(allocation.value) / Number(totalValue)
      weightedApy += allocation.trailingApy30d * weight
    }
  }

  return {
    totalValue,
    trailingApy30d: weightedApy,
    validatorCount,
  }
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Network benchmark APY from Rated (hardcoded).
 * This represents the average network staking yield.
 */
export const NETWORK_BENCHMARK_APY = 0.038 // 3.8%

// ============================================================================
// Portfolio Summary
// ============================================================================

/**
 * Creates a complete portfolio summary from validators and reward events.
 * This is the main entry point for dashboard data.
 */
export function createPortfolioSummary(
  validators: ValidatorWithContext[],
  rewardEvents: RewardEvent[],
  windowDays?: number | null
): PortfolioSummary {
  // Calculate state buckets (lifecycle stages only, no rewards)
  const stateBuckets = aggregateByStateBucket(validators)

  const now = new Date()
  const effectiveDays = windowDays === null ? null : (windowDays ?? 30)

  // Roll up to custodian level (pass windowDays through)
  const custodianBreakdown = rollupValidatorsToCustodian(validators, rewardEvents, windowDays)

  // Roll up to portfolio level
  const portfolioRollup = rollupCustodiansToPortfolio(custodianBreakdown)

  // Calculate previous period APY (preceding window of equal length)
  const totalValue = portfolioRollup.totalValue
  let previousMonthApy: number | undefined
  if (effectiveDays !== null) {
    const windowStart = new Date(now.getTime() - effectiveDays * 24 * 60 * 60 * 1000)
    const previousWindowEnd = windowStart
    const previousWindowStart = new Date(windowStart.getTime() - effectiveDays * 24 * 60 * 60 * 1000)
    previousMonthApy = calculateTrailingApy(
      rewardEvents,
      totalValue,
      previousWindowStart,
      previousWindowEnd
    )
  }

  return {
    totalValue: portfolioRollup.totalValue,
    trailingApy30d: portfolioRollup.trailingApy30d,
    previousMonthApy,
    networkBenchmarkApy: NETWORK_BENCHMARK_APY,
    validatorCount: portfolioRollup.validatorCount,
    stateBuckets,
    custodianBreakdown,
    asOfTimestamp: now,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Formats a bigint balance (in gwei) to ETH string.
 */
export function formatGweiToEth(gwei: bigint): string {
  const eth = Number(gwei) / 1e9
  return eth.toFixed(4)
}

/**
 * Formats APY as percentage string.
 */
export function formatApyPercent(apy: number): string {
  return (apy * 100).toFixed(2) + '%'
}
