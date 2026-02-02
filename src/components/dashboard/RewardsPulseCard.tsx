'use client'

/**
 * RewardsPulseCard Component
 *
 * Displays real-time rewards status:
 * - Claimable Now (with 24h change)
 * - Top 3 custodians by claimable amount
 * - Accrued (pending finalization)
 * - Claimed This Month
 *
 * Clickable to expand into detailed modal
 */

import { useState } from 'react'
import { formatEther, formatUSD, formatEthChange } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { RewardsPulseModal } from './RewardsPulseModal'
import { CheckCircle } from 'lucide-react'

interface CustodianReward {
  custodianId: string
  custodianName: string
  amount: string
}

export interface RewardsPulseData {
  claimableNow: string
  claimable24hChange: string
  custodianBreakdown: CustodianReward[]
  accrued: string
  claimedThisMonth: string
  asOfTimestamp: string
}

interface RewardsPulseCardProps {
  data: RewardsPulseData | null
  isLoading: boolean
  error?: string
}

export function RewardsPulseCard({ data, isLoading, error }: RewardsPulseCardProps) {
  const { ethPrice } = useCurrency()
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div
        data-testid="rewards-pulse-loading"
        className="bg-slate-900 rounded-lg shadow p-6 animate-pulse"
      >
        <div className="h-4 bg-slate-700 rounded w-32 mb-4" />
        <div className="h-8 bg-slate-700 rounded w-24 mb-2" />
        <div className="h-4 bg-slate-700 rounded w-40" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        data-testid="rewards-pulse-error"
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700"
      >
        <p className="font-medium">Error loading rewards data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Format values
  const claimableEth = formatEther(data.claimableNow)
  const claimableUsd = formatUSD(data.claimableNow, ethPrice)
  const change24h = formatEthChange(data.claimable24hChange)
  const isPositiveChange = BigInt(data.claimable24hChange) >= 0n

  const accruedEth = formatEther(data.accrued)
  const claimedEth = formatEther(data.claimedThisMonth)

  // Get top 3 custodians sorted by amount
  const topCustodians = [...data.custodianBreakdown]
    .sort((a, b) => Number(BigInt(b.amount) - BigInt(a.amount)))
    .slice(0, 3)

  const topCustodianText = topCustodians
    .map((c) => `${c.custodianName} (${formatEther(c.amount)})`)
    .join(', ')

  return (
    <>
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-slate-900 rounded-lg shadow p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Rewards Pulse
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
            </span>
            <span className="text-xs text-green-500 font-medium">Live</span>
          </div>
        </div>

        {/* Claimable Now */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Claimable Now</span>
            <span
              className={`text-sm font-medium ${
                isPositiveChange ? 'text-green-500' : 'text-red-400'
              } tabular-nums`}
            >
              {change24h} 24h
            </span>
          </div>
          <p
            data-testid="claimable-now"
            className="text-3xl font-bold text-white mt-1 tabular-nums"
          >
            {claimableEth}<span className="unit-symbol">ETH</span>
          </p>
          <p className="text-sm text-slate-500 tabular-nums">{claimableUsd}</p>
        </div>

        {/* Top Custodians */}
        {topCustodians.length > 0 && (
          <p className="text-xs text-slate-500 mb-4 tabular-nums">
            Top: {topCustodianText}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-slate-700 my-4" />

        {/* Accrued & Claimed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Accrued (pending)</span>
            <span className="text-sm font-medium text-white tabular-nums">
              {accruedEth}<span className="unit-symbol">ETH</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400 flex items-center gap-1">
              Claimed This Month
              <CheckCircle className="h-3 w-3 text-green-500" />
            </span>
            <span className="text-sm font-medium text-green-500 tabular-nums">
              {claimedEth}<span className="unit-symbol">ETH</span>
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Modal */}
      <RewardsPulseModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        data={data}
      />
    </>
  )
}
