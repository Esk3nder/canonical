'use client'

/**
 * KPIBands Component
 *
 * Displays key portfolio metrics in a prominent band layout:
 * - Total Portfolio Value (with dual currency display and 24h change)
 * - Trailing 30-day APY
 * - Validator Count
 */

import { formatCurrency, formatEthChange } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'

interface KPIData {
  totalValue: string
  change24h?: string
  trailingApy30d: number
  validatorCount: number
}

interface KPIBandsProps {
  data: KPIData | null
  isLoading: boolean
  error?: string
}

export function KPIBands({ data, isLoading, error }: KPIBandsProps) {
  const { currency, ethPrice } = useCurrency()

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

  const formattedApy = (data.trailingApy30d * 100).toFixed(2)
  const formattedCount = data.validatorCount.toLocaleString()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Portfolio Value - Enhanced with dual currency display */}
      <div className="bg-white rounded-lg shadow p-6">
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
      </div>

      {/* Trailing APY */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Blended Staking APY
        </p>
        <p
          data-testid="trailing-apy"
          className="mt-2 text-3xl font-bold text-green-600"
        >
          {formattedApy}%
        </p>
      </div>

      {/* Validator Count */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Active Validators
        </p>
        <p
          data-testid="validator-count"
          className="mt-2 text-3xl font-bold text-gray-900"
        >
          {formattedCount}
        </p>
      </div>
    </div>
  )
}
