import { test, expect } from '@playwright/test';

test.describe('Command Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to HJKL command page
    await page.goto('http://localhost:3000/category/basic-movement/hjkl');
    await page.waitForSelector('h1:has-text("Basic Movement: HJKL Keys")');
  });

  test('should display command title and description', async ({ page }) => {
    // Check command title
    const title = page.getByRole('heading', { name: 'Basic Movement: HJKL Keys' }).first();
    await expect(title).toBeVisible();
    
    // Check description text
    const description = page.locator('p').filter({ hasText: 'Learn to navigate efficiently' }).first();
    await expect(description).toBeVisible();
  });

  test('should display mode indicator', async ({ page }) => {
    // Check if mode indicator is visible
    const modeIndicator = page.locator('div').filter({ hasText: /Mode:/ }).first();
    await expect(modeIndicator).toBeVisible();
    
    // Should display Normal mode by default
    await expect(modeIndicator).toContainText('Normal');
  });

  test('should display command reference section', async ({ page }) => {
    // Check command reference section
    const referenceSection = page.locator('div').filter({ hasText: 'Command Reference' }).first();
    await expect(referenceSection).toBeVisible();
    
    // Check for HJKL key badges
    const keyBadges = referenceSection.locator('.bg-blue-600, .bg-blue-700');
    expect(await keyBadges.count()).toBeGreaterThanOrEqual(4);
    
    // Check for specific keys
    await expect(keyBadges).toContainText('h');
    await expect(keyBadges).toContainText('j');
    await expect(keyBadges).toContainText('k');
    await expect(keyBadges).toContainText('l');
  });

  test('should display practice editor', async ({ page }) => {
    // Check practice section heading
    const practiceHeading = page.getByRole('heading', { name: 'Practice' });
    await expect(practiceHeading).toBeVisible();
    
    // Check if editor is visible
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
  });

  test('should display challenge progress section', async ({ page }) => {
    // Check challenges section heading
    const challengesHeading = page.getByRole('heading', { name: 'Challenge Progress' });
    await expect(challengesHeading).toBeVisible();
    
    // Check for challenges
    const challenges = page.locator('div').filter({ hasText: 'Basic Challenge' });
    await expect(challenges).toBeVisible();
    
    const advancedChallenge = page.locator('div').filter({ hasText: 'Advanced Challenge' });
    await expect(advancedChallenge).toBeVisible();
  });

  test('should display tips section', async ({ page }) => {
    // Check tips section heading
    const tipsHeading = page.getByRole('heading', { name: 'Tips & Tricks' });
    await expect(tipsHeading).toBeVisible();
    
    // Check if there are multiple tips
    const tipsList = page.locator('ul').last();
    const tips = tipsList.locator('li');
    expect(await tips.count()).toBeGreaterThan(1);
  });

  test('should navigate back to category page', async ({ page }) => {
    // Find the back link
    const backLink = page.getByRole('link', { name: /Back to Basic Movement/ });
    await expect(backLink).toBeVisible();
    
    // Click back link
    await backLink.click();
    
    // Wait for navigation
    await page.waitForURL('**/category/basic-movement');
    
    // Verify we're on the category page
    await expect(page.getByRole('heading', { name: 'Basic Movement' })).toBeVisible();
  });

  test('should complete basic challenge when navigating maze', async ({ page }) => {
    // Focus the editor
    const editor = page.locator('.monaco-editor');
    await editor.click();
    
    // Ensure we're in Normal mode
    await page.keyboard.press('Escape');
    
    // Move through the maze using hjkl commands
    const commands = [
      'g', 'g',      // Go to top
      'j', 'j', 'j', // Down to maze
      'l', 'l',      // Right to start point
      'j', 'j',      // Down
      'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', // Right
      'j', 'j',      // Down
      'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', // Right
      'j', 'j',      // Down
      'k',           // Up
      'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', // Right
      'j', 'j',      // Down
    ];
    
    for (const command of commands) {
      await page.keyboard.press(command);
      await page.waitForTimeout(50); // Small delay between keys
    }
    
    // Wait for challenge completion detection
    await page.waitForTimeout(1000);
    
    // Check if the challenge is marked as completed
    const completedChallenge = page.locator('.bg-green-900/30, .border-green-700').first();
    await expect(completedChallenge).toBeVisible({ timeout: 10000 });
    
    // Verify success message is shown
    await expect(page.getByText('You successfully navigated')).toBeVisible();
  });

  test('should handle editor mode changes', async ({ page }) => {
    // Focus the editor
    const editor = page.locator('.monaco-editor');
    await editor.click();
    
    // Ensure we're in Normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    // Check current mode
    await expect(page.getByText('Mode: Normal')).toBeVisible();
    
    // Enter insert mode
    await page.keyboard.press('i');
    await page.waitForTimeout(300);
    
    // Check mode changed
    await expect(page.getByText('Mode: Insert')).toBeVisible();
    
    // Back to normal mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Check mode changed back
    await expect(page.getByText('Mode: Normal')).toBeVisible();
  });

  test('should verify generic command page layout', async ({ page }) => {
    // Navigate to a different command page that uses the generic template
    await page.goto('http://localhost:3000/category/text-editing/delete');
    await page.waitForLoadState('networkidle');
    
    // Check for key components
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible();
    await expect(page.getByText('Command Reference')).toBeVisible();
    await expect(page.getByText('Challenge:')).toBeVisible();
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: 'Reset Challenge' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show Hint' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show Solution' })).toBeVisible();
  });
});