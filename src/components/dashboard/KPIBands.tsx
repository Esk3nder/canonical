'use client'

/**
 * KPIBands Component
 *
 * Displays key portfolio metrics in a prominent band layout:
 * - Total Portfolio Value
 * - Trailing 30-day APY
 * - Validator Count
 */

import { formatEther } from '@/lib/format'

interface KPIData {
  totalValue: string
  trailingApy30d: number
  validatorCount: number
}

interface KPIBandsProps {
  data: KPIData | null
  isLoading: boolean
  error?: string
}

export function KPIBands({ data, isLoading, error }: KPIBandsProps) {
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

  const formattedValue = formatEther(data.totalValue)
  const formattedApy = (data.trailingApy30d * 100).toFixed(2)
  const formattedCount = data.validatorCount.toLocaleString()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Portfolio Value */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Portfolio Value
        </p>
        <p
          data-testid="portfolio-value"
          className="mt-2 text-3xl font-bold text-gray-900"
        >
          {formattedValue} ETH
        </p>
      </div>

      {/* Trailing APY */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Trailing 30d APY
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
