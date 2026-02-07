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
import { CheckCircle } from 'lucide-react'

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatEthChange, formatEther, formatUSD } from '@/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { RewardsPulseModal } from './RewardsPulseModal'

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
      <Card data-testid="rewards-pulse-loading" className="border-slate-800 bg-slate-900">
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-32 bg-slate-700" />
          <Skeleton className="h-8 w-24 bg-slate-700" />
          <Skeleton className="h-4 w-40 bg-slate-700" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert data-testid="rewards-pulse-error" variant="destructive">
        <AlertTitle>Error loading rewards data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  const claimableEth = formatEther(data.claimableNow)
  const claimableUsd = formatUSD(data.claimableNow, ethPrice)
  const change24h = formatEthChange(data.claimable24hChange)
  const isPositiveChange = BigInt(data.claimable24hChange) >= 0n

  const accruedEth = formatEther(data.accrued)
  const claimedEth = formatEther(data.claimedThisMonth)

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
        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-6 text-left shadow transition-all duration-200 hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.99]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">Rewards Pulse</h3>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            <span className="text-xs font-medium text-green-500">Live</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Claimable Now</span>
            <span
              className={`tabular-nums text-sm font-medium ${
                isPositiveChange ? 'text-green-500' : 'text-red-400'
              }`}
            >
              {change24h} 24h
            </span>
          </div>
          <p data-testid="claimable-now" className="mt-1 tabular-nums text-3xl font-bold text-white">
            {claimableEth}
            <span className="unit-symbol">ETH</span>
          </p>
          <p className="tabular-nums text-sm text-slate-500">{claimableUsd}</p>
        </div>

        {topCustodians.length > 0 && (
          <p className="tabular-nums mb-4 text-xs text-slate-500">Top: {topCustodianText}</p>
        )}

        <Separator className="my-4 bg-slate-700" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Accrued (pending)</span>
            <span className="tabular-nums text-sm font-medium text-white">
              {accruedEth}
              <span className="unit-symbol">ETH</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm text-slate-400">
              Claimed This Month
              <CheckCircle className="h-3 w-3 text-green-500" />
            </span>
            <span className="tabular-nums text-sm font-medium text-green-500">
              {claimedEth}
              <span className="unit-symbol">ETH</span>
            </span>
          </div>
        </div>
      </button>

      <RewardsPulseModal isOpen={isExpanded} onClose={() => setIsExpanded(false)} data={data} />
    </>
  )
}
