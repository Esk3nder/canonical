'use client'

/**
 * Exception Detail Page
 *
 * Shows full exception details:
 * - Exception metadata and description
 * - Evidence links with navigation
 * - Status update workflow
 * - Resolution form
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

type ExceptionStatus = 'new' | 'investigating' | 'resolved'
type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical'
type ExceptionType = 'portfolio_value_change' | 'validator_count_change' | 'in_transit_stuck' | 'rewards_anomaly' | 'performance_divergence'

interface EvidenceLink {
  type: 'validator' | 'custodian' | 'event' | 'external'
  id: string
  label: string
  url?: string
}

interface ExceptionDetail {
  id: string
  type: ExceptionType
  status: ExceptionStatus
  title: string
  description: string
  severity: ExceptionSeverity
  evidenceLinks: EvidenceLink[]
  detectedAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

const SEVERITY_VARIANTS: Record<ExceptionSeverity, 'destructive' | 'secondary'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'secondary',
}

const STATUS_VARIANTS: Record<ExceptionStatus, 'destructive' | 'secondary' | 'default'> = {
  new: 'destructive',
  investigating: 'secondary',
  resolved: 'default',
}

const TYPE_LABELS: Record<ExceptionType, string> = {
  portfolio_value_change: 'Portfolio Value Change',
  validator_count_change: 'Validator Count Change',
  in_transit_stuck: 'In-Transit Stuck',
  rewards_anomaly: 'Rewards Anomaly',
  performance_divergence: 'Performance Divergence',
}

const TYPE_DESCRIPTIONS: Record<ExceptionType, string> = {
  portfolio_value_change: 'An unexpected material change in total portfolio value was detected.',
  validator_count_change: 'The number of validators changed unexpectedly.',
  in_transit_stuck: 'One or more validators have been stuck in transit state beyond the expected threshold.',
  rewards_anomaly: 'Rewards deviated significantly from expected patterns.',
  performance_divergence: 'A custodian or operator is underperforming compared to peers.',
}

export default function ExceptionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const exceptionId = params.id as string

  const [exception, setException] = useState<ExceptionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [resolution, setResolution] = useState('')

  const fetchException = useCallback(async () => {
    if (!exceptionId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/exceptions/${exceptionId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Exception not found')
        } else {
          throw new Error('Failed to fetch exception')
        }
        return
      }
      const json = await res.json()
      setException(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [exceptionId])

  useEffect(() => {
    fetchException()
  }, [fetchException])

  async function handleStatusUpdate(newStatus: ExceptionStatus, resolutionText?: string) {
    try {
      setUpdating(true)
      const body: { status: ExceptionStatus; resolution?: string } = { status: newStatus }
      if (resolutionText) {
        body.resolution = resolutionText
      }

      const res = await fetch(`/api/exceptions/${exceptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to update status')

      await fetchException()
      setShowResolveForm(false)
      setResolution('')
    } catch (error) {
      console.error('Failed to update exception status:', error)
      alert('Failed to update exception')
    } finally {
      setUpdating(false)
    }
  }

  function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getEvidenceUrl(link: EvidenceLink): string {
    if (link.url) return link.url
    switch (link.type) {
      case 'validator':
        return `/validators/${link.id}`
      case 'custodian':
        return `/custodians/${link.id}`
      default:
        return '#'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-8 h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !exception) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="link" onClick={() => router.push('/exceptions')} className="mb-4 px-0">
          &larr; Back to Exception Queue
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load exception'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <PageBreadcrumb
          items={[
            { label: 'Exceptions', href: '/exceptions' },
            { label: exception.title },
          ]}
        />
      </div>

      {/* Exception Card */}
      <Card data-testid="exception-detail">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={SEVERITY_VARIANTS[exception.severity]}>
                {exception.severity.toUpperCase()}
              </Badge>
              <Badge variant={STATUS_VARIANTS[exception.status]}>
                {exception.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {TYPE_LABELS[exception.type]}
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-6">
          <h1 className="text-xl font-bold mb-2">{exception.title}</h1>
          <p className="text-muted-foreground mb-4">{exception.description}</p>

          {/* Type Explanation */}
          <Alert className="mb-6">
            <AlertTitle className="text-sm font-medium">What this means</AlertTitle>
            <AlertDescription>{TYPE_DESCRIPTIONS[exception.type]}</AlertDescription>
          </Alert>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground">Detected</div>
              <div className="font-medium">{formatDateTime(exception.detectedAt)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="font-medium">{formatDateTime(exception.updatedAt)}</div>
            </div>
            {exception.resolvedAt && (
              <>
                <div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                  <div className="font-medium">{formatDateTime(exception.resolvedAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Resolved By</div>
                  <div className="font-medium">{exception.resolvedBy || 'Unknown'}</div>
                </div>
              </>
            )}
          </div>

          {/* Resolution */}
          {exception.resolution && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Resolution</h3>
              <Alert>
                <AlertDescription className="text-turquoise-800">
                  {exception.resolution}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Evidence Links */}
          {exception.evidenceLinks.length > 0 && (
            <div data-testid="evidence-links" className="mb-6">
              <h3 className="text-sm font-medium mb-2">Evidence</h3>
              <div className="space-y-2">
                {exception.evidenceLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={getEvidenceUrl(link)}
                    onClick={(e) => {
                      if (!link.url) {
                        e.preventDefault()
                        router.push(getEvidenceUrl(link))
                      }
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Badge variant="outline">{link.type}</Badge>
                    <span className="text-primary">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {exception.status !== 'resolved' && (
            <>
              <Separator className="mb-6" />
              <h3 className="text-sm font-medium mb-3">Actions</h3>

              {showResolveForm ? (
                <div className="space-y-3">
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe how this exception was resolved..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate('resolved', resolution)}
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : 'Mark as Resolved'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowResolveForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {exception.status === 'new' && (
                    <Button
                      variant="secondary"
                      onClick={() => handleStatusUpdate('investigating')}
                      disabled={updating}
                    >
                      Start Investigation
                    </Button>
                  )}
                  <Button onClick={() => setShowResolveForm(true)}>
                    Resolve Exception
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ID Footer */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Exception ID: {exception.id}
      </div>
    </div>
  )
}
