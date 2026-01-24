import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { CurrencyToggle } from '@/components/CurrencyToggle'

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
            <nav className="bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-slate-900">
                      Canonical
                    </span>
                    <span className="ml-2 text-sm text-slate-500">
                      Staking Portfolio
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
                      Overview
                    </a>
                    <a href="/reports" className="text-sm text-slate-600 hover:text-slate-900">
                      Reports
                    </a>
                    <a href="/exceptions" className="text-sm text-slate-600 hover:text-slate-900">
                      Exceptions
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <CurrencyToggle />
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {children}
            </main>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  )
}
