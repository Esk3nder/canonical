/**
 * CSV Export Service Tests
 */
import { describe, it, expect } from 'vitest'
import {
  generatePortfolioCSV,
  generateValidatorScheduleCSV,
  generateCustodianBreakdownCSV,
} from '@/services/export/csv'
import type { PortfolioSummary, ValidatorPerformance, CustodianAllocation } from '@/domain/types'

describe('CSV Export Service', () => {
  describe('generatePortfolioCSV', () => {
    const mockSummary: PortfolioSummary = {
      totalValue: 5000000000000000000n,
      trailingApy30d: 0.045,
      validatorCount: 156,
      stateBuckets: {
        active: 4500000000000000000n,
        inTransit: 200000000000000000n,
        rewards: 150000000000000000n,
        exiting: 150000000000000000n,
      },
      custodianBreakdown: [],
      asOfTimestamp: new Date('2026-01-23T12:00:00Z'),
    }

    it('generates valid CSV header', () => {
      const csv = generatePortfolioCSV(mockSummary)
      const lines = csv.split('\n')

      expect(lines[0]).toContain('Total Value')
      expect(lines[0]).toContain('Trailing APY')
      expect(lines[0]).toContain('Validator Count')
    })

    it('includes portfolio summary data', () => {
      const csv = generatePortfolioCSV(mockSummary)

      expect(csv).toContain('5000000000000000000')
      expect(csv).toContain('0.045')
      expect(csv).toContain('156')
    })

    it('includes state bucket breakdown', () => {
      const csv = generatePortfolioCSV(mockSummary)

      expect(csv).toContain('Active')
      expect(csv).toContain('In Transit')
      expect(csv).toContain('Rewards')
      expect(csv).toContain('Exiting')
    })

    it('includes methodology version', () => {
      const csv = generatePortfolioCSV(mockSummary, '1.0.0')

      expect(csv).toContain('1.0.0')
    })
  })

  describe('generateValidatorScheduleCSV', () => {
    const mockValidators: ValidatorPerformance[] = [
      {
        validatorId: 'val-1',
        pubkey: '0xabc123...',
        operatorName: 'Operator A',
        custodianName: 'Coinbase',
        status: 'active',
        stakeState: 'active',
        balance: 32000000000n,
        effectiveBalance: 32000000000n,
        trailingApy30d: 0.048,
        rewardsTotal: 500000000n,
        penalties: 0n,
        lastActivityTimestamp: new Date('2026-01-23T10:00:00Z'),
      },
      {
        validatorId: 'val-2',
        pubkey: '0xdef456...',
        operatorName: 'Operator B',
        custodianName: 'Anchorage',
        status: 'active',
        stakeState: 'active',
        balance: 32000000000n,
        effectiveBalance: 32000000000n,
        trailingApy30d: 0.046,
        rewardsTotal: 480000000n,
        penalties: 0n,
        lastActivityTimestamp: new Date('2026-01-23T10:00:00Z'),
      },
    ]

    it('generates valid CSV with headers', () => {
      const csv = generateValidatorScheduleCSV(mockValidators)
      const lines = csv.split('\n')

      expect(lines[0]).toContain('Validator ID')
      expect(lines[0]).toContain('Pubkey')
      expect(lines[0]).toContain('Custodian')
      expect(lines[0]).toContain('Balance')
    })

    it('includes all validators', () => {
      const csv = generateValidatorScheduleCSV(mockValidators)

      expect(csv).toContain('val-1')
      expect(csv).toContain('val-2')
      expect(csv).toContain('Coinbase')
      expect(csv).toContain('Anchorage')
    })

    it('formats numeric values correctly', () => {
      const csv = generateValidatorScheduleCSV(mockValidators)

      expect(csv).toContain('32000000000')
      expect(csv).toContain('0.048')
    })

    it('handles empty validator list', () => {
      const csv = generateValidatorScheduleCSV([])
      const lines = csv.split('\n')

      // Should still have header
      expect(lines[0]).toContain('Validator ID')
      // Should only have header row
      expect(lines.filter(l => l.trim()).length).toBe(1)
    })
  })

  describe('generateCustodianBreakdownCSV', () => {
    const mockCustodians: CustodianAllocation[] = [
      {
        custodianId: 'cust-1',
        custodianName: 'Coinbase Custody',
        value: 3000000000000000000n,
        percentage: 0.6,
        trailingApy30d: 0.048,
        validatorCount: 94,
        change7d: 0.02,
        change30d: 0.05,
      },
      {
        custodianId: 'cust-2',
        custodianName: 'Anchorage',
        value: 2000000000000000000n,
        percentage: 0.4,
        trailingApy30d: 0.042,
        validatorCount: 62,
        change7d: -0.01,
        change30d: 0.03,
      },
    ]

    it('generates valid CSV with headers', () => {
      const csv = generateCustodianBreakdownCSV(mockCustodians)
      const lines = csv.split('\n')

      expect(lines[0]).toContain('Custodian')
      expect(lines[0]).toContain('Value')
      expect(lines[0]).toContain('Percentage')
      expect(lines[0]).toContain('APY')
    })

    it('includes all custodians', () => {
      const csv = generateCustodianBreakdownCSV(mockCustodians)

      expect(csv).toContain('Coinbase Custody')
      expect(csv).toContain('Anchorage')
    })

    it('includes change indicators', () => {
      const csv = generateCustodianBreakdownCSV(mockCustodians)

      expect(csv).toContain('7d Change')
      expect(csv).toContain('30d Change')
    })
  })
})
