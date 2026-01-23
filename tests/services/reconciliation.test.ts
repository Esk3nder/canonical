import { describe, it, expect } from 'vitest'
import {
  detectVariance,
  categorizeVariance,
  createReconciliationReport,
  type InternalTotal,
  type ExternalStatement,
} from '@/services/reconciliation'

describe('Reconciliation Service', () => {
  describe('detectVariance', () => {
    it('detects variance between internal and external totals', () => {
      const internal: InternalTotal = {
        totalValue: 100000000000n, // 100 ETH
        validatorCount: 3,
        asOfDate: new Date('2026-01-23'),
      }

      const external: ExternalStatement = {
        source: 'Coinbase',
        totalValue: 99500000000n, // 99.5 ETH
        reportDate: new Date('2026-01-23'),
      }

      const variance = detectVariance(internal, external)

      expect(variance.amount).toBe(500000000n) // 0.5 ETH difference
      expect(variance.percentage).toBeCloseTo(0.005, 4) // 0.5%
      expect(variance.direction).toBe('internal_higher')
    })

    it('detects when external is higher', () => {
      const internal: InternalTotal = {
        totalValue: 99000000000n,
        validatorCount: 3,
        asOfDate: new Date(),
      }

      const external: ExternalStatement = {
        source: 'Custodian',
        totalValue: 100000000000n,
        reportDate: new Date(),
      }

      const variance = detectVariance(internal, external)

      expect(variance.direction).toBe('external_higher')
      expect(variance.amount).toBe(1000000000n)
    })

    it('returns zero variance when totals match', () => {
      const internal: InternalTotal = {
        totalValue: 100000000000n,
        validatorCount: 3,
        asOfDate: new Date(),
      }

      const external: ExternalStatement = {
        source: 'Custodian',
        totalValue: 100000000000n,
        reportDate: new Date(),
      }

      const variance = detectVariance(internal, external)

      expect(variance.amount).toBe(0n)
      expect(variance.percentage).toBe(0)
      expect(variance.direction).toBe('match')
    })
  })

  describe('categorizeVariance', () => {
    it('categorizes variance by type', () => {
      const varianceAmount = 500000000n // 0.5 ETH

      const categories = categorizeVariance(varianceAmount, {
        timingDifference: 200000000n,
        rewardAccrual: 150000000n,
        feesDifference: 100000000n,
        unexplained: 50000000n,
      })

      expect(categories).toHaveLength(4)
      expect(categories.find(c => c.category === 'timing_difference')?.amount).toBe(200000000n)
      expect(categories.find(c => c.category === 'reward_accrual')?.amount).toBe(150000000n)
      expect(categories.find(c => c.category === 'fees_difference')?.amount).toBe(100000000n)
      expect(categories.find(c => c.category === 'unexplained')?.amount).toBe(50000000n)
    })

    it('links variance to specific validators', () => {
      const categories = categorizeVariance(100000000n, {
        timingDifference: 100000000n,
      }, {
        timingDifference: [
          { validatorId: 'v1', label: 'Validator 1 pending deposit' },
          { validatorId: 'v2', label: 'Validator 2 pending deposit' },
        ],
      })

      const timingCategory = categories.find(c => c.category === 'timing_difference')
      expect(timingCategory?.evidenceLinks).toHaveLength(2)
      expect(timingCategory?.evidenceLinks[0].id).toBe('v1')
    })
  })

  describe('createReconciliationReport', () => {
    it('generates variance report', () => {
      const internal: InternalTotal = {
        totalValue: 100000000000n,
        validatorCount: 3,
        asOfDate: new Date('2026-01-23'),
      }

      const external: ExternalStatement = {
        source: 'Coinbase Custody',
        totalValue: 99800000000n,
        reportDate: new Date('2026-01-23'),
      }

      const report = createReconciliationReport(internal, external)

      expect(report.internalTotal).toBe(100000000000n)
      expect(report.externalTotal).toBe(99800000000n)
      expect(report.variance).toBe(200000000n)
      expect(report.variancePercentage).toBeCloseTo(0.002, 4)
      expect(report.status).toBe('variance_detected')
    })

    it('marks as reconciled when variance is within threshold', () => {
      const internal: InternalTotal = {
        totalValue: 100000000000n,
        validatorCount: 3,
        asOfDate: new Date(),
      }

      const external: ExternalStatement = {
        source: 'Custodian',
        totalValue: 100000000000n, // Exact match
        reportDate: new Date(),
      }

      const report = createReconciliationReport(internal, external)

      expect(report.status).toBe('reconciled')
    })

    it('includes evidence links in report', () => {
      const internal: InternalTotal = {
        totalValue: 100000000000n,
        validatorCount: 3,
        asOfDate: new Date(),
        validatorBreakdown: [
          { validatorId: 'v1', balance: 32000000000n },
          { validatorId: 'v2', balance: 32000000000n },
          { validatorId: 'v3', balance: 36000000000n },
        ],
      }

      const external: ExternalStatement = {
        source: 'Custodian',
        totalValue: 99000000000n,
        reportDate: new Date(),
      }

      const report = createReconciliationReport(internal, external)

      // Should include validator references in variance categories
      expect(report.varianceCategories).toBeDefined()
    })
  })
})
