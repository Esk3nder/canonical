'use client'

/**
 * CustodianDistribution Component
 *
 * Displays custodian allocation with:
 * - Visual allocation chart (bar chart)
 * - Comparison table with APY and changes
 * - Sortable columns
 */

import { useState } from 'react'
import { formatCurrency, formatPercent } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'

interface CustodianData {
  custodianId: string
  custodianName: string
  value: string
  percentage: number
  trailingApy30d: number
  validatorCount: number
  change7d?: number
  change30d?: number
}

interface CustodianDistributionProps {
  data: CustodianData[] | null
  isLoading?: boolean
  onCustodianClick?: (custodianId: string) => void
}

type SortField = 'name' | 'value' | 'apy' | 'validators'
type SortDirection = 'asc' | 'desc'

// Colors for the allocation chart
const CHART_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
]

export function CustodianDistribution({
  data,
  isLoading,
  onCustodianClick,
}: CustodianDistributionProps) {
  const { currency, ethPrice } = useCurrency()
  const [sortField, setSortField] = useState<SortField>('value')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  if (isLoading) {
    return (
        <div data-testid="distribution-loading" className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48 mb-4" />
          <div className="h-8 bg-slate-200 rounded w-full mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded" />
            ))}
          </div>
          </div>
        </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-slate-500">
        No custodian data available
      </div>
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'name':
        comparison = a.custodianName.localeCompare(b.custodianName)
        break
      case 'value':
        comparison = Number(BigInt(a.value) - BigInt(b.value))
        break
      case 'apy':
        comparison = a.trailingApy30d - b.trailingApy30d
        break
      case 'validators':
        comparison = a.validatorCount - b.validatorCount
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <th
      role="columnheader"
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-slate-400">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">
          Custodian Distribution
        </h3>

        {/* Allocation Chart */}
        <div data-testid="allocation-chart" className="mt-4">
          <div className="flex h-8 rounded-lg overflow-hidden">
            {data.map((custodian, index) => (
              <div
                key={custodian.custodianId}
                className={cn(
                  CHART_COLORS[index % CHART_COLORS.length],
                  'transition-all hover:opacity-80 cursor-pointer'
                )}
                style={{ width: `${custodian.percentage * 100}%` }}
                title={`${custodian.custodianName}: ${formatPercent(custodian.percentage)}`}
                onClick={() => onCustodianClick?.(custodian.custodianId)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4">
            {data.map((custodian, index) => (
              <div key={custodian.custodianId} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    CHART_COLORS[index % CHART_COLORS.length]
                  )}
                />
                <span className="text-sm text-slate-600">
                  {custodian.custodianName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div data-testid="custodian-table" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortHeader field="name">Custodian</SortHeader>
              <SortHeader field="value">Value</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                %
              </th>
              <SortHeader field="apy">APY</SortHeader>
              <SortHeader field="validators">Validators</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                7d
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                30d
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedData.map((custodian, idx) => (
              <tr
                key={custodian.custodianId}
                data-testid={`custodian-row-${idx}`}
                onClick={() => onCustodianClick?.(custodian.custodianId)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-medium text-slate-900">
                    {custodian.custodianName}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-900 tabular-nums">
                  {(() => {
                    const { value: formatted, suffix } = formatCurrency(custodian.value, currency, ethPrice)
                    return `${formatted}${suffix ? ` ${suffix}` : ''}`
                  })()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-500 tabular-nums">
                  {formatPercent(custodian.percentage)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-green-600 font-medium tabular-nums">
                    {(custodian.trailingApy30d * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-900 tabular-nums">
                  {custodian.validatorCount.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <ChangeIndicator value={custodian.change7d} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <ChangeIndicator value={custodian.change30d} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChangeIndicator({ value }: { value?: number }) {
  if (value === undefined || value === null) {
    return <span className="text-slate-400">-</span>
  }

  const isPositive = value >= 0
  const formatted = `${isPositive ? '+' : ''}${(value * 100).toFixed(2)}%`

  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}
    >
      {formatted}
    </span>
  )
}
