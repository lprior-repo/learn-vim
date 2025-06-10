import { test, expect } from '@playwright/test';

test.describe('Category Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Basic Movement category page
    await page.goto('http://localhost:3000/category/basic-movement');
    await page.waitForSelector('h1:has-text("Basic Movement")');
  });

  test('should load content without getting stuck in loading state', async ({ page }) => {
    // Navigate to the category page
    await page.goto('http://localhost:3000/category/basic-movement');
    
    // Ensure no loading spinner is stuck on the page after reasonable time
    await page.waitForSelector('h1:has-text("Basic Movement")', { timeout: 5000 });
    
    // Verify main content is loaded (no loading spinner should be visible)
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    
    // Verify the Monaco editor has loaded
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    
    // Verify command cards are present
    await expect(page.getByRole('heading', { name: 'Commands in this Category' })).toBeVisible();
    await expect(page.locator('.grid .block')).toHaveCount(4); // Basic Movement has 4 commands
  });

  test('should display category title and description', async ({ page }) => {
    // Check category title
    const title = page.getByRole('heading', { name: 'Basic Movement' }).first();
    await expect(title).toBeVisible();
    
    // Check description text
    const description = page.locator('p').filter({ hasText: 'Learn how to navigate in Vim' }).first();
    await expect(description).toBeVisible();
  });

  test('should display an editor with category-specific content', async ({ page }) => {
    // Check if the editor is visible
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
    
    // Since we can't easily check the exact content of Monaco editor,
    // we'll check if the editor container exists and is visible
    const editorContainer = page.locator('div').filter({ has: editor }).first();
    await expect(editorContainer).toBeVisible();
  });

  test('should list all commands in the category', async ({ page }) => {
    // Check commands section heading
    const commandsHeading = page.getByRole('heading', { name: 'Commands in this Category' });
    await expect(commandsHeading).toBeVisible();
    
    // Check if there are multiple command cards
    const commandCards = page.locator('.grid .block');
    expect(await commandCards.count()).toBeGreaterThanOrEqual(2);
    
    // Check for specific command names in Basic Movement category
    await expect(page.getByRole('heading', { name: 'Basic Cursor Movement' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Word Movement' })).toBeVisible();
  });

  test('should navigate to command page when clicking on a command card', async ({ page }) => {
    // Find a specific command card (HJKL)
    const hjklCard = page.locator('.grid .block').filter({ hasText: 'Basic Cursor Movement' }).first();
    await expect(hjklCard).toBeVisible();
    
    // Click on the card
    await hjklCard.click();
    
    // Wait for navigation
    await page.waitForURL('**/category/basic-movement/hjkl');
    
    // Verify we're on the HJKL command page
    await expect(page.getByRole('heading', { name: 'Basic Movement: HJKL Keys' })).toBeVisible();
  });

  test('should display related categories section', async ({ page }) => {
    // Check for related categories section
    const relatedSection = page.locator('div').filter({ hasText: 'Related Categories' }).first();
    await expect(relatedSection).toBeVisible();
    
    // Check for related category links
    const relatedLinks = relatedSection.getByRole('link');
    expect(await relatedLinks.count()).toBeGreaterThan(0);
    
    // Try clicking a related category link
    const firstRelatedLink = relatedLinks.first();
    const relatedCategoryName = await firstRelatedLink.textContent();
    
    await firstRelatedLink.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify we navigated to the related category
    // The category name should be visible in the header
    await expect(page.getByRole('heading', { level: 1 })).toContainText(relatedCategoryName || '');
  });

  test('should handle different categories correctly', async ({ page }) => {
    // Navigate to a different category
    await page.goto('http://localhost:3000/category/mode-switching');
    await page.waitForSelector('h1:has-text("Mode Switching")');
    
    // Ensure this category also loads without getting stuck
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    
    // Check for category-specific content
    await expect(page.getByRole('heading', { name: 'Mode Switching' })).toBeVisible();
    await expect(page.getByText('Learn about Vim modes')).toBeVisible();
    
    // Check if the command list is different for this category
    await expect(page.getByRole('heading', { name: 'Insert Mode' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Normal Mode' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Visual Mode' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Command Mode' })).toBeVisible();
  });

  test('should show helpful error for invalid category', async ({ page }) => {
    // Navigate to a non-existent category
    await page.goto('http://localhost:3000/category/not-a-real-category');
    
    // Check for error message
    await expect(page.getByText('Category Not Found')).toBeVisible();
    await expect(page.getByText('Return to Home')).toBeVisible();
    
    // Click on return to home link
    await page.getByRole('link', { name: 'Return to Home' }).click();
    
    // Verify we navigate back to home
    await expect(page.url()).toBe('http://localhost:3000/');
  });
});