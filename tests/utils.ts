import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

// Valid ARIA role values
type AriaRole =
  | "alert"
  | "alertdialog"
  | "button"
  | "checkbox"
  | "dialog"
  | "grid"
  | "gridcell"
  | "heading"
  | "img"
  | "link"
  | "listbox"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "option"
  | "progressbar"
  | "radio"
  | "region"
  | "scrollbar"
  | "searchbox"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "switch"
  | "tab"
  | "tablist"
  | "tabpanel"
  | "textbox"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treeitem";

/**
 * Test utilities for more reliable and maintainable tests
 */

// Selector strategies with fallbacks and retries
export const getBySelector = async (
  page: Page,
  options: {
    // Primary selector strategy
    primary: {
      type: "css" | "text" | "role" | "testid";
      value: string;
      ariaRole?: AriaRole;
    };
    // Fallback selector if primary fails
    fallback?: {
      type: "css" | "text" | "role" | "testid";
      value: string;
      ariaRole?: AriaRole;
    };
    // Additional matching criteria
    hasText?: RegExp | string;
    hasClass?: RegExp | string;
    timeout?: number;
  },
): Promise<Locator> => {
  const timeout = options.timeout || 10000;
  let locator: Locator | null = null;

  try {
    // Try primary selector
    switch (options.primary.type) {
      case "css":
        locator = page.locator(options.primary.value);
        break;
      case "text":
        locator = page.getByText(options.primary.value);
        break;
      case "role":
        if (!options.primary.ariaRole) {
          throw new Error("ariaRole is required for role selector");
        }
        locator = page.getByRole(options.primary.ariaRole);
        break;
      case "testid":
        locator = page.getByTestId(options.primary.value);
        break;
    }

    // Add additional filters
    if (options.hasText) {
      locator = locator.filter({ hasText: options.hasText });
    }
    if (options.hasClass) {
      locator = locator.locator(`.${options.hasClass}`);
    }

    // Wait for element with timeout
    await locator.waitFor({ timeout, state: "visible" });
    return locator;
  } catch (e) {
    // Try fallback if primary fails
    if (options.fallback) {
      switch (options.fallback.type) {
        case "css":
          locator = page.locator(options.fallback.value);
          break;
        case "text":
          locator = page.getByText(options.fallback.value);
          break;
        case "role":
          if (!options.fallback.ariaRole) {
            throw new Error("ariaRole is required for role selector");
          }
          locator = page.getByRole(options.fallback.ariaRole);
          break;
        case "testid":
          locator = page.getByTestId(options.fallback.value);
          break;
      }

      // Add additional filters to fallback
      if (options.hasText) {
        locator = locator.filter({ hasText: options.hasText });
      }
      if (options.hasClass) {
        locator = locator.locator(`.${options.hasClass}`);
      }

      await locator.waitFor({ timeout, state: "visible" });
      return locator;
    }
    throw e;
  }
};

// Wait for Monaco editor to be fully initialized
export const waitForEditor = async (page: Page, timeout = 10000) => {
  // Wait for basic structure
  await Promise.all([
    page.waitForSelector(".monaco-editor", {
      state: "visible",
      timeout,
    }),
    page.waitForSelector(".view-lines", {
      state: "visible", 
      timeout,
    }),
    page.waitForSelector('[data-testid="mode-indicator"]', {
      state: "visible",
      timeout,
    }),
  ]);

  // Wait for Monaco initialization - single attempt
  await page.waitForFunction(
    () => {
      const monaco = (window as any).monaco;
      const editor = monaco?.editor?.getEditors()[0];
      return monaco !== undefined && editor !== undefined;
    },
    { timeout },
  );

  // Verify editor is ready for input
  await page.waitForFunction(
    () => {
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      return editor?.getModel()?.getValue() !== undefined;
    },
    { timeout: 5000 },
  );
};

// Common test setup - fast, no retries
export const setupTest = async (page: Page) => {
  // Navigate with timeout
  await page.goto("http://localhost:3000", { timeout: 5000 });

  // Wait for critical resources
  await Promise.all([
    page.waitForLoadState("networkidle"),
    page.waitForLoadState("domcontentloaded"),
    page.waitForSelector("body", { state: "visible" }),
  ]);

  // Verify page is interactive
  await page.waitForFunction(
    () => {
      return document.readyState === "complete" && !document.querySelector(".loading");
    },
    { timeout: 5000 },
  );
};

