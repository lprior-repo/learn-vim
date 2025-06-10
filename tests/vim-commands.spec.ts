import { test, expect, type Page } from "@playwright/test";

/**
 * Vim Commands Test Suite
 * Tests the new command handling architecture with proper state verification
 */
test.describe("Vim Commands Functionality", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("http://localhost:3000");

    // Wait for editor with increased timeout
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30000 });

    // Wait for editor to be fully initialized
    await page.waitForFunction(
      () => {
        const editor = (window as any).monaco?.editor?.getEditors()[0];
        return editor?.getModel()?.getValue() !== undefined;
      },
      { timeout: 30000 },
    );

    // Ensure clean state
    await ensureNormalMode(page);
    await clearEditor(page);

    // Verify editor is ready
    await page.waitForFunction(
      () => {
        return document.querySelector('.monaco-editor [role="status"]')?.textContent?.includes("NORMAL");
      },
      { timeout: 10000 },
    );
  });

  /**
   * Helper functions with state verification
   */
  async function ensureNormalMode(page: Page) {
    await page.keyboard.press("Escape");
    const mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");
  }

  async function clearEditor(page: Page) {
    // Ensure normal mode
    await page.keyboard.press("Escape");

    // Try different clear approaches
    for (const clearCommand of ["ggdG", ":%d", "ggVGd"]) {
      try {
        // Execute clear command
        await page.keyboard.type(clearCommand);
        if (clearCommand === ":%d") {
          await page.keyboard.press("Enter");
        }

        // Verify content is cleared
        const content = await getEditorContent(page);
        if (content.trim() === "") {
          return;
        }

        // If not cleared, try manual clear
        if (clearCommand === "ggVGd") {
          await page.keyboard.press("i");
          await page.keyboard.press("Control+a");
          await page.keyboard.press("Delete");
          await page.keyboard.press("Escape");

          const manualContent = await getEditorContent(page);
          if (manualContent.trim() === "") {
            return;
          }
        }
      } catch (e) {
        console.warn(`Clear attempt with ${clearCommand} failed:`, e.message);
      }
    }
    throw new Error("Failed to clear editor content after multiple attempts");
  }

  async function getEditorContent(page: Page): Promise<string> {
    return await page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      return editor?.getValue() || "";
    });
  }

  async function getEditorMode(page: Page): Promise<string> {
    return await page.evaluate(() => {
      const statusBar = document.querySelector('.monaco-editor [role="status"]');
      return statusBar?.textContent || "";
    });
  }

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

  async function typeInEditor(page: Page, text: string) {
    await page.keyboard.press("i");
    await page.keyboard.type(text);
    await page.keyboard.press("Escape");
    const content = await getEditorContent(page);
    expect(content).toContain(text);
  }

  /**
   * Command Mode Tests
   */
  test("command mode operations", async () => {
    await typeInEditor(page, "Line 1\nLine 2\nLine 3");

    // Test :1 command
    await page.keyboard.type(":1");
    await page.keyboard.press("Enter");
    let pos = await getCursorPosition(page);
    expect(pos?.lineNumber).toBe(1);

    // Test mode preservation
    let mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");

    // Test :$ command
    await page.keyboard.type(":$");
    await page.keyboard.press("Enter");
    pos = await getCursorPosition(page);
    expect(pos?.lineNumber).toBe(3);
  });

  /**
   * Mode Transition Tests
   */
  test("mode transitions", async () => {
    // Normal to Insert
    await page.keyboard.press("i");
    let mode = await getEditorMode(page);
    expect(mode).toContain("INSERT");

    // Insert to Normal
    await page.keyboard.press("Escape");
    mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");

    // Normal to Visual
    await page.keyboard.press("v");
    mode = await getEditorMode(page);
    expect(mode).toContain("VISUAL");

    // Visual to Normal
    await page.keyboard.press("Escape");
    mode = await getEditorMode(page);
    expect(mode).not.toContain("VISUAL");
  });

  /**
   * Command Registration Tests
   */
  test("custom command execution", async () => {
    await typeInEditor(page, "Test custom command");

    // Execute custom command sequence
    await page.keyboard.type("ciw");
    await page.keyboard.type("Changed");
    await page.keyboard.press("Escape");

    const content = await getEditorContent(page);
    expect(content).toContain("Changed custom command");

    // Verify mode after command
    const mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");
  });

  /**
   * State Verification Tests
   */
  test("editor state consistency", async () => {
    // Setup initial content
    await typeInEditor(page, "Line 1\nLine 2\nLine 3");

    // Test cursor state after movements
    await page.keyboard.press("j");
    let pos = await getCursorPosition(page);
    expect(pos?.lineNumber).toBe(2);

    // Test content state after deletion
    await page.keyboard.type("dd");
    const content = await getEditorContent(page);
    expect(content).toBe("Line 1\nLine 3");

    // Test mode state after operations
    const mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");
  });

  /**
   * Visual Mode Operations
   */
  test("visual mode operations", async () => {
    await typeInEditor(page, "Select this text");

    // Enter visual mode
    await page.keyboard.press("v");
    let mode = await getEditorMode(page);
    expect(mode).toContain("VISUAL");

    // Make selection
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("l");
    }

    // Delete selection
    await page.keyboard.press("d");
    const content = await getEditorContent(page);
    expect(content.trim()).toBe("this text");

    // Verify return to normal mode
    mode = await getEditorMode(page);
    expect(mode).not.toContain("VISUAL");
  });

  /**
   * Undo/Redo Operations
   */
  test("undo and redo with state verification", async () => {
    const initialText = "Test undo redo";
    await typeInEditor(page, initialText);

    // Make change and verify
    await page.keyboard.type("dd");
    let content = await getEditorContent(page);
    expect(content.trim()).toBe("");

    // Undo and verify state
    await page.keyboard.press("u");
    content = await getEditorContent(page);
    expect(content).toBe(initialText);
    let mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");

    // Redo and verify state
    await page.keyboard.down("Control");
    await page.keyboard.press("r");
    await page.keyboard.up("Control");
    content = await getEditorContent(page);
    expect(content.trim()).toBe("");
    mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");
  });

  /**
   * Complex Command Sequences
   */
  test("complex command sequences", async () => {
    await typeInEditor(page, "First line\nSecond line\nThird line");

    // Execute complex sequence
    await page.keyboard.type("gg"); // Go to start
    let pos = await getCursorPosition(page);
    expect(pos?.lineNumber).toBe(1);

    await page.keyboard.type("yy"); // Yank line
    await page.keyboard.type("p"); // Paste
    let content = await getEditorContent(page);
    expect(content).toContain("First line\nFirst line");

    // Verify state after sequence
    const mode = await getEditorMode(page);
    expect(mode).not.toContain("INSERT");
  });
});
