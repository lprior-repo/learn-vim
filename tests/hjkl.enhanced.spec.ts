import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { verifyMovementStable, getCursorPosition, ensureNormalMode } from "./utils";

// Configure test timeouts with no retries
test.describe.configure({
  timeout: 10000,
  retries: 0,
});

test.describe("Enhanced HJKL Navigation Tests", () => {
  let page: Page;
  const testContent = "First line\nSecond line\nThird line\nFourth line";

  test.beforeEach(async ({ context }) => {
    // Create new page
    page = await context.newPage();
    
    // Navigate to app
    await page.goto("http://localhost:3000/category/basic-movement/hjkl");

    // Wait for editor
    await page.waitForSelector(".monaco-editor", {
      state: "visible",
      timeout: 5000
    });

    // Verify editor loaded
    await page.waitForFunction(
      () => {
        const monaco = (window as any).monaco;
        const editor = monaco?.editor?.getEditors()[0];
        return monaco && editor && editor.getModel();
      },
      { timeout: 5000 }
    );

    // Initialize content
    await page.evaluate((content) => {
      const editor = (window as any).monaco.editor.getEditors()[0];
      editor.setValue(content);
      editor.setPosition({ lineNumber: 1, column: 1 });
    }, testContent);

    // Verify normal mode
    await ensureNormalMode(page);
  });

  test("should move cursor left with h key", async () => {
    // Move right twice to set up test position
    await verifyMovementStable(page, { key: "l", expected: { column: 1 } });
    await verifyMovementStable(page, { key: "l", expected: { column: 1 } });

    // Test movement left
    await verifyMovementStable(page, { key: "h", expected: { column: -1 } });
  });

  test("should move cursor down with j key", async () => {
    await verifyMovementStable(page, { key: "j", expected: { line: 1 } });
  });

  test("should move cursor up with k key", async () => {
    // Move down first
    await verifyMovementStable(page, { key: "j", expected: { line: 1 } });
    await verifyMovementStable(page, { key: "j", expected: { line: 1 } });

    // Test upward movement
    await verifyMovementStable(page, { key: "k", expected: { line: -1 } });
  });

  test("should move cursor right with l key", async () => {
    await verifyMovementStable(page, { key: "l", expected: { column: 1 } });
  });

  test("should handle combined movements", async () => {
    // Test sequence: right, right, down, left
    await verifyMovementStable(page, { key: "l", expected: { column: 1 } });
    await verifyMovementStable(page, { key: "l", expected: { column: 1 } });
    await verifyMovementStable(page, { key: "j", expected: { line: 1 } });
    await verifyMovementStable(page, { key: "h", expected: { column: -1 } });

    const finalPos = await getCursorPosition(page);
    expect(finalPos).toEqual({
      lineNumber: 2,
      column: 2,
    });
  });

  test("should respect movement boundaries", async () => {
    // Test left boundary
    await verifyMovementStable(page, { key: "h", expected: { column: 0 } });

    // Test top boundary
    await verifyMovementStable(page, { key: "k", expected: { line: 0 } });

    // Test bottom boundary
    for (let i = 0; i < 5; i++) {
      await verifyMovementStable(page, { key: "j", expected: { line: i < 3 ? 1 : 0 } });
    }

    // Test right boundary
    const lineLength = "First line".length;
    for (let i = 0; i < lineLength + 2; i++) {
      await verifyMovementStable(page, { key: "l", expected: { column: i < lineLength ? 1 : 0 } });
    }
  });
});
