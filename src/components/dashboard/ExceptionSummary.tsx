'use client'

/**
 * ExceptionSummary Component
 *
 * Collapsible alert banner showing open exceptions:
 * - Collapsed (default): compact row with count, severity dots, top exception
 * - Expanded: full list of recent exceptions
 */

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

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

function getHighestSeverity(bySeverity: ExceptionSummaryData['bySeverity']): string {
  if (bySeverity.critical > 0) return 'critical'
  if (bySeverity.high > 0) return 'high'
  if (bySeverity.medium > 0) return 'medium'
  if (bySeverity.low > 0) return 'low'
  return 'none'
}

function getSeverityVariant(severity: string): BadgeProps['variant'] {
  if (severity === 'critical') return 'critical'
  if (severity === 'high') return 'high'
  if (severity === 'medium') return 'medium'
  return 'info'
}

function getCountVariant(severity: string): BadgeProps['variant'] {
  if (severity === 'critical') return 'critical'
  if (severity === 'high') return 'high'
  if (severity === 'medium') return 'medium'
  if (severity === 'low') return 'low'
  return 'neutral'
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
      <Card data-testid="summary-loading" className="px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </Card>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className={cn('rounded-lg border px-4 py-3', BANNER_COLORS.none)}>
        <div className="flex items-center gap-3">
          <span className="text-lg text-green-600">✓</span>
          <span className="text-sm text-green-800">No open exceptions</span>
        </div>
      </div>
    )
  }

  const { bySeverity } = data
  const highestSeverity = getHighestSeverity(bySeverity)
  const topException = data.recent[0]

  return (
    <Collapsible
      data-testid="exception-summary"
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn('overflow-hidden rounded-lg border', BANNER_COLORS[highestSeverity])}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <CollapsibleTrigger asChild>
          <Button
            data-testid="expand-toggle"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-700"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse exceptions' : 'Expand exceptions'}
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
            />
          </Button>
        </CollapsibleTrigger>

        <Badge
          data-testid="exception-count"
          variant={getCountVariant(highestSeverity)}
          className="h-7 w-7 flex-shrink-0 justify-center rounded-full p-0 text-sm font-bold tabular-nums"
        >
          {data.total}
        </Badge>

        <div data-testid="severity-breakdown" className="flex items-center gap-2 text-xs tabular-nums">
          {bySeverity.critical > 0 && (
            <span className="flex items-center gap-1">
              <span className={cn('h-2 w-2 rounded-full', SEVERITY_DOT_COLORS.critical)} />
              {bySeverity.critical} Critical
            </span>
          )}
          {bySeverity.high > 0 && (
            <span className="flex items-center gap-1">
              <span className={cn('h-2 w-2 rounded-full', SEVERITY_DOT_COLORS.high)} />
              {bySeverity.high} High
            </span>
          )}
          {bySeverity.medium > 0 && (
            <span className="flex items-center gap-1">
              <span className={cn('h-2 w-2 rounded-full', SEVERITY_DOT_COLORS.medium)} />
              {bySeverity.medium} Medium
            </span>
          )}
          {bySeverity.low > 0 && (
            <span className="flex items-center gap-1">
              <span className={cn('h-2 w-2 rounded-full', SEVERITY_DOT_COLORS.low)} />
              {bySeverity.low} Low
            </span>
          )}
        </div>

        <Separator orientation="vertical" className="h-5" />

        {!isExpanded ? (
          topException ? (
            <button
              onClick={() => onExceptionClick?.(topException.id)}
              className="group min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-sm text-slate-700 group-hover:text-slate-900">
                {topException.title}
              </span>
            </button>
          ) : (
            <span className="flex-1 text-sm text-slate-600">No recent exceptions available</span>
          )
        ) : (
          <span className="flex-1 text-sm font-medium text-slate-700">Open Exceptions</span>
        )}

        {!isExpanded && topException?.isNew && (
          <Badge data-testid="exception-new-badge" variant="info">
            New
          </Badge>
        )}

        <Button
          data-testid="view-all-exceptions"
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onViewAll}
        >
          View All →
        </Button>
      </div>

      <CollapsibleContent>
        <div
          data-testid="exceptions-list"
          className="divide-y divide-slate-100 border-t border-slate-200 bg-white"
        >
          {data.recent.map((exception, index) => (
            <div
              key={exception.id}
              onClick={() => onExceptionClick?.(exception.id)}
              className="cursor-pointer px-4 py-3 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'h-2 w-2 flex-shrink-0 rounded-full',
                    SEVERITY_DOT_COLORS[exception.severity]
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{exception.title}</p>
                    {exception.isNew && index === 0 && (
                      <Badge data-testid="exception-new-badge" variant="info">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                    {formatDateTime(exception.detectedAt)}
                  </p>
                </div>
                <Badge variant={getSeverityVariant(exception.severity)}>{exception.severity}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
