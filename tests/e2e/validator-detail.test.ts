/**
 * Validator Detail Page E2E Tests
 */
import { test, expect } from '@playwright/test'

test.describe('Validator detail page', () => {
  test('displays validator pubkey', async ({ page }) => {
    await page.goto('/validators/validator-1')
    await expect(page.getByTestId('validator-pubkey')).toBeVisible()
  })

  test('displays event timeline', async ({ page }) => {
    await page.goto('/validators/validator-1')
    await expect(page.getByTestId('event-timeline')).toBeVisible()
  })

  test('displays evidence links', async ({ page }) => {
    await page.goto('/validators/validator-1')
    await expect(page.getByTestId('evidence-links')).toBeVisible()
  })

  test('shows performance metrics', async ({ page }) => {
    await page.goto('/validators/validator-1')
    await expect(page.getByTestId('validator-metrics')).toBeVisible()
  })

  test('shows operator and custodian info', async ({ page }) => {
    await page.goto('/validators/validator-1')
    await expect(page.getByTestId('validator-context')).toBeVisible()
  })

  test('back button returns to previous page', async ({ page }) => {
    await page.goto('/validators/validator-1')
    await expect(page.getByTestId('back-button')).toBeVisible()
  })
})
