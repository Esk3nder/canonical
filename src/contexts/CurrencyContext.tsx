'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type Currency = 'ETH' | 'USD'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  ethPrice: number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const ETH_PRICE_USD = 3200

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('ETH')

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, ethPrice: ETH_PRICE_USD }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
