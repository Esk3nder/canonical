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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { RewardsPulseData } from './RewardsPulseCard'

interface RewardsPulseModalProps {
  isOpen: boolean
  onClose: () => void
  data: RewardsPulseData
}

export function RewardsPulseModal({ isOpen, onClose, data }: RewardsPulseModalProps) {
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-slate-200 bg-white p-0 data-[state=closed]:animate-modal-out data-[state=open]:animate-modal-in">
        <DialogHeader className="space-y-0 border-b border-slate-200 px-6 pb-4 pt-5">
          <DialogTitle
            id="rewards-modal-title"
            className="text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            Rewards <span className="normal-case font-normal">(Last 30 Days)</span>
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs text-slate-400">
            Claimable and accrued rewards
          </DialogDescription>
          <div className="mt-3">
            <span className="text-sm text-slate-500">Claimable Now</span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="tabular-nums text-3xl font-bold text-slate-900">
                {claimableEth}
                <span className="unit-symbol">ETH</span>
              </span>
              <span
                className={`tabular-nums text-sm font-medium ${
                  isPositiveChange ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change24h} 24h
              </span>
            </div>
            <p className="tabular-nums mt-0.5 text-sm text-slate-500">{claimableUsd}</p>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">By Custodian</h3>

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
                        <span className="text-sm text-slate-900">{custodian.custodianName}</span>
                      </div>
                      <div className="text-right">
                        <span className="tabular-nums text-sm font-medium text-slate-900">
                          {custodianEth}
                          <span className="unit-symbol">ETH</span>
                        </span>
                        <span className="tabular-nums ml-2 text-xs text-slate-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
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

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Total Claimable</span>
                  <span className="tabular-nums text-sm font-bold text-slate-900">
                    {claimableEth}
                    <span className="unit-symbol">ETH</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">No custodian data available</p>
          )}
        </div>

        <div className="border-y border-slate-200 bg-slate-50 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-slate-500">Accrued (Pending)</p>
              <p className="tabular-nums mt-1 text-lg font-semibold text-slate-900">
                {accruedEth}
                <span className="unit-symbol">ETH</span>
              </p>
            </div>
            <div className="text-center">
              <p className="flex items-center justify-center gap-1 text-xs uppercase tracking-wider text-slate-500">
                Claimed This Month
                <CheckCircle className="h-3 w-3 text-green-600" />
              </p>
              <p className="tabular-nums mt-1 text-lg font-semibold text-green-600">
                {claimedEth}
                <span className="unit-symbol">ETH</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3">
          <p className="text-center text-xs text-slate-400">Updated {timeAgoText}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
