'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  KPIBands,
  StateBuckets,
  CustodianDistribution,
  ExceptionSummary,
} from '@/components/dashboard'

// API response types
interface PortfolioData {
  totalValue: string
  trailingApy30d: number
  validatorCount: number
  stateBuckets: {
    active: string
    inTransit: string
    rewards: string
    exiting: string
  }
  custodianBreakdown: Array<{
    custodianId: string
    custodianName: string
    value: string
    percentage: number
    trailingApy30d: number
    validatorCount: number
    change7d?: number
    change30d?: number
  }>
  asOfTimestamp: string
}

interface ExceptionData {
  id: string
  type: string
  status: string
  title: string
  severity: string
  detectedAt: string
}

export default function PortfolioOverview() {
  const router = useRouter()

  // Portfolio data state
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [portfolioError, setPortfolioError] = useState<string | undefined>()

  // Exceptions state
  const [exceptionsData, setExceptionsData] = useState<{
    total: number
    bySeverity: { critical: number; high: number; medium: number; low: number }
    recent: Array<{
      id: string
      type: string
      title: string
      severity: string
      detectedAt: string
      isNew?: boolean
    }>
  } | null>(null)
  const [exceptionsLoading, setExceptionsLoading] = useState(true)

  // Fetch portfolio data
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setPortfolioLoading(true)
        const res = await fetch('/api/portfolio')
        if (!res.ok) throw new Error('Failed to fetch portfolio')
        const json = await res.json()
        setPortfolioData(json.data)
        setPortfolioError(undefined)
      } catch (err) {
        setPortfolioError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setPortfolioLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  // Fetch exceptions
  useEffect(() => {
    async function fetchExceptions() {
      try {
        setExceptionsLoading(true)
        const res = await fetch('/api/exceptions?pageSize=5')
        if (!res.ok) throw new Error('Failed to fetch exceptions')
        const json = await res.json()

        // Transform to summary format
        const exceptions = json.data as ExceptionData[]
        const bySeverity = {
          critical: exceptions.filter((e) => e.severity === 'critical').length,
          high: exceptions.filter((e) => e.severity === 'high').length,
          medium: exceptions.filter((e) => e.severity === 'medium').length,
          low: exceptions.filter((e) => e.severity === 'low').length,
        }

        setExceptionsData({
          total: json.total,
          bySeverity,
          recent: exceptions.slice(0, 3).map((e, idx) => ({
            id: e.id,
            type: e.type,
            title: e.title,
            severity: e.severity,
            detectedAt: e.detectedAt,
            isNew: idx === 0 && e.status === 'new',
          })),
        })
      } catch (error) {
        console.error('Failed to fetch exceptions:', error)
        // Set empty data on error
        setExceptionsData({
          total: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          recent: [],
        })
      } finally {
        setExceptionsLoading(false)
      }
    }

    fetchExceptions()
  }, [])

  // Navigation handlers
  const handleCustodianClick = (custodianId: string) => {
    router.push(`/custodians/${custodianId}`)
  }

  const handleExceptionClick = (exceptionId: string) => {
    router.push(`/exceptions/${exceptionId}`)
  }

  const handleBucketClick = (bucket: string) => {
    router.push(`/validators?state=${bucket}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-gray-500">Institutional staking dashboard</p>
      </div>

      {/* KPI Bands */}
      <div className="mb-6">
        <KPIBands
          data={
            portfolioData
              ? {
                  totalValue: portfolioData.totalValue,
                  trailingApy30d: portfolioData.trailingApy30d,
                  validatorCount: portfolioData.validatorCount,
                }
              : null
          }
          isLoading={portfolioLoading}
          error={portfolioError}
        />
      </div>

      {/* State Buckets */}
      <div className="mb-6">
        <StateBuckets
          data={portfolioData?.stateBuckets ?? null}
          totalValue={portfolioData?.totalValue ?? '0'}
          isLoading={portfolioLoading}
          onBucketClick={handleBucketClick}
        />
      </div>

      {/* Custodian Distribution */}
      <div className="mb-6">
        <CustodianDistribution
          data={portfolioData?.custodianBreakdown ?? null}
          isLoading={portfolioLoading}
          onCustodianClick={handleCustodianClick}
        />
      </div>

      {/* Exceptions Summary */}
      <div className="mb-6">
        <ExceptionSummary
          data={exceptionsData}
          isLoading={exceptionsLoading}
          onViewAll={() => router.push('/exceptions')}
          onExceptionClick={handleExceptionClick}
        />
      </div>

      {/* Footer with timestamp */}
      {portfolioData && (
        <div className="mt-8 text-center text-sm text-gray-400">
          Data as of {new Date(portfolioData.asOfTimestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}
