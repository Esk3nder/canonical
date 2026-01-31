import { describe, it, expect, beforeEach } from 'vitest'
import {
  aggregateByStateBucket,
  calculateTrailingApy,
  rollupValidatorsToCustodian,
  rollupCustodiansToPortfolio,
  createPortfolioSummary,
} from '@/services/rollup'
import type { StakeState } from '@/domain/types'

// Test data factories
function createTestValidator(overrides: Partial<{
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
}> = {}) {
  return {
    id: overrides.id ?? 'validator-1',
    pubkey: overrides.pubkey ?? '0x1234',
    operatorId: overrides.operatorId ?? 'operator-1',
    operatorName: overrides.operatorName ?? 'Test Operator',
    custodianId: overrides.custodianId ?? 'custodian-1',
    custodianName: overrides.custodianName ?? 'Test Custodian',
    status: overrides.status ?? 'active',
    stakeState: overrides.stakeState ?? 'active',
    balance: overrides.balance ?? 32000000000n, // 32 ETH in gwei
    effectiveBalance: overrides.effectiveBalance ?? 32000000000n,
  }
}

function createTestRewardEvent(overrides: Partial<{
  validatorId: string
  amount: bigint
  timestamp: Date
}> = {}) {
  return {
    validatorId: overrides.validatorId ?? 'validator-1',
    amount: overrides.amount ?? 10000000n, // ~0.01 ETH
    timestamp: overrides.timestamp ?? new Date(),
  }
}

