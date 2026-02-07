'use client'

/**
 * StakeLifecycle Component
 * Vertical waterfall showing the 5 stake lifecycle stages
 */

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StakeLifecycleData {
  deposited: string
  entryQueue: string
  active: string
  exiting: string
  withdrawable: string
}

interface StakeLifecycleProps {
  data: StakeLifecycleData | null
  totalValue: string
  isLoading?: boolean
  onStateClick?: (state: string) => void
}

const STAGES = [
  {
    key: 'deposited',
    stateKey: 'deposited',
    label: 'Deposited',
    sublabel: 'Awaiting validator creation',
    color: 'bg-slate-400',
    earning: false,
    timeLabel: '~1-2 days',
  },
  {
    key: 'entryQueue',
    stateKey: 'pending_activation',
    label: 'Entry Queue',
    sublabel: 'Awaiting activation',
    color: 'bg-amber-400',
    earning: false,
    timeLabel: '~4 days',
  },
  {
    key: 'active',
    stateKey: 'active',
    label: 'Active',
    sublabel: 'Earning rewards',
    color: 'bg-emerald-500',
    earning: true,
    timeLabel: null,
  },
  {
    key: 'exiting',
    stateKey: 'exiting',
    label: 'Exiting',
    sublabel: 'In withdrawal queue',
    color: 'bg-orange-400',
    earning: false,
    timeLabel: '~1-5 days',
  },
  {
    key: 'withdrawable',
    stateKey: 'withdrawable',
    label: 'Withdrawable',
    sublabel: 'Ready for treasury',
    color: 'bg-blue-400',
    earning: false,
    timeLabel: null,
  },
]

export function StakeLifecycle({
  data,
  totalValue,
  isLoading,
  onStateClick,
}: StakeLifecycleProps) {
  const { currency, ethPrice } = useCurrency()

  if (isLoading) {
    return (
      <Card className="h-full border-slate-200 bg-white">
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const total = BigInt(totalValue || '1')
  const getPercent = (val: string) => (total === 0n ? 0 : (Number(BigInt(val)) / Number(total)) * 100)

  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Stake Lifecycle
          </CardTitle>
          <span className="text-xs text-slate-400">
            {(() => {
              const { value, suffix } = formatCurrency(totalValue, currency, ethPrice)
              return `${value}${suffix ? ` ${suffix}` : ''} total`
            })()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-1 grid grid-cols-[auto,1fr,auto,auto] gap-3 border-b border-slate-100 px-2 py-1.5 text-xs uppercase tracking-wide text-slate-400">
          <span className="w-3" />
          <span>Stage</span>
          <span className="w-24 text-right">Amount</span>
          <span className="w-16 text-right">Time</span>
        </div>

        <div className="divide-y divide-slate-50">
          {STAGES.map((stage, idx) => {
            const value = data[stage.key as keyof StakeLifecycleData]
            const percent = getPercent(value)
            const { value: formatted, suffix } = formatCurrency(value, currency, ethPrice)
            const hasValue = BigInt(value) > 0n

            return (
              <div
                key={stage.key}
                data-testid={`bucket-${stage.key}`}
                onClick={() => onStateClick?.(stage.stateKey)}
                className={cn(
                  'grid cursor-pointer grid-cols-[auto,1fr,auto,auto] items-center gap-3 px-2 py-3 transition-colors hover:bg-slate-50',
                  !hasValue && 'opacity-50'
                )}
              >
                <div className="flex w-3 flex-col items-center self-stretch">
                  <div
                    className={cn(
                      'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                      stage.color,
                      stage.earning && 'ring-2 ring-emerald-200'
                    )}
                  />
                  {idx < STAGES.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-200" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', stage.earning ? 'text-emerald-700' : 'text-slate-700')}>
                      {stage.label}
                    </span>
                    {stage.earning && (
                      <Badge variant="success" className="px-1.5 py-0 text-[10px] uppercase tracking-wide">
                        Earning
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{stage.sublabel}</span>
                </div>

                <div className="w-24 text-right">
                  <span className="tabular-nums text-sm font-medium text-slate-900">
                    {formatted}
                    {suffix ? ` ${suffix}` : ''}
                  </span>
                  {percent > 0 && (
                    <div className="tabular-nums text-xs text-slate-400">{percent.toFixed(1)}%</div>
                  )}
                </div>

                <div className="w-16 text-right">
                  {stage.timeLabel ? (
                    <span className="text-xs text-slate-400">{stage.timeLabel}</span>
                  ) : (
                    <span className="text-xs text-slate-300">-</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
