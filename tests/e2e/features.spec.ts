import { test, expect } from '@playwright/test';

test.describe('Platform Features E2E', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('eq_initialized', 'true');
    });
    // Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', 'features.user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');
    
    // Accept privacy consent if visible
    try {
      await page.click('button:has-text("Accept & Continue")', { timeout: 3000, force: true });
    } catch {
      // ignore
    }
  });

  test('should verify Impact Simulator sliders and equivalences', async ({ page }) => {
    await page.goto('/simulator');
    await expect(page.getByText('Impact Simulator')).toBeVisible();

    // Verify sliders are visible
    const carSlider = page.locator('[aria-label="Daily car distance simulation"]');
    const elecSlider = page.locator('[aria-label="Monthly electricity usage simulation"]');
    const meatSlider = page.locator('[aria-label="Meat meals per week simulation"]');
    const shoppingSlider = page.locator('[aria-label="Online shopping orders simulation"]');

    await expect(carSlider).toBeVisible();
    await expect(elecSlider).toBeVisible();
    await expect(meatSlider).toBeVisible();
    await expect(shoppingSlider).toBeVisible();

    // Move sliders to simulate carbon savings
    await carSlider.fill('5'); // reduce car km from original
    await meatSlider.fill('2'); // reduce meat meals

    // Carbon savings and environmental equivalency should update
    await expect(page.getByText('Annual Carbon Savings')).toBeVisible();
    await expect(page.getByText('Environmental Equivalency')).toBeVisible();
    await expect(page.getByText('footprint reduction')).toBeVisible();
  });

  test('should verify Daily Habit Tracker checklist and logs', async ({ page }) => {
    await page.goto('/habits');
    await expect(page.getByText('Daily Habit Tracker')).toBeVisible();

    // Fill habit logging fields
    await page.fill('input[id="bike"]', '6');
    await page.fill('input[id="bus"]', '2');
    await page.fill('input[id="veg"]', '2');
    await page.check('input[id="plastic"]');

    // Click Save
    await page.click('button:has-text("Log Habits")');

    // Success message should appear
    await expect(page.getByText("Today's habits logged successfully!")).toBeVisible();

    // Active log streak and sustainability ledger should be visible
    await expect(page.getByText('Active Log Streak')).toBeVisible();
    await expect(page.getByText('Sustainablity Ledger')).toBeVisible();
  });

  test('should join a challenge and log progress in Roadmap', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.getByText('Reduction Roadmap & Challenges')).toBeVisible();

    // Join the "Vampire Power Slayer" challenge if available
    // Look for first join challenge button
    const joinButton = page.locator('button:has-text("Join Challenge")').first();
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    // Once joined, button text changes to Log Day (0/5)
    const logDayButton = page.locator('button:has-text("Log Day (0/5)")').first();
    await expect(logDayButton).toBeVisible();

    // Click Log Day
    await logDayButton.click();

    // Check if progress increments
    const logDayNextButton = page.locator('button:has-text("Log Day (1/5)")').first();
    await expect(logDayNextButton).toBeVisible();

    // Verify Week-by-Week Action Plan checklist
    const uncheckedCheckbox = page.locator('input[type="checkbox"]').first();
    const isChecked = await uncheckedCheckbox.isChecked();
    if (!isChecked) {
      await uncheckedCheckbox.check();
      await expect(uncheckedCheckbox).toBeChecked();
    }
  });
});
