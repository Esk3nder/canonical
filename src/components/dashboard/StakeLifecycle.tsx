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
    color: 'bg-muted-foreground',
    earning: false,
    timeLabel: '~1-2 days',
  },
  {
    key: 'entryQueue',
    stateKey: 'pending_activation',
    label: 'Entry Queue',
    sublabel: 'Awaiting activation',
    color: 'bg-apricot',
    earning: false,
    timeLabel: '~4 days',
  },
  {
    key: 'active',
    stateKey: 'active',
    label: 'Active',
    sublabel: 'Earning rewards',
    color: 'bg-primary',
    earning: true,
    timeLabel: null,
  },
  {
    key: 'exiting',
    stateKey: 'exiting',
    label: 'Exiting',
    sublabel: 'In withdrawal queue',
    color: 'bg-terra-cotta',
    earning: false,
    timeLabel: '~1-5 days',
  },
  {
    key: 'withdrawable',
    stateKey: 'withdrawable',
    label: 'Withdrawable',
    sublabel: 'Ready for treasury',
    color: 'bg-plex-blue',
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
      <Card className="h-full border-border bg-card">
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
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Stake Lifecycle
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {(() => {
              const { value, suffix } = formatCurrency(totalValue, currency, ethPrice)
              return `${value}${suffix ? ` ${suffix}` : ''} total`
            })()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-1 grid grid-cols-[auto,1fr,auto,auto] gap-3 border-b border-border px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="w-3" />
          <span>Stage</span>
          <span className="w-24 text-right">Amount</span>
          <span className="w-16 text-right">Time</span>
        </div>

        <div className="divide-y divide-border">
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
                  'grid cursor-pointer grid-cols-[auto,1fr,auto,auto] items-center gap-3 px-2 py-3 transition-colors hover:bg-muted',
                  !hasValue && 'opacity-50'
                )}
              >
                <div className="flex w-3 flex-col items-center self-stretch">
                  <div
                    className={cn(
                      'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                      stage.color,
                      stage.earning && 'ring-2 ring-primary/30'
                    )}
                  />
                  {idx < STAGES.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', stage.earning ? 'text-primary' : 'text-foreground')}>
                      {stage.label}
                    </span>
                    {stage.earning && (
                      <Badge variant="success" className="px-1.5 py-0 text-[10px] uppercase tracking-wide">
                        Earning
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{stage.sublabel}</span>
                </div>

                <div className="w-24 text-right">
                  <span className="tabular-nums text-sm font-medium text-foreground">
                    {formatted}
                    {suffix ? ` ${suffix}` : ''}
                  </span>
                  {percent > 0 && (
                    <div className="tabular-nums text-xs text-muted-foreground">{percent.toFixed(1)}%</div>
                  )}
                </div>

                <div className="w-16 text-right">
                  {stage.timeLabel ? (
                    <span className="text-xs text-muted-foreground">{stage.timeLabel}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">-</span>
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
