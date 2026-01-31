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

import { useEffect, useCallback, useState } from 'react'
import { formatEther, formatUSD, formatEthChange } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { CheckCircle } from 'lucide-react'
import type { RewardsPulseData } from './RewardsPulseCard'

interface RewardsPulseModalProps {
  isOpen: boolean
  onClose: () => void
  data: RewardsPulseData
}

export function RewardsPulseModal({
  isOpen,
  onClose,
  data,
}: RewardsPulseModalProps) {
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

  // Format values
  const claimableEth = formatEther(data.claimableNow)
  const claimableUsd = formatUSD(data.claimableNow, ethPrice)
  const change24h = formatEthChange(data.claimable24hChange)
  const isPositiveChange = BigInt(data.claimable24hChange) >= 0n

  const accruedEth = formatEther(data.accrued)
  const claimedEth = formatEther(data.claimedThisMonth)

  // Calculate total claimable for percentages
  const totalClaimable = BigInt(data.claimableNow)

  // Sort custodians by amount descending
  const sortedCustodians = [...data.custodianBreakdown].sort(
    (a, b) => Number(BigInt(b.amount) - BigInt(a.amount))
  )

  // Time since update
  const updatedAt = new Date(data.asOfTimestamp)
  const secondsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const timeAgoText =
    secondsAgo < 60
      ? `${secondsAgo}s ago`
      : secondsAgo < 3600
      ? `${Math.floor(secondsAgo / 60)}m ago`
      : `${Math.floor(secondsAgo / 3600)}h ago`

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewards-modal-title"
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
        <div className="px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="rewards-modal-title"
                className="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rewards <span className="normal-case font-normal">(Last 30 Days)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Claimable and accrued rewards
              </p>
              <div className="mt-3">
                <span className="text-sm text-gray-500">Claimable Now</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {claimableEth} ETH
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isPositiveChange ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {change24h} 24h
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{claimableUsd}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custodian Breakdown */}
        <div className="px-6 py-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            By Custodian
          </h3>

          {sortedCustodians.length > 0 ? (
            <div className="space-y-3">
              {sortedCustodians.map((custodian) => {
                const custodianEth = formatEther(custodian.amount)
                const percentage =
                  totalClaimable > 0n
                    ? Number(
                        (BigInt(custodian.amount) * 10000n) / totalClaimable
                      ) / 100
                    : 0

                // Bar width based on percentage
                const barWidth = Math.max(percentage, 2)

                return (
                  <div key={custodian.custodianId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getCustodianColor(
                              custodian.custodianName
                            ),
                          }}
                        />
                        <span className="text-sm text-gray-900">
                          {custodian.custodianName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {custodianEth} ETH
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: getCustodianColor(
                            custodian.custodianName
                          ),
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              {/* Total row */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Total Claimable
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {claimableEth} ETH
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No custodian data available
            </p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Accrued (Pending)
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {accruedEth} ETH
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1">
                Claimed This Month
                <CheckCircle className="h-3 w-3 text-green-600" />
              </p>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {claimedEth} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
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
    Figment: '#f59e0b', // amber
  }
  return colors[name] || '#6b7280' // default gray
}
