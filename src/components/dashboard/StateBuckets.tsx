'use client'

/**
 * StateBuckets Component
 *
 * Displays the four state buckets for staking assets:
 * - Active (staking and earning)
 * - In Transit (pending activation or moving)
 * - Rewards (claimable/unclaimed)
 * - Exiting (withdrawal in progress)
 */

import { formatEther, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

interface StateBucketsData {
  active: string
  inTransit: string
  rewards: string
  exiting: string
}

interface StateBucketsProps {
  data: StateBucketsData | null
  totalValue: string
  isLoading?: boolean
  anomalyThreshold?: number
  onBucketClick?: (bucket: string) => void
}

const BUCKET_CONFIG = [
  {
    key: 'active',
    label: 'Active Stake',
    description: 'Currently staking and earning rewards',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    key: 'inTransit',
    stateKey: 'in_transit',
    label: 'In Transit',
    description: 'Pending activation or moving between validators',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'rewards',
    label: 'Rewards',
    description: 'Claimable and unclaimed rewards',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  {
    key: 'exiting',
    label: 'Exiting',
    description: 'Withdrawal in progress',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
]

export function StateBuckets({
  data,
  totalValue,
  isLoading,
  anomalyThreshold = 0.15,
  onBucketClick,
}: StateBucketsProps) {
  if (isLoading) {
    return (
      <div data-testid="buckets-loading" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 animate-pulse"
          >
            <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return null
  }

  const total = BigInt(totalValue || '1')

  const calculatePercentage = (value: string): number => {
    if (total === 0n) return 0
    return Number(BigInt(value)) / Number(total)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {BUCKET_CONFIG.map((bucket) => {
        const value = data[bucket.key as keyof StateBucketsData]
        const percentage = calculatePercentage(value)
        const isAnomaly = bucket.key === 'inTransit' && percentage > anomalyThreshold

        return (
          <div
            key={bucket.key}
            data-testid={`bucket-${bucket.key === 'inTransit' ? 'in-transit' : bucket.key}`}
            onClick={() => onBucketClick?.(bucket.stateKey || bucket.key)}
            className={cn(
              'rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md',
              bucket.bgColor,
              isAnomaly && 'border-2 border-amber-500'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-3 h-3 rounded-full', bucket.color)} />
              <p className={cn('text-sm font-medium', bucket.textColor)}>
                {bucket.label}
              </p>
            </div>

            <p className="text-2xl font-bold text-gray-900">
              {formatEther(value)} ETH
            </p>

            <p className="text-sm text-gray-500">
              {formatPercent(percentage)}
            </p>

            {isAnomaly && (
              <p className="mt-1 text-xs text-amber-600 font-medium">
                Above threshold
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