describe('Rollup Service', () => {
  describe('aggregateByStateBucket', () => {
    it('aggregates stake by state bucket', () => {
      const validators = [
        createTestValidator({ id: 'v1', stakeState: 'active', balance: 32000000000n }),
        createTestValidator({ id: 'v2', stakeState: 'active', balance: 32000000000n }),
        createTestValidator({ id: 'v3', stakeState: 'pending_activation', balance: 32000000000n }),
        createTestValidator({ id: 'v4', stakeState: 'exiting', balance: 32000000000n }),
        createTestValidator({ id: 'v5', stakeState: 'withdrawable', balance: 32000000000n }),
      ]

      const buckets = aggregateByStateBucket(validators)

      expect(buckets.active).toBe(64000000000n) // 2 validators * 32 ETH
      expect(buckets.entryQueue).toBe(32000000000n)
      expect(buckets.exiting).toBe(32000000000n)
      expect(buckets.withdrawable).toBe(32000000000n)
      expect(buckets.deposited).toBe(0n)
    })

    it('handles empty validator list', () => {
      const buckets = aggregateByStateBucket([])

      expect(buckets.active).toBe(0n)
      expect(buckets.entryQueue).toBe(0n)
      expect(buckets.exiting).toBe(0n)
      expect(buckets.deposited).toBe(0n)
      expect(buckets.withdrawable).toBe(0n)
    })

    it('includes pending_activation in entryQueue bucket', () => {
      const validators = [
        createTestValidator({ stakeState: 'pending_activation', balance: 32000000000n }),
      ]

      const buckets = aggregateByStateBucket(validators)

      expect(buckets.entryQueue).toBe(32000000000n)
    })

    it('includes deposited in deposited bucket', () => {
      const validators = [
        createTestValidator({ stakeState: 'deposited', balance: 32000000000n }),
      ]

      const buckets = aggregateByStateBucket(validators)

      expect(buckets.deposited).toBe(32000000000n)
    })
  })

  describe('calculateTrailingApy', () => {
    it('calculates trailing APY from reward events', () => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // 32 ETH stake, earned 0.1 ETH over 30 days
      const rewardEvents = [
        createTestRewardEvent({ amount: 50000000n, timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) }),
        createTestRewardEvent({ amount: 50000000n, timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) }),
      ]

      const principalBalance = 32000000000n // 32 ETH

      const apy = calculateTrailingApy(rewardEvents, principalBalance, thirtyDaysAgo, now)

      // 0.1 ETH / 32 ETH over 30 days, annualized
      // (0.1 / 32) * (365 / 30) ≈ 3.8%
      expect(apy).toBeGreaterThan(0.03)
      expect(apy).toBeLessThan(0.05)
    })

    it('returns 0 for no rewards', () => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const apy = calculateTrailingApy([], 32000000000n, thirtyDaysAgo, now)

      expect(apy).toBe(0)
    })

    it('returns 0 for zero balance', () => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const apy = calculateTrailingApy([createTestRewardEvent()], 0n, thirtyDaysAgo, now)

      expect(apy).toBe(0)
    })

    it('only includes rewards within the time window', () => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const rewardEvents = [
        createTestRewardEvent({ amount: 100000000n, timestamp: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) }), // 60 days ago - excluded
        createTestRewardEvent({ amount: 50000000n, timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) }), // included
      ]

      const apy = calculateTrailingApy(rewardEvents, 32000000000n, thirtyDaysAgo, now)

      // Should only count the 50000000n reward
      expect(apy).toBeGreaterThan(0)
      expect(apy).toBeLessThan(0.03) // Less than if both were counted
    })
  })

  describe('rollupValidatorsToCustodian', () => {
    it('rolls up validators to custodian level', () => {
      const validators = [
        createTestValidator({ id: 'v1', custodianId: 'c1', custodianName: 'Coinbase', balance: 32000000000n }),
        createTestValidator({ id: 'v2', custodianId: 'c1', custodianName: 'Coinbase', balance: 32000000000n }),
        createTestValidator({ id: 'v3', custodianId: 'c2', custodianName: 'Anchorage', balance: 32000000000n }),
      ]

      const custodianRollups = rollupValidatorsToCustodian(validators)

      expect(custodianRollups).toHaveLength(2)

      const coinbase = custodianRollups.find(c => c.custodianId === 'c1')
      expect(coinbase).toBeDefined()
      expect(coinbase!.value).toBe(64000000000n)
      expect(coinbase!.validatorCount).toBe(2)

      const anchorage = custodianRollups.find(c => c.custodianId === 'c2')
      expect(anchorage).toBeDefined()
      expect(anchorage!.value).toBe(32000000000n)
      expect(anchorage!.validatorCount).toBe(1)
    })

    it('calculates percentage allocation', () => {
      const validators = [
        createTestValidator({ id: 'v1', custodianId: 'c1', custodianName: 'Coinbase', balance: 75000000000n }),
        createTestValidator({ id: 'v2', custodianId: 'c2', custodianName: 'Anchorage', balance: 25000000000n }),
      ]

      const custodianRollups = rollupValidatorsToCustodian(validators)

      const coinbase = custodianRollups.find(c => c.custodianId === 'c1')
      expect(coinbase!.percentage).toBeCloseTo(0.75, 2)

      const anchorage = custodianRollups.find(c => c.custodianId === 'c2')
      expect(anchorage!.percentage).toBeCloseTo(0.25, 2)
    })
  })

  describe('rollupCustodiansToPortfolio', () => {
    it('rolls up custodians to portfolio level', () => {
      const custodianAllocations = [
        { custodianId: 'c1', custodianName: 'Coinbase', value: 64000000000n, percentage: 0.67, trailingApy30d: 0.04, validatorCount: 2 },
        { custodianId: 'c2', custodianName: 'Anchorage', value: 32000000000n, percentage: 0.33, trailingApy30d: 0.045, validatorCount: 1 },
      ]

      const portfolio = rollupCustodiansToPortfolio(custodianAllocations)

      expect(portfolio.totalValue).toBe(96000000000n)
      expect(portfolio.validatorCount).toBe(3)
    })

    it('calculates weighted average APY', () => {
      const custodianAllocations = [
        { custodianId: 'c1', custodianName: 'A', value: 50000000000n, percentage: 0.5, trailingApy30d: 0.04, validatorCount: 1 },
        { custodianId: 'c2', custodianName: 'B', value: 50000000000n, percentage: 0.5, trailingApy30d: 0.06, validatorCount: 1 },
      ]

      const portfolio = rollupCustodiansToPortfolio(custodianAllocations)

      // Weighted average: (0.04 * 0.5) + (0.06 * 0.5) = 0.05
      expect(portfolio.trailingApy30d).toBeCloseTo(0.05, 4)
    })
  })

  describe('createPortfolioSummary', () => {
    it('produces deterministic output for same inputs', () => {
      const validators = [
        createTestValidator({ id: 'v1', custodianId: 'c1', custodianName: 'Coinbase', stakeState: 'active', balance: 32000000000n }),
        createTestValidator({ id: 'v2', custodianId: 'c1', custodianName: 'Coinbase', stakeState: 'pending_activation', balance: 32000000000n }),
      ]

      const rewardEvents = [
        createTestRewardEvent({ validatorId: 'v1', amount: 10000000n }),
      ]

      const summary1 = createPortfolioSummary(validators, rewardEvents)
      const summary2 = createPortfolioSummary(validators, rewardEvents)

      // Same inputs should produce same outputs
      expect(summary1.totalValue).toBe(summary2.totalValue)
      expect(summary1.validatorCount).toBe(summary2.validatorCount)
      expect(summary1.stateBuckets.active).toBe(summary2.stateBuckets.active)
      expect(summary1.stateBuckets.entryQueue).toBe(summary2.stateBuckets.entryQueue)
    })

    it('includes all required fields', () => {
      const validators = [
        createTestValidator({ stakeState: 'active', balance: 32000000000n }),
      ]

      const summary = createPortfolioSummary(validators, [])

      expect(summary).toHaveProperty('totalValue')
      expect(summary).toHaveProperty('trailingApy30d')
      expect(summary).toHaveProperty('validatorCount')
      expect(summary).toHaveProperty('stateBuckets')
      expect(summary).toHaveProperty('custodianBreakdown')
      expect(summary).toHaveProperty('asOfTimestamp')

      expect(summary.stateBuckets).toHaveProperty('active')
      expect(summary.stateBuckets).toHaveProperty('deposited')
      expect(summary.stateBuckets).toHaveProperty('entryQueue')
      expect(summary.stateBuckets).toHaveProperty('exiting')
      expect(summary.stateBuckets).toHaveProperty('withdrawable')
    })
  })
})
