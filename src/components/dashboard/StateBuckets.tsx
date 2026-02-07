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

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

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
    progressColor: 'bg-slate-500',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
  },
  {
    key: 'entryQueue',
    stateKey: 'pending_activation',
    label: 'Entry Queue',
    description: 'Validator created, awaiting activation',
    color: 'bg-amber-500',
    progressColor: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  {
    key: 'active',
    stateKey: 'active',
    label: 'Active',
    description: 'Currently staking and earning rewards',
    color: 'bg-emerald-500',
    progressColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  {
    key: 'exiting',
    stateKey: 'exiting',
    label: 'Exiting',
    description: 'Exit initiated, in withdrawal queue',
    color: 'bg-orange-500',
    progressColor: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  {
    key: 'withdrawable',
    stateKey: 'withdrawable',
    label: 'Withdrawable',
    description: 'Ready for treasury withdrawal',
    color: 'bg-blue-500',
    progressColor: 'bg-blue-500',
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
      <div data-testid="buckets-loading" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-2 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
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

  const preActivePercentage =
    calculatePercentage(data.deposited) + calculatePercentage(data.entryQueue)

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {BUCKET_CONFIG.map((bucket) => {
        const value = data[bucket.key as keyof StateBucketsData]
        const percentage = calculatePercentage(value)
        const isAnomaly =
          (bucket.key === 'deposited' || bucket.key === 'entryQueue') &&
          preActivePercentage > anomalyThreshold

        return (
          <Card
            key={bucket.key}
            data-testid={`bucket-${bucket.key}`}
            onClick={() => onBucketClick?.(bucket.stateKey || bucket.key)}
            className={cn(
              'cursor-pointer border transition-all hover:shadow-md',
              bucket.bgColor,
              isAnomaly && 'border-amber-500'
            )}
          >
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className={cn('h-3 w-3 rounded-full', bucket.color)} />
                <p className={cn('text-sm font-medium', bucket.textColor)}>{bucket.label}</p>
              </div>

              <p className="tabular-nums text-2xl font-bold text-slate-900">
                {(() => {
                  const { value: formatted, suffix } = formatCurrency(value, currency, ethPrice)
                  return `${formatted}${suffix ? ` ${suffix}` : ''}`
                })()}
              </p>

              <p className="tabular-nums text-sm text-slate-500">{formatPercent(percentage)}</p>
              <Progress
                value={percentage * 100}
                className="mt-2 h-1.5"
                indicatorClassName={bucket.progressColor}
              />

              {isAnomaly && (
                <Badge variant="warning" className="mt-2">
                  Above threshold
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
