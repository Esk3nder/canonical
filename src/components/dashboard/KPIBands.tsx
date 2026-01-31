'use client'

/**
 * KPIBands Component
 *
 * Displays key portfolio metrics in a prominent band layout:
 * - Total Portfolio Value (with dual currency display and 24h change) - CLICKABLE to expand
 * - Trailing 30-day APY - CLICKABLE to expand
 * - Rewards Pulse - CLICKABLE to expand
 */

import { useState } from 'react'
import { formatCurrency, formatEthChange, formatEther, formatUSD } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { PortfolioExpandedModal } from './PortfolioExpandedModal'
import { APYExpandedModal } from './APYExpandedModal'
import { RewardsPulseModal } from './RewardsPulseModal'

interface StateBuckets {
  active: string
  inTransit: string
  rewards: string
  exiting: string
}

interface CustodianAllocation {
  custodianId: string
  custodianName: string
  value: string
  percentage: number
  trailingApy30d: number
  validatorCount: number
  change7d?: number
  change30d?: number
}

interface KPIData {
  totalValue: string
  change24h?: string
  trailingApy30d: number
  previousMonthApy?: number
  networkBenchmarkApy?: number
  validatorCount: number
  stateBuckets?: StateBuckets
  custodianBreakdown?: CustodianAllocation[]
  asOfTimestamp?: string
}

interface CustodianReward {
  custodianId: string
  custodianName: string
  amount: string
}

interface RewardsPulseData {
  claimableNow: string
  claimable24hChange: string
  custodianBreakdown: CustodianReward[]
  accrued: string
  claimedThisMonth: string
  asOfTimestamp: string
}

interface KPIBandsProps {
  data: KPIData | null
  isLoading: boolean
  error?: string
  rewardsPulse?: {
    data: RewardsPulseData | null
    isLoading: boolean
    error?: string
  }
}

