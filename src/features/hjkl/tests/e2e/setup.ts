// Playwright e2e test setup for HJKL feature
import { test as base, expect } from '@playwright/test'

// Custom test fixture for HJKL tests
export const test = base.extend<{
  hjklPage: any
}>({
  hjklPage: async ({ page }, use) => {
    // Navigate to HJKL page and wait for it to load
    await page.goto('/hjkl')
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
    
    // Clear any existing progress
    await page.evaluate(() => {
      localStorage.removeItem('hjkl-progress')
    })
    
    await use(page)
  }
})

// Custom matchers for HJKL testing
expect.extend({
  async toHaveHjklProgress(page: any, expectedProgress: number) {
    const progressText = await page.getByText(`Progress: ${expectedProgress}%`).textContent()
    const pass = progressText === `Progress: ${expectedProgress}%`
    
    return {
      message: () => pass 
        ? `Expected progress not to be ${expectedProgress}%`
        : `Expected progress to be ${expectedProgress}%, but got ${progressText}`,
      pass
    }
  },
  
  async toHaveCompletedCommand(page: any, command: string) {
    const commandCard = page.getByTestId(`command-card-${command}`)
    const hasCompletedClass = await commandCard.evaluate((el: Element) => 
      el.classList.contains('completed')
    )
    
    return {
      message: () => hasCompletedClass
        ? `Expected command ${command} not to be completed`
        : `Expected command ${command} to be completed`,
      pass: hasCompletedClass
    }
  }
})