'use client'

/**
 * Exception Queue Page
 *
 * Displays and manages the exception queue:
 * - Filterable list of exceptions
 * - Status updates (new → investigating → resolved)
 * - Evidence links
 * - Severity indicators
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/ui/data-table-pagination'

type ExceptionStatus = 'new' | 'investigating' | 'resolved'
type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical'
type ExceptionType =
  | 'portfolio_value_change'
  | 'validator_count_change'
  | 'in_transit_stuck'
  | 'rewards_anomaly'
  | 'performance_divergence'

interface ExceptionData {
  id: string
  type: ExceptionType
  status: ExceptionStatus
  title: string
  description: string
  severity: ExceptionSeverity
  evidenceLinks: Array<{
    type: string
    id: string
    label: string
    url?: string
  }>
  detectedAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS: { value: ExceptionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
]

const SEVERITY_OPTIONS: { value: ExceptionSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const TYPE_LABELS: Record<ExceptionType, string> = {
  portfolio_value_change: 'Portfolio Value Change',
  validator_count_change: 'Validator Count Change',
  in_transit_stuck: 'In-Transit Stuck',
  rewards_anomaly: 'Rewards Anomaly',
  performance_divergence: 'Performance Divergence',
}

function getStatusVariant(status: ExceptionStatus): BadgeProps['variant'] {
  if (status === 'new') return 'danger'
  if (status === 'investigating') return 'warning'
  return 'success'
}

function getSeverityVariant(severity: ExceptionSeverity): BadgeProps['variant'] {
  if (severity === 'critical') return 'critical'
  if (severity === 'high') return 'high'
  if (severity === 'medium') return 'medium'
  return 'neutral'
}

export default function ExceptionsPage() {
  const router = useRouter()

  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<ExceptionSeverity | 'all'>('all')

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    investigating: 0,
    resolved: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  })

  const fetchExceptions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (severityFilter !== 'all') params.set('severity', severityFilter)

      const res = await fetch(`/api/exceptions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch exceptions')
      const json = await res.json()
      setExceptions(json.data)
      setTotal(json.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, severityFilter, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const [newRes, invRes, resRes] = await Promise.all([
        fetch('/api/exceptions?status=new&pageSize=1'),
        fetch('/api/exceptions?status=investigating&pageSize=1'),
        fetch('/api/exceptions?status=resolved&pageSize=1'),
      ])

      const [newJson, invJson, resJson] = await Promise.all([
        newRes.json(),
        invRes.json(),
        resRes.json(),
      ])

      setStats({
        total: newJson.total + invJson.total + resJson.total,
        new: newJson.total,
        investigating: invJson.total,
        resolved: resJson.total,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchExceptions()
  }, [fetchExceptions])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  async function handleStatusUpdate(exceptionId: string, newStatus: ExceptionStatus) {
    try {
      const res = await fetch(`/api/exceptions/${exceptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      await Promise.all([fetchExceptions(), fetchStats()])
    } catch (updateError) {
      console.error('Failed to update exception status:', updateError)
      alert('Failed to update exception status')
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Exception Queue</h1>
          <p className="text-muted-foreground">Monitor and resolve portfolio anomalies</p>
        </div>

        <div data-testid="exception-stats" className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-warm-red/30 bg-warm-red/10">
            <CardContent className="p-4">
              <div className="text-sm text-warm-red">New</div>
              <div className="text-2xl font-bold text-warm-red">{stats.new}</div>
            </CardContent>
          </Card>
          <Card className="border-apricot/30 bg-apricot/10">
            <CardContent className="p-4">
              <div className="text-sm text-terra-cotta">Investigating</div>
              <div className="text-2xl font-bold text-terra-cotta">{stats.investigating}</div>
            </CardContent>
          </Card>
          <Card className="border-turquoise-200 bg-turquoise-100">
            <CardContent className="p-4">
              <div className="text-sm text-turquoise-800">Resolved</div>
              <div className="text-2xl font-bold text-turquoise-800">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="flex flex-wrap gap-4 pt-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as ExceptionStatus | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger data-testid="status-filter" className="w-[200px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Severity</label>
              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value as ExceptionSeverity | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger data-testid="severity-filter" className="w-[220px]">
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="space-y-4 p-8">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error loading exceptions</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : exceptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="mb-1 text-lg font-medium text-foreground">No exceptions found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'All systems operating normally.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div data-testid="exception-list" className="space-y-4">
            {exceptions.map((exception) => (
              <Card key={exception.id} data-testid={`exception-${exception.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant={getSeverityVariant(exception.severity)}>
                          {exception.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusVariant(exception.status)}>{exception.status}</Badge>
                        <span className="text-xs text-muted-foreground">{TYPE_LABELS[exception.type]}</span>
                      </div>

                      <h3
                        className="cursor-pointer font-medium text-foreground hover:text-primary"
                        onClick={() => router.push(`/exceptions/${exception.id}`)}
                      >
                        {exception.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exception.description}</p>

                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Detected: {formatDate(exception.detectedAt)}</span>
                        {exception.evidenceLinks.length > 0 && (
                          <span data-testid="evidence-link" className="text-primary">
                            {exception.evidenceLinks.length} evidence link(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {exception.status !== 'resolved' && (
                        <>
                          {exception.status === 'new' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-apricot/50 bg-apricot/10 text-terra-cotta hover:bg-apricot/20"
                              onClick={() => handleStatusUpdate(exception.id, 'investigating')}
                            >
                              Investigate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-turquoise-200 bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200"
                            onClick={() => handleStatusUpdate(exception.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/exceptions/${exception.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
