'use client'

/**
 * ValidatorTable Component
 *
 * Displays a sortable, filterable, paginated table of validators with:
 * - Pubkey (shortened)
 * - Operator/Custodian
 * - Status and stake state
 * - Balance and performance metrics
 * - Click to navigate to detail view
 */

import { useState } from 'react'

import { formatEther, shortenHex } from '@/lib/format'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ValidatorData {
  id: string
  pubkey: string
  operatorName: string
  custodianName: string
  status: string
  stakeState: string
  balance: string
  effectiveBalance: string
  trailingApy30d?: number
}

interface ValidatorTableProps {
  data: ValidatorData[] | null
  total: number
  page?: number
  pageSize?: number
  isLoading?: boolean
  onPageChange?: (page: number) => void
  onFilterChange?: (filters: { stakeState?: string }) => void
  onRowClick?: (validatorId: string) => void
}

const STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  active: 'active',
  pending: 'pending',
  slashed: 'slashed',
  exited: 'exited',
}

const STATE_OPTIONS = [
  { value: 'all', label: 'All States' },
  { value: 'deposited', label: 'Deposited' },
  { value: 'pending_activation', label: 'Entry Queue' },
  { value: 'active', label: 'Active' },
  { value: 'exiting', label: 'Exiting' },
  { value: 'withdrawable', label: 'Withdrawable' },
]

export function ValidatorTable({
  data,
  total,
  page = 1,
  pageSize = 10,
  isLoading,
  onPageChange,
  onFilterChange,
  onRowClick,
}: ValidatorTableProps) {
  const [stateFilter, setStateFilter] = useState('all')

  if (isLoading) {
    return (
      <Card data-testid="table-loading">
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          No validators found
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  const handleFilterChange = (value: string) => {
    const nextValue = value || 'all'
    setStateFilter(nextValue)
    onFilterChange?.({ stakeState: nextValue === 'all' ? undefined : nextValue })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Validators</CardTitle>
        <Select value={stateFilter} onValueChange={handleFilterChange}>
          <SelectTrigger data-testid="state-filter-trigger" className="w-[180px]">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            {STATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="p-0">
        <div data-testid="validator-table" className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Validator</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Custodian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((validator) => (
                <TableRow
                  key={validator.id}
                  onClick={() => onRowClick?.(validator.id)}
                  className="cursor-pointer"
                  role="row"
                >
                  <TableCell>
                    <code className="font-mono text-sm text-slate-900">
                      {shortenHex(validator.pubkey, 6)}
                    </code>
                  </TableCell>
                  <TableCell className="text-slate-900">{validator.operatorName}</TableCell>
                  <TableCell className="text-slate-500">{validator.custodianName}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[validator.status] ?? 'secondary'}>
                      {validator.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums font-medium text-slate-900">
                    {formatEther(validator.balance)}<span className="unit-symbol">ETH</span>
                  </TableCell>
                  <TableCell>
                    {validator.trailingApy30d !== undefined &&
                    validator.trailingApy30d > 0 ? (
                      <span className="tabular-nums font-medium text-green-600">
                        {(validator.trailingApy30d * 100).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div
            data-testid="pagination"
            className="flex items-center justify-between border-t border-slate-200 px-4 py-3"
          >
            <div className="tabular-nums text-sm text-slate-500">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
              {total} validators
            </div>
            <div className="flex items-center gap-2">
              <Button
                data-testid="prev-page"
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="tabular-nums text-sm text-slate-700">
                Page {page} of {totalPages}
              </span>
              <Button
                data-testid="next-page"
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
