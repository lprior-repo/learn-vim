import { test, expect } from '@playwright/test';

test.describe('Monaco Editor Bundled Loading', () => {
  test('Monaco Editor should be available immediately when page loads', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check that Monaco is available globally immediately (no waiting)
    const monacoAvailable = await page.evaluate(() => {
      return typeof window.monaco !== 'undefined' && 
             typeof window.monaco.editor !== 'undefined';
    });
    
    expect(monacoAvailable).toBe(true);
  });

  test('Monaco Vim should be available immediately when page loads', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check that Monaco Vim is available globally immediately (no waiting)
    const monacoVimAvailable = await page.evaluate(() => {
      return typeof window.MonacoVim !== 'undefined' && 
             typeof window.MonacoVim.initVimMode !== 'undefined';
    });
    
    expect(monacoVimAvailable).toBe(true);
  });

  test('Editor should initialize quickly without loading delays', async ({ page }) => {
    // Navigate to a page with an editor (HJKL command page)
    await page.goto('/category/basic-movement/hjkl');
    
    // Wait for the editor container to appear
    await page.waitForSelector('[data-testid="vim-editor"]', { timeout: 5000 });
    
    // Check that the Monaco editor is rendered within a reasonable time
    const editorReady = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="vim-editor"]');
      if (!container) return false;
      
      // Check if Monaco editor elements are present
      const monacoElements = container.querySelectorAll('.monaco-editor');
      return monacoElements.length > 0;
    });
    
    expect(editorReady).toBe(true);
  });

  test('Vim mode should be active immediately', async ({ page }) => {
    // Navigate to a page with an editor (HJKL command page)
    await page.goto('/category/basic-movement/hjkl');
    
    // Wait for the editor and mode indicator
    await page.waitForSelector('[data-testid="vim-editor"]');
    await page.waitForSelector('[data-testid="mode-indicator"]');
    
    // Check that vim mode is active
    const modeText = await page.locator('[data-testid="mode-indicator"]').textContent();
    expect(modeText).toContain('NORMAL');
  });
});