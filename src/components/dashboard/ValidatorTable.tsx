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
import { cn } from '@/lib/utils'

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

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  slashed: 'bg-red-100 text-red-800',
  exited: 'bg-slate-100 text-slate-800',
}

const STATE_OPTIONS = [
  { value: '', label: 'All States' },
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
  const [stateFilter, setStateFilter] = useState('')

  if (isLoading) {
    return (
      <div data-testid="table-loading" className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-200 rounded w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-slate-500">
        No validators found
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  const handleFilterChange = (value: string) => {
    setStateFilter(value)
    onFilterChange?.({ stakeState: value || undefined })
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with filters */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Validators</h3>
        <div className="flex items-center gap-4">
          <select
            data-testid="state-filter"
            value={stateFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div data-testid="validator-table" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Validator
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Custodian
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                APY
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((validator) => (
              <tr
                key={validator.id}
                onClick={() => onRowClick?.(validator.id)}
                className="hover:bg-slate-50 cursor-pointer"
                role="row"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <code className="text-sm font-mono text-slate-900">
                    {shortenHex(validator.pubkey, 6)}
                  </code>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                  {validator.operatorName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  {validator.custodianName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      STATUS_COLORS[validator.status] || 'bg-slate-100 text-slate-800'
                    )}
                  >
                    {validator.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-medium tabular-nums">
                  {formatEther(validator.balance)}<span className="unit-symbol">ETH</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {validator.trailingApy30d !== undefined && validator.trailingApy30d > 0 ? (
                    <span className="text-green-600 font-medium tabular-nums">
                      {(validator.trailingApy30d * 100).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          data-testid="pagination"
          className="px-4 py-3 border-t border-slate-200 flex items-center justify-between"
        >
          <div className="text-sm text-slate-500 tabular-nums">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} validators
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="prev-page"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className={cn(
                'px-3 py-1 border rounded text-sm',
                page <= 1
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              Previous
            </button>
            <span className="text-sm text-slate-700 tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              data-testid="next-page"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className={cn(
                'px-3 py-1 border rounded text-sm',
                page >= totalPages
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
