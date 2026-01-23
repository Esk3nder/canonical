'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatEther, formatPercent, shortenHex } from '@/lib/format'
import { cn } from '@/lib/utils'

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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            data-testid="back-button"
            onClick={() => router.push('/')}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="text-red-600">{error || 'Failed to load custodian'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            data-testid="back-button"
            onClick={() => router.push('/')}
            className="mb-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 data-testid="custodian-name" className="text-2xl font-bold text-gray-900">
            {data.name}
          </h1>
          {data.description && (
            <p className="text-gray-500 mt-1">{data.description}</p>
          )}
        </div>

        {/* Performance Metrics */}
        <div data-testid="performance-metrics" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 uppercase">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatEther(data.totalValue)} ETH
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 uppercase">Validators</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.validatorCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 uppercase">30d APY</p>
            <p className="text-2xl font-bold text-green-600">
              {formatPercent(data.trailingApy30d)}
            </p>
          </div>
        </div>

        {/* Operator Breakdown */}
        <div data-testid="operator-breakdown" className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Operators</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {data.operators.map((op) => (
              <div key={op.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{op.name}</p>
                  {op.description && (
                    <p className="text-sm text-gray-500">{op.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {op.validatorCount} validators
                  </p>
                </div>
              </div>
            ))}
            {data.operators.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No operators found
              </div>
            )}
          </div>
        </div>

        {/* Validator List */}
        <div data-testid="validator-list" className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Validators</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pubkey
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    State
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.validators.map((v, idx) => (
                  <tr
                    key={v.id}
                    data-testid={`validator-row-${idx}`}
                    onClick={() => router.push(`/validators/${v.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <code className="text-sm font-mono">
                        {shortenHex(v.pubkey, 8)}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          v.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {v.stakeState.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatEther(v.balance)} ETH
                    </td>
                  </tr>
                ))}
                {data.validators.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No validators found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
