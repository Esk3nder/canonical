import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { CurrencyToggle } from '@/components/CurrencyToggle'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Canonical Staking Portfolio',
  description: 'Institutional staking portfolio overview and reporting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CurrencyProvider>
          <div className="min-h-screen bg-slate-50">
            <nav className="fixed left-0 right-0 top-0 z-10 border-b border-slate-200 bg-white">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-slate-900">Canonical</span>
                    <span className="ml-2 text-sm text-slate-500">Staking Portfolio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CurrencyToggle />
                    <Button variant="ghost" asChild>
                      <a href="/about">About Us</a>
                    </Button>
                    <Button asChild>
                      <a href="/signin">Sign In</a>
                    </Button>
                  </div>
                </div>
              </div>
            </nav>

            <Sidebar />

            <main className="pl-56 pt-16">
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  )
}
