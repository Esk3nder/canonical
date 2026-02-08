'use client'

import { type TimePeriod, useTimePeriod } from '@/contexts/TimePeriodContext'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' },
  { value: 'all', label: 'All' },
]

export function TimePeriodToggle() {
  const { timePeriod, setTimePeriod } = useTimePeriod()

  return (
    <ToggleGroup
      type="single"
      value={String(timePeriod)}
      onValueChange={(value) => {
        if (value) {
          setTimePeriod(value === 'all' ? 'all' : (Number(value) as TimePeriod))
        }
      }}
      className="rounded-lg bg-muted p-1"
      aria-label="Time period"
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem
          key={String(option.value)}
          value={String(option.value)}
          className="h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          aria-label={`Show ${option.label}`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
