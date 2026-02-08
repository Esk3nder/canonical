'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type TimePeriod = 30 | 60 | 90 | 'all'

interface TimePeriodContextType {
  timePeriod: TimePeriod
  setTimePeriod: (period: TimePeriod) => void
  timePeriodDays: number | null
  timePeriodLabel: string
}

const TimePeriodContext = createContext<TimePeriodContextType | undefined>(undefined)

export function TimePeriodProvider({ children }: { children: ReactNode }) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(30)

  const timePeriodDays = timePeriod === 'all' ? null : timePeriod
  const timePeriodLabel = timePeriod === 'all' ? 'All' : `${timePeriod}d`

  return (
    <TimePeriodContext.Provider
      value={{ timePeriod, setTimePeriod, timePeriodDays, timePeriodLabel }}
    >
      {children}
    </TimePeriodContext.Provider>
  )
}

export function useTimePeriod(): TimePeriodContextType {
  const context = useContext(TimePeriodContext)
  if (context === undefined) {
    throw new Error('useTimePeriod must be used within a TimePeriodProvider')
  }
  return context
}
