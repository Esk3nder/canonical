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
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, FileText } from 'lucide-react'

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

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  generating: 'default',
  completed: 'outline',
  failed: 'destructive',
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
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and download monthly statements</p>
          </div>
          <Button data-testid="generate-button" onClick={() => setShowGenerateForm(true)}>
            Generate Report
          </Button>
        </div>

        {/* Generate Form Modal */}
        <Dialog open={showGenerateForm} onOpenChange={setShowGenerateForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleGenerate}>
              {/* Period Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Report Period</label>
                <div className="flex gap-2">
                  <input
                    data-testid="period-start"
                    type="date"
                    value={form.periodStart}
                    onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                  <span className="self-center text-muted-foreground">to</span>
                  <input
                    data-testid="period-end"
                    type="date"
                    value={form.periodEnd}
                    onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Export Format</label>
                <RadioGroup
                  value={form.format}
                  onValueChange={(value) => setForm({ ...form, format: value as 'json' | 'csv' | 'pdf' })}
                  className="grid grid-cols-3 gap-2"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer flex-col items-center rounded-md border p-3 text-sm transition-colors ${
                        form.format === opt.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-input hover:border-muted-foreground'
                      }`}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Error */}
              {generateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{generateError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowGenerateForm(false)}>
                  Cancel
                </Button>
                <Button data-testid="submit-generate" type="submit" disabled={generating}>
                  {generating ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reports List */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading reports</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No reports yet</h3>
              <p className="mt-1 text-muted-foreground">Generate your first monthly statement to get started.</p>
              <Button className="mt-4" onClick={() => setShowGenerateForm(true)}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Period</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-testid="report-list">
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatPeriod(report.periodStart, report.periodEnd)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium uppercase">{report.format}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[report.status] || 'secondary'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.generatedAt ? formatDate(report.generatedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => router.push(`/reports/${report.id}`)}
                        >
                          View
                        </Button>
                        {report.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-success hover:text-success/80"
                            onClick={() => handleDownload(report)}
                          >
                            Download
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
