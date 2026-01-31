'use client'

/**
 * StakeLifecycle Component
 * Vertical waterfall showing the 5 stake lifecycle stages
 */

import { formatCurrency } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'

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
      <div className="bg-white border border-slate-200 rounded-lg p-5 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const total = BigInt(totalValue || '1')
  const getPercent = (val: string) => total === 0n ? 0 : (Number(BigInt(val)) / Number(total)) * 100

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 h-full">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Stake Lifecycle
        </h3>
        <span className="text-xs text-slate-400">
          {(() => {
            const { value, suffix } = formatCurrency(totalValue, currency, ethPrice)
            return `${value}${suffix ? ` ${suffix}` : ''} total`
          })()}
        </span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[auto,1fr,auto,auto] gap-3 px-2 py-1.5 text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100 mb-1">
        <span className="w-3"></span>
        <span>Stage</span>
        <span className="text-right w-24">Amount</span>
        <span className="text-right w-16">Time</span>
      </div>

      {/* Stages */}
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
                'grid grid-cols-[auto,1fr,auto,auto] gap-3 items-center px-2 py-3 transition-colors cursor-pointer',
                'hover:bg-slate-50',
                !hasValue && 'opacity-50'
              )}
            >
              {/* Stage indicator with connecting line */}
              <div className="flex flex-col items-center w-3 self-stretch">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  stage.color,
                  stage.earning && 'ring-2 ring-emerald-200'
                )} />
                {idx < STAGES.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 mt-1" />
                )}
              </div>

              {/* Label and sublabel */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-medium',
                    stage.earning ? 'text-emerald-700' : 'text-slate-700'
                  )}>
                    {stage.label}
                  </span>
                  {stage.earning && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                      earning
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{stage.sublabel}</span>
              </div>

              {/* Amount */}
              <div className="text-right w-24">
                <span className="text-sm font-medium tabular-nums text-slate-900">
                  {formatted}{suffix ? ` ${suffix}` : ''}
                </span>
                {percent > 0 && (
                  <div className="text-xs text-slate-400 tabular-nums">
                    {percent.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Time estimate */}
              <div className="text-right w-16">
                {stage.timeLabel ? (
                  <span className="text-xs text-slate-400">
                    {stage.timeLabel}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300">-</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
