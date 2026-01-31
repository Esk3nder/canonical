/**
 * PDF Export Service Tests
 */
import { describe, it, expect } from 'vitest'
import {
  generatePortfolioPDFContent,
  generateMonthlyStatementPDFContent,
} from '@/services/export/pdf'
import type { PortfolioSummary, MonthlyStatement } from '@/domain/types'

describe('PDF Export Service', () => {
  describe('generatePortfolioPDFContent', () => {
    const mockSummary: PortfolioSummary = {
      totalValue: 5000000000000000000n,
      trailingApy30d: 0.045,
      validatorCount: 156,
      stateBuckets: {
        deposited: 100000000000000000n,
        entryQueue: 200000000000000000n,
        active: 4500000000000000000n,
        exiting: 150000000000000000n,
        withdrawable: 150000000000000000n,
      },
      custodianBreakdown: [
        {
          custodianId: 'cust-1',
          custodianName: 'Coinbase',
          value: 3000000000000000000n,
          percentage: 0.6,
          trailingApy30d: 0.048,
          validatorCount: 94,
        },
      ],
      asOfTimestamp: new Date('2026-01-23T12:00:00Z'),
    }

    it('generates valid HTML document', () => {
      const html = generatePortfolioPDFContent(mockSummary)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('includes portfolio value', () => {
      const html = generatePortfolioPDFContent(mockSummary)

      expect(html).toContain('Portfolio Value')
      expect(html).toContain('5,000') // Formatted ETH value
    })

    it('includes APY', () => {
      const html = generatePortfolioPDFContent(mockSummary)

      expect(html).toContain('APY')
      expect(html).toContain('4.50%')
    })

    it('includes validator count', () => {
      const html = generatePortfolioPDFContent(mockSummary)

      expect(html).toContain('Validators')
      expect(html).toContain('156')
    })

    it('includes state buckets section', () => {
      const html = generatePortfolioPDFContent(mockSummary)

      expect(html).toContain('State Buckets')
      expect(html).toContain('Deposited')
      expect(html).toContain('Entry Queue')
      expect(html).toContain('Active')
      expect(html).toContain('Exiting')
      expect(html).toContain('Withdrawable')
    })

    it('includes methodology version when provided', () => {
      const html = generatePortfolioPDFContent(mockSummary, '1.0.0')

      expect(html).toContain('Methodology Version')
      expect(html).toContain('1.0.0')
    })

    it('includes custodian breakdown', () => {
      const html = generatePortfolioPDFContent(mockSummary)

      expect(html).toContain('Custodian Breakdown')
      expect(html).toContain('Coinbase')
    })
  })

  describe('generateMonthlyStatementPDFContent', () => {
    const mockStatement: MonthlyStatement = {
      reportId: 'report-123',
      entityId: 'entity-1',
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-01-31'),
      methodologyVersion: '1.0.0',
      generatedAt: new Date('2026-02-01'),
      summary: {
        totalValue: 5000000000000000000n,
        trailingApy30d: 0.045,
        validatorCount: 156,
        stateBuckets: {
          deposited: 100000000000000000n,
          entryQueue: 200000000000000000n,
          active: 4500000000000000000n,
          exiting: 150000000000000000n,
          withdrawable: 150000000000000000n,
        },
        custodianBreakdown: [],
        asOfTimestamp: new Date('2026-01-31'),
      },
      validatorSchedule: [],
      custodianBreakdown: [],
    }

    it('generates valid HTML document', () => {
      const html = generateMonthlyStatementPDFContent(mockStatement)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
    })

    it('includes report metadata', () => {
      const html = generateMonthlyStatementPDFContent(mockStatement)

      expect(html).toContain('report-123')
      expect(html).toContain('January 2026')
    })

    it('includes methodology version', () => {
      const html = generateMonthlyStatementPDFContent(mockStatement)

      expect(html).toContain('1.0.0')
    })

    it('includes all required sections', () => {
      const html = generateMonthlyStatementPDFContent(mockStatement)

      expect(html).toContain('Portfolio Summary')
      expect(html).toContain('State Buckets')
    })
  })
})
