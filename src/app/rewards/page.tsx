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
import { formatEther, shortenHex } from '@/lib/format'
import { cn } from '@/lib/utils'

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

  // Fetch rewards
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
          <p className="text-gray-600">Track earned ETH from staking validators</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Last 7 Days</div>
              <div className="text-xl font-bold text-green-600">
                +{formatGwei(summary.total7d)} ETH
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Last 30 Days</div>
              <div className="text-xl font-bold text-green-600">
                +{formatGwei(summary.total30d)} ETH
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">All Time</div>
              <div className="text-xl font-bold text-green-600">
                +{formatGwei(summary.totalAllTime)} ETH
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-xl font-bold text-gray-900">
                {summary.eventCount.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-medium">Error loading rewards</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : rewards.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No rewards yet</h3>
            <p className="text-gray-500">
              Rewards will appear here as your validators earn ETH.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reward History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Custodian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Epoch
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rewards.map((reward) => (
                    <tr
                      key={reward.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/validators/${reward.validatorId}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(reward.timestamp)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900">
                          {shortenHex(reward.validatorPubkey, 6)}
                        </code>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reward.custodianName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reward.epoch ? reward.epoch.toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-green-600 font-medium">
                          +{formatGwei(reward.amount)} ETH
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            reward.finalized
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {reward.finalized ? 'Finalized' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * pageSize + 1} to{' '}
                  {Math.min(page * pageSize, total)} of {total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={cn(
                      'px-3 py-1 border rounded text-sm',
                      page <= 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className={cn(
                      'px-3 py-1 border rounded text-sm',
                      page >= totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
