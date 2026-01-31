'use client'

/**
 * Report Detail Page
 *
 * Displays a generated report with:
 * - Report metadata
 * - Portfolio summary
 * - Custodian breakdown
 * - Validator schedule (paginated)
 * - Export options
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatEther, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ReportDetail {
  id: string
  entityId?: string
  periodStart: string
  periodEnd: string
  methodologyVersion: string
  format: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  generatedAt?: string
  createdAt: string
  summary?: {
    totalValue: string
    trailingApy30d: number
    validatorCount: number
    stateBuckets: {
      deposited: string
      entryQueue: string
      active: string
      exiting: string
      withdrawable: string
    }
  }
  custodianBreakdown?: Array<{
    custodianId: string
    custodianName: string
    value: string
    percentage: number
    trailingApy30d: number
    validatorCount: number
  }>
  validatorSchedule?: Array<{
    validatorId: string
    pubkey: string
    custodianName: string
    status: string
    balance: string
    trailingApy30d: number
  }>
}

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true)
        const res = await fetch(`/api/reports/${reportId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Report not found')
          } else {
            throw new Error('Failed to fetch report')
          }
          return
        }
        const json = await res.json()
        setReport(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  async function handleDownload(format: string) {
    try {
      const res = await fetch(`/api/reports/${reportId}/download?format=${format}`)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report')
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function formatPeriod(start: string, end: string): string {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const startLabel = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
    const sameMonth =
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()

    if (sameMonth) return startLabel

    const endLabel = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
    return `${startLabel} - ${endLabel}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/reports')}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Reports
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="text-red-600">{error || 'Failed to load report'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/reports')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            &larr; Back to Reports
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 data-testid="report-title" className="text-2xl font-bold text-gray-900">
                Monthly Statement - {formatPeriod(report.periodStart, report.periodEnd)}
              </h1>
              <p className="text-gray-600 mt-1">
                Report ID: {report.id} &middot; Methodology v{report.methodologyVersion}
              </p>
              <p className="text-sm text-gray-500">
                Period: {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('csv')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {report.status !== 'completed' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-yellow-800">Report Generation</h2>
            <p className="text-yellow-700">
              Status: <span className="font-medium capitalize">{report.status}</span>
            </p>
            {report.status === 'generating' && (
              <p className="text-sm text-yellow-600 mt-2">
                Please wait while the report is being generated...
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            {report.summary && (
              <div data-testid="report-preview" className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Portfolio Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Total Value</div>
                    <div className="text-2xl font-bold">
                      {formatEther(report.summary.totalValue)} ETH
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Blended Staking APY</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercent(report.summary.trailingApy30d)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Validators</div>
                    <div className="text-2xl font-bold">
                      {report.summary.validatorCount}
                    </div>
                  </div>
                </div>

                {/* State Buckets */}
                <h3 className="text-md font-semibold mt-6 mb-3">State Buckets</h3>
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-700 uppercase">Deposited</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {formatEther(report.summary.stateBuckets.deposited)} ETH
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-xs text-amber-700 uppercase">Entry Queue</div>
                    <div className="text-lg font-semibold text-amber-800">
                      {formatEther(report.summary.stateBuckets.entryQueue)} ETH
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-xs text-emerald-700 uppercase">Active</div>
                    <div className="text-lg font-semibold text-emerald-800">
                      {formatEther(report.summary.stateBuckets.active)} ETH
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-700 uppercase">Exiting</div>
                    <div className="text-lg font-semibold text-orange-800">
                      {formatEther(report.summary.stateBuckets.exiting)} ETH
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-700 uppercase">Withdrawable</div>
                    <div className="text-lg font-semibold text-blue-800">
                      {formatEther(report.summary.stateBuckets.withdrawable)} ETH
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custodian Breakdown */}
            {report.custodianBreakdown && report.custodianBreakdown.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Custodian Breakdown</h2>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Custodian</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Value (ETH)</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Allocation</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">APY</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Validators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.custodianBreakdown.map((c) => (
                      <tr key={c.custodianId} className="border-b last:border-0">
                        <td className="py-3 font-medium">{c.custodianName}</td>
                        <td className="py-3 text-right">{formatEther(c.value)}</td>
                        <td className="py-3 text-right">{formatPercent(c.percentage)}</td>
                        <td className="py-3 text-right text-green-600">{formatPercent(c.trailingApy30d)}</td>
                        <td className="py-3 text-right">{c.validatorCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Validator Schedule */}
            {report.validatorSchedule && report.validatorSchedule.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Validator Schedule</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-500">Pubkey</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500">Custodian</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">Balance (ETH)</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">APY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.validatorSchedule.slice(0, 20).map((v) => (
                        <tr
                          key={v.validatorId}
                          className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/validators/${v.validatorId}`)}
                        >
                          <td className="py-3 font-mono text-sm">
                            {v.pubkey.slice(0, 10)}...{v.pubkey.slice(-6)}
                          </td>
                          <td className="py-3">{v.custodianName}</td>
                          <td className="py-3">
                            <span className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            )}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">{formatEther(v.balance)}</td>
                          <td className="py-3 text-right text-green-600">{formatPercent(v.trailingApy30d)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {report.validatorSchedule.length > 20 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Showing 20 of {report.validatorSchedule.length} validators. Download the full report for complete data.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
