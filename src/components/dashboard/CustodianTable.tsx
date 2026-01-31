'use client'

/**
 * CustodianTable Component
 * Minimal table showing custodian allocation and performance
 */

import { formatCurrency } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'

interface CustodianData {
  custodianId: string
  custodianName: string
  value: string
  percentage: number
  trailingApy30d: number
  validatorCount: number
}

interface CustodianTableProps {
  data: CustodianData[] | null
  isLoading?: boolean
  onCustodianClick?: (custodianId: string) => void
}

// Partner brand colors for logos
const PARTNER_BRANDS: Record<string, { bg: string; text: string; initials?: string }> = {
  coinbase: { bg: 'bg-blue-600', text: 'text-white', initials: 'CB' },
  anchorage: { bg: 'bg-slate-800', text: 'text-white', initials: 'AN' },
  figment: { bg: 'bg-purple-600', text: 'text-white', initials: 'FG' },
  lido: { bg: 'bg-sky-500', text: 'text-white', initials: 'LD' },
  kraken: { bg: 'bg-violet-700', text: 'text-white', initials: 'KR' },
  bitgo: { bg: 'bg-blue-500', text: 'text-white', initials: 'BG' },
  fireblocks: { bg: 'bg-orange-500', text: 'text-white', initials: 'FB' },
  'self-node': { bg: 'bg-emerald-600', text: 'text-white', initials: 'SN' },
}

function getPartnerBrand(name: string) {
  const key = name.toLowerCase().replace(/\s+/g, '-')
  if (PARTNER_BRANDS[key]) return PARTNER_BRANDS[key]

  // Generate initials and a consistent color for unknown partners
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-slate-600', 'bg-zinc-600', 'bg-neutral-600', 'bg-stone-600']
  const colorIndex = name.length % colors.length
  return { bg: colors[colorIndex], text: 'text-white', initials }
}

export function CustodianTable({
  data,
  isLoading,
  onCustodianClick,
}: CustodianTableProps) {
  const { currency, ethPrice } = useCurrency()

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-40" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 h-full flex items-center justify-center">
        <span className="text-sm text-slate-400">No custodian data</span>
      </div>
    )
  }

  // Sort by value descending
  const sorted = [...data].sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)))

  return (
    <div data-testid="custodian-table" className="bg-white border border-slate-200 rounded-lg p-5 h-full">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Custodians
      </h3>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr,auto,auto] gap-4 px-3 py-2 text-xs text-slate-400 uppercase tracking-wide">
          <span>Partner</span>
          <span className="text-right w-24">Stake</span>
          <span className="text-right w-16">APY</span>
        </div>

        {/* Rows */}
        {sorted.map((custodian, idx) => {
          const { value: formatted, suffix } = formatCurrency(custodian.value, currency, ethPrice)

          return (
            <div
              key={custodian.custodianId}
              data-testid={`custodian-row-${idx}`}
              onClick={() => onCustodianClick?.(custodian.custodianId)}
              className={cn(
                'grid grid-cols-[1fr,auto,auto] gap-4 px-3 py-3 rounded-md',
                'hover:bg-slate-50 cursor-pointer transition-colors'
              )}
            >
              {/* Logo and name with allocation bar */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Partner logo */}
                {(() => {
                  const brand = getPartnerBrand(custodian.custodianName)
                  return (
                    <div className={cn(
                      'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                      'text-xs font-semibold',
                      brand.bg, brand.text
                    )}>
                      {brand.initials}
                    </div>
                  )
                })()}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {custodian.custodianName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(custodian.percentage * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${custodian.percentage * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stake value */}
              <span className="text-sm tabular-nums text-slate-700 text-right w-24">
                {formatted}{suffix ? ` ${suffix}` : ''}
              </span>

              {/* APY */}
              <span className="text-sm tabular-nums text-emerald-600 text-right w-16">
                {(custodian.trailingApy30d * 100).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
