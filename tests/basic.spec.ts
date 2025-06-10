import { test, expect } from "@playwright/test";

/**
 * ATDD Basic Application Tests
 * 
 * Following Acceptance Test-Driven Development principles:
 * - Tests focus on user acceptance criteria
 * - Tests verify complete user journeys
 * - Tests use Given-When-Then structure
 * - Tests ensure no loading or hanging issues
 */
test.describe("Vim Trainer Application - ATDD Basic Tests", () => {
  
  /**
   * Helper to ensure page loads completely without hanging
   */
  async function ensurePageLoaded(page: any) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Allow some time for legitimate loading to complete
    await page.waitForTimeout(500);
    
    // Verify essential elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  }
  
  test.beforeEach(async ({ page }) => {
    // Given: User navigates to the application
    await page.goto('/');
    await ensurePageLoaded(page);
  });

  test("Given user visits application - When page loads - Then header and title appear without hanging", async ({ page }) => {
    // Then: Main header is visible
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h1')).toContainText('Welcome to Vim Trainer');
    
    // Then: Page title is correct
    await expect(page).toHaveTitle(/Vim|Trainer/);
  });

  test("Given user is on home page - When page loads - Then navigation links are available", async ({ page }) => {
    // Then: Main navigation links are visible and functional
    const practiceLink = page.getByRole('link', { name: 'Start Practicing' });
    const basicsLink = page.getByRole('link', { name: 'Learn Basics' });
    
    await expect(practiceLink).toBeVisible();
    await expect(basicsLink).toBeVisible();
    
    // Verify links have proper href attributes
    await expect(practiceLink).toHaveAttribute('href', '/learning-paths');
    await expect(basicsLink).toHaveAttribute('href', '/category/basic-movement');
  });

  test("Given user is on home page - When page loads - Then featured commands section displays without hanging", async ({ page }) => {
    // Then: Featured commands section is visible
    const featuredTitle = page.getByRole('heading', { name: 'Featured Commands' });
    await expect(featuredTitle).toBeVisible();
    
    // Then: Command cards are dynamically loaded and visible
    const commandCards = page.locator('.grid .block').or(page.locator('[class*="CommandCard"]'));
    await expect(commandCards.first()).toBeVisible();
    
    // Then: Multiple categories are shown
    expect(await commandCards.count()).toBeGreaterThan(2);
  });

  test("Given user is on home page - When page loads - Then educational content displays properly", async ({ page }) => {
    // Then: Why learn vim section is visible
    const whyLearnTitle = page.getByRole('heading', { name: 'Why Learn Vim?' });
    await expect(whyLearnTitle).toBeVisible();
    
    // Then: Benefit list items are visible
    await expect(page.locator('text=Efficiency:')).toBeVisible();
    await expect(page.locator('text=Ubiquity:')).toBeVisible();
    await expect(page.locator('text=Customizability:')).toBeVisible();
  });

  test("Given user has different viewport sizes - When viewing application - Then responsive design works without hanging", async ({ page }) => {
    const viewportTests = [
      { width: 1280, height: 800, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 800, name: 'Mobile' }
    ];

    for (const viewport of viewportTests) {
      // Given: User has specific viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);
      
      // When: Page renders
      await ensurePageLoaded(page);
      
      // Then: Header remains visible and functional
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Start Practicing' })).toBeVisible();
      
      console.log(`✓ Responsive layout verified for ${viewport.name}`);
    }
  });
});