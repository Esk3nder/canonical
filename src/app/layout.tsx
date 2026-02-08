import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { TimePeriodProvider } from '@/contexts/TimePeriodContext'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
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
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CurrencyProvider>
            <TimePeriodProvider>
              <SidebarProvider>
                <div className="[--header-height:4rem]">
                  <SiteHeader />
                  <div className="flex">
                    <AppSidebar />
                    <SidebarTrigger className="sticky top-[calc(var(--header-height)+0.5rem)] z-10 -ml-3 h-7 w-7 self-start rounded-full border bg-background shadow-sm" />
                    <SidebarInset>
                      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{children}</div>
                    </SidebarInset>
                  </div>
                </div>
              </SidebarProvider>
            </TimePeriodProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
