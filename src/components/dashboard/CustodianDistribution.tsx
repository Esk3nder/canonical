'use client'

/**
 * CustodianDistribution Component
 *
 * Displays custodian allocation with:
 * - Visual allocation chart (bar chart)
 * - Comparison table with APY and changes
 * - Sortable columns
 */

import { type ReactNode, useState } from 'react'

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      <Card data-testid="distribution-loading">
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">No custodian data available</CardContent>
      </Card>
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

  const SortHeader = ({ field, children }: { field: SortField; children: ReactNode }) => (
    <TableHead
      role="columnheader"
      onClick={() => handleSort(field)}
      className="cursor-pointer uppercase tracking-wider hover:bg-slate-50"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && <span className="text-slate-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </div>
    </TableHead>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custodian Distribution</CardTitle>

        <div data-testid="allocation-chart" className="mt-2">
          <div className="flex h-8 overflow-hidden rounded-lg">
            {data.map((custodian, index) => (
              <div
                key={custodian.custodianId}
                className={cn(
                  CHART_COLORS[index % CHART_COLORS.length],
                  'cursor-pointer transition-all hover:opacity-80'
                )}
                style={{ width: `${custodian.percentage * 100}%` }}
                title={`${custodian.custodianName}: ${formatPercent(custodian.percentage)}`}
                onClick={() => onCustodianClick?.(custodian.custodianId)}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            {data.map((custodian, index) => (
              <div key={custodian.custodianId} className="flex items-center gap-2">
                <div className={cn('h-3 w-3 rounded-full', CHART_COLORS[index % CHART_COLORS.length])} />
                <span className="text-sm text-slate-600">{custodian.custodianName}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div data-testid="custodian-table" className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortHeader field="name">Custodian</SortHeader>
                <SortHeader field="value">Value</SortHeader>
                <TableHead>%</TableHead>
                <SortHeader field="apy">APY</SortHeader>
                <SortHeader field="validators">Validators</SortHeader>
                <TableHead>7d</TableHead>
                <TableHead>30d</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((custodian, idx) => (
                <TableRow
                  key={custodian.custodianId}
                  data-testid={`custodian-row-${idx}`}
                  onClick={() => onCustodianClick?.(custodian.custodianId)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <span className="font-medium text-slate-900">{custodian.custodianName}</span>
                  </TableCell>
                  <TableCell className="tabular-nums text-slate-900">
                    {(() => {
                      const { value: formatted, suffix } = formatCurrency(custodian.value, currency, ethPrice)
                      return `${formatted}${suffix ? ` ${suffix}` : ''}`
                    })()}
                  </TableCell>
                  <TableCell className="tabular-nums text-slate-500">
                    {formatPercent(custodian.percentage)}
                  </TableCell>
                  <TableCell>
                    <span className="tabular-nums font-medium text-green-600">
                      {(custodian.trailingApy30d * 100).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums text-slate-900">
                    {custodian.validatorCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <ChangeIndicator value={custodian.change7d} />
                  </TableCell>
                  <TableCell>
                    <ChangeIndicator value={custodian.change30d} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function ChangeIndicator({ value }: { value?: number }) {
  if (value === undefined || value === null) {
    return <span className="text-slate-400">-</span>
  }

  const isPositive = value >= 0
  const formatted = `${isPositive ? '+' : ''}${(value * 100).toFixed(2)}%`

  return (
    <span className={cn('tabular-nums font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
      {formatted}
    </span>
  )
}
