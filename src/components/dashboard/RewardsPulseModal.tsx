'use client'

/**
 * RewardsPulseModal Component
 *
 * Expanded view showing reward composition:
 * - Claimable Now with 24h change
 * - Full custodian breakdown (name, ETH amount, percentage)
 * - Accrued (pending finalization)
 * - Claimed This Month
 */

import { CheckCircle } from 'lucide-react'

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatEthChange, formatEther, formatUSD } from '@/lib/format'
import { getCustodianColor } from '@/lib/custodian-colors'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { RewardsPulseData } from './RewardsPulseCard'

interface RewardsPulseModalProps {
  isOpen: boolean
  onClose: () => void
  data: RewardsPulseData
  timePeriodLabel?: string
}

export function RewardsPulseModal({ isOpen, onClose, data, timePeriodLabel = '30d' }: RewardsPulseModalProps) {
  const { ethPrice } = useCurrency()

  const claimableEth = formatEther(data.claimableNow)
  const claimableUsd = formatUSD(data.claimableNow, ethPrice)
  const change24h = formatEthChange(data.claimable24hChange)
  const isPositiveChange = BigInt(data.claimable24hChange) >= 0n

  const accruedEth = formatEther(data.accrued)
  const claimedEth = formatEther(data.claimedThisMonth)

  const totalClaimable = BigInt(data.claimableNow)

  const sortedCustodians = [...data.custodianBreakdown].sort((a, b) =>
    Number(BigInt(b.amount) - BigInt(a.amount))
  )

  const updatedAt = new Date(data.asOfTimestamp)
  const secondsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const timeAgoText =
    secondsAgo < 60
      ? `${secondsAgo}s ago`
      : secondsAgo < 3600
      ? `${Math.floor(secondsAgo / 60)}m ago`
      : `${Math.floor(secondsAgo / 3600)}h ago`

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent side="right" className="w-[400px] overflow-y-auto p-0 sm:w-[540px]">
        <SheetHeader className="space-y-0 border-b border-border px-6 pb-4 pt-5">
          <SheetTitle
            id="rewards-modal-title"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Rewards <span className="normal-case font-normal">(Last {timePeriodLabel === 'All' ? 'All Time' : timePeriodLabel})</span>
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
            Claimable and accrued rewards
          </SheetDescription>
          <div className="mt-3">
            <span className="text-sm text-muted-foreground">Claimable Now</span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="tabular-nums text-3xl font-bold text-foreground">
                {claimableEth}
                <span className="unit-symbol">ETH</span>
              </span>
              <span
                className={`tabular-nums text-sm font-medium ${
                  isPositiveChange ? 'text-success' : 'text-destructive'
                }`}
              >
                {change24h} 24h
              </span>
            </div>
            <p className="tabular-nums mt-0.5 text-sm text-muted-foreground">{claimableUsd}</p>
          </div>
        </SheetHeader>

        <div className="px-6 py-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">By Custodian</h3>

          {sortedCustodians.length > 0 ? (
            <div className="space-y-3">
              {sortedCustodians.map((custodian) => {
                const custodianEth = formatEther(custodian.amount)
                const percentage =
                  totalClaimable > 0n
                    ? Number((BigInt(custodian.amount) * 10000n) / totalClaimable) / 100
                    : 0
                const barWidth = Math.max(percentage, 2)

                return (
                  <div key={custodian.custodianId}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: getCustodianColor(custodian.custodianName) }}
                        />
                        <span className="text-sm text-foreground">{custodian.custodianName}</span>
                      </div>
                      <div className="text-right">
                        <span className="tabular-nums text-sm font-medium text-foreground">
                          {custodianEth}
                          <span className="unit-symbol">ETH</span>
                        </span>
                        <span className="tabular-nums ml-2 text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: getCustodianColor(custodian.custodianName),
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Claimable</span>
                  <span className="tabular-nums text-sm font-bold text-foreground">
                    {claimableEth}
                    <span className="unit-symbol">ETH</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No custodian data available</p>
          )}
        </div>

        <div className="border-y border-border bg-muted px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Accrued (Pending)</p>
              <p className="tabular-nums mt-1 text-lg font-semibold text-foreground">
                {accruedEth}
                <span className="unit-symbol">ETH</span>
              </p>
            </div>
            <div className="text-center">
              <p className="flex items-center justify-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                Claimed ({timePeriodLabel})
                <CheckCircle className="h-3 w-3 text-success" />
              </p>
              <p className="tabular-nums mt-1 text-lg font-semibold text-success">
                {claimedEth}
                <span className="unit-symbol">ETH</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">Updated {timeAgoText}</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
