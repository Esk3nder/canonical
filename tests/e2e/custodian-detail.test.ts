/**
 * Custodian Detail Page E2E Tests
 */
import { test, expect } from '@playwright/test'

test.describe('Custodian detail page', () => {
  test('displays custodian name', async ({ page }) => {
    await page.goto('/custodians/custodian-1')
    await expect(page.getByTestId('custodian-name')).toBeVisible()
  })

  test('displays validator list', async ({ page }) => {
    await page.goto('/custodians/custodian-1')
    await expect(page.getByTestId('validator-list')).toBeVisible()
  })

  test('displays performance metrics', async ({ page }) => {
    await page.goto('/custodians/custodian-1')
    await expect(page.getByTestId('performance-metrics')).toBeVisible()
  })

  test('shows operator breakdown', async ({ page }) => {
    await page.goto('/custodians/custodian-1')
    await expect(page.getByTestId('operator-breakdown')).toBeVisible()
  })

  test('navigates to validator detail on row click', async ({ page }) => {
    await page.goto('/custodians/custodian-1')
    await page.click('[data-testid="validator-row-0"]')
    await expect(page).toHaveURL(/\/validators\//)
  })

  test('back button returns to dashboard', async ({ page }) => {
    await page.goto('/custodians/custodian-1')
    await page.click('[data-testid="back-button"]')
    await expect(page).toHaveURL('/')
  })
})
