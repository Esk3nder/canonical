'use client'

/**
 * ExceptionSummary Component
 *
 * Collapsible alert banner showing open exceptions:
 * - Collapsed (default): compact row with count, severity dots, top exception
 * - Expanded: full list of recent exceptions
 */

import { useState } from 'react'
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

const SEVERITY_DOT_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

const BANNER_COLORS: Record<string, string> = {
  critical: 'bg-red-50 border-red-200',
  high: 'bg-orange-50 border-orange-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-blue-50 border-blue-200',
  none: 'bg-green-50 border-green-200',
}

const COUNT_COLORS: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
  none: 'bg-slate-500 text-white',
}

const SEVERITY_BADGE_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
}

function getHighestSeverity(bySeverity: ExceptionSummaryData['bySeverity']): string {
  if (bySeverity.critical > 0) return 'critical'
  if (bySeverity.high > 0) return 'high'
  if (bySeverity.medium > 0) return 'medium'
  if (bySeverity.low > 0) return 'low'
  return 'none'
}

export function ExceptionSummary({
  data,
  isLoading,
  onViewAll,
  onExceptionClick,
}: ExceptionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div data-testid="summary-loading" className="bg-white rounded-lg shadow px-4 py-3">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-6 w-6 bg-slate-200 rounded-full" />
          <div className="h-4 bg-slate-200 rounded w-48" />
        </div>
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className={cn('rounded-lg border px-4 py-3', BANNER_COLORS.none)}>
        <div className="flex items-center gap-3">
          <span className="text-green-600 text-lg">✓</span>
          <span className="text-sm text-green-800">No open exceptions</span>
        </div>
      </div>
    )
  }

  const { bySeverity } = data
  const highestSeverity = getHighestSeverity(bySeverity)
  const topException = data.recent[0]

  return (
    <div
      data-testid="exception-summary"
      className={cn('rounded-lg border overflow-hidden', BANNER_COLORS[highestSeverity])}
    >
      {/* Compact banner row */}
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Expand/collapse toggle */}
        <button
          data-testid="expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 text-slate-500 hover:text-slate-700"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse exceptions' : 'Expand exceptions'}
        >
          <svg
            className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Count badge */}
        <span
          data-testid="exception-count"
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold tabular-nums',
            COUNT_COLORS[highestSeverity]
          )}
        >
          {data.total}
        </span>

        {/* Severity breakdown */}
        <div data-testid="severity-breakdown" className="flex items-center gap-2 text-xs tabular-nums">
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

        {/* Separator */}
        <span className="text-slate-300">|</span>

        {!isExpanded ? (
          topException ? (
            <button
              onClick={() => onExceptionClick?.(topException.id)}
              className="flex-1 min-w-0 text-left group"
            >
              <span className="text-sm text-slate-700 truncate block group-hover:text-slate-900">
                {topException.title}
              </span>
            </button>
          ) : (
            <span className="flex-1 text-sm text-slate-600">
              No recent exceptions available
            </span>
          )
        ) : (
          <span className="flex-1 text-sm font-medium text-slate-700">Open Exceptions</span>
        )}

        {/* New badge */}
        {!isExpanded && topException?.isNew && (
          <span
            data-testid="exception-new-badge"
            className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
          >
            New
          </span>
        )}

        {/* View All */}
        <button
          data-testid="view-all-exceptions"
          onClick={onViewAll}
          className="flex-shrink-0 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All →
        </button>
      </div>

      {/* Expanded exceptions list */}
      {isExpanded && (
        <div data-testid="exceptions-list" className="border-t border-slate-200 bg-white divide-y divide-slate-100">
          {data.recent.map((exception, index) => (
            <div
              key={exception.id}
              onClick={() => onExceptionClick?.(exception.id)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    SEVERITY_DOT_COLORS[exception.severity]
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {exception.title}
                    </p>
                    {exception.isNew && index === 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {formatDateTime(exception.detectedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded border',
                    SEVERITY_BADGE_COLORS[exception.severity]
                  )}
                >
                  {exception.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