// Wait for application state to stabilize
export const waitForStableState = async (page: Page) => {
  // Wait for any network requests to complete
  await page.waitForLoadState("networkidle");

  // Wait for animations to complete
  await page.waitForFunction(() => {
    return !document.querySelector(".animate-spin");
  });

  // Wait for any React state updates
  await page.waitForFunction(() => {
    return !document.querySelector('[aria-busy="true"]');
  });
};

// Ensure editor is in normal mode
export const ensureNormalMode = async (page: Page) => {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  
  const statusBar = await page.locator('[data-testid="mode-indicator"]');
  await statusBar.waitFor({ state: 'visible', timeout: 5000 });
  
  const text = await statusBar.textContent();
  if (text?.includes("INSERT") || text?.includes("VISUAL")) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
  }
};

// Cursor position utilities
export const getCursorPosition = async (page: Page): Promise<{ lineNumber: number; column: number }> => {
  const position = await page.evaluate(() => {
    const editor = (window as any).monaco?.editor?.getEditors()[0];
    return editor?.getPosition();
  });

  if (!position) {
    throw new Error("Could not get cursor position");
  }
  return position;
};

// Enhanced movement verification
export const verifyMovement = async (page: Page, movement: { key: string; expected: { line?: number; column?: number } }): Promise<void> => {
  // Get initial position
  const beforePos = await getCursorPosition(page);

  // Perform movement
  await page.keyboard.press(movement.key);

  // Wait for position to stabilize
  await page.waitForFunction(
    ({ before, expected }) => {
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      const current = editor?.getPosition();
      if (!current) return false;

      if (expected.line !== undefined) {
        if (current.lineNumber !== before.lineNumber + expected.line) return false;
      }
      if (expected.column !== undefined) {
        if (current.column !== before.column + expected.column) return false;
      }
      return true;
    },
    { before: beforePos, expected: movement.expected },
    { timeout: 5000 },
  );

  // Verify final position
  const afterPos = await getCursorPosition(page);

  if (movement.expected.line !== undefined) {
    expect(afterPos.lineNumber).toBe(beforePos.lineNumber + movement.expected.line);
  }
  if (movement.expected.column !== undefined) {
    expect(afterPos.column).toBe(beforePos.column + movement.expected.column);
  }

  // Verify mode stayed in normal
  const mode = await page.evaluate(() => {
    return document.querySelector('.monaco-editor [role="status"]')?.textContent || "";
  });
  expect(mode).toContain("NORMAL");
};

// Enhanced movement verification with retries and stability checks
export const verifyMovementStable = async (page: Page, movement: { key: string; expected: { line?: number; column?: number } }): Promise<void> => {
  // Wait for editor to be ready
  await page.waitForFunction(
    () => {
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      return editor && editor.getModel() && !editor.getOption("readOnly");
    },
    { timeout: 10000 },
  );

  // Focus the Monaco editor
  await page.locator('.monaco-editor').click();
  await page.waitForTimeout(200);

  // Verify we're in normal mode
  await ensureNormalMode(page);

  // Get initial position
  const beforePos = await getCursorPosition(page);
  expect(beforePos).toBeTruthy();

  // Execute movement - single attempt
  await page.keyboard.press(movement.key);

  // Wait for movement to complete with stability check
  await page.waitForFunction(
    ({ before, expected }) => {
      const editor = (window as any).monaco?.editor?.getEditors()[0];
      const current = editor?.getPosition();
      if (!current) return false;

      // Verify position matches expectations
      const lineOk = expected.line === undefined || current.lineNumber === before.lineNumber + expected.line;
      const colOk = expected.column === undefined || current.column === before.column + expected.column;

      return lineOk && colOk;
    },
    { before: beforePos, expected: movement.expected },
    { timeout: 5000 },
  );

  // Verify final state
  const afterPos = await getCursorPosition(page);
  if (movement.expected.line !== undefined) {
    expect(afterPos.lineNumber).toBe(beforePos.lineNumber + movement.expected.line);
  }
  if (movement.expected.column !== undefined) {
    expect(afterPos.column).toBe(beforePos.column + movement.expected.column);
  }

  // Verify mode stayed in normal
  await ensureNormalMode(page);
};

// Vim command navigation helper
export const executeVimCommand = async (page: Page, command: string, expectedPosition: { line?: number; column?: number }): Promise<void> => {
  for (const key of command.split("")) {
    await verifyMovement(page, {
      key,
      expected: {
        line: key === "j" ? 1 : key === "k" ? -1 : undefined,
        column: key === "l" ? 1 : key === "h" ? -1 : undefined,
      },
    });
  }
};
