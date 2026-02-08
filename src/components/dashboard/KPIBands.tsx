'use client'

/**
 * KPIBands Component
 *
 * Displays key portfolio metrics in a prominent band layout:
 * - Total Portfolio Value (with dual currency display and 24h change) - CLICKABLE to expand
 * - Trailing 30-day APY - CLICKABLE to expand
 * - Rewards Pulse - CLICKABLE to expand
 */

import { useState } from 'react'

import { useCurrency } from '@/contexts/CurrencyContext'
import { formatCurrency, formatEthChange, formatEther, formatUSD } from '@/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { APYExpandedModal } from './APYExpandedModal'
import { PortfolioExpandedModal } from './PortfolioExpandedModal'
import { RewardsPulseModal } from './RewardsPulseModal'

interface StateBuckets {
  deposited: string
  entryQueue: string
  active: string
  exiting: string
  withdrawable: string
}

interface CustodianAllocation {
  custodianId: string
  custodianName: string
  value: string
  percentage: number
  trailingApy30d: number
  validatorCount: number
  change7d?: number
  change30d?: number
}

interface KPIData {
  totalValue: string
  change24h?: string
  trailingApy30d: number
  previousMonthApy?: number
  networkBenchmarkApy?: number
  validatorCount: number
  stateBuckets?: StateBuckets
  custodianBreakdown?: CustodianAllocation[]
  asOfTimestamp?: string
}

interface CustodianReward {
  custodianId: string
  custodianName: string
  amount: string
}

interface RewardsPulseData {
  claimableNow: string
  claimable24hChange: string
  custodianBreakdown: CustodianReward[]
  accrued: string
  claimedThisMonth: string
  asOfTimestamp: string
}

interface KPIBandsProps {
  data: KPIData | null
  isLoading: boolean
  error?: string
  rewardsPulse?: {
    data: RewardsPulseData | null
    isLoading: boolean
    error?: string
  }
  timePeriodLabel?: string
}

export function KPIBands({ data, isLoading, error, rewardsPulse, timePeriodLabel = '30d' }: KPIBandsProps) {
  const { currency, ethPrice } = useCurrency()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApyExpanded, setIsApyExpanded] = useState(false)
  const [isRewardsExpanded, setIsRewardsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div data-testid="kpi-loading" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-2 pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert data-testid="kpi-error" variant="destructive">
        <AlertTitle>Error loading portfolio data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  const usdFormatted = formatCurrency(data.totalValue, 'USD', ethPrice)
  const ethFormatted = formatCurrency(data.totalValue, 'ETH', ethPrice)

  const isPrimaryUSD = currency === 'USD'
  const primaryValue = isPrimaryUSD ? usdFormatted : ethFormatted
  const secondaryValue = isPrimaryUSD ? ethFormatted : usdFormatted

  const change24hFormatted = data.change24h ? formatEthChange(data.change24h) : null
  const isPositiveChange = data.change24h ? BigInt(data.change24h) >= 0n : true

  const formattedApy = (data.trailingApy30d * 100).toFixed(1)

  const apyChange =
    data.previousMonthApy !== undefined
      ? (data.trailingApy30d - data.previousMonthApy) * 100
      : null
  const isApyPositive = apyChange !== null && apyChange >= 0

  const formattedBenchmark =
    data.networkBenchmarkApy !== undefined ? (data.networkBenchmarkApy * 100).toFixed(1) : null

  const defaultStateBuckets: StateBuckets = data?.stateBuckets ?? {
    deposited: data?.totalValue ? ((BigInt(data.totalValue) * 1n) / 100n).toString() : '0',
    entryQueue: data?.totalValue ? ((BigInt(data.totalValue) * 1n) / 100n).toString() : '0',
    active: data?.totalValue ? ((BigInt(data.totalValue) * 96n) / 100n).toString() : '0',
    exiting: data?.totalValue ? ((BigInt(data.totalValue) * 1n) / 100n).toString() : '0',
    withdrawable: data?.totalValue ? ((BigInt(data.totalValue) * 1n) / 100n).toString() : '0',
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border shadow transition-all duration-200 hover:shadow-lg">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full rounded-xl p-6 text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.99]"
          >
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Portfolio Value</p>

            <p
              data-testid="portfolio-value"
              className="mt-2 tabular-nums text-3xl font-bold text-foreground transition-all duration-200"
            >
              {primaryValue.value}
              {primaryValue.suffix && ` ${primaryValue.suffix}`}
            </p>

            <div className="mt-1 flex items-center gap-2 transition-all duration-200">
              <span className="tabular-nums text-lg text-muted-foreground">
                {secondaryValue.value}
                {secondaryValue.suffix && ` ${secondaryValue.suffix}`}
              </span>
              {change24hFormatted && (
                <span
                  data-testid="portfolio-change-24h"
                  className={`tabular-nums text-sm font-medium ${
                    isPositiveChange ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {change24hFormatted} (24h)
                </span>
              )}
            </div>
          </button>
        </Card>

        <Card className="border-border shadow transition-all duration-200 hover:shadow-lg">
          <button
            onClick={() => setIsApyExpanded(true)}
            className="w-full rounded-xl p-6 text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.99]"
          >
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Global Blended APY</p>
            <div className="mt-3 flex items-baseline gap-3">
              <p data-testid="trailing-apy" className="tabular-nums text-3xl font-bold text-success">
                {formattedApy}%
              </p>
              {formattedBenchmark && (
                <span className="tabular-nums text-sm text-muted-foreground">CESR: {formattedBenchmark}%</span>
              )}
            </div>
            {apyChange !== null && (
              <p
                data-testid="apy-change"
                className={`tabular-nums mt-1 text-sm font-medium ${
                  isApyPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {isApyPositive ? '+' : ''}
                {apyChange.toFixed(1)}% vs prev {timePeriodLabel}
              </p>
            )}
          </button>
        </Card>

        {rewardsPulse?.isLoading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ) : rewardsPulse?.error ? (
          <Alert variant="destructive">
            <AlertTitle>Error loading rewards</AlertTitle>
          </Alert>
        ) : rewardsPulse?.data ? (
          <Card className="border-border shadow transition-all duration-200 hover:shadow-lg">
            <button
              onClick={() => setIsRewardsExpanded(true)}
              className="w-full rounded-xl p-6 text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.99]"
            >
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Rewards <span className="normal-case font-normal">(Last {timePeriodLabel === 'All' ? 'All Time' : timePeriodLabel})</span>
              </p>

              <p className="mt-2 tabular-nums text-3xl font-bold text-foreground">
                {formatEther(rewardsPulse.data.claimableNow)}
                <span className="unit-symbol">ETH</span>
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="tabular-nums text-lg text-muted-foreground">
                  {formatUSD(rewardsPulse.data.claimableNow, ethPrice)}
                </span>
                <span
                  className={`tabular-nums text-sm font-medium ${
                    BigInt(rewardsPulse.data.claimable24hChange) >= 0n
                      ? 'text-success'
                      : 'text-destructive'
                  }`}
                >
                  {formatEthChange(rewardsPulse.data.claimable24hChange)} (24h)
                </span>
              </div>
            </button>
          </Card>
        ) : null}
      </div>

      <PortfolioExpandedModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        data={{
          totalValue: data.totalValue,
          change24h: data.change24h,
          stateBuckets: defaultStateBuckets,
          custodianBreakdown: data.custodianBreakdown ?? [],
          asOfTimestamp: data.asOfTimestamp ?? new Date().toISOString(),
        }}
      />

      <APYExpandedModal
        isOpen={isApyExpanded}
        onClose={() => setIsApyExpanded(false)}
        timePeriodLabel={timePeriodLabel}
        data={{
          trailingApy30d: data.trailingApy30d,
          previousMonthApy: data.previousMonthApy,
          networkBenchmarkApy: data.networkBenchmarkApy,
          custodianBreakdown: data.custodianBreakdown ?? [],
          asOfTimestamp: data.asOfTimestamp ?? new Date().toISOString(),
        }}
      />

      {rewardsPulse?.data && (
        <RewardsPulseModal
          isOpen={isRewardsExpanded}
          onClose={() => setIsRewardsExpanded(false)}
          data={rewardsPulse.data}
          timePeriodLabel={timePeriodLabel}
        />
      )}
    </>
  )
}
