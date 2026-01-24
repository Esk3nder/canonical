'use client'

import { useCurrency, Currency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  const options: Currency[] = ['ETH', 'USD']

  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setCurrency(option)}
          className={cn(
            'px-3 py-1 text-sm font-medium rounded-md transition-colors',
            currency === option
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
