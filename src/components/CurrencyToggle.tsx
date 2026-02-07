'use client'

import { type Currency, useCurrency } from '@/contexts/CurrencyContext'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  const options: Currency[] = ['ETH', 'USD']

  return (
    <ToggleGroup
      type="single"
      value={currency}
      onValueChange={(value) => {
        if (value) {
          setCurrency(value as Currency)
        }
      }}
      className="rounded-lg bg-slate-100 p-1"
      aria-label="Display currency"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className="h-8 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 data-[state=on]:bg-slate-800 data-[state=on]:text-white"
          aria-label={`Show ${option}`}
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
