import { test, expect } from '@playwright/test';

/**
 * ATDD Navigation Test Suite
 * 
 * Following Acceptance Test-Driven Development principles:
 * - Tests focus on user acceptance criteria
 * - Tests verify complete user journeys
 * - Tests use Given-When-Then structure
 * - Tests ensure reliable navigation without loading issues
 */
test.describe('Application Navigation - ATDD', () => {
  
  /**
   * Helper to ensure page is fully loaded without hanging
   */
  async function ensurePageLoaded(page: any, expectedUrl?: string) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Allow some time for legitimate loading to complete
    await page.waitForTimeout(1000);
    
    // Verify essential elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    if (expectedUrl) {
      expect(page.url()).toContain(expectedUrl);
    }
  }
  
  test.beforeEach(async ({ page }) => {
    // Given: User navigates to the home page
    await page.goto('/');
    await ensurePageLoaded(page);
  });

  test('Given user is on home page - When clicking navigation links - Then pages load without hanging', async ({ page }) => {
    // Given: User sees main call-to-action links on home page
    const practiceLink = page.getByRole('link', { name: 'Start Practicing' });
    const basicsLink = page.getByRole('link', { name: 'Learn Basics' });
    
    await expect(practiceLink).toBeVisible();
    await expect(basicsLink).toBeVisible();
    
    // When: User clicks the Learn Basics link
    await basicsLink.click();
    
    // Then: Category page loads completely without hanging
    await ensurePageLoaded(page, '/category/basic-movement');
    await expect(page.getByRole('heading', { name: 'Basic Movement' })).toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    
    // When: User navigates back home via header
    const homeLink = page.locator('header').getByRole('link').first();
    await homeLink.click();
    
    // Then: Home page loads without hanging
    await ensurePageLoaded(page);
    await expect(page.getByRole('heading', { name: 'Welcome to Vim Trainer' })).toBeVisible();
  });

  test('Given user sees featured commands - When clicking view all links - Then category pages load properly', async ({ page }) => {
    // Given: User sees featured commands with "View all" links
    const viewAllLinks = page.getByText('View all →');
    expect(await viewAllLinks.count()).toBeGreaterThan(0);
    
    // When: User clicks the first "View all" link
    await viewAllLinks.first().click();
    
    // Then: Category page loads completely without hanging
    await ensurePageLoaded(page, '/category/');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
  });

  test('Given user navigates to category page - When page loads - Then editor loads without hanging', async ({ page }) => {
    // Given: User navigates to a category page directly
    await page.goto('/category/basic-movement');
    
    // When: Page loads
    await ensurePageLoaded(page, '/category/basic-movement');
    
    // Then: Editor loads properly without hanging
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Basic Movement' })).toBeVisible();
    
    // Given: User sees command cards on the category page
    const commandCards = page.locator('.grid .block');
    
    // When: User clicks a command card (if available)
    if (await commandCards.count() > 0) {
      await commandCards.first().click();
      
      // Then: Command detail page loads with editor
      await ensurePageLoaded(page);
      await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Given user is on command detail page - When navigating back home - Then navigation works without hanging', async ({ page }) => {
    // Given: User navigates to a category page first
    await page.goto('/category/basic-movement');
    await ensurePageLoaded(page, '/category/basic-movement');
    
    // Given: User navigates to a command detail page
    const commandCards = page.locator('.grid .block');
    if (await commandCards.count() > 0) {
      await commandCards.first().click();
      await ensurePageLoaded(page);
      
      // When: User clicks the home link in header
      const homeLink = page.locator('header').getByRole('link').first();
      await homeLink.click();
      
      // Then: Home page loads without hanging
      await ensurePageLoaded(page);
      await expect(page.getByRole('heading', { name: 'Welcome to Vim Trainer' })).toBeVisible();
    }
  });

  test('Given user visits different pages - When checking layout consistency - Then header renders on all pages', async ({ page }) => {
    const pagesToTest = [
      { path: '/', name: 'Home' },
      { path: '/category/basic-movement', name: 'Category' },
      { path: '/learning-paths', name: 'Learning Paths' }
    ];

    for (const pageTest of pagesToTest) {
      // Given: User navigates to page
      await page.goto(pageTest.path);
      
      // When: Page loads
      await ensurePageLoaded(page, pageTest.path);
      
      // Then: Header is consistently visible
      await expect(page.locator('header')).toBeVisible();
      console.log(`✓ Header visible on ${pageTest.name} page`);
    }
  });
});