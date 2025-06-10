// End-to-end tests for HJKL user workflows using Playwright
import { test, expect, Page } from '@playwright/test'

test.describe('HJKL Learning Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hjkl')
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
  })

  test('should complete basic HJKL learning journey', async ({ page }) => {
    // Verify initial state
    await expect(page.getByText('Progress: 0%')).toBeVisible()
    await expect(page.getByText('Score: 0')).toBeVisible()
    
    // Practice H key
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    await page.keyboard.press('h')
    
    await expect(page.getByText('✓ H key mastered')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Progress: 25%')).toBeVisible()
    
    // Practice J key
    await page.keyboard.press('j')
    await expect(page.getByText('✓ J key mastered')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Progress: 50%')).toBeVisible()
    
    // Practice K key
    await page.keyboard.press('k')
    await expect(page.getByText('✓ K key mastered')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Progress: 75%')).toBeVisible()
    
    // Practice L key
    await page.keyboard.press('l')
    await expect(page.getByText('✓ L key mastered')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Progress: 100%')).toBeVisible()
    
    // Verify completion
    await expect(page.getByText('🎉 All HJKL Commands Mastered!')).toBeVisible()
  })

  test('should handle individual key practice through command cards', async ({ page }) => {
    // Click on J command card
    await page.getByTestId('command-card-j').click()
    await expect(page.getByText('Practicing J key movement')).toBeVisible()
    
    // Practice the J key
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    await page.keyboard.press('j')
    
    await expect(page.getByText('✓ J key mastered')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('command-card-j')).toHaveClass(/completed/)
  })

  test('should show real-time cursor position updates', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Initial position
    await expect(page.getByText('Line: 1, Column: 1')).toBeVisible()
    
    // Move right with L
    await page.keyboard.press('l')
    await expect(page.getByText('Line: 1, Column: 2')).toBeVisible({ timeout: 3000 })
    
    // Move down with J
    await page.keyboard.press('j')
    await expect(page.getByText('Line: 2, Column: 2')).toBeVisible({ timeout: 3000 })
    
    // Move left with H
    await page.keyboard.press('h')
    await expect(page.getByText('Line: 2, Column: 1')).toBeVisible({ timeout: 3000 })
    
    // Move up with K
    await page.keyboard.press('k')
    await expect(page.getByText('Line: 1, Column: 1')).toBeVisible({ timeout: 3000 })
  })

  test('should handle boundary collisions gracefully', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Try to move left from initial position (should be at boundary)
    await page.keyboard.press('h')
    await expect(page.getByText('Cannot move left: at boundary')).toBeVisible({ timeout: 3000 })
    
    // Try to move up from initial position (should be at boundary)
    await page.keyboard.press('k')
    await expect(page.getByText('Cannot move up: at boundary')).toBeVisible({ timeout: 3000 })
  })

  test('should provide helpful learning hints', async ({ page }) => {
    await expect(page.getByText('Remember: H moves left, L moves right')).toBeVisible()
    await expect(page.getByText('J moves down, K moves up')).toBeVisible()
    
    // Show keyboard shortcuts
    await page.getByText('Show Shortcuts').click()
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
    await expect(page.getByText('H - Move cursor left')).toBeVisible()
    await expect(page.getByText('J - Move cursor down')).toBeVisible()
    await expect(page.getByText('K - Move cursor up')).toBeVisible()
    await expect(page.getByText('L - Move cursor right')).toBeVisible()
  })

  test('should allow progress reset', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Make some progress
    await page.keyboard.press('h')
    await page.keyboard.press('j')
    await expect(page.getByText('Progress: 50%')).toBeVisible()
    
    // Reset progress
    await page.getByText('Reset Progress').click()
    await expect(page.getByText('Progress: 0%')).toBeVisible()
    await expect(page.getByText('Score: 0')).toBeVisible()
    
    // Verify command cards are no longer marked as completed
    await expect(page.getByTestId('command-card-h')).not.toHaveClass(/completed/)
    await expect(page.getByTestId('command-card-j')).not.toHaveClass(/completed/)
  })

  test('should persist learning progress across page reloads', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Make some progress
    await page.keyboard.press('h')
    await page.keyboard.press('j')
    await expect(page.getByText('Progress: 50%')).toBeVisible()
    
    // Reload the page
    await page.reload()
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
    
    // Verify progress is restored
    await expect(page.getByText('Progress: 50%')).toBeVisible()
    await expect(page.getByTestId('command-card-h')).toHaveClass(/completed/)
    await expect(page.getByTestId('command-card-j')).toHaveClass(/completed/)
  })

  test('should ignore non-HJKL key presses', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Press non-HJKL keys
    await page.keyboard.press('a')
    await page.keyboard.press('w')
    await page.keyboard.press('1')
    await page.keyboard.press('Space')
    
    // Verify no progress made
    await expect(page.getByText('Progress: 0%')).toBeVisible()
    await expect(page.getByText('Score: 0')).toBeVisible()
  })

  test('should show completion celebration', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Complete all movements quickly
    await page.keyboard.press('h')
    await page.keyboard.press('j')
    await page.keyboard.press('k')
    await page.keyboard.press('l')
    
    // Check for completion celebration
    await expect(page.getByText('🎉 All HJKL Commands Mastered!')).toBeVisible()
    await expect(page.getByText('Perfect Score: 100')).toBeVisible()
    await expect(page.getByText('Ready for Advanced Movement')).toBeVisible()
    
    // Should show next steps
    await expect(page.getByText('Continue to Word Movement')).toBeVisible()
  })

  test('should handle rapid key sequences', async ({ page }) => {
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Rapid sequence of movements
    await page.keyboard.press('h')
    await page.keyboard.press('j')
    await page.keyboard.press('k')
    await page.keyboard.press('l')
    await page.keyboard.press('h')
    await page.keyboard.press('j')
    
    // Should handle all movements correctly
    await expect(page.getByText('Progress: 100%')).toBeVisible({ timeout: 5000 })
  })

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('command-card-h')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('command-card-j')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('command-card-k')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('command-card-l')).toBeFocused()
    
    // Should be able to activate cards with Enter
    await page.keyboard.press('Enter')
    await expect(page.getByText('Practicing L key movement')).toBeVisible()
  })

  test('should work on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
    await expect(page.getByTestId('hjkl-tutorial')).toBeVisible()
    await expect(page.getByTestId('hjkl-editor')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
  })

  test('should handle page navigation correctly', async ({ page }) => {
    // Complete the learning
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    await page.keyboard.press('h')
    await page.keyboard.press('j')
    await page.keyboard.press('k')
    await page.keyboard.press('l')
    
    await expect(page.getByText('Continue to Word Movement')).toBeVisible()
    
    // Navigate to next section
    await page.getByText('Continue to Word Movement').click()
    
    // Should navigate to word movement page
    await expect(page).toHaveURL(/.*word-movement.*/)
  })
})

test.describe('HJKL Performance and Stability', () => {
  test('should handle continuous movement without performance degradation', async ({ page }) => {
    await page.goto('/hjkl')
    
    const editor = page.getByTestId('hjkl-editor')
    await editor.focus()
    
    // Perform many movements
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press(['h', 'j', 'k', 'l'][i % 4])
    }
    
    // Should still be responsive
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
    await expect(page.getByText('Progress: 100%')).toBeVisible({ timeout: 10000 })
  })

  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/hjkl')
    await expect(page.getByTestId('hjkl-page')).toBeVisible()
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle editor focus correctly', async ({ page }) => {
    await page.goto('/hjkl')
    
    const editor = page.getByTestId('hjkl-editor')
    
    // Click elsewhere to lose focus
    await page.getByTestId('hjkl-tutorial').click()
    
    // Click back on editor
    await editor.click()
    
    // Should accept key presses
    await page.keyboard.press('h')
    await expect(page.getByText('✓ H key mastered')).toBeVisible({ timeout: 5000 })
  })
})