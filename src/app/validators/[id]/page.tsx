'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { formatEther, formatPercent, formatDateTime, shortenHex } from '@/lib/format'
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          data-testid="back-button"
          variant="link"
          onClick={() => router.back()}
          className="mb-4 px-0"
        >
          &larr; Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load validator'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <PageBreadcrumb
            items={[
              { label: 'Overview', href: '/', testId: 'back-button' },
              { label: 'Validators', href: '/validators' },
              { label: shortenHex(data.pubkey, 10) },
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <h1 data-testid="validator-pubkey" className="text-xl font-bold font-mono">
            {shortenHex(data.pubkey, 10)}
          </h1>
          <Badge
            variant={
              data.status === 'active' ? 'default' : data.status === 'slashed' ? 'destructive' : 'secondary'
            }
          >
            {data.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          State: {data.stakeState.replace('_', ' ')}
        </p>
      </div>

      {/* Context */}
      <Card data-testid="validator-context" className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Custodian</p>
              <p
                className="text-primary hover:underline cursor-pointer"
                onClick={() => router.push(`/custodians/${data.custodianId}`)}
              >
                {data.custodianName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Operator</p>
              <p>{data.operatorName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activation Epoch</p>
              <p>{data.activationEpoch ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Withdrawal Credential</p>
              <code className="text-xs text-muted-foreground">
                {shortenHex(data.withdrawalCredential, 8)}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div data-testid="validator-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Balance</p>
            <p className="text-xl font-bold">{formatEther(data.balance)} ETH</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">30d APY</p>
            <p className="text-xl font-bold text-success">{formatPercent(data.trailingApy30d)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Total Rewards</p>
            <p className="text-xl font-bold text-primary">{formatEther(data.rewardsTotal)} ETH</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Penalties</p>
            <p className="text-xl font-bold text-destructive">{formatEther(data.penalties)} ETH</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline */}
      <Card data-testid="event-timeline">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Event History</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {events.map((event) => (
            <div key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {event.eventType.replace('_', ' ')}
                  </Badge>
                  <div>
                    <p className="text-sm">
                      {event.amount !== '0' && `${formatEther(event.amount)} ETH`}
                      {event.epoch && ` \u00b7 Epoch ${event.epoch}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                      {event.finalized && ' \u00b7 Finalized'}
                    </p>
                  </div>
                </div>
                {event.evidenceLinks && event.evidenceLinks.length > 0 && (
                  <div data-testid="evidence-links" className="flex gap-2">
                    {event.evidenceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
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
            <div className="p-8 text-center text-muted-foreground">No events recorded</div>
          )}
        </div>
      </Card>

      {/* Last Activity */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Last activity: {formatDateTime(data.lastActivityTimestamp)}
      </div>
    </div>
  )
}
