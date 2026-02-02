'use client'

/**
 * PortfolioExpandedModal Component
 *
 * Expanded view showing portfolio composition:
 * - Total value with 24h change
 * - Custodian breakdown (where is the ETH held?)
 * - Stake status (active vs non-earning)
 */

import { useEffect, useCallback, useState } from 'react'
import { formatEther, formatUSD, formatNumber } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'

interface StateBuckets {
  deposited: string
  entryQueue: string
  active: string
  exiting: string
  withdrawable: string
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

interface PortfolioExpandedModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    totalValue: string
    change24h?: string
    stateBuckets: StateBuckets
    custodianBreakdown: CustodianAllocation[]
    asOfTimestamp: string
  }
}

export function PortfolioExpandedModal({
  isOpen,
  onClose,
  data,
}: PortfolioExpandedModalProps) {
  const { ethPrice } = useCurrency()
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
  const depositedBigInt = BigInt(data.stateBuckets.deposited)
  const entryQueueBigInt = BigInt(data.stateBuckets.entryQueue)
  const activeBigInt = BigInt(data.stateBuckets.active)
  const exitingBigInt = BigInt(data.stateBuckets.exiting)
  const withdrawableBigInt = BigInt(data.stateBuckets.withdrawable)

  // Total lifecycle value (excluding rewards which are separate)
  const totalLifecycle = depositedBigInt + entryQueueBigInt + activeBigInt + exitingBigInt + withdrawableBigInt
  const earningRatio = totalLifecycle > 0n
    ? Number((activeBigInt * 10000n) / totalLifecycle) / 100
    : 0
  const nonEarningBigInt = totalLifecycle - activeBigInt

  // Format values
  const totalUsd = formatUSD(data.totalValue, ethPrice)
  const totalEth = formatEther(data.totalValue)
  const change24hEth = data.change24h ? formatEther(data.change24h) : null
  const change24hIsPositive = data.change24h ? BigInt(data.change24h) >= 0n : true

  // Time since update
  const updatedAt = new Date(data.asOfTimestamp)
  const secondsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const timeAgoText = secondsAgo < 60
    ? `${secondsAgo}s ago`
    : secondsAgo < 3600
    ? `${Math.floor(secondsAgo / 60)}m ago`
    : `${Math.floor(secondsAgo / 3600)}h ago`

  // Sort custodians by value descending
  const sortedCustodians = [...data.custodianBreakdown].sort(
    (a, b) => Number(BigInt(b.value) - BigInt(a.value))
  )

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
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
              <h2 id="modal-title" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Portfolio Composition
              </h2>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {totalEth}<span className="unit-symbol">ETH</span>
                </span>
                <span className="text-lg text-slate-500 ml-2 tabular-nums">· {totalUsd}</span>
              </div>
              {change24hEth && (
                <p className={`text-sm font-medium mt-1 tabular-nums ${
                  change24hIsPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change24hIsPositive ? '+' : ''}{change24hEth}<span className="unit-symbol">ETH</span> (24h)
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
              </span>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Custodian Breakdown Table */}
        <div className="px-6 py-4">
          {sortedCustodians.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left font-medium pb-2">Custodian</th>
                  <th className="text-right font-medium pb-2">ETH</th>
                  <th className="text-right font-medium pb-2">%</th>
                  <th className="text-right font-medium pb-2">APY</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustodians.map((custodian) => {
                  const custodianEth = formatEther(custodian.value)
                  const custodianApy = (custodian.trailingApy30d * 100).toFixed(2)
                  const percentFormatted = (custodian.percentage * 100).toFixed(1)

                  return (
                    <tr
                      key={custodian.custodianId}
                      className="border-t border-slate-100"
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: getCustodianColor(custodian.custodianName),
                            }}
                          />
                          <span className="text-slate-900">{custodian.custodianName}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-slate-900 tabular-nums">{custodianEth}</td>
                      <td className="py-2 text-right text-slate-500 tabular-nums">{percentFormatted}%</td>
                      <td className="py-2 text-right text-green-600 tabular-nums">{custodianApy}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No custodian data available
            </p>
          )}
        </div>

        {/* Stake Status */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Stake Status
            </h3>
            <span className="text-sm font-medium text-slate-900 tabular-nums">
              {earningRatio.toFixed(1)}% Active
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${earningRatio}%` }}
            />
            <div
              className="bg-orange-400 transition-all duration-300"
              style={{ width: `${100 - earningRatio}%` }}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
            <span className="tabular-nums">
              <span className="inline-block w-2 h-2 rounded bg-green-500 mr-1" />
              {formatNumber(Number(activeBigInt) / 1e18, 2)}<span className="unit-symbol">ETH</span> earning
            </span>
            <span className="tabular-nums">
              <span className="inline-block w-2 h-2 rounded bg-orange-400 mr-1" />
              {formatNumber(Number(nonEarningBigInt) / 1e18, 2)}<span className="unit-symbol">ETH</span> pending
            </span>
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
