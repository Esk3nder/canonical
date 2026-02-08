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
import { AlertCircle } from 'lucide-react'
import { formatEther, formatPercent } from '@/lib/format'
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-8 h-4 w-96" />
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto">
        <Button variant="link" onClick={() => router.push('/reports')} className="mb-4 px-0">
          &larr; Back to Reports
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load report'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <PageBreadcrumb
            items={[
              { label: 'Reports', href: '/reports' },
              { label: formatPeriod(report.periodStart, report.periodEnd) },
            ]}
          />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 data-testid="report-title" className="text-2xl font-bold">
              Monthly Statement - {formatPeriod(report.periodStart, report.periodEnd)}
            </h1>
            <p className="text-muted-foreground mt-1">
              Report ID: {report.id} &middot; Methodology v{report.methodologyVersion}
            </p>
            <p className="text-sm text-muted-foreground">
              Period: {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleDownload('csv')}>
              Export CSV
            </Button>
            <Button onClick={() => handleDownload('pdf')}>Export PDF</Button>
          </div>
        </div>
      </div>

      {report.status !== 'completed' ? (
        <Alert>
          <AlertTitle>Report Generation</AlertTitle>
          <AlertDescription>
            Status: <Badge variant="secondary" className="ml-1">{report.status}</Badge>
            {report.status === 'generating' && (
              <p className="text-sm mt-2">Please wait while the report is being generated...</p>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Portfolio Summary */}
          {report.summary && (
            <Card data-testid="report-preview" className="mb-6">
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Total Value</div>
                      <div className="text-2xl font-bold">
                        {formatEther(report.summary.totalValue)} ETH
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Blended Staking APY</div>
                      <div className="text-2xl font-bold text-success">
                        {formatPercent(report.summary.trailingApy30d)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Validators</div>
                      <div className="text-2xl font-bold">{report.summary.validatorCount}</div>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="my-6" />

                {/* State Buckets */}
                <h3 className="text-md font-semibold mb-3">State Buckets</h3>
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-foreground uppercase">Deposited</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatEther(report.summary.stateBuckets.deposited)} ETH
                    </div>
                  </div>
                  <div className="bg-apricot/10 rounded-lg p-3">
                    <div className="text-xs text-terra-cotta uppercase">Entry Queue</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatEther(report.summary.stateBuckets.entryQueue)} ETH
                    </div>
                  </div>
                  <div className="bg-turquoise-100 rounded-lg p-3">
                    <div className="text-xs text-primary uppercase">Active</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatEther(report.summary.stateBuckets.active)} ETH
                    </div>
                  </div>
                  <div className="bg-terra-cotta/10 rounded-lg p-3">
                    <div className="text-xs text-terra-cotta uppercase">Exiting</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatEther(report.summary.stateBuckets.exiting)} ETH
                    </div>
                  </div>
                  <div className="bg-sky/20 rounded-lg p-3">
                    <div className="text-xs text-plex-blue uppercase">Withdrawable</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatEther(report.summary.stateBuckets.withdrawable)} ETH
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custodian Breakdown */}
          {report.custodianBreakdown && report.custodianBreakdown.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Custodian Breakdown</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Custodian</TableHead>
                    <TableHead className="text-right">Value (ETH)</TableHead>
                    <TableHead className="text-right">Allocation</TableHead>
                    <TableHead className="text-right">APY</TableHead>
                    <TableHead className="text-right">Validators</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.custodianBreakdown.map((c) => (
                    <TableRow key={c.custodianId}>
                      <TableCell className="font-medium">{c.custodianName}</TableCell>
                      <TableCell className="text-right">{formatEther(c.value)}</TableCell>
                      <TableCell className="text-right">{formatPercent(c.percentage)}</TableCell>
                      <TableCell className="text-right text-success">
                        {formatPercent(c.trailingApy30d)}
                      </TableCell>
                      <TableCell className="text-right">{c.validatorCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Validator Schedule */}
          {report.validatorSchedule && report.validatorSchedule.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validator Schedule</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Pubkey</TableHead>
                    <TableHead>Custodian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance (ETH)</TableHead>
                    <TableHead className="text-right">APY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.validatorSchedule.slice(0, 20).map((v) => (
                    <TableRow
                      key={v.validatorId}
                      className="cursor-pointer"
                      onClick={() => router.push(`/validators/${v.validatorId}`)}
                    >
                      <TableCell className="font-mono text-sm">
                        {v.pubkey.slice(0, 10)}...{v.pubkey.slice(-6)}
                      </TableCell>
                      <TableCell>{v.custodianName}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatEther(v.balance)}</TableCell>
                      <TableCell className="text-right text-success">
                        {formatPercent(v.trailingApy30d)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {report.validatorSchedule.length > 20 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 20 of {report.validatorSchedule.length} validators. Download the full
                    report for complete data.
                  </p>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
