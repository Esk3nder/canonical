'use client'

/**
 * StakeLifecycle Component
 * Minimal vertical waterfall showing stake states
 */

import { formatCurrency } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'

interface StakeLifecycleData {
  active: string
  inTransit: string
  rewards: string
  exiting: string
}

interface StakeLifecycleProps {
  data: StakeLifecycleData | null
  totalValue: string
  isLoading?: boolean
  onStateClick?: (state: string) => void
}

const STATES = [
  { key: 'active', label: 'Active', color: 'bg-emerald-400' },
  { key: 'inTransit', stateKey: 'in_transit', label: 'Entry Queue', color: 'bg-amber-400' },
  { key: 'exiting', label: 'Exiting', color: 'bg-slate-400' },
  { key: 'rewards', label: 'Rewards', color: 'bg-violet-400' },
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded" />
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
      <div className="flex items-baseline justify-between mb-5">
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

      <div className="space-y-2">
        {STATES.map((state, idx) => {
          const value = data[state.key as keyof StakeLifecycleData]
          const percent = getPercent(value)
          const { value: formatted, suffix } = formatCurrency(value, currency, ethPrice)

          return (
            <div
              key={state.key}
              data-testid={`bucket-${state.key === 'inTransit' ? 'in-transit' : state.key}`}
              onClick={() => onStateClick?.(state.stateKey || state.key)}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer',
                'hover:bg-slate-50'
              )}
            >
              {/* State indicator */}
              <div className="flex flex-col items-center w-4">
                <div className={cn('w-2.5 h-2.5 rounded-full', state.color)} />
                {idx < STATES.length - 1 && (
                  <div className="w-px h-6 bg-slate-200 mt-1" />
                )}
              </div>

              {/* Label and value */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {state.label}
                  </span>
                  <span className="text-sm tabular-nums text-slate-900">
                    {formatted}{suffix ? ` ${suffix}` : ''}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', state.color)}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <span className="text-xs text-slate-400 w-12 text-right tabular-nums">
                {percent.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
