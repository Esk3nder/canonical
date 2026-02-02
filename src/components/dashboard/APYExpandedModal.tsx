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

import { useEffect, useCallback, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

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

export function APYExpandedModal({
  isOpen,
  onClose,
  data,
}: APYExpandedModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 150)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  // Calculate values
  const formattedApy = (data.trailingApy30d * 100).toFixed(1)

  // Month-over-month change
  const apyChange = data.previousMonthApy !== undefined
    ? (data.trailingApy30d - data.previousMonthApy) * 100
    : null
  const isApyPositive = apyChange !== null && apyChange > 0
  const isApyNegative = apyChange !== null && apyChange < 0

  // Benchmark comparison
  const formattedBenchmark = data.networkBenchmarkApy !== undefined
    ? (data.networkBenchmarkApy * 100).toFixed(1)
    : null
  const benchmarkDelta = data.networkBenchmarkApy !== undefined
    ? (data.trailingApy30d - data.networkBenchmarkApy) * 100
    : null
  const isAboveBenchmark = benchmarkDelta !== null && benchmarkDelta > 0

  // Time since update
  const updatedAt = new Date(data.asOfTimestamp)
  const secondsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const timeAgoText = secondsAgo < 60
    ? `${secondsAgo}s ago`
    : secondsAgo < 3600
    ? `${Math.floor(secondsAgo / 60)}m ago`
    : `${Math.floor(secondsAgo / 3600)}h ago`

  // Sort custodians by weighted APY contribution (percentage * APY)
  const sortedCustodians = [...data.custodianBreakdown].sort(
    (a, b) => (b.percentage * b.trailingApy30d) - (a.percentage * a.trailingApy30d)
  )

  // Calculate weighted contribution for each custodian
  const custodianContributions = sortedCustodians.map(custodian => ({
    ...custodian,
    weightedContribution: custodian.percentage * custodian.trailingApy30d * 100,
  }))

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apy-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        } md:mx-4 max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="apy-modal-title" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Global Blended APY
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
                  </span>
                  <span className="text-xs text-green-600 font-medium">Daily</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                30-day trailing, net of operator fees
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-green-600 tabular-nums">{formattedApy}%</span>
                {apyChange !== null && (
                  <span
                    className={`text-sm font-medium flex items-center gap-1 ${
                      isApyPositive ? 'text-green-600' : isApyNegative ? 'text-red-600' : 'text-slate-500'
                    } tabular-nums`}
                  >
                    {isApyPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : isApyNegative ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    {isApyPositive ? '+' : ''}{apyChange.toFixed(1)}% vs last month
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Network Benchmark */}
          {formattedBenchmark && (
            <div className="mt-3 flex items-center justify-between py-2 px-3 bg-slate-50 rounded-md">
              <span className="text-sm text-slate-600 tabular-nums">
                CESR Rate: <span className="font-medium">{formattedBenchmark}%</span>
              </span>
              {benchmarkDelta !== null && (
                <span
                  className={`text-sm font-medium ${
                    isAboveBenchmark ? 'text-green-600' : 'text-red-600'
                  } tabular-nums`}
                >
                  {isAboveBenchmark ? '+' : ''}{benchmarkDelta.toFixed(2)}% vs benchmark
                </span>
              )}
            </div>
          )}
        </div>

        {/* Custodian APY Breakdown */}
        <div className="px-6 py-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Composition (Allocation-Weighted)
          </h3>

          {custodianContributions.length > 0 ? (
            <div className="space-y-3">
              {custodianContributions.map((custodian) => {
                const custodianApy = (custodian.trailingApy30d * 100).toFixed(2)
                const allocationPct = (custodian.percentage * 100).toFixed(0)
                const contribution = custodian.weightedContribution.toFixed(2)

                // Bar width based on contribution relative to total APY
                const contributionRatio = data.trailingApy30d > 0
                  ? (custodian.weightedContribution / 100) / data.trailingApy30d
                  : 0

                return (
                  <div key={custodian.custodianId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getCustodianColor(custodian.custodianName),
                          }}
                        />
                        <span className="text-sm text-slate-900">{custodian.custodianName}</span>
                        <span className="text-xs text-slate-400 tabular-nums">({allocationPct}%)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600 tabular-nums">{custodianApy}%</span>
                        <span className="text-xs text-slate-400 ml-2 tabular-nums">→ {contribution}%</span>
                      </div>
                    </div>
                    {/* Contribution bar */}
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

              {/* Total row */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Blended Total</span>
                  <span className="text-sm font-bold text-green-600 tabular-nums">{formattedApy}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No custodian data available
            </p>
          )}
        </div>

        {/* Performance Summary */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">vs Last Month</p>
              <p className={`text-lg font-semibold mt-1 tabular-nums ${
                apyChange !== null && apyChange > 0 ? 'text-green-600' :
                apyChange !== null && apyChange < 0 ? 'text-red-600' : 'text-slate-600'
              }`}>
                {apyChange !== null ? (
                  <>
                    {apyChange > 0 ? '+' : ''}{apyChange.toFixed(2)}%
                  </>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">vs CESR Rate</p>
              <p className={`text-lg font-semibold mt-1 tabular-nums ${
                benchmarkDelta !== null && benchmarkDelta > 0 ? 'text-green-600' :
                benchmarkDelta !== null && benchmarkDelta < 0 ? 'text-red-600' : 'text-slate-600'
              }`}>
                {benchmarkDelta !== null ? (
                  <>
                    {benchmarkDelta > 0 ? '+' : ''}{benchmarkDelta.toFixed(2)}%
                  </>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">
            Updated {timeAgoText}
          </p>
        </div>
      </div>
    </div>
  )
}

// Color mapping for custodians (matches the dashboard chart)
function getCustodianColor(name: string): string {
  const colors: Record<string, string> = {
    'Coinbase Prime': '#2563eb', // blue
    'Anchorage Digital': '#16a34a', // green
    'BitGo': '#9333ea', // purple
    'Fireblocks': '#ea580c', // orange
    'Copper': '#0891b2', // cyan
  }
  return colors[name] || '#6b7280' // default gray
}
