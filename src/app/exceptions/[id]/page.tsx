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
import { cn } from '@/lib/utils'

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

const STATUS_STYLES: Record<ExceptionStatus, string> = {
  new: 'bg-red-100 text-red-800 border-red-200',
  investigating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !exception) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/exceptions')}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Exception Queue
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="text-red-600">{error || 'Failed to load exception'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/exceptions')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            &larr; Back to Exception Queue
          </button>
        </div>

        {/* Exception Card */}
        <div data-testid="exception-detail" className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className={cn(
            'p-4 border-b',
            STATUS_STYLES[exception.status]
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'px-3 py-1 text-sm font-bold rounded',
                  SEVERITY_STYLES[exception.severity]
                )}>
                  {exception.severity.toUpperCase()}
                </span>
                <span className="font-medium capitalize">{exception.status}</span>
              </div>
              <div className="text-sm opacity-75">
                {TYPE_LABELS[exception.type]}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{exception.title}</h1>
            <p className="text-gray-600 mb-4">{exception.description}</p>

            {/* Type Explanation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-1">What this means</h3>
              <p className="text-sm text-gray-600">{TYPE_DESCRIPTIONS[exception.type]}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Detected</div>
                <div className="font-medium">{formatDateTime(exception.detectedAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="font-medium">{formatDateTime(exception.updatedAt)}</div>
              </div>
              {exception.resolvedAt && (
                <>
                  <div>
                    <div className="text-sm text-gray-500">Resolved</div>
                    <div className="font-medium">{formatDateTime(exception.resolvedAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Resolved By</div>
                    <div className="font-medium">{exception.resolvedBy || 'Unknown'}</div>
                  </div>
                </>
              )}
            </div>

            {/* Resolution */}
            {exception.resolution && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">{exception.resolution}</p>
                </div>
              </div>
            )}

            {/* Evidence Links */}
            {exception.evidenceLinks.length > 0 && (
              <div data-testid="evidence-links" className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Evidence</h3>
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
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded',
                        link.type === 'validator' ? 'bg-blue-100 text-blue-800' :
                        link.type === 'custodian' ? 'bg-purple-100 text-purple-800' :
                        link.type === 'event' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {link.type}
                      </span>
                      <span className="text-blue-600">{link.label}</span>
                      <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {exception.status !== 'resolved' && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>

                {showResolveForm ? (
                  <div className="space-y-3">
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how this exception was resolved..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate('resolved', resolution)}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating ? 'Saving...' : 'Mark as Resolved'}
                      </button>
                      <button
                        onClick={() => setShowResolveForm(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {exception.status === 'new' && (
                      <button
                        onClick={() => handleStatusUpdate('investigating')}
                        disabled={updating}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Start Investigation
                      </button>
                    )}
                    <button
                      onClick={() => setShowResolveForm(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolve Exception
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ID Footer */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Exception ID: {exception.id}
        </div>
      </div>
    </div>
  )
}
