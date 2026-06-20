import { test, expect } from '@playwright/test';

test.describe('Carbon Footprint Calculator E2E', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('eq_initialized', 'true');
    });
    // Log in before each calculator test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'calculator.user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');
    
    // Accept privacy consent if visible
    try {
      await page.click('button:has-text("Accept & Continue")', { timeout: 3000, force: true });
    } catch {
      // ignore if already accepted
    }
  });

  test('should step through and successfully submit the carbon calculator', async ({ page }) => {
    await page.goto('/calculator');
    await expect(page.getByText('Carbon Calculator')).toBeVisible();

    // --- Tab 1: Transport ---
    await expect(page.getByText('Daily Transportation & Travel')).toBeVisible();
    await page.fill('input[id="carKm"]', '20');
    await page.selectOption('select[id="fuelType"]', 'diesel');
    await page.fill('input[id="transitKm"]', '15');
    await page.fill('input[id="activeKm"]', '4');
    await page.fill('input[id="flights"]', '3');
    await page.selectOption('select[id="flightType"]', 'shortHaul');

    // Proceed to next tab
    await page.click('button:has-text("Next Tab")');

    // --- Tab 2: Utilities ---
    await expect(page.getByText('Household Utility Consumption')).toBeVisible();
    await page.fill('input[id="electricity"]', '250');
    await page.selectOption('select[id="elecSource"]', 'grid');
    await page.fill('input[id="hhSize"]', '3');
    await page.fill('input[id="gas"]', '10');

    // Proceed to next tab
    await page.click('button:has-text("Next Tab")');

    // --- Tab 3: Diet ---
    await expect(page.getByText('Dietary Habits & Food Waste')).toBeVisible();
    await page.fill('input[id="meatMeals"]', '8');
    await page.fill('input[id="beefMeals"]', '2');
    await page.fill('input[id="dairy"]', '3');
    await page.fill('input[id="waste"]', '15');

    // Proceed to next tab
    await page.click('button:has-text("Next Tab")');

    // --- Tab 4: Consumption ---
    await expect(page.getByText('Purchasing & Daily Consumption')).toBeVisible();
    await page.fill('input[id="clothing"]', '3');
    await page.fill('input[id="electronics"]', '2');
    await page.fill('input[id="orders"]', '4');

    // Check estimated annual footprint updates
    const estimatedValueText = await page.textContent('.text-4xl.font-extrabold.text-white');
    expect(estimatedValueText).not.toBeNull();
    
    // Save Footprint
    await page.click('button:has-text("Save Footprint")');

    // Success message should appear
    await expect(page.getByText('Calculation saved successfully to your profile!')).toBeVisible();

    // --- Verification of Audit Transparency Panel ---
    const detailsAudit = page.locator('details[aria-label="Transparency formulas and references"]');
    await expect(detailsAudit).toBeVisible();
    
    // Open details panel
    await page.click('summary:has-text("Calculation Audit & Transparency Panel")');
    await expect(page.getByText('1. Transportation Formula')).toBeVisible();
    await expect(page.getByText('2. Energy Formula')).toBeVisible();
    await expect(page.getByText('3. Dietary Formula')).toBeVisible();
  });
});
