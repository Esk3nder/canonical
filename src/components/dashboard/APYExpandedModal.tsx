'use client'

/**
 * APYExpandedModal Component
 *
 * Expanded view showing APY composition and performance:
 * - Global blended APY with month-over-month comparison
 * - Network benchmark comparison (CESR Rate)
 * - Custodian-weighted APY contribution breakdown
 * - Performance vs benchmark indicator
 */

import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { getCustodianColor } from '@/lib/custodian-colors'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CustodianAllocation {
  custodianId: string
  custodianName: string
  value: string
  percentage: number
  trailingApy30d: number
  validatorCount: number
}

interface APYExpandedModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    trailingApy30d: number
    previousMonthApy?: number
    networkBenchmarkApy?: number
    custodianBreakdown: CustodianAllocation[]
    asOfTimestamp: string
  }
}

export function APYExpandedModal({ isOpen, onClose, data }: APYExpandedModalProps) {
  const formattedApy = (data.trailingApy30d * 100).toFixed(1)

  const apyChange =
    data.previousMonthApy !== undefined
      ? (data.trailingApy30d - data.previousMonthApy) * 100
      : null
  const isApyPositive = apyChange !== null && apyChange > 0
  const isApyNegative = apyChange !== null && apyChange < 0

  const formattedBenchmark =
    data.networkBenchmarkApy !== undefined ? (data.networkBenchmarkApy * 100).toFixed(1) : null
  const benchmarkDelta =
    data.networkBenchmarkApy !== undefined
      ? (data.trailingApy30d - data.networkBenchmarkApy) * 100
      : null
  const isAboveBenchmark = benchmarkDelta !== null && benchmarkDelta > 0

  const updatedAt = new Date(data.asOfTimestamp)
  const secondsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const timeAgoText =
    secondsAgo < 60
      ? `${secondsAgo}s ago`
      : secondsAgo < 3600
      ? `${Math.floor(secondsAgo / 60)}m ago`
      : `${Math.floor(secondsAgo / 3600)}h ago`

  const sortedCustodians = [...data.custodianBreakdown].sort(
    (a, b) => b.percentage * b.trailingApy30d - a.percentage * a.trailingApy30d
  )

  const custodianContributions = sortedCustodians.map((custodian) => ({
    ...custodian,
    weightedContribution: custodian.percentage * custodian.trailingApy30d * 100,
  }))

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
          <div className="flex items-center justify-between pr-8">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle id="apy-modal-title" className="text-xs uppercase tracking-wider text-slate-500">
                  Global Blended APY
                </DialogTitle>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                  </span>
                  <span className="text-xs font-medium text-green-600">Daily</span>
                </div>
              </div>
              <DialogDescription className="mt-0.5 text-xs text-slate-400">
                30-day trailing, net of operator fees
              </DialogDescription>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="tabular-nums text-4xl font-bold text-green-600">{formattedApy}%</span>
                {apyChange !== null && (
                  <span
                    className={`tabular-nums text-sm font-medium ${
                      isApyPositive
                        ? 'text-green-600'
                        : isApyNegative
                        ? 'text-red-600'
                        : 'text-slate-500'
                    } flex items-center gap-1`}
                  >
                    {isApyPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : isApyNegative ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {isApyPositive ? '+' : ''}
                    {apyChange.toFixed(1)}% vs last month
                  </span>
                )}
              </div>
            </div>
          </div>

          {formattedBenchmark && (
            <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="tabular-nums text-sm text-slate-600">
                CESR Rate: <span className="font-medium">{formattedBenchmark}%</span>
              </span>
              {benchmarkDelta !== null && (
                <span
                  className={`tabular-nums text-sm font-medium ${
                    isAboveBenchmark ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isAboveBenchmark ? '+' : ''}
                  {benchmarkDelta.toFixed(2)}% vs benchmark
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Composition (Allocation-Weighted)
          </h3>

          {custodianContributions.length > 0 ? (
            <div className="space-y-3">
              {custodianContributions.map((custodian) => {
                const custodianApy = (custodian.trailingApy30d * 100).toFixed(2)
                const allocationPct = (custodian.percentage * 100).toFixed(0)
                const contribution = custodian.weightedContribution.toFixed(2)

                const contributionRatio =
                  data.trailingApy30d > 0
                    ? custodian.weightedContribution / 100 / data.trailingApy30d
                    : 0

                return (
                  <div key={custodian.custodianId}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: getCustodianColor(custodian.custodianName) }}
                        />
                        <span className="text-sm text-slate-900">{custodian.custodianName}</span>
                        <span className="tabular-nums text-xs text-slate-400">({allocationPct}%)</span>
                      </div>
                      <div className="text-right">
                        <span className="tabular-nums text-sm font-medium text-green-600">
                          {custodianApy}%
                        </span>
                        <span className="tabular-nums ml-2 text-xs text-slate-400">
                          → {contribution}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(contributionRatio * 100, 2)}%`,
                          backgroundColor: getCustodianColor(custodian.custodianName),
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Blended Total</span>
                  <span className="tabular-nums text-sm font-bold text-green-600">{formattedApy}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">No custodian data available</p>
          )}
        </div>

        <div className="border-y border-slate-200 bg-slate-50 px-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">vs Last Month</p>
              <p
                className={`tabular-nums mt-1 text-lg font-semibold ${
                  apyChange !== null && apyChange > 0
                    ? 'text-green-600'
                    : apyChange !== null && apyChange < 0
                    ? 'text-red-600'
                    : 'text-slate-600'
                }`}
              >
                {apyChange !== null ? `${apyChange > 0 ? '+' : ''}${apyChange.toFixed(2)}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">vs CESR Rate</p>
              <p
                className={`tabular-nums mt-1 text-lg font-semibold ${
                  benchmarkDelta !== null && benchmarkDelta > 0
                    ? 'text-green-600'
                    : benchmarkDelta !== null && benchmarkDelta < 0
                    ? 'text-red-600'
                    : 'text-slate-600'
                }`}
              >
                {benchmarkDelta !== null
                  ? `${benchmarkDelta > 0 ? '+' : ''}${benchmarkDelta.toFixed(2)}%`
                  : '—'}
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
