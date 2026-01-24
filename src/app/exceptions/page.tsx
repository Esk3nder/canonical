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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type ExceptionStatus = 'new' | 'investigating' | 'resolved'
type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical'
type ExceptionType = 'portfolio_value_change' | 'validator_count_change' | 'in_transit_stuck' | 'rewards_anomaly' | 'performance_divergence'

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

const STATUS_STYLES: Record<ExceptionStatus, string> = {
  new: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
}

const SEVERITY_STYLES: Record<ExceptionSeverity, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-gray-400 text-white',
}

const TYPE_LABELS: Record<ExceptionType, string> = {
  portfolio_value_change: 'Portfolio Value Change',
  validator_count_change: 'Validator Count Change',
  in_transit_stuck: 'In-Transit Stuck',
  rewards_anomaly: 'Rewards Anomaly',
  performance_divergence: 'Performance Divergence',
}

export default function ExceptionsPage() {
  const router = useRouter()

  // State
  const [exceptions, setExceptions] = useState<ExceptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Filters
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<ExceptionSeverity | 'all'>('all')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    investigating: 0,
    resolved: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  })

  // Fetch exceptions
  useEffect(() => {
    fetchExceptions()
  }, [page, statusFilter, severityFilter])

  // Fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchExceptions() {
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
  }

  async function fetchStats() {
    try {
      // Fetch counts for each status
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
  }

  async function handleStatusUpdate(exceptionId: string, newStatus: ExceptionStatus) {
    try {
      const res = await fetch(`/api/exceptions/${exceptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      // Refresh data
      await Promise.all([fetchExceptions(), fetchStats()])
    } catch (err) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Exception Queue</h1>
          <p className="text-gray-600">Monitor and resolve portfolio anomalies</p>
        </div>

        {/* Stats Cards */}
        <div data-testid="exception-stats" className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-sm text-red-700">New</div>
            <div className="text-2xl font-bold text-red-800">{stats.new}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-yellow-700">Investigating</div>
            <div className="text-2xl font-bold text-yellow-800">{stats.investigating}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-green-700">Resolved</div>
            <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                data-testid="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ExceptionStatus | 'all')
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                data-testid="severity-filter"
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value as ExceptionSeverity | 'all')
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exception List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-medium">Error loading exceptions</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : exceptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No exceptions found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'all' || severityFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'All systems operating normally.'}
            </p>
          </div>
        ) : (
          <div data-testid="exception-list" className="space-y-4">
            {exceptions.map((exception) => (
              <div
                key={exception.id}
                data-testid={`exception-${exception.id}`}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          SEVERITY_STYLES[exception.severity]
                        )}>
                          {exception.severity.toUpperCase()}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          STATUS_STYLES[exception.status]
                        )}>
                          {exception.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {TYPE_LABELS[exception.type]}
                        </span>
                      </div>
                      <h3
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => router.push(`/exceptions/${exception.id}`)}
                      >
                        {exception.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {exception.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Detected: {formatDate(exception.detectedAt)}</span>
                        {exception.evidenceLinks.length > 0 && (
                          <span data-testid="evidence-link" className="text-blue-600">
                            {exception.evidenceLinks.length} evidence link(s)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {exception.status !== 'resolved' && (
                        <>
                          {exception.status === 'new' && (
                            <button
                              onClick={() => handleStatusUpdate(exception.id, 'investigating')}
                              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                            >
                              Investigate
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(exception.id, 'resolved')}
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => router.push(`/exceptions/${exception.id}`)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
