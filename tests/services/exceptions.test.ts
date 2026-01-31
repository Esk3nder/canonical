import { describe, it, expect } from 'vitest'
import {
  detectPortfolioValueChange,
  detectValidatorCountChange,
  detectInTransitStuck,
  detectRewardsAnomaly,
  detectPerformanceDivergence,
  createException,
  runExceptionDetection,
  type ExceptionConfig,
  type PortfolioSnapshot,
  type ValidatorWithTransit,
  type CustodianPerformance,
} from '@/services/exceptions'

describe('Exception Detection Service', () => {
  describe('detectPortfolioValueChange', () => {
    it('flags material portfolio value change > threshold', () => {
      const previous: PortfolioSnapshot = {
        totalValue: 100000000000n,
        timestamp: new Date('2026-01-22'),
      }

      const current: PortfolioSnapshot = {
        totalValue: 90000000000n, // 10% drop
        timestamp: new Date('2026-01-23'),
      }

      const config: ExceptionConfig = {
        portfolioValueChangeThreshold: 0.05, // 5%
      }

      const exception = detectPortfolioValueChange(previous, current, config)

      expect(exception).not.toBeNull()
      expect(exception?.type).toBe('portfolio_value_change')
      expect(exception?.severity).toBe('high')
    })

    it('does not flag changes within threshold', () => {
      const previous: PortfolioSnapshot = {
        totalValue: 100000000000n,
        timestamp: new Date('2026-01-22'),
      }

      const current: PortfolioSnapshot = {
        totalValue: 98000000000n, // 2% drop
        timestamp: new Date('2026-01-23'),
      }

      const config: ExceptionConfig = {
        portfolioValueChangeThreshold: 0.05,
      }

      const exception = detectPortfolioValueChange(previous, current, config)

      expect(exception).toBeNull()
    })
  })

  describe('detectValidatorCountChange', () => {
    it('flags unexpected validator count change', () => {
      const previousCount = 100
      const currentCount = 85 // 15% drop

      const config: ExceptionConfig = {
        validatorCountChangeThreshold: 0.1, // 10%
      }

      const exception = detectValidatorCountChange(previousCount, currentCount, config)

      expect(exception).not.toBeNull()
      expect(exception?.type).toBe('validator_count_change')
    })

    it('does not flag small changes', () => {
      const previousCount = 100
      const currentCount = 98 // 2% change

      const config: ExceptionConfig = {
        validatorCountChangeThreshold: 0.1,
      }

      const exception = detectValidatorCountChange(previousCount, currentCount, config)

      expect(exception).toBeNull()
    })
  })

  describe('detectInTransitStuck', () => {
    it('flags pre-activation stuck > N days', () => {
      const now = new Date('2026-01-23')
      const validators: ValidatorWithTransit[] = [
        {
          id: 'v1',
          stakeState: 'deposited',
          transitStartDate: new Date('2026-01-10'), // 13 days ago
        },
        {
          id: 'v2',
          stakeState: 'pending_activation',
          transitStartDate: new Date('2026-01-01'), // 22 days ago
        },
      ]

      const config: ExceptionConfig = {
        inTransitStuckDays: 7,
      }

      const exceptions = detectInTransitStuck(validators, now, config)

      expect(exceptions).toHaveLength(2)
      expect(exceptions[0].type).toBe('in_transit_stuck')
    })

    it('does not flag recent pre-activation', () => {
      const now = new Date('2026-01-23')
      const validators: ValidatorWithTransit[] = [
        {
          id: 'v1',
          stakeState: 'deposited',
          transitStartDate: new Date('2026-01-20'), // 3 days ago
        },
      ]

      const config: ExceptionConfig = {
        inTransitStuckDays: 7,
      }

      const exceptions = detectInTransitStuck(validators, now, config)

      expect(exceptions).toHaveLength(0)
    })
  })

  describe('detectRewardsAnomaly', () => {
    it('flags reward anomaly - unexpected drop', () => {
      const rewardHistory = [
        { date: new Date('2026-01-15'), amount: 100000000n },
        { date: new Date('2026-01-16'), amount: 98000000n },
        { date: new Date('2026-01-17'), amount: 102000000n },
        { date: new Date('2026-01-18'), amount: 99000000n },
        { date: new Date('2026-01-19'), amount: 101000000n },
        { date: new Date('2026-01-20'), amount: 50000000n }, // 50% drop
      ]

      const config: ExceptionConfig = {
        rewardsAnomalyThreshold: 0.3, // 30% deviation
      }

      const exception = detectRewardsAnomaly(rewardHistory, config)

      expect(exception).not.toBeNull()
      expect(exception?.type).toBe('rewards_anomaly')
    })

    it('flags reward anomaly - unexpected spike', () => {
      const rewardHistory = [
        { date: new Date('2026-01-15'), amount: 100000000n },
        { date: new Date('2026-01-16'), amount: 98000000n },
        { date: new Date('2026-01-17'), amount: 102000000n },
        { date: new Date('2026-01-18'), amount: 99000000n },
        { date: new Date('2026-01-19'), amount: 200000000n }, // 100% spike
      ]

      const config: ExceptionConfig = {
        rewardsAnomalyThreshold: 0.3,
      }

      const exception = detectRewardsAnomaly(rewardHistory, config)

      expect(exception).not.toBeNull()
    })

    it('does not flag normal variance', () => {
      const rewardHistory = [
        { date: new Date('2026-01-15'), amount: 100000000n },
        { date: new Date('2026-01-16'), amount: 98000000n },
        { date: new Date('2026-01-17'), amount: 102000000n },
        { date: new Date('2026-01-18'), amount: 99000000n },
        { date: new Date('2026-01-19'), amount: 105000000n }, // 5% above average
      ]

      const config: ExceptionConfig = {
        rewardsAnomalyThreshold: 0.3,
      }

      const exception = detectRewardsAnomaly(rewardHistory, config)

      expect(exception).toBeNull()
    })
  })

  describe('detectPerformanceDivergence', () => {
    it('flags custodian performance divergence', () => {
      const custodianPerformance: CustodianPerformance[] = [
        { custodianId: 'c1', custodianName: 'A', trailingApy30d: 0.045 },
        { custodianId: 'c2', custodianName: 'B', trailingApy30d: 0.044 },
        { custodianId: 'c3', custodianName: 'C', trailingApy30d: 0.030 }, // Significantly lower
      ]

      const config: ExceptionConfig = {
        performanceDivergenceThreshold: 0.2, // 20% below average
      }

      const exceptions = detectPerformanceDivergence(custodianPerformance, config)

      expect(exceptions).toHaveLength(1)
      expect(exceptions[0].type).toBe('performance_divergence')
      expect(exceptions[0].title).toContain('C')
    })

    it('does not flag similar performance', () => {
      const custodianPerformance: CustodianPerformance[] = [
        { custodianId: 'c1', custodianName: 'A', trailingApy30d: 0.045 },
        { custodianId: 'c2', custodianName: 'B', trailingApy30d: 0.044 },
        { custodianId: 'c3', custodianName: 'C', trailingApy30d: 0.043 },
      ]

      const config: ExceptionConfig = {
        performanceDivergenceThreshold: 0.2,
      }

      const exceptions = detectPerformanceDivergence(custodianPerformance, config)

      expect(exceptions).toHaveLength(0)
    })
  })

  describe('createException', () => {
    it('creates exception with evidence links', () => {
      const exception = createException({
        type: 'portfolio_value_change',
        title: 'Portfolio value dropped 10%',
        description: 'Unexpected decrease in total portfolio value',
        severity: 'high',
        evidenceLinks: [
          { type: 'validator', id: 'v1', label: 'Validator exited' },
          { type: 'event', id: 'e1', label: 'Exit event' },
        ],
      })

      expect(exception.id).toBeDefined()
      expect(exception.status).toBe('new')
      expect(exception.evidenceLinks).toHaveLength(2)
      expect(exception.detectedAt).toBeInstanceOf(Date)
    })
  })

  describe('runExceptionDetection', () => {
    it('runs all detectors and collects exceptions', () => {
      const state = {
        previousSnapshot: {
          totalValue: 100000000000n,
          validatorCount: 100,
          timestamp: new Date('2026-01-22'),
        },
        currentSnapshot: {
          totalValue: 85000000000n, // 15% drop
          validatorCount: 85, // 15% fewer validators
          timestamp: new Date('2026-01-23'),
        },
        validators: [] as ValidatorWithTransit[],
        rewardHistory: [] as Array<{ date: Date; amount: bigint }>,
        custodianPerformance: [] as CustodianPerformance[],
      }

      const config: ExceptionConfig = {
        portfolioValueChangeThreshold: 0.05,
        validatorCountChangeThreshold: 0.1,
        inTransitStuckDays: 7,
        rewardsAnomalyThreshold: 0.3,
        performanceDivergenceThreshold: 0.2,
      }

      const exceptions = runExceptionDetection(state, config)

      // Should detect both portfolio value change and validator count change
      expect(exceptions.length).toBeGreaterThanOrEqual(2)
      expect(exceptions.some(e => e.type === 'portfolio_value_change')).toBe(true)
      expect(exceptions.some(e => e.type === 'validator_count_change')).toBe(true)
    })
  })
})
