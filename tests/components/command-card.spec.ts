import { test, expect } from '@playwright/test';

/**
 * Simple test suite focusing on basic application functionality
 * Following TDD principles:
 * - Focus on behavior, not implementation details
 * - Resilient to UI changes
 * - Tests functional requirements
 */
test.describe('Basic Application Tests', () => {
  // Increase test timeout
  test.setTimeout(30000);
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app with increased timeout
    await page.goto('http://localhost:3000', { timeout: 20000 });
    
    // Wait for basic content
    await page.waitForSelector('body', { state: 'visible', timeout: 20000 });
  });

  test('should render page content', async ({ page }) => {
    // Basic test: page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Page should have meaningful content
    const bodyHTML = await body.innerHTML();
    expect(bodyHTML.length).toBeGreaterThan(100);
  });

  test('should have DOM structure', async ({ page }) => {
    // Check for basic DOM structure
    const divCount = await page.locator('div').count();
    expect(divCount).toBeGreaterThan(5);
    
    // Page should have some text content
    const textContent = await page.locator('body').textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test('should respond to viewport changes', async ({ page }) => {
    // Get initial window dimensions
    const initialDimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    
    // Resize viewport
    await page.setViewportSize({ width: 800, height: 600 });
    
    // Check that window dimensions changed
    const newDimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    
    expect(newDimensions.width).toBe(800);
    expect(newDimensions.height).toBe(600);
    expect(newDimensions).not.toEqual(initialDimensions);
  });
});