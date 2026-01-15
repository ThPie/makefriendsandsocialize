import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('user can navigate to auth page and see signup form', async ({ page }) => {
    await page.goto('/');
    
    // Click on a CTA that leads to auth
    await page.click('text=Join Now');
    
    // Should be on auth page
    await expect(page).toHaveURL(/\/auth/);
    
    // Should see signup form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('user can view events page', async ({ page }) => {
    await page.goto('/events');
    
    // Should see events heading
    await expect(page.locator('h1')).toContainText(/event/i);
  });

  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should see main heading
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Should have navigation
    await expect(page.locator('nav')).toBeVisible();
  });
});
