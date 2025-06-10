// Basic test for HJKL vertical slice functionality
import { test, expect } from '@playwright/test';

test.describe('HJKL Vertical Slice - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load HJKL training page successfully', async ({ page }) => {
    // Verify page loads and basic elements are present
    await expect(page.getByRole('heading', { name: /vim trainer/i })).toBeVisible();
    await expect(page.getByText('Vertical Slice Architecture').first()).toBeVisible();
    
    // Verify HJKL specific content
    await expect(page.getByRole('heading', { name: /hjkl movement training/i })).toBeVisible();
    await expect(page.getByText(/master the fundamental movement keys/i).first()).toBeVisible();
  });

  test('should display HJKL tutorial components', async ({ page }) => {
    // Check for tutorial section
    await expect(page.getByTestId('hjkl-tutorial')).toBeVisible();
    
    // Check for command cards
    await expect(page.getByTestId('command-card-h')).toBeVisible();
    await expect(page.getByTestId('command-card-j')).toBeVisible();
    await expect(page.getByTestId('command-card-k')).toBeVisible();
    await expect(page.getByTestId('command-card-l')).toBeVisible();
  });

  test('should display progress tracking', async ({ page }) => {
    // Check for progress section
    await expect(page.getByTestId('hjkl-progress')).toBeVisible();
    await expect(page.getByText('Progress: 0%')).toBeVisible();
    await expect(page.getByTestId('hjkl-progress').getByText('Score: 0')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Verify main content is still visible
      await expect(page.getByRole('heading', { name: /vim trainer/i })).toBeVisible();
      await expect(page.getByTestId('hjkl-tutorial')).toBeVisible();
      
      console.log(`✓ Responsive layout verified for ${viewport.name}`);
    }
  });
});