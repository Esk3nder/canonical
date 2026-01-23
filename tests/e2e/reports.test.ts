/**
 * Reports Page E2E Tests
 */
import { test, expect } from '@playwright/test'

test.describe('Reports page', () => {
  test('displays generate report button', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.getByTestId('generate-button')).toBeVisible()
  })

  test('opens generate form modal', async ({ page }) => {
    await page.goto('/reports')
    await page.click('[data-testid="generate-button"]')
    await expect(page.getByText('Generate New Report')).toBeVisible()
  })

  test('shows period selection inputs', async ({ page }) => {
    await page.goto('/reports')
    await page.click('[data-testid="generate-button"]')
    await expect(page.getByTestId('period-start')).toBeVisible()
    await expect(page.getByTestId('period-end')).toBeVisible()
  })

  test('shows format selection options', async ({ page }) => {
    await page.goto('/reports')
    await page.click('[data-testid="generate-button"]')
    await expect(page.getByText('JSON')).toBeVisible()
    await expect(page.getByText('CSV')).toBeVisible()
    await expect(page.getByText('PDF')).toBeVisible()
  })

  test('can select different export formats', async ({ page }) => {
    await page.goto('/reports')
    await page.click('[data-testid="generate-button"]')

    // Click CSV option
    await page.click('text=CSV')
    await expect(page.locator('text=CSV').locator('..')).toHaveClass(/border-blue-500/)
  })

  test('shows empty state when no reports', async ({ page }) => {
    await page.goto('/reports')
    // May show empty state or list depending on data
    const emptyState = page.getByText('No reports yet')
    const reportList = page.getByTestId('report-list')

    // Either empty state or list should be visible
    await expect(emptyState.or(reportList)).toBeVisible()
  })

  test('back button returns to dashboard', async ({ page }) => {
    await page.goto('/reports')
    await page.click('text=Back to Dashboard')
    await expect(page).toHaveURL('/')
  })
})
