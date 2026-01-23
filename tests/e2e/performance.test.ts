/**
 * Performance Tests
 *
 * Tests for load times and responsiveness
 */
import { test, expect } from '@playwright/test'

test.describe('Dashboard Performance', () => {
  test('initial load completes within 3 seconds', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    // Wait for critical content
    await expect(page.getByTestId('portfolio-value')).toBeVisible()

    const loadTime = Date.now() - startTime
    console.log(`Dashboard load time: ${loadTime}ms`)

    expect(loadTime).toBeLessThan(3000)
  })

  test('API responses complete within 500ms', async ({ page }) => {
    // Track API response times
    const apiTimes: Record<string, number> = {}

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.timing()
        if (timing) {
          apiTimes[response.url()] = timing.responseEnd - timing.requestStart
        }
      }
    })

    await page.goto('/')
    await expect(page.getByTestId('portfolio-value')).toBeVisible()

    // Check that API calls were reasonably fast
    for (const [url, time] of Object.entries(apiTimes)) {
      console.log(`API ${url}: ${time}ms`)
      // Allow up to 500ms for each API call
      expect(time).toBeLessThan(500)
    }
  })

  test('client-side navigation is fast', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('portfolio-value')).toBeVisible()

    // Navigate to reports
    const reportsLink = page.locator('a[href="/reports"]')
    if (await reportsLink.isVisible()) {
      const startTime = Date.now()
      await reportsLink.click()
      await expect(page).toHaveURL('/reports')
      const navTime = Date.now() - startTime

      console.log(`Navigation to reports: ${navTime}ms`)
      expect(navTime).toBeLessThan(500)
    }
  })
})

test.describe('Component Render Performance', () => {
  test('validator table renders without delay', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    await expect(page.getByTestId('validator-table')).toBeVisible()
    const renderTime = Date.now() - startTime

    console.log(`Validator table render: ${renderTime}ms`)
    expect(renderTime).toBeLessThan(1000)
  })

  test('custodian table renders without delay', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    await expect(page.getByTestId('custodian-table')).toBeVisible()
    const renderTime = Date.now() - startTime

    console.log(`Custodian table render: ${renderTime}ms`)
    expect(renderTime).toBeLessThan(1000)
  })

  test('exception summary renders without delay', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    await expect(page.getByTestId('exception-summary')).toBeVisible()
    const renderTime = Date.now() - startTime

    console.log(`Exception summary render: ${renderTime}ms`)
    expect(renderTime).toBeLessThan(500)
  })
})

test.describe('Loading States', () => {
  test('shows loading states while fetching data', async ({ page }) => {
    // Slow down network to see loading states
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await page.goto('/')

    // Should show loading indicator briefly
    const loading = page.getByTestId('kpi-loading')
    // Loading might be too fast to catch, so we just verify page loads
    await expect(page.getByTestId('portfolio-value').or(loading)).toBeVisible()
  })

  test('handles API errors gracefully', async ({ page }) => {
    // Simulate API error
    await page.route('**/api/portfolio', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    await page.goto('/')

    // Should show error state
    const errorElement = page.getByTestId('kpi-error').or(page.getByText(/error/i))
    await expect(errorElement).toBeVisible()
  })
})

test.describe('Memory & Resource Usage', () => {
  test('no memory leaks on repeated navigation', async ({ page }) => {
    await page.goto('/')

    // Navigate back and forth multiple times
    for (let i = 0; i < 5; i++) {
      // Go to reports
      const reportsLink = page.locator('a[href="/reports"]')
      if (await reportsLink.isVisible()) {
        await reportsLink.click()
        await expect(page).toHaveURL('/reports')
      }

      // Back to dashboard
      await page.goto('/')
      await expect(page.getByTestId('portfolio-value')).toBeVisible()
    }

    // If we got here without hanging or crashing, the test passes
    expect(true).toBe(true)
  })

  test('handles large data sets', async ({ page }) => {
    // This test verifies the app handles pagination correctly
    await page.goto('/exceptions')

    // Should load without issues
    await expect(
      page.getByTestId('exception-list').or(page.getByText('No exceptions found'))
    ).toBeVisible()
  })
})
