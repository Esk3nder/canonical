'use client'

/**
 * CustodianTable Component
 * Logo-heavy list showing custodian allocation and performance
 */

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

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

const PARTNER_BRANDS: Record<
  string,
  { bg: string; text: string; initials?: string; logo?: string }
> = {
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

  for (const [key, brand] of Object.entries(PARTNER_BRANDS)) {
    if (nameLower === key || nameLower.startsWith(key)) {
      return brand
    }
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const colors = ['bg-slate-600', 'bg-zinc-600', 'bg-neutral-600', 'bg-stone-600']
  const colorIndex = name.length % colors.length
  return { bg: colors[colorIndex], text: 'text-white', initials }
}

export function CustodianTable({ data, isLoading, onCustodianClick }: CustodianTableProps) {
  const { currency, ethPrice } = useCurrency()

  if (isLoading) {
    return (
      <Card className="h-full border-slate-200 bg-white">
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full border-slate-200 bg-white">
        <CardContent className="flex h-full items-center justify-center p-5">
          <span className="text-sm text-slate-400">No custodian data</span>
        </CardContent>
      </Card>
    )
  }

  const sorted = [...data].sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)))

  return (
    <Card data-testid="custodian-table" className="h-full border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Custodians
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 border-b border-slate-100 px-3 py-2 text-xs uppercase tracking-wide text-slate-400">
          <span className="w-11" />
          <span>Partner</span>
          <span className="w-24 text-right">Stake</span>
          <span className="w-20 text-right">30d APY</span>
        </div>

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
                  'grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 px-3 py-3',
                  'cursor-pointer transition-colors hover:bg-slate-50'
                )}
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={custodian.custodianName}
                    width={44}
                    height={44}
                    className="h-11 w-11 flex-shrink-0 rounded-lg object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-base font-bold shadow-sm',
                      brand.bg,
                      brand.text
                    )}
                  >
                    {brand.initials}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{custodian.custodianName}</div>
                  <div className="text-xs text-slate-400">
                    {custodian.validatorCount.toLocaleString()} validators
                  </div>
                </div>

                <div className="w-24 text-right text-sm font-medium tabular-nums text-slate-900">
                  {formatted}
                  {suffix ? ` ${suffix}` : ''}
                </div>

                <div className="w-20 text-right text-sm font-medium tabular-nums text-emerald-600">
                  {(custodian.trailingApy30d * 100).toFixed(2)}%
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