export function KPIBands({ data, isLoading, error, rewardsPulse }: KPIBandsProps) {
  const { currency, ethPrice } = useCurrency()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApyExpanded, setIsApyExpanded] = useState(false)
  const [isRewardsExpanded, setIsRewardsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div data-testid="kpi-loading" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        data-testid="kpi-error"
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700"
      >
        <p className="font-medium">Error loading portfolio data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Format values for both currencies
  const usdFormatted = formatCurrency(data.totalValue, 'USD', ethPrice)
  const ethFormatted = formatCurrency(data.totalValue, 'ETH', ethPrice)

  // Determine primary and secondary based on current currency
  const isPrimaryUSD = currency === 'USD'
  const primaryValue = isPrimaryUSD ? usdFormatted : ethFormatted
  const secondaryValue = isPrimaryUSD ? ethFormatted : usdFormatted

  // Format 24h change (always in ETH)
  const change24hFormatted = data.change24h ? formatEthChange(data.change24h) : null
  const isPositiveChange = data.change24h ? BigInt(data.change24h) >= 0n : true

  const formattedApy = (data.trailingApy30d * 100).toFixed(1)

  // Calculate month-over-month change
  const apyChange = data.previousMonthApy !== undefined
    ? (data.trailingApy30d - data.previousMonthApy) * 100
    : null
  const isApyPositive = apyChange !== null && apyChange >= 0

  // Format network benchmark
  const formattedBenchmark = data.networkBenchmarkApy !== undefined
    ? (data.networkBenchmarkApy * 100).toFixed(1)
    : null

  // Default state buckets for modal if not provided
  const defaultStateBuckets: StateBuckets = data?.stateBuckets ?? {
    active: data?.totalValue ? (BigInt(data.totalValue) * 98n / 100n).toString() : '0',
    inTransit: data?.totalValue ? (BigInt(data.totalValue) * 1n / 100n).toString() : '0',
    rewards: '0',
    exiting: data?.totalValue ? (BigInt(data.totalValue) * 1n / 100n).toString() : '0',
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Portfolio Value - Enhanced with dual currency display - CLICKABLE */}
      <button
        onClick={() => setIsExpanded(true)}
        className="bg-white rounded-lg shadow p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Portfolio Value
        </p>

        {/* Primary value */}
        <p
          data-testid="portfolio-value"
          className="mt-2 text-3xl font-bold text-gray-900 transition-all duration-200"
        >
          {primaryValue.value}{primaryValue.suffix && ` ${primaryValue.suffix}`}
        </p>

        {/* Secondary value with 24h change on same row */}
        <div className="mt-1 flex items-center gap-2 transition-all duration-200">
          <span className="text-lg text-gray-500">
            {secondaryValue.value}{secondaryValue.suffix && ` ${secondaryValue.suffix}`}
          </span>
          {change24hFormatted && (
            <span
              data-testid="portfolio-change-24h"
              className={`text-sm font-medium ${
                isPositiveChange ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change24hFormatted} (24h)
            </span>
          )}
        </div>
      </button>

      {/* Global Blended APY - CLICKABLE */}
      <button
        onClick={() => setIsApyExpanded(true)}
        className="bg-white rounded-lg shadow p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Global Blended APY
        </p>
        <div className="mt-3 flex items-baseline gap-3">
          <p
            data-testid="trailing-apy"
            className="text-3xl font-bold text-green-600"
          >
            {formattedApy}%
          </p>
          {formattedBenchmark && (
            <span className="text-sm text-gray-500">
              CESR: {formattedBenchmark}%
            </span>
          )}
        </div>
        {apyChange !== null && (
          <p
            data-testid="apy-change"
            className={`mt-1 text-sm font-medium ${
              isApyPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isApyPositive ? '+' : ''}{apyChange.toFixed(1)}% vs last month
          </p>
        )}
      </button>

      {/* Rewards Pulse - CLICKABLE */}
      {rewardsPulse?.isLoading ? (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      ) : rewardsPulse?.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-medium text-sm">Error loading rewards</p>
        </div>
      ) : rewardsPulse?.data ? (
        <button
          onClick={() => setIsRewardsExpanded(true)}
          className="bg-white rounded-lg shadow p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Rewards <span className="normal-case font-normal">(Last 30 Days)</span>
          </p>

          {/* Claimable Now - Primary metric */}
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatEther(rewardsPulse.data.claimableNow)} <span className="text-xl text-gray-500">ETH</span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg text-gray-500">
              {formatUSD(rewardsPulse.data.claimableNow, ethPrice)}
            </span>
            <span
              className={`text-sm font-medium ${
                BigInt(rewardsPulse.data.claimable24hChange) >= 0n ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatEthChange(rewardsPulse.data.claimable24hChange)} (24h)
            </span>
          </div>
        </button>
      ) : null}
    </div>

    {/* Expanded Portfolio Modal */}
    <PortfolioExpandedModal
      isOpen={isExpanded}
      onClose={() => setIsExpanded(false)}
      data={{
        totalValue: data.totalValue,
        change24h: data.change24h,
        stateBuckets: defaultStateBuckets,
        custodianBreakdown: data.custodianBreakdown ?? [],
        asOfTimestamp: data.asOfTimestamp ?? new Date().toISOString(),
      }}
    />

    {/* Expanded APY Modal */}
    <APYExpandedModal
      isOpen={isApyExpanded}
      onClose={() => setIsApyExpanded(false)}
      data={{
        trailingApy30d: data.trailingApy30d,
        previousMonthApy: data.previousMonthApy,
        networkBenchmarkApy: data.networkBenchmarkApy,
        custodianBreakdown: data.custodianBreakdown ?? [],
        asOfTimestamp: data.asOfTimestamp ?? new Date().toISOString(),
      }}
    />

    {/* Expanded Rewards Pulse Modal */}
    {rewardsPulse?.data && (
      <RewardsPulseModal
        isOpen={isRewardsExpanded}
        onClose={() => setIsRewardsExpanded(false)}
        data={rewardsPulse.data}
      />
    )}
    </>
  )
}
