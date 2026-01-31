'use client'

/**
 * CustodianTable Component
 * Logo-heavy list showing custodian allocation and performance
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

// Partner brand colors and logos
const PARTNER_BRANDS: Record<string, { bg: string; text: string; initials?: string; logo?: string }> = {
  coinbase: { bg: 'bg-blue-600', text: 'text-white', initials: 'CB', logo: '/logos/coinbase.png' },
  anchorage: { bg: 'bg-black', text: 'text-white', initials: 'AN', logo: '/logos/anchorage.png' },
  figment: { bg: 'bg-purple-600', text: 'text-white', initials: 'FG' },
  lido: { bg: 'bg-sky-500', text: 'text-white', initials: 'LD' },
  kraken: { bg: 'bg-violet-700', text: 'text-white', initials: 'KR' },
  bitgo: { bg: 'bg-blue-500', text: 'text-white', initials: 'BG', logo: '/logos/bitgo.png' },
  fireblocks: { bg: 'bg-orange-500', text: 'text-white', initials: 'FB' },
  'self-node': { bg: 'bg-emerald-600', text: 'text-white', initials: 'SN' },
}

function getPartnerBrand(name: string) {
  const nameLower = name.toLowerCase()

  // Check for exact match first, then partial match (e.g., "Coinbase Prime" matches "coinbase")
  for (const [key, brand] of Object.entries(PARTNER_BRANDS)) {
    if (nameLower === key || nameLower.startsWith(key)) {
      return brand
    }
  }

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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-11 h-11 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-100 rounded w-16" />
                </div>
              </div>
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

      {/* Table header */}
      <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 px-3 py-2 text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
        <span className="w-11"></span>
        <span>Partner</span>
        <span className="text-right w-24">Stake</span>
        <span className="text-right w-20">30d APY</span>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-slate-50">
        {sorted.map((custodian, idx) => {
          const { value: formatted, suffix } = formatCurrency(custodian.value, currency, ethPrice)
          const brand = getPartnerBrand(custodian.custodianName)

          return (
            <div
              key={custodian.custodianId}
              data-testid={`custodian-row-${idx}`}
              onClick={() => onCustodianClick?.(custodian.custodianId)}
              className={cn(
                'grid grid-cols-[auto,1fr,auto,auto] gap-4 items-center px-3 py-3',
                'hover:bg-slate-50 cursor-pointer transition-colors'
              )}
            >
              {/* Partner logo */}
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={custodian.custodianName}
                  className="w-11 h-11 rounded-lg flex-shrink-0 object-cover shadow-sm"
                />
              ) : (
                <div className={cn(
                  'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
                  'text-base font-bold shadow-sm',
                  brand.bg, brand.text
                )}>
                  {brand.initials}
                </div>
              )}

              {/* Name and validators */}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {custodian.custodianName}
                </div>
                <div className="text-xs text-slate-400">
                  {custodian.validatorCount.toLocaleString()} validators
                </div>
              </div>

              {/* Stake value */}
              <div className="text-sm font-medium text-slate-900 tabular-nums text-right w-24">
                {formatted}{suffix ? ` ${suffix}` : ''}
              </div>

              {/* APY */}
              <div className="text-sm font-medium text-emerald-600 tabular-nums text-right w-20">
                {(custodian.trailingApy30d * 100).toFixed(2)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
