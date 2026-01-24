'use client'

/**
 * Reports Page
 *
 * Allows users to:
 * - View list of generated reports
 * - Generate new monthly statements
 * - Export reports in CSV/PDF format
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ReportData {
  id: string
  entityId?: string
  periodStart: string
  periodEnd: string
  methodologyVersion: string
  format: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  filePath?: string
  generatedAt?: string
  createdAt: string
}

interface GenerateReportForm {
  periodStart: string
  periodEnd: string
  format: 'json' | 'csv' | 'pdf'
  entityId?: string
}

const FORMAT_OPTIONS = [
  { value: 'json', label: 'JSON', description: 'Machine-readable format' },
  { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
  { value: 'pdf', label: 'PDF', description: 'Print-ready document' },
]

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  generating: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

export default function ReportsPage() {
  const router = useRouter()

  // Reports list state
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate form state
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [form, setForm] = useState<GenerateReportForm>({
    periodStart: getDefaultPeriodStart(),
    periodEnd: getDefaultPeriodEnd(),
    format: 'pdf',
  })

  // Fetch reports on mount
  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      const res = await fetch('/api/reports')
      if (!res.ok) throw new Error('Failed to fetch reports')
      const json = await res.json()
      setReports(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodStart: form.periodStart,
          periodEnd: form.periodEnd,
          format: form.format,
          entityId: form.entityId || undefined,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to generate report')
      }

      // Refresh reports list
      await fetchReports()
      setShowGenerateForm(false)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  function getDefaultPeriodStart(): string {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return lastMonth.toISOString().split('T')[0]
  }

  function getDefaultPeriodEnd(): string {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    return lastDay.toISOString().split('T')[0]
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  async function handleDownload(report: ReportData) {
    try {
      const res = await fetch(`/api/reports/${report.id}/download`)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${report.id}.${report.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report')
    }
  }

  return (
    <div>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and download monthly statements</p>
          </div>
          <button
            data-testid="generate-button"
            onClick={() => setShowGenerateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Report
          </button>
        </div>

        {/* Generate Form Modal */}
        {showGenerateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Generate New Report</h2>

              <form onSubmit={handleGenerate}>
                {/* Period Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Period
                  </label>
                  <div className="flex gap-2">
                    <input
                      data-testid="period-start"
                      type="date"
                      value={form.periodStart}
                      onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <span className="self-center text-gray-500">to</span>
                    <input
                      data-testid="period-end"
                      type="date"
                      value={form.periodEnd}
                      onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Format Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, format: opt.value as 'json' | 'csv' | 'pdf' })}
                        className={cn(
                          'px-3 py-2 border rounded-md text-sm transition-colors',
                          form.format === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                      >
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {generateError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {generateError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="submit-generate"
                    type="submit"
                    disabled={generating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reports List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-medium">Error loading reports</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports yet</h3>
            <p className="text-gray-500 mb-4">Generate your first monthly statement to get started.</p>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Report
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody data-testid="report-list" className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {formatPeriod(report.periodStart, report.periodEnd)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="uppercase text-sm font-medium text-gray-600">
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        STATUS_STYLES[report.status] || 'bg-gray-100 text-gray-800'
                      )}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.generatedAt ? formatDate(report.generatedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/reports/${report.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {report.status === 'completed' && (
                          <button
                            onClick={() => handleDownload(report)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
