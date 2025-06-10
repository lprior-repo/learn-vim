import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1:has-text("Welcome to Vim Trainer")');
  });

  test('should display welcome section with call-to-action buttons', async ({ page }) => {
    // Check if the welcome section is visible
    const welcomeSection = page.locator('section').first();
    await expect(welcomeSection).toBeVisible();
    
    // Check welcome heading
    const heading = welcomeSection.getByRole('heading', { name: 'Welcome to Vim Trainer' });
    await expect(heading).toBeVisible();
    
    // Check description text
    const description = welcomeSection.locator('p').first();
    await expect(description).toBeVisible();
    await expect(description).toContainText('Master Vim commands');
    
    // Check call-to-action buttons
    const startPracticingButton = page.getByRole('link', { name: 'Start Practicing' });
    await expect(startPracticingButton).toBeVisible();
    
    const learnBasicsButton = page.getByRole('link', { name: 'Learn Basics' });
    await expect(learnBasicsButton).toBeVisible();
  });

  test('should display featured commands section', async ({ page }) => {
    // Check if the featured commands section is visible
    const featuredSection = page.locator('section:has-text("Featured Commands")');
    await expect(featuredSection).toBeVisible();
    
    // Check section heading
    const heading = featuredSection.getByRole('heading', { name: 'Featured Commands' });
    await expect(heading).toBeVisible();
    
    // Check if multiple categories are displayed
    const categoryHeadings = featuredSection.getByRole('heading', { level: 3 });
    expect(await categoryHeadings.count()).toBeGreaterThan(1);
    
    // Check if command cards are displayed
    const commandCards = featuredSection.locator('.grid .block');
    expect(await commandCards.count()).toBeGreaterThan(3);
    
    // Check if "View all" links are present
    const viewAllLinks = featuredSection.getByText('View all →');
    expect(await viewAllLinks.count()).toBeGreaterThan(1);
  });

  test('should navigate to learning paths when clicking start practicing', async ({ page }) => {
    // Find and click the Start Practicing button
    const startPracticingButton = page.getByRole('link', { name: 'Start Practicing' });
    await startPracticingButton.click();
    
    // Check if we navigated to the learning paths page
    await page.waitForURL('**/learning-paths');
    
    // Verify we're on the learning paths page
    await expect(page.url()).toContain('/learning-paths');
  });

  test('should navigate to basic movement page when clicking learn basics', async ({ page }) => {
    // Find and click the Learn Basics button
    const learnBasicsButton = page.getByRole('link', { name: 'Learn Basics' });
    await learnBasicsButton.click();
    
    // Check if we navigated to the basic movement category
    await page.waitForURL('**/category/basic-movement');
    
    // Verify we're on the basic movement page
    await expect(page.url()).toContain('/category/basic-movement');
  });

  test('should navigate to command page when clicking a featured command card', async ({ page }) => {
    // Find the first command card
    const commandCard = page.locator('.grid .block').first();
    
    // Click the card
    await commandCard.click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Check URL pattern - should contain /category/ and a command ID
    await expect(page.url()).toMatch(/\/category\/[\w-]+\/[\w-]+/);
    
    // Verify we're on a command detail page with proper structure
    // Command pages should have either h1 or h2 heading visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display why learn vim section', async ({ page }) => {
    // Find the "Why Learn Vim?" section
    const whyLearnSection = page.locator('section:has-text("Why Learn Vim?")');
    await expect(whyLearnSection).toBeVisible();
    
    // Check section heading
    const heading = whyLearnSection.getByRole('heading', { name: 'Why Learn Vim?' });
    await expect(heading).toBeVisible();
    
    // Check if it contains a list of benefits
    const benefitsList = whyLearnSection.locator('ul');
    await expect(benefitsList).toBeVisible();
    
    // Should have multiple benefits listed
    const benefits = benefitsList.locator('li');
    expect(await benefits.count()).toBeGreaterThanOrEqual(3);
    
    // Check for specific benefits - use first() to avoid strict mode violation
    await expect(page.locator('text=Efficiency:')).toBeVisible();
    await expect(page.locator('text=Ubiquity:')).toBeVisible();
    await expect(page.locator('text=Customizability:')).toBeVisible();
  });
});