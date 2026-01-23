'use client'

/**
 * ExceptionSummary Component
 *
 * Displays a summary of open exceptions:
 * - Total count with severity breakdown
 * - Most critical/recent exceptions
 * - Quick link to exception queue
 * - Highlights new exceptions
 */

import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ExceptionItem {
  id: string
  type: string
  title: string
  severity: string
  detectedAt: string
  isNew?: boolean
}

interface ExceptionSummaryData {
  total: number
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recent: ExceptionItem[]
}

interface ExceptionSummaryProps {
  data: ExceptionSummaryData | null
  isLoading?: boolean
  onViewAll?: () => void
  onExceptionClick?: (exceptionId: string) => void
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
}

const SEVERITY_DOT_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

export function ExceptionSummary({
  data,
  isLoading,
  onViewAll,
  onExceptionClick,
}: ExceptionSummaryProps) {
  if (isLoading) {
    return (
      <div data-testid="summary-loading" className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-16 bg-gray-200 rounded w-24 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Open Exceptions
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-gray-500">No open exceptions</p>
          <p className="text-sm text-gray-400">All systems operating normally</p>
        </div>
      </div>
    )
  }

  const { bySeverity } = data

  return (
    <div data-testid="exception-summary" className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Open Exceptions</h3>
          <button
            data-testid="view-all-exceptions"
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All →
          </button>
        </div>

        {/* Count and breakdown */}
        <div className="flex items-end gap-6">
          <div>
            <p
              data-testid="exception-count"
              className={cn(
                'text-5xl font-bold',
                bySeverity.critical > 0 ? 'text-red-600' : 'text-orange-600'
              )}
            >
              {data.total}
            </p>
            <p className="text-sm text-gray-500">Open Issues</p>
          </div>

          <div data-testid="severity-breakdown" className="flex gap-3 text-sm">
            {bySeverity.critical > 0 && (
              <span className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full', SEVERITY_DOT_COLORS.critical)} />
                {bySeverity.critical} Critical
              </span>
            )}
            {bySeverity.high > 0 && (
              <span className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full', SEVERITY_DOT_COLORS.high)} />
                {bySeverity.high} High
              </span>
            )}
            {bySeverity.medium > 0 && (
              <span className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full', SEVERITY_DOT_COLORS.medium)} />
                {bySeverity.medium} Medium
              </span>
            )}
            {bySeverity.low > 0 && (
              <span className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full', SEVERITY_DOT_COLORS.low)} />
                {bySeverity.low} Low
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent exceptions list */}
      <div className="divide-y divide-gray-100">
        {data.recent.map((exception, index) => (
          <div
            key={exception.id}
            onClick={() => onExceptionClick?.(exception.id)}
            className="p-4 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 w-2 h-2 rounded-full flex-shrink-0',
                  SEVERITY_DOT_COLORS[exception.severity]
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {exception.title}
                  </p>
                  {exception.isNew && index === 0 && (
                    <span
                      data-testid="exception-new-badge"
                      className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    >
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDateTime(exception.detectedAt)}
                </p>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded border',
                  SEVERITY_COLORS[exception.severity]
                )}
              >
                {exception.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
