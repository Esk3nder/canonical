'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTimePeriod } from '@/contexts/TimePeriodContext'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { TimePeriodToggle } from '@/components/TimePeriodToggle'
import {
  KPIBands,
  StakeLifecycle,
  CustodianTable,
  ExceptionSummary,
  CustodianAprChart,
} from '@/components/dashboard'
import type { RewardsPulseData } from '@/components/dashboard'

// API response types
interface PortfolioData {
  totalValue: string
  change24h: string
  trailingApy30d: number
  previousMonthApy?: number
  networkBenchmarkApy?: number
  validatorCount: number
  stateBuckets: {
    deposited: string
    entryQueue: string
    active: string
    exiting: string
    withdrawable: string
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
  const { timePeriod, timePeriodLabel } = useTimePeriod()

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

  // Rewards Pulse state
  const [rewardsPulseData, setRewardsPulseData] = useState<RewardsPulseData | null>(null)
  const [rewardsPulseLoading, setRewardsPulseLoading] = useState(true)
  const [rewardsPulseError, setRewardsPulseError] = useState<string | undefined>()

  // Fetch portfolio data
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setPortfolioLoading(true)
        const daysParam = timePeriod === 'all' ? 'all' : String(timePeriod)
        const res = await fetch(`/api/portfolio?days=${daysParam}`)
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
  }, [timePeriod])

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

  // Fetch rewards pulse
  useEffect(() => {
    async function fetchRewardsPulse() {
      try {
        setRewardsPulseLoading(true)
        const daysParam = timePeriod === 'all' ? 'all' : String(timePeriod)
        const res = await fetch(`/api/rewards/pulse?days=${daysParam}`)
        if (!res.ok) throw new Error('Failed to fetch rewards pulse')
        const json = await res.json()
        setRewardsPulseData(json.data)
        setRewardsPulseError(undefined)
      } catch (err) {
        setRewardsPulseError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setRewardsPulseLoading(false)
      }
    }

    fetchRewardsPulse()
  }, [timePeriod])

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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Portfolio Overview</h1>
      </div>

      {/* Dashboard Controls + Exceptions - Single Row */}
      <div className="mb-4 flex items-center gap-2">
        <CurrencyToggle />
        <TimePeriodToggle />
        <div className="ml-auto flex-1">
          <ExceptionSummary
            data={exceptionsData}
            isLoading={exceptionsLoading}
            onViewAll={() => router.push('/exceptions')}
            onExceptionClick={handleExceptionClick}
          />
        </div>
      </div>

      {/* KPI Bands */}
      <div className="mb-4">
        <KPIBands
          data={
            portfolioData
              ? {
                  totalValue: portfolioData.totalValue,
                  change24h: portfolioData.change24h,
                  trailingApy30d: portfolioData.trailingApy30d,
                  previousMonthApy: portfolioData.previousMonthApy,
                  networkBenchmarkApy: portfolioData.networkBenchmarkApy,
                  validatorCount: portfolioData.validatorCount,
                  stateBuckets: portfolioData.stateBuckets,
                  custodianBreakdown: portfolioData.custodianBreakdown,
                  asOfTimestamp: portfolioData.asOfTimestamp,
                }
              : null
          }
          isLoading={portfolioLoading}
          error={portfolioError}
          rewardsPulse={{
            data: rewardsPulseData,
            isLoading: rewardsPulseLoading,
            error: rewardsPulseError,
          }}
          timePeriodLabel={timePeriodLabel}
        />
      </div>

      {/* Custodian APR Trend */}
      <div className="mb-4">
        <CustodianAprChart />
      </div>

      {/* Stake Lifecycle & Custodians - Side by Side */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StakeLifecycle
          data={portfolioData?.stateBuckets ?? null}
          totalValue={portfolioData?.totalValue ?? '0'}
          isLoading={portfolioLoading}
          onStateClick={handleBucketClick}
        />
        <CustodianTable
          data={portfolioData?.custodianBreakdown ?? null}
          isLoading={portfolioLoading}
          onCustodianClick={handleCustodianClick}
          timePeriodLabel={timePeriodLabel}
        />
      </div>

      {/* Footer with timestamp */}
      {portfolioData && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Data as of {new Date(portfolioData.asOfTimestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}
