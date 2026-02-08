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
      className="rounded-lg bg-muted p-1"
      aria-label="Display currency"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          aria-label={`Show ${option}`}
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
