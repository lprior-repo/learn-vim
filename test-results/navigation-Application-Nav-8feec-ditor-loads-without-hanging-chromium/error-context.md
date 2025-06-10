# Test info

- Name: Application Navigation - ATDD >> Given user navigates to category page - When page loads - Then editor loads without hanging
- Location: /home/family/src/vim/tests/navigation.spec.ts:78:3

# Error details

```
Error: Timed out 15000ms waiting for expect(locator).toBeVisible()

Locator: locator('h1, h2').first()
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 15000ms
  - waiting for locator('h1, h2').first()

    at ensurePageLoaded (/home/family/src/vim/tests/navigation.spec.ts:26:50)
    at /home/family/src/vim/tests/navigation.spec.ts:97:7
```

# Page snapshot

```yaml
- banner:
  - link "Vim Trainer":
    - /url: /
  - navigation:
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "About":
          - /url: /about
      - listitem:
        - link "Practice":
          - /url: /practice
- complementary:
  - navigation
- main
- contentinfo:
  - paragraph: Vim Trainer - Become a Vim expert through interactive exercises
  - paragraph: Practice makes perfect! Keep trying different Vim commands to build muscle memory.
- alert
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * ATDD Navigation Test Suite
   5 |  * 
   6 |  * Following Acceptance Test-Driven Development principles:
   7 |  * - Tests focus on user acceptance criteria
   8 |  * - Tests verify complete user journeys
   9 |  * - Tests use Given-When-Then structure
   10 |  * - Tests ensure reliable navigation without loading issues
   11 |  */
   12 | test.describe('Application Navigation - ATDD', () => {
   13 |   
   14 |   /**
   15 |    * Helper to ensure page is fully loaded without hanging
   16 |    */
   17 |   async function ensurePageLoaded(page: any, expectedUrl?: string) {
   18 |     await page.waitForLoadState('domcontentloaded');
   19 |     await page.waitForLoadState('networkidle', { timeout: 15000 });
   20 |     
   21 |     // Allow some time for legitimate loading to complete
   22 |     await page.waitForTimeout(1000);
   23 |     
   24 |     // Verify essential elements are visible
   25 |     await expect(page.locator('header')).toBeVisible();
>  26 |     await expect(page.locator('h1, h2').first()).toBeVisible();
      |                                                  ^ Error: Timed out 15000ms waiting for expect(locator).toBeVisible()
   27 |     
   28 |     if (expectedUrl) {
   29 |       expect(page.url()).toContain(expectedUrl);
   30 |     }
   31 |   }
   32 |   
   33 |   test.beforeEach(async ({ page }) => {
   34 |     // Given: User navigates to the home page
   35 |     await page.goto('/');
   36 |     await ensurePageLoaded(page);
   37 |   });
   38 |
   39 |   test('Given user is on home page - When clicking navigation links - Then pages load without hanging', async ({ page }) => {
   40 |     // Given: User sees main call-to-action links on home page
   41 |     const practiceLink = page.getByRole('link', { name: 'Start Practicing' });
   42 |     const basicsLink = page.getByRole('link', { name: 'Learn Basics' });
   43 |     
   44 |     await expect(practiceLink).toBeVisible();
   45 |     await expect(basicsLink).toBeVisible();
   46 |     
   47 |     // When: User clicks the Learn Basics link
   48 |     await basicsLink.click();
   49 |     
   50 |     // Then: Category page loads completely without hanging
   51 |     await ensurePageLoaded(page, '/category/basic-movement');
   52 |     await expect(page.getByRole('heading', { name: 'Basic Movement' })).toBeVisible();
   53 |     await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
   54 |     
   55 |     // When: User navigates back home via header
   56 |     const homeLink = page.locator('header').getByRole('link').first();
   57 |     await homeLink.click();
   58 |     
   59 |     // Then: Home page loads without hanging
   60 |     await ensurePageLoaded(page);
   61 |     await expect(page.getByRole('heading', { name: 'Welcome to Vim Trainer' })).toBeVisible();
   62 |   });
   63 |
   64 |   test('Given user sees featured commands - When clicking view all links - Then category pages load properly', async ({ page }) => {
   65 |     // Given: User sees featured commands with "View all" links
   66 |     const viewAllLinks = page.getByText('View all →');
   67 |     expect(await viewAllLinks.count()).toBeGreaterThan(0);
   68 |     
   69 |     // When: User clicks the first "View all" link
   70 |     await viewAllLinks.first().click();
   71 |     
   72 |     // Then: Category page loads completely without hanging
   73 |     await ensurePageLoaded(page, '/category/');
   74 |     await expect(page.locator('h1, h2').first()).toBeVisible();
   75 |     await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
   76 |   });
   77 |
   78 |   test('Given user navigates to category page - When page loads - Then editor loads without hanging', async ({ page }) => {
   79 |     // Given: User navigates to a category page directly
   80 |     await page.goto('/category/basic-movement');
   81 |     
   82 |     // When: Page loads
   83 |     await ensurePageLoaded(page, '/category/basic-movement');
   84 |     
   85 |     // Then: Editor loads properly without hanging
   86 |     await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 10000 });
   87 |     await expect(page.getByRole('heading', { name: 'Basic Movement' })).toBeVisible();
   88 |     
   89 |     // Given: User sees command cards on the category page
   90 |     const commandCards = page.locator('.grid .block');
   91 |     
   92 |     // When: User clicks a command card (if available)
   93 |     if (await commandCards.count() > 0) {
   94 |       await commandCards.first().click();
   95 |       
   96 |       // Then: Command detail page loads with editor
   97 |       await ensurePageLoaded(page);
   98 |       await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 10000 });
   99 |     }
  100 |   });
  101 |
  102 |   test('Given user is on command detail page - When navigating back home - Then navigation works without hanging', async ({ page }) => {
  103 |     // Given: User navigates to a category page first
  104 |     await page.goto('/category/basic-movement');
  105 |     await ensurePageLoaded(page, '/category/basic-movement');
  106 |     
  107 |     // Given: User navigates to a command detail page
  108 |     const commandCards = page.locator('.grid .block');
  109 |     if (await commandCards.count() > 0) {
  110 |       await commandCards.first().click();
  111 |       await ensurePageLoaded(page);
  112 |       
  113 |       // When: User clicks the home link in header
  114 |       const homeLink = page.locator('header').getByRole('link').first();
  115 |       await homeLink.click();
  116 |       
  117 |       // Then: Home page loads without hanging
  118 |       await ensurePageLoaded(page);
  119 |       await expect(page.getByRole('heading', { name: 'Welcome to Vim Trainer' })).toBeVisible();
  120 |     }
  121 |   });
  122 |
  123 |   test('Given user visits different pages - When checking layout consistency - Then header renders on all pages', async ({ page }) => {
  124 |     const pagesToTest = [
  125 |       { path: '/', name: 'Home' },
  126 |       { path: '/category/basic-movement', name: 'Category' },
```