'use client'

import { useCallback, useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'

import { getCustodianColor } from '@/lib/custodian-colors'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'

interface CustodianInfo {
  id: string
  name: string
}

interface AprHistoryData {
  series: Array<Record<string, number | string>>
  custodians: CustodianInfo[]
  windowDays: number
}

type ChartDays = 30 | 60 | 90

const PERIOD_OPTIONS: { value: ChartDays; label: string }[] = [
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' },
]

export function CustodianAprChart() {
  const [days, setDays] = useState<ChartDays>(30)
  const [data, setData] = useState<AprHistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  const fetchData = useCallback(async (numDays: number) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/portfolio/apr-history?days=${numDays}`)
      if (!res.ok) throw new Error('Failed to fetch APR history')
      const json = await res.json()
      setData(json.data)
      setError(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(days)
  }, [days, fetchData])

  const toggle = (
    <ToggleGroup
      type="single"
      value={String(days)}
      onValueChange={(value) => {
        if (value) setDays(Number(value) as ChartDays)
      }}
      className="rounded-lg bg-muted p-1"
      aria-label="Chart time period"
    >
      {PERIOD_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={String(option.value)}
          className="h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          aria-label={`Show ${option.label}`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )

  if (isLoading) {
    return (
      <Card data-testid="apr-chart-loading">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          {toggle}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Custodian APR</CardTitle>
            <CardDescription>7-day rolling annualized rate by custodian</CardDescription>
          </div>
          {toggle}
        </CardHeader>
        <CardContent className="py-8 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.series.length === 0 || data.custodians.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Custodian APR</CardTitle>
            <CardDescription>7-day rolling annualized rate by custodian</CardDescription>
          </div>
          {toggle}
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No APR data available
        </CardContent>
      </Card>
    )
  }

  const { series, custodians } = data

  // Build chart config dynamically from custodians
  const chartConfig = custodians.reduce<ChartConfig>((config, c) => {
    config[c.id] = {
      label: c.name,
      color: getCustodianColor(c.name),
    }
    return config
  }, {})

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Custodian APR</CardTitle>
          <CardDescription>7-day rolling annualized rate by custodian</CardDescription>
        </div>
        {toggle}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
          <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    if (payload?.[0]?.payload?.date) {
                      return format(parseISO(payload[0].payload.date), 'MMM d, yyyy')
                    }
                    return String(_)
                  }}
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {chartConfig[String(name)]?.label ?? String(name)}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {(Number(value) * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {custodians.map((c) => (
              <Area
                key={c.id}
                type="monotone"
                dataKey={c.id}
                fill={`var(--color-${c.id})`}
                stroke={`var(--color-${c.id})`}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
