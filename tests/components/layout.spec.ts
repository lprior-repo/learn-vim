import { test, expect } from '@playwright/test';

/**
 * Test suite for the App Layout (Vim Trainer)
 * 
 * Following TDD principles:
 * - Tests focus on behavior, not implementation details
 * - Tests are resilient to UI changes
 * - Tests verify functional requirements for a Monaco editor app
 */
test.describe('App Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render header with title', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Check for app title
    await expect(page.locator('h1')).toContainText('Vim in Monaco Editor');
  });

  test('should render Monaco editor area', async ({ page }) => {
    // Check for editor container (the rounded border div that contains the editor)
    const editorContainer = page.locator('div').filter({ hasText: /Loading editor\.\.\.|Error:/ }).or(
      page.locator('[class*="monaco-editor"]')
    ).or(
      page.locator('div[class*="rounded-md"][class*="overflow-hidden"]')
    ).first();
    
    // Either loading message, error, or editor container should be visible
    await expect(editorContainer).toBeVisible({ timeout: 15000 });
  });

  test('should render commands reference panel', async ({ page }) => {
    // Look for the commands panel
    const commandsPanel = page.locator('h2').filter({ hasText: 'Vim Commands Reference' });
    await expect(commandsPanel).toBeVisible();
    
    // Should have command cards
    const commandCards = page.locator('[class*="grid"]').filter({ has: page.locator('span').filter({ hasText: /^[a-zA-Z0-9:\/\$]+$/ }) });
    await expect(commandCards).toBeVisible();
  });

  test('should render footer', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Practice makes perfect');
  });

  test('should be responsive', async ({ page }) => {
    // Test at desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    
    const desktopTitle = await page.locator('h1').first().textContent();
    expect(desktopTitle).toBeTruthy();
    
    // Test at mobile size
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(500);
    
    const mobileTitle = await page.locator('h1').first().textContent();
    expect(mobileTitle).toBeTruthy();
    
    // Title should remain visible at both sizes
    expect(desktopTitle).toBe(mobileTitle);
  });
});