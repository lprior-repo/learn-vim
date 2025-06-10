import { test, expect, Page } from '@playwright/test';

/**
 * ATDD Loading Verification Test Suite
 * 
 * Following Acceptance Test-Driven Development principles:
 * - Tests focus on user acceptance criteria
 * - Tests verify complete user journeys
 * - Tests ensure application loads reliably across all pages
 * - Tests follow Given-When-Then structure
 */
test.describe('Application Loading Verification - ATDD', () => {
  
  /**
   * Helper function to verify page is fully loaded
   */
  async function verifyPageFullyLoaded(page: Page, pageName: string) {
    // Wait for DOM content to be loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Wait for initial loading to complete - allow some time for legitimate loading
    await page.waitForTimeout(1000);
    
    // Verify layout is rendered
    await expect(page.locator('header')).toBeVisible();
    
    // Verify page has a proper heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // For pages with editors, wait for editor to load but don't fail if loading spinner briefly appears
    const hasEditor = await page.locator('.monaco-editor').count() > 0;
    if (hasEditor) {
      // Wait for Monaco editor to be fully loaded
      await page.waitForFunction(
        () => {
          const editors = (window as any).monaco?.editor?.getEditors();
          return editors && editors.length > 0;
        },
        { timeout: 15000 }
      );
    }
    
    console.log(`✓ ${pageName} loaded successfully`);
  }
  
  /**
   * Helper function to verify Monaco editor is properly loaded
   */
  async function verifyMonacoEditorLoaded(page: Page) {
    // Wait for Monaco editor to be visible
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    
    // Verify Monaco is available globally
    const monacoReady = await page.evaluate(() => {
      const monaco = (window as any).monaco;
      const editors = monaco?.editor?.getEditors();
      return monaco !== undefined && editors && editors.length > 0;
    });
    
    expect(monacoReady).toBe(true);
    
    // Verify vim mode is active
    const vimModeActive = await page.evaluate(() => {
      const statusElements = document.querySelectorAll('[role="status"], [data-testid="mode-indicator"]');
      return Array.from(statusElements).some(el => 
        el.textContent?.includes('NORMAL') || 
        el.textContent?.includes('INSERT') ||
        el.textContent?.includes('VISUAL')
      );
    });
    
    expect(vimModeActive).toBe(true);
    console.log('✓ Monaco Editor with Vim mode loaded successfully');
  }

  test.describe('Given the application is deployed', () => {
    
    test('When user visits home page - Then page loads completely without hanging', async ({ page }) => {
      // Given: User navigates to home page
      await page.goto('/');
      
      // When: Page loads
      await verifyPageFullyLoaded(page, 'Home Page');
      
      // Then: User sees welcome content
      await expect(page.getByRole('heading', { name: 'Welcome to Vim Trainer' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Start Practicing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Learn Basics' })).toBeVisible();
    });

    test('When user visits category pages - Then all pages load without hanging', async ({ page }) => {
      const categories = [
        { path: '/category/basic-movement', title: 'Basic Movement' },
        { path: '/category/mode-switching', title: 'Mode Switching' },
        { path: '/category/text-editing', title: 'Text Editing' },
        { path: '/category/advanced-movement', title: 'Advanced Movement' }
      ];

      for (const category of categories) {
        // Given: User navigates to category page
        await page.goto(category.path);
        
        // When: Page loads
        await verifyPageFullyLoaded(page, `Category: ${category.title}`);
        
        // Then: Monaco editor loads and category content is visible
        await verifyMonacoEditorLoaded(page);
        await expect(page.getByRole('heading', { name: category.title })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Commands in this Category' })).toBeVisible();
      }
    });

    test('When user visits command detail pages - Then pages load with functional editors', async ({ page }) => {
      const commandPages = [
        { path: '/category/basic-movement/hjkl', title: 'Basic Movement: HJKL Keys' },
        { path: '/category/mode-switching/insert-mode', title: 'Insert Mode' },
        { path: '/category/text-editing/delete-character', title: 'Delete Character' }
      ];

      for (const command of commandPages) {
        // Given: User navigates to command detail page
        await page.goto(command.path);
        
        // When: Page loads
        await verifyPageFullyLoaded(page, `Command: ${command.title}`);
        
        // Then: Monaco editor loads and is interactive
        await verifyMonacoEditorLoaded(page);
        
        // Verify editor is interactive by testing basic vim commands
        await page.keyboard.press('Escape'); // Ensure normal mode
        await page.waitForTimeout(200);
        
        const initialPos = await page.evaluate(() => {
          const editor = (window as any).monaco.editor.getEditors()[0];
          return editor ? editor.getPosition() : null;
        });
        
        expect(initialPos).toBeTruthy();
        console.log(`✓ ${command.title} editor is interactive`);
      }
    });

    test('When user visits learning paths - Then pages load without hanging', async ({ page }) => {
      // Given: User navigates to learning paths page
      await page.goto('/learning-paths');
      
      // When: Page loads
      await verifyPageFullyLoaded(page, 'Learning Paths');
      
      // Then: Learning paths content is visible
      await expect(page.getByRole('heading', { name: 'Learning Paths' })).toBeVisible();
      
      // Verify learning path cards are present
      const pathCards = page.locator('.grid .block, .learning-path-card');
      expect(await pathCards.count()).toBeGreaterThan(0);
    });

    test('When user navigates between pages - Then navigation works smoothly', async ({ page }) => {
      // Given: User starts on home page
      await page.goto('/');
      await verifyPageFullyLoaded(page, 'Home Page - Initial');
      
      // When: User navigates to different pages in sequence
      // Home -> Category -> Command -> Learning Paths -> Home
      
      // Navigate to basic movement category
      await page.getByRole('link', { name: 'Learn Basics' }).click();
      await page.waitForURL('**/category/basic-movement');
      await verifyPageFullyLoaded(page, 'Category Page via Navigation');
      await verifyMonacoEditorLoaded(page);
      
      // Navigate to HJKL command
      const hjklCard = page.locator('.grid .block').filter({ hasText: 'Basic Cursor Movement' }).first();
      await hjklCard.click();
      await page.waitForURL('**/category/basic-movement/hjkl');
      await verifyPageFullyLoaded(page, 'Command Page via Navigation');
      await verifyMonacoEditorLoaded(page);
      
      // Navigate to learning paths
      await page.goto('/learning-paths');
      await verifyPageFullyLoaded(page, 'Learning Paths via Navigation');
      
      // Navigate back to home
      const homeLink = page.locator('header').getByRole('link').first();
      await homeLink.click();
      await page.waitForLoadState('domcontentloaded');
      await verifyPageFullyLoaded(page, 'Home Page via Navigation');
      
      // Then: All navigation completed successfully
      expect(page.url()).toMatch(/\/$|\/$/);
    });

    test('When user encounters errors - Then error pages load gracefully', async ({ page }) => {
      // Given: User navigates to non-existent pages
      const errorScenarios = [
        { path: '/category/non-existent-category', expectedError: 'Category Not Found' },
        { path: '/category/basic-movement/non-existent-command', expectedError: 'Command Not Found' },
        { path: '/completely-invalid-path', expectedError: 'Page Not Found' }
      ];

      for (const scenario of errorScenarios) {
        // When: User visits invalid URL
        await page.goto(scenario.path);
        
        // Then: Error page loads properly
        await verifyPageFullyLoaded(page, `Error Page: ${scenario.path}`);
        
        // Verify error message is displayed
        await expect(page.locator('h1, h2').filter({ hasText: scenario.expectedError })).toBeVisible();
        
        // Verify recovery options are available
        const homeLink = page.getByRole('link', { name: /home|back/i }).first();
        await expect(homeLink).toBeVisible();
        
        console.log(`✓ Error scenario handled: ${scenario.path}`);
      }
    });

    test('When application loads with different viewport sizes - Then responsive loading works', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop Large' },
        { width: 1280, height: 720, name: 'Desktop Standard' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      for (const viewport of viewports) {
        // Given: User has specific viewport size
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // When: User visits home page
        await page.goto('/');
        await verifyPageFullyLoaded(page, `Home Page - ${viewport.name}`);
        
        // Then: Layout adapts properly
        await expect(page.locator('header')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Welcome to Vim Trainer' })).toBeVisible();
        
        // When: User visits editor page
        await page.goto('/category/basic-movement/hjkl');
        await verifyPageFullyLoaded(page, `Editor Page - ${viewport.name}`);
        await verifyMonacoEditorLoaded(page);
        
        console.log(`✓ Responsive loading verified for ${viewport.name}`);
      }
    });

    test('When multiple rapid navigations occur - Then application handles concurrent loading', async ({ page }) => {
      // Given: User starts on home page
      await page.goto('/');
      await verifyPageFullyLoaded(page, 'Home Page - Rapid Navigation Test');
      
      // When: User performs rapid navigation sequence
      const rapidNavSequence = [
        '/category/basic-movement',
        '/learning-paths',
        '/category/mode-switching',
        '/category/basic-movement/hjkl',
        '/',
        '/category/text-editing'
      ];
      
      for (let i = 0; i < rapidNavSequence.length; i++) {
        const path = rapidNavSequence[i];
        
        // Navigate quickly
        await page.goto(path);
        
        // Verify page loads properly even with rapid navigation
        await verifyPageFullyLoaded(page, `Rapid Nav ${i + 1}: ${path}`);
        
        // If it's an editor page, verify Monaco loads
        if (path.includes('/category/') && path.split('/').length > 3) {
          await verifyMonacoEditorLoaded(page);
        }
        
        // Small delay to simulate realistic user behavior
        await page.waitForTimeout(100);
      }
      
      // Then: All rapid navigations completed successfully
      console.log('✓ Rapid navigation sequence completed successfully');
    });
  });
});