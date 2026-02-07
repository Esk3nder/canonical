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
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { useCurrency } from '@/contexts/CurrencyContext'
import { getCustodianColor } from '@/lib/custodian-colors'
import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
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

  const chartConfig = data.reduce<ChartConfig>((config, custodian) => {
    config[custodian.custodianId] = {
      label: custodian.custodianName,
      color: getCustodianColor(custodian.custodianName),
    }
    return config
  }, {})

  const chartData = [
    data.reduce<Record<string, number | string>>(
      (row, custodian) => {
        row[custodian.custodianId] = custodian.percentage * 100
        return row
      },
      { allocation: 'Allocation' }
    ),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custodian Distribution</CardTitle>

        <div data-testid="allocation-chart" className="mt-2">
          <ChartContainer config={chartConfig} className="h-12 w-full aspect-auto">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="allocation" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {chartConfig[String(name)]?.label ?? String(name)}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatPercent(Number(value) / 100)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {data.map((custodian) => (
                <Bar
                  key={custodian.custodianId}
                  dataKey={custodian.custodianId}
                  stackId="allocation"
                  fill={`var(--color-${custodian.custodianId})`}
                  radius={6}
                  onClick={() => onCustodianClick?.(custodian.custodianId)}
                  className="cursor-pointer"
                />
              ))}
            </BarChart>
          </ChartContainer>

          <div className="mt-3 flex flex-wrap gap-4">
            {data.map((custodian) => (
              <div key={custodian.custodianId} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getCustodianColor(custodian.custodianName) }}
                />
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
