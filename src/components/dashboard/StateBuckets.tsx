'use client'

/**
 * StateBuckets Component
 *
 * Displays the five state buckets for staking lifecycle:
 * - Deposited (ETH received, awaiting validator creation)
 * - Entry Queue (validator created, awaiting activation)
 * - Active (staking and earning)
 * - Exiting (withdrawal in progress)
 * - Withdrawable (ready for treasury)
 */

import { formatCurrency, formatPercent } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'

interface StateBucketsData {
  deposited: string
  entryQueue: string
  active: string
  exiting: string
  withdrawable: string
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
    key: 'deposited',
    stateKey: 'deposited',
    label: 'Deposited',
    description: 'ETH received, awaiting validator creation',
    color: 'bg-slate-500',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
  },
  {
    key: 'entryQueue',
    stateKey: 'pending_activation',
    label: 'Entry Queue',
    description: 'Validator created, awaiting activation',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  {
    key: 'active',
    stateKey: 'active',
    label: 'Active',
    description: 'Currently staking and earning rewards',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  {
    key: 'exiting',
    stateKey: 'exiting',
    label: 'Exiting',
    description: 'Exit initiated, in withdrawal queue',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  {
    key: 'withdrawable',
    stateKey: 'withdrawable',
    label: 'Withdrawable',
    description: 'Ready for treasury withdrawal',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
]

export function StateBuckets({
  data,
  totalValue,
  isLoading,
  anomalyThreshold = 0.15,
  onBucketClick,
}: StateBucketsProps) {
  const { currency, ethPrice } = useCurrency()

  if (isLoading) {
    return (
      <div data-testid="buckets-loading" className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
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

  // Check for anomaly: deposited + entryQueue (pre-active) above threshold
  const preActivePercentage = calculatePercentage(data.deposited) + calculatePercentage(data.entryQueue)

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {BUCKET_CONFIG.map((bucket) => {
        const value = data[bucket.key as keyof StateBucketsData]
        const percentage = calculatePercentage(value)
        const isAnomaly = (bucket.key === 'deposited' || bucket.key === 'entryQueue') && preActivePercentage > anomalyThreshold

        return (
          <div
            key={bucket.key}
            data-testid={`bucket-${bucket.key}`}
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
              {(() => {
                const { value: formatted, suffix } = formatCurrency(value, currency, ethPrice)
                return `${formatted}${suffix ? ` ${suffix}` : ''}`
              })()}
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
