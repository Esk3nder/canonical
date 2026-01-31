/**
 * Morning Check Flow E2E Tests
 *
 * Tests the primary user journey: landing on dashboard → reading KPIs →
 * checking buckets → drilling down if needed
 */
import { test, expect } from '@playwright/test'

test.describe('Morning check flow', () => {
  test('complete morning check journey', async ({ page }) => {
    // Step 1: Land on dashboard
    await page.goto('/')

    // Step 2: KPIs visible above the fold
    await expect(page.getByTestId('portfolio-value')).toBeVisible()
    await expect(page.getByTestId('trailing-apy')).toBeVisible()
    // Validator count moved out of KPI bands

    // Step 3: State buckets visible
    await expect(page.getByTestId('bucket-deposited')).toBeVisible()
    await expect(page.getByTestId('bucket-entryQueue')).toBeVisible()
    await expect(page.getByTestId('bucket-active')).toBeVisible()
    await expect(page.getByTestId('bucket-exiting')).toBeVisible()
    await expect(page.getByTestId('bucket-withdrawable')).toBeVisible()

    // Step 4: Custodian distribution visible
    await expect(page.getByTestId('custodian-table')).toBeVisible()

    // Step 5: Can drill down to custodian
    const custodianRow = page.locator('[data-testid="custodian-row-0"]')
    if (await custodianRow.isVisible()) {
      await custodianRow.click()
      await expect(page).toHaveURL(/\/custodians\//)

      // Custodian detail loads
      await expect(page.getByTestId('custodian-name')).toBeVisible()

      // Can drill down to validator
      const validatorRow = page.locator('[data-testid="validator-row-0"]')
      if (await validatorRow.isVisible()) {
        await validatorRow.click()
        await expect(page).toHaveURL(/\/validators\//)

        // Validator detail loads
        await expect(page.getByTestId('validator-pubkey')).toBeVisible()
      }
    }
  })

  test('dashboard loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    // Wait for main content to be visible
    await expect(page.getByTestId('portfolio-value')).toBeVisible()

    const loadTime = Date.now() - startTime

    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('exception summary visible if exceptions exist', async ({ page }) => {
    await page.goto('/')

    // Exception summary component should be present
    const exceptionSummary = page.getByTestId('exception-summary')
    await expect(exceptionSummary).toBeVisible()
  })

  test('can navigate to exception queue from dashboard', async ({ page }) => {
    await page.goto('/')

    // Find and click exception queue link
    const exceptionLink = page.locator('a[href="/exceptions"]').or(
      page.getByText('View all exceptions')
    )

    if (await exceptionLink.isVisible()) {
      await exceptionLink.click()
      await expect(page).toHaveURL('/exceptions')
    }
  })

  test('can navigate to reports from dashboard', async ({ page }) => {
    await page.goto('/')

    // Find and click reports link
    const reportsLink = page.locator('a[href="/reports"]')

    if (await reportsLink.isVisible()) {
      await reportsLink.click()
      await expect(page).toHaveURL('/reports')
    }
  })
})

test.describe('Dashboard data display', () => {
  test('portfolio value is formatted correctly', async ({ page }) => {
    await page.goto('/')

    const portfolioValue = page.getByTestId('portfolio-value')
    await expect(portfolioValue).toBeVisible()

    // Should contain "ETH" suffix
    const text = await portfolioValue.textContent()
    expect(text).toContain('ETH')
  })

  test('APY is displayed as percentage', async ({ page }) => {
    await page.goto('/')

    const apy = page.getByTestId('trailing-apy')
    await expect(apy).toBeVisible()

    // Should contain percentage sign
    const text = await apy.textContent()
    expect(text).toContain('%')
  })

  test('state buckets show values and percentages', async ({ page }) => {
    await page.goto('/')

    const buckets = ['deposited', 'entryQueue', 'active', 'exiting', 'withdrawable']

    for (const bucket of buckets) {
      const element = page.getByTestId(`bucket-${bucket}`)
      if (await element.isVisible()) {
        const text = await element.textContent()
        // Should contain ETH value
        expect(text?.toLowerCase()).toMatch(/eth|%/)
      }
    }
  })
})

test.describe('Navigation', () => {
  test('all main navigation links work', async ({ page }) => {
    await page.goto('/')

    // Test navigation to each main section
    const routes = [
      { link: 'a[href="/reports"]', url: '/reports' },
      { link: 'a[href="/exceptions"]', url: '/exceptions' },
    ]

    for (const route of routes) {
      await page.goto('/')
      const link = page.locator(route.link)
      if (await link.isVisible()) {
        await link.click()
        await expect(page).toHaveURL(route.url)
      }
    }
  })

  test('back navigation works from drilldown pages', async ({ page }) => {
    // Go to custodian detail and back
    await page.goto('/custodians/test-id')
    await page.click('text=Back')
    await expect(page).toHaveURL('/')

    // Go to validator detail and back
    await page.goto('/validators/test-id')
    await page.click('text=Back')
    // Should go back (either to dashboard or custodian)
  })
})
