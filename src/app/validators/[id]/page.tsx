'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatEther, formatPercent, formatDateTime, shortenHex } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ValidatorData {
  id: string
  pubkey: string
  operatorId: string
  operatorName: string
  custodianId: string
  custodianName: string
  withdrawalCredential: string
  status: string
  stakeState: string
  balance: string
  effectiveBalance: string
  activationEpoch?: number
  exitEpoch?: number
  trailingApy30d: number
  rewardsTotal: string
  penalties: string
  lastActivityTimestamp: string
  createdAt: string
  updatedAt: string
}

interface EventData {
  id: string
  eventType: string
  amount: string
  epoch?: number
  slot?: number
  txHash?: string
  timestamp: string
  finalized: boolean
  evidenceLinks?: Array<{
    type: string
    id: string
    label: string
    url?: string
  }>
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  deposit: 'bg-blue-100 text-blue-800',
  activation: 'bg-green-100 text-green-800',
  reward: 'bg-purple-100 text-purple-800',
  penalty: 'bg-red-100 text-red-800',
  exit_initiated: 'bg-orange-100 text-orange-800',
  exit_completed: 'bg-gray-100 text-gray-800',
  withdrawal: 'bg-cyan-100 text-cyan-800',
}

export default function ValidatorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const validatorId = params.id as string

  const [data, setData] = useState<ValidatorData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchValidator() {
      try {
        setLoading(true)

        // Fetch validator details
        const res = await fetch(`/api/validators/${validatorId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Validator not found')
          } else {
            throw new Error('Failed to fetch validator')
          }
          return
        }
        const json = await res.json()
        setData(json.data)

        // Fetch events
        const eventsRes = await fetch(`/api/validators/${validatorId}/events?pageSize=20`)
        if (eventsRes.ok) {
          const eventsJson = await eventsRes.json()
          setEvents(eventsJson.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (validatorId) {
      fetchValidator()
    }
  }, [validatorId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-8 h-4 w-96" />
            <div className="mb-8 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            data-testid="back-button"
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="text-red-600">{error || 'Failed to load validator'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            data-testid="back-button"
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <h1 data-testid="validator-pubkey" className="text-xl font-bold text-gray-900 font-mono">
              {shortenHex(data.pubkey, 10)}
            </h1>
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                data.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : data.status === 'slashed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {data.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            State: {data.stakeState.replace('_', ' ')}
          </p>
        </div>

        {/* Context */}
        <div data-testid="validator-context" className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Context</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Custodian</p>
              <p
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => router.push(`/custodians/${data.custodianId}`)}
              >
                {data.custodianName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Operator</p>
              <p className="text-gray-900">{data.operatorName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Activation Epoch</p>
              <p className="text-gray-900">{data.activationEpoch ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Withdrawal Credential</p>
              <code className="text-xs text-gray-600">
                {shortenHex(data.withdrawalCredential, 8)}
              </code>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div data-testid="validator-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Balance</p>
            <p className="text-xl font-bold text-gray-900">
              {formatEther(data.balance)} ETH
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">30d APY</p>
            <p className="text-xl font-bold text-green-600">
              {formatPercent(data.trailingApy30d)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Total Rewards</p>
            <p className="text-xl font-bold text-purple-600">
              {formatEther(data.rewardsTotal)} ETH
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Penalties</p>
            <p className="text-xl font-bold text-red-600">
              {formatEther(data.penalties)} ETH
            </p>
          </div>
        </div>

        {/* Event Timeline */}
        <div data-testid="event-timeline" className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Event History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded',
                        EVENT_TYPE_COLORS[event.eventType] || 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {event.eventType.replace('_', ' ')}
                    </span>
                    <div>
                      <p className="text-sm text-gray-900">
                        {event.amount !== '0' && `${formatEther(event.amount)} ETH`}
                        {event.epoch && ` • Epoch ${event.epoch}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(event.timestamp)}
                        {event.finalized && ' • Finalized'}
                      </p>
                    </div>
                  </div>
                  {/* Evidence Links */}
                  {event.evidenceLinks && event.evidenceLinks.length > 0 && (
                    <div data-testid="evidence-links" className="flex gap-2">
                      {event.evidenceLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No events recorded
              </div>
            )}
          </div>
        </div>

        {/* Last Activity */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Last activity: {formatDateTime(data.lastActivityTimestamp)}
        </div>
      </div>
    </div>
  )
}
