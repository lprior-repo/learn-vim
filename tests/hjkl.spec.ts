import { test, expect, type Page } from "@playwright/test";
import { verifyMovement, executeVimCommand, getCursorPosition } from "./utils";

/**
 * HJKL Navigation Test Suite
 * Tests the core Vim movement commands using the new command handling architecture
 */
test.describe("HJKL Navigation Tests", () => {
  let page: Page;
  const testContent = "First line\nSecond line\nThird line\nFourth line";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Fast page load without retries
    await page.goto("http://localhost:3000/category/basic-movement/hjkl");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 5000 });

    // Wait for editor initialization
    await page.waitForFunction(
      () => {
        const monaco = (window as any).monaco;
        const editor = monaco?.editor?.getEditors()[0];
        return monaco !== undefined && editor !== undefined;
      },
      { timeout: 5000 },
    );

    // Set up test content with verification
    await page
      .evaluate((content) => {
        const editor = (window as any).monaco.editor.getEditors()[0];
        editor.setValue(content);
        editor.setPosition({ lineNumber: 1, column: 1 });

        // Verify content and position
        return {
          contentSet: editor.getValue() === content,
          position: editor.getPosition(),
        };
      }, testContent)
      .then((result) => {
        expect(result.contentSet).toBe(true);
        expect(result.position).toEqual({ lineNumber: 1, column: 1 });
      });

    // Wait for editor initialization
    await page.waitForFunction(
      () => {
        const editor = (window as any).monaco?.editor?.getEditors()[0];
        return editor && editor.getModel() && editor.getPosition();
      },
      { timeout: 5000 },
    );

    // Ensure clean vim state
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Verify normal mode
    const isNormal = await page.evaluate(() => {
      const status = document.querySelector('.monaco-editor [role="status"]')?.textContent || "";
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      return status.includes("NORMAL") && !editor?.getOption("readOnly");
    });

    if (!isNormal) {
      throw new Error("Failed to ensure normal mode");
    }
  });

  /**
   * Helper to get cursor position
   */
  async function getCursorPosition(page: Page) {
    return await page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      return editor
        ? {
            lineNumber: editor.getPosition().lineNumber,
            column: editor.getPosition().column,
          }
        : null;
    });
  }

  /**
   * Helper to verify editor mode
   */
  async function getEditorMode(page: Page) {
    return await page.evaluate(() => {
      const statusBar = document.querySelector('.monaco-editor [role="status"]');
      return statusBar?.textContent || "";
    });
  }

  /**
   * Test h command (left movement)
   */
  test("should move cursor left with h key", async () => {
    // Setup position by moving right twice
    await verifyMovement(page, { key: "l", expected: { column: 1 } });
    await verifyMovement(page, { key: "l", expected: { column: 1 } });

    // Test movement left
    await verifyMovement(page, { key: "h", expected: { column: -1 } });
  });

  /**
   * Test j command (down movement)
   */
  test("should move cursor down with j key", async () => {
    await verifyMovement(page, { key: "j", expected: { line: 1 } });
  });

  /**
   * Test k command (up movement)
   */
  test("should move cursor up with k key", async () => {
    // Move down two lines first
    await verifyMovement(page, { key: "j", expected: { line: 1 } });
    await verifyMovement(page, { key: "j", expected: { line: 1 } });

    // Test upward movement
    await verifyMovement(page, { key: "k", expected: { line: -1 } });
  });

  /**
   * Test l command (right movement)
   */
  test("should move cursor right with l key", async () => {
    await verifyMovement(page, { key: "l", expected: { column: 1 } });
  });

  /**
   * Test combined movements
   */
  test("should handle combined hjkl movements correctly", async () => {
    await executeVimCommand(page, "ll", { column: 2 });
    await executeVimCommand(page, "j", { line: 1 });
    await executeVimCommand(page, "h", { column: -1 });

    // Verify final position
    const finalPos = await getCursorPosition(page);
    expect(finalPos).toEqual({
      lineNumber: 2,
      column: 2,
    });
  });

  /**
   * Test movement boundaries
   */
  test("should respect movement boundaries", async () => {
    // Test left boundary
    await page.keyboard.press("h");
    let pos = await getCursorPosition(page);
    expect(pos?.column).toBe(1);

    // Test top boundary
    await page.keyboard.press("k");
    pos = await getCursorPosition(page);
    expect(pos?.lineNumber).toBe(1);

    // Move to last line
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("j");
    }
    pos = await getCursorPosition(page);
    expect(pos?.lineNumber).toBe(4); // Should stop at last line

    // Test right boundary
    const line1Length = "First line".length;
    for (let i = 0; i < line1Length + 5; i++) {
      await page.keyboard.press("l");
    }
    pos = await getCursorPosition(page);
    expect(pos?.column).toBe(line1Length + 1); // Should stop at line end
  });

  /**
   * Test mode preservation
   */
  test("should maintain normal mode during movement", async () => {
    // Perform various movements
    const movements = ["h", "j", "k", "l", "h", "j"];
    for (const movement of movements) {
      await page.keyboard.press(movement);
      const mode = await getEditorMode(page);
      expect(mode).not.toContain("INSERT");
    }
  });
});
