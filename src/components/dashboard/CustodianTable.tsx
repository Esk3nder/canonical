'use client'

/**
 * CustodianTable Component
 * Logo-heavy list showing custodian allocation and performance
 */

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { type ColumnDef } from '@tanstack/react-table'
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
  timePeriodLabel?: string
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
  const colors = ['bg-muted-foreground', 'bg-muted-foreground', 'bg-muted-foreground', 'bg-muted-foreground']
  const colorIndex = name.length % colors.length
  return { bg: colors[colorIndex], text: 'text-white', initials }
}

export function CustodianTable({ data, isLoading, onCustodianClick, timePeriodLabel = '30d' }: CustodianTableProps) {
  const { currency, ethPrice } = useCurrency()

  if (isLoading) {
    return (
      <Card className="h-full border-border bg-card">
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
      <Card className="h-full border-border bg-card">
        <CardContent className="flex h-full items-center justify-center p-5">
          <span className="text-sm text-muted-foreground">No custodian data</span>
        </CardContent>
      </Card>
    )
  }
  const columns: ColumnDef<CustodianData>[] = [
    {
      id: 'avatar',
      header: () => <span className="block w-11" />,
      enableSorting: false,
      cell: ({ row }) => {
        const custodian = row.original
        const brand = getPartnerBrand(custodian.custodianName)

        if (brand.logo) {
          return (
            <Image
              src={brand.logo}
              alt={custodian.custodianName}
              width={44}
              height={44}
              className="h-11 w-11 flex-shrink-0 rounded-lg object-cover shadow-sm"
            />
          )
        }

        return (
          <div
            className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-base font-bold shadow-sm',
              brand.bg,
              brand.text
            )}
          >
            {brand.initials}
          </div>
        )
      },
    },
    {
      accessorKey: 'custodianName',
      header: () => <span className="text-xs uppercase tracking-wide text-muted-foreground">Partner</span>,
      cell: ({ row }) => {
        const custodian = row.original
        return (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{custodian.custodianName}</div>
            <div className="text-xs text-muted-foreground">
              {custodian.validatorCount.toLocaleString()} validators
            </div>
          </div>
        )
      },
    },
    {
      id: 'value',
      accessorKey: 'value',
      header: () => (
        <span className="block w-24 text-right text-xs uppercase tracking-wide text-muted-foreground">Stake</span>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = BigInt(rowA.getValue<string>(columnId))
        const b = BigInt(rowB.getValue<string>(columnId))
        if (a === b) return 0
        return a > b ? 1 : -1
      },
      cell: ({ row }) => {
        const { value: formatted, suffix } = formatCurrency(row.original.value, currency, ethPrice)
        return (
          <div className="w-24 text-right text-sm font-medium tabular-nums text-foreground">
            {formatted}
            {suffix ? ` ${suffix}` : ''}
          </div>
        )
      },
    },
    {
      id: 'trailingApy30d',
      accessorKey: 'trailingApy30d',
      header: () => (
        <span className="block w-20 text-right text-xs uppercase tracking-wide text-muted-foreground">{timePeriodLabel} APY</span>
      ),
      cell: ({ row }) => (
        <div className="w-20 text-right text-sm font-medium tabular-nums text-success">
          {(row.original.trailingApy30d * 100).toFixed(2)}%
        </div>
      ),
    },
  ]

  return (
    <Card data-testid="custodian-table" className="h-full border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Custodians
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DataTable
          columns={columns}
          data={data}
          initialSorting={[{ id: 'value', desc: true }]}
          onRowClick={(row) => onCustodianClick?.(row.custodianId)}
          getRowTestId={(_, index) => `custodian-row-${index}`}
        />
      </CardContent>
    </Card>
  )
}
