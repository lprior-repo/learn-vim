import { test, expect } from '@playwright/test';

test.describe('Vim Trainer Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for editor to be fully loaded
    await page.waitForSelector('.monaco-editor', { state: 'visible', timeout: 30000 });
  });

  test('should load page with correct title and components', async ({ page }) => {
    // Check page title
    const header = page.locator('h1');
    await expect(header).toContainText('Vim in Monaco Editor');
    await expect(header).toBeVisible();
    
    // Verify editor container exists
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
    
    // Verify command panel exists
    const commandPanel = page.locator('.p-3, .p-4, .bg-neutral-800').first();
    await expect(commandPanel).toBeVisible();
    
    // Check a few basic vim commands are displayed
    for (const command of ['h', 'j', 'k', 'l']) {
      await expect(page.getByText(command, { exact: true }).first()).toBeVisible();
    }
  });

  test('should display mode indicator', async ({ page }) => {
    // Check for mode indicator
    const modeIndicator = page.getByText('Current Mode:');
    await expect(modeIndicator).toBeVisible();
    
    // Should show Normal mode initially
    await expect(page.getByText('Normal').first()).toBeVisible();
  });

  test('should handle mode switching', async ({ page }) => {
    // Focus editor
    await page.locator('.monaco-editor').first().click();
    await page.waitForTimeout(200);
    
    // Enter insert mode
    await page.keyboard.press('i');
    await page.waitForTimeout(200);
    await expect(page.getByText('Insert').first()).toBeVisible();
    
    // Return to normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await expect(page.getByText('Normal').first()).toBeVisible();
    
    // Enter visual mode
    await page.keyboard.press('v');
    await page.waitForTimeout(200);
    await expect(page.getByText('Visual').first()).toBeVisible();
    
    // Return to normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await expect(page.getByText('Normal').first()).toBeVisible();
  });

  test('should show status bar information', async ({ page }) => {
    // Verify status bar exists
    const statusBar = page.locator('div[class*="h-[30px]"]');
    await expect(statusBar).toBeVisible();
    
    // Focus editor
    await page.locator('.monaco-editor').first().click();
    
    // Check status bar in insert mode
    await page.keyboard.press('i');
    await page.waitForTimeout(200);
    await expect(statusBar).toContainText('--INSERT--');
    
    // Check status bar in normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await expect(statusBar).not.toContainText('--INSERT--');
  });
  
  test('should be responsive', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop layout
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('h1')).toBeVisible();
  });
});