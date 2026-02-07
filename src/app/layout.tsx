import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'

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
      <body className={GeistSans.className}>
        <CurrencyProvider>
          <SidebarProvider>
            <div className="[--header-height:4rem]">
              <SiteHeader />
              <div className="flex">
                <AppSidebar />
                <SidebarInset>
                  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
                </SidebarInset>
              </div>
            </div>
          </SidebarProvider>
        </CurrencyProvider>
      </body>
    </html>
  )
}
