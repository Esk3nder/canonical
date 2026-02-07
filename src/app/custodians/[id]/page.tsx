'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { formatEther, formatPercent, shortenHex } from '@/lib/format'
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface CustodianData {
  id: string
  name: string
  description?: string
  totalValue: string
  validatorCount: number
  trailingApy30d: number
  operators: Array<{
    id: string
    name: string
    description?: string
    validatorCount: number
  }>
  validators: Array<{
    id: string
    pubkey: string
    status: string
    stakeState: string
    balance: string
  }>
  createdAt: string
  updatedAt: string
}

export default function CustodianDetailPage() {
  const router = useRouter()
  const params = useParams()
  const custodianId = params.id as string

  const [data, setData] = useState<CustodianData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCustodian() {
      try {
        setLoading(true)
        const res = await fetch(`/api/custodians/${custodianId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Custodian not found')
          } else {
            throw new Error('Failed to fetch custodian')
          }
          return
        }
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (custodianId) {
      fetchCustodian()
    }
  }, [custodianId])

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
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <Button
          data-testid="back-button"
          variant="link"
          onClick={() => router.push('/')}
          className="mb-4 px-0"
        >
          &larr; Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load custodian'}</AlertDescription>
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
              { label: 'Overview', href: '/', testId: 'back-button' },
              { label: 'Custodians' },
              { label: data.name },
            ]}
          />
        </div>
        <h1 data-testid="custodian-name" className="text-2xl font-bold">
          {data.name}
        </h1>
        {data.description && (
          <p className="text-muted-foreground mt-1">{data.description}</p>
        )}
      </div>

      {/* Performance Metrics */}
      <div data-testid="performance-metrics" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase">Total Value</p>
            <p className="text-2xl font-bold">
              {formatEther(data.totalValue)} ETH
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase">Validators</p>
            <p className="text-2xl font-bold">
              {data.validatorCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase">30d APY</p>
            <p className="text-2xl font-bold text-green-600">
              {formatPercent(data.trailingApy30d)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operator Breakdown */}
      <Card data-testid="operator-breakdown" className="mb-8">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Operators</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {data.operators.map((op) => (
            <div key={op.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{op.name}</p>
                {op.description && (
                  <p className="text-sm text-muted-foreground">{op.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm">{op.validatorCount} validators</p>
              </div>
            </div>
          ))}
          {data.operators.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">No operators found</div>
          )}
        </div>
      </Card>

      {/* Validator List */}
      <Card data-testid="validator-list">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Validators</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Pubkey</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.validators.map((v, idx) => (
              <TableRow
                key={v.id}
                data-testid={`validator-row-${idx}`}
                onClick={() => router.push(`/validators/${v.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <code className="text-sm font-mono">{shortenHex(v.pubkey, 8)}</code>
                </TableCell>
                <TableCell>
                  <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>
                    {v.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {v.stakeState.replace('_', ' ')}
                </TableCell>
                <TableCell className="text-sm">{formatEther(v.balance)} ETH</TableCell>
              </TableRow>
            ))}
            {data.validators.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No validators found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
