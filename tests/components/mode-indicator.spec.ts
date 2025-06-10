import { test, expect } from '@playwright/test';

/**
 * Tests for the ModeIndicator component
 * 
 * Following functional TDD principles:
 * - Focus on behavior, not implementation details
 * - Use resilient selectors
 * - Test what the user sees and interacts with
 */
test.describe('ModeIndicator Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that has the editor and mode indicator
    await page.goto('http://localhost:3000');
    
    // Wait for page to load with a more resilient approach
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display editor with mode indicator', async ({ page }) => {
    // Find any element that indicates editor mode
    const modeIndicator = page.locator('div, span').filter({ hasText: /mode|normal|insert|visual/i }).first();
    
    // Verify it exists
    await expect(modeIndicator).toBeVisible();
    
    // Verify we have an editor to interact with
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
  });

  test('should change when editor mode changes', async ({ page }) => {
    // Find the editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
    
    // Initial mode indicator state
    const initialMode = await page.locator('div, span').filter({ 
      hasText: /mode|normal|insert|visual/i 
    }).first().textContent();
    
    // Click the editor to focus it
    await editor.click();
    
    // Try to enter insert mode by pressing 'i'
    await page.keyboard.press('i');
    
    // Wait a moment for mode to update
    await page.waitForTimeout(300);
    
    // Get the updated mode text
    const updatedMode = await page.locator('div, span').filter({ 
      hasText: /mode|normal|insert|visual/i 
    }).first().textContent();
    
    // Verify the mode has changed in some way (being resilient to exact text)
    expect(initialMode).not.toEqual(updatedMode);
  });

  test('should return to previous mode when pressing Escape', async ({ page }) => {
    // Find the editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
    
    // Focus the editor
    await editor.click();
    
    // Press Escape to ensure we're in Normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    // Get initial mode
    const initialMode = await page.locator('div, span').filter({ 
      hasText: /mode|normal|insert|visual/i 
    }).first().textContent();
    
    // Enter insert mode
    await page.keyboard.press('i');
    await page.waitForTimeout(200);
    
    // Verify mode changed
    const insertMode = await page.locator('div, span').filter({ 
      hasText: /mode|normal|insert|visual/i 
    }).first().textContent();
    expect(insertMode).not.toEqual(initialMode);
    
    // Return to normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Get final mode
    const finalMode = await page.locator('div, span').filter({ 
      hasText: /mode|normal|insert|visual/i 
    }).first().textContent();
    
    // The final mode should match the initial mode
    expect(finalMode).toContain(initialMode?.trim());
  });

  test('should have visual distinctions between modes', async ({ page }) => {
    // Find the editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
    
    // Focus the editor
    await editor.click();
    
    // Ensure we're in Normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    // Get the mode indicator
    const modeIndicator = page.locator('div, span').filter({ 
      hasText: /mode|normal|insert|visual/i 
    }).first();
    
    // Get its visual properties
    const normalStyles = await modeIndicator.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return { 
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        textContent: el.textContent
      };
    });
    
    // Enter insert mode
    await page.keyboard.press('i');
    await page.waitForTimeout(200);
    
    // Get updated visual properties
    const insertStyles = await modeIndicator.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return { 
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        textContent: el.textContent
      };
    });
    
    // The visual appearance should be different in some way
    // (either background, color, or text content)
    const visuallyDifferent = 
      normalStyles.backgroundColor !== insertStyles.backgroundColor ||
      normalStyles.color !== insertStyles.color ||
      normalStyles.textContent !== insertStyles.textContent;
    
    expect(visuallyDifferent).toBe(true);
  });
});