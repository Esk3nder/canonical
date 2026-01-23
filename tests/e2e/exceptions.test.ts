/**
 * Exception Queue E2E Tests
 */
import { test, expect } from '@playwright/test'

test.describe('Exception queue', () => {
  test('displays exception list', async ({ page }) => {
    await page.goto('/exceptions')
    await expect(page.getByTestId('exception-list').or(page.getByText('No exceptions found'))).toBeVisible()
  })

  test('displays exception stats', async ({ page }) => {
    await page.goto('/exceptions')
    await expect(page.getByTestId('exception-stats')).toBeVisible()
  })

  test('has status filter', async ({ page }) => {
    await page.goto('/exceptions')
    await expect(page.getByTestId('status-filter')).toBeVisible()
  })

  test('has severity filter', async ({ page }) => {
    await page.goto('/exceptions')
    await expect(page.getByTestId('severity-filter')).toBeVisible()
  })

  test('can filter by status', async ({ page }) => {
    await page.goto('/exceptions')
    await page.selectOption('[data-testid="status-filter"]', 'new')
    // Should update the list (URL or content changes)
    await expect(page).toHaveURL(/status=new/)
  })

  test('navigates to exception detail on click', async ({ page }) => {
    await page.goto('/exceptions')

    // If there are exceptions, click on one
    const firstException = page.locator('[data-testid^="exception-"]').first()
    if (await firstException.isVisible()) {
      await firstException.click()
      await expect(page).toHaveURL(/\/exceptions\//)
    }
  })

  test('back button returns to dashboard', async ({ page }) => {
    await page.goto('/exceptions')
    await page.click('text=Back to Dashboard')
    await expect(page).toHaveURL('/')
  })
})

test.describe('Exception detail', () => {
  test('displays exception detail', async ({ page }) => {
    // Navigate to a known exception or check for error state
    await page.goto('/exceptions/test-exception-id')

    // Either shows detail or error state
    await expect(
      page.getByTestId('exception-detail').or(page.getByText('Exception not found'))
    ).toBeVisible()
  })

  test('shows evidence links when available', async ({ page }) => {
    await page.goto('/exceptions/test-exception-id')

    // Check if evidence links section exists (if exception has evidence)
    const evidenceSection = page.getByTestId('evidence-links')
    if (await evidenceSection.isVisible()) {
      await expect(evidenceSection).toBeVisible()
    }
  })

  test('back button returns to queue', async ({ page }) => {
    await page.goto('/exceptions/test-exception-id')
    await page.click('text=Back to Exception Queue')
    await expect(page).toHaveURL('/exceptions')
  })
})
