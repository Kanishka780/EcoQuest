import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (Mock Mode)', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('eq_initialized', 'true');
    });
  });

  test('should successfully log in and accept privacy consent', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // Enter email and password (any works in mock mode)
    await page.fill('input[type="email"]', 'test.user@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard home
    await page.waitForURL('http://localhost:3000/');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Check if Privacy Consent Modal is visible
    // If not by accessible name, search by text or header
    await expect(page.getByText('Privacy Consent & Data Policy')).toBeVisible();

    // Click Accept & Continue
    await page.click('button:has-text("Accept & Continue")', { force: true });

    // Modal should close and welcome banner should be visible
    await expect(page.getByText('Privacy Consent & Data Policy')).not.toBeVisible();
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should allow register validation and navigation', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Register here');
    await expect(page).toHaveURL(/\/register/);

    // Fill registration details
    await page.fill('input[id="name"]', 'Eco Commuter');
    await page.fill('input[type="email"]', 'new.commuter@example.com');
    await page.fill('input[type="password"]', 'securepassword123');
    await page.fill('input[id="city"]', 'Bangalore');

    // Click Create Account
    await page.click('button[type="submit"]');

    // In mock mode, should auto-register and redirect to dashboard home
    await page.waitForURL('http://localhost:3000/');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should successfully log out', async ({ page }) => {
    // Perform login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test.user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');
    
    // Accept privacy consent if visible
    try {
      await page.click('button:has-text("Accept & Continue")', { timeout: 3000, force: true });
    } catch {
      // already accepted or not showing
    }

    // Click logout button (desktop sidebar has "Sign Out" button)
    await page.click('button:has-text("Sign Out")');

    // Should redirect back to login page
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);
  });
});
