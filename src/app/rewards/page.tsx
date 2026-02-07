'use client'

/**
 * Rewards Page
 *
 * Displays earned ETH rewards in a table format with:
 * - Summary stats (7d, 30d, all-time totals)
 * - Paginated table of individual reward events
 * - Filtering by date range and validator
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { shortenHex } from '@/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'

interface RewardData {
  id: string
  validatorId: string
  validatorPubkey: string
  operatorName: string
  custodianId: string
  custodianName: string
  amount: string
  epoch: number | null
  timestamp: string
  txHash: string | null
  finalized: boolean
}

interface RewardSummary {
  total7d: string
  total30d: string
  totalAllTime: string
  eventCount: number
}

export default function RewardsPage() {
  const router = useRouter()

  const [rewards, setRewards] = useState<RewardData[]>([])
  const [summary, setSummary] = useState<RewardSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    async function fetchRewards() {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        })

        const res = await fetch(`/api/rewards?${params}`)
        if (!res.ok) throw new Error('Failed to fetch rewards')
        const json = await res.json()

        setRewards(json.data)
        setTotal(json.total)
        setSummary(json.summary)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRewards()
  }, [page])

  const totalPages = Math.ceil(total / pageSize)

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatGwei(amount: string): string {
    const eth = Number(BigInt(amount)) / 1e9
    return eth.toFixed(6)
  }

  return (
    <div>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Rewards</h1>
          <p className="text-slate-600">Track earned ETH from staking validators</p>
        </div>

        {summary && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Last 7 Days</div>
                <div className="text-xl font-bold text-green-600">+{formatGwei(summary.total7d)} ETH</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Last 30 Days</div>
                <div className="text-xl font-bold text-green-600">+{formatGwei(summary.total30d)} ETH</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">All Time</div>
                <div className="text-xl font-bold text-green-600">+{formatGwei(summary.totalAllTime)} ETH</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Total Events</div>
                <div className="text-xl font-bold text-slate-900">
                  {summary.eventCount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error loading rewards</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : rewards.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="mb-1 text-lg font-medium text-slate-900">No rewards yet</h3>
              <p className="text-slate-500">Rewards will appear here as your validators earn ETH.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-200">
              <CardTitle>Reward History</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Custodian</TableHead>
                    <TableHead>Epoch</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow
                      key={reward.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/validators/${reward.validatorId}`)}
                    >
                      <TableCell className="text-sm text-slate-500">{formatDate(reward.timestamp)}</TableCell>
                      <TableCell>
                        <code className="font-mono text-sm text-slate-900">
                          {shortenHex(reward.validatorPubkey, 6)}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{reward.custodianName}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {reward.epoch ? reward.epoch.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-green-600">+{formatGwei(reward.amount)} ETH</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reward.finalized ? 'active' : 'pending'}>
                          {reward.finalized ? 'Finalized' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="border-t border-slate-200 px-4 py-3">
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
