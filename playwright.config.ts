import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  // Increased timeout to accommodate Monaco Editor loading
  timeout: 15000,
  expect: {
    // Increased timeout for expectations to accommodate loading
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },
  // Enable full parallel execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for fast testing loop
  // Maximize workers for speed
  workers: process.env.CI ? 4 : '100%',
  // Reporter configuration for better debugging
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // Headless for speed
    headless: true,
    // Increased timeouts to accommodate Monaco Editor loading
    actionTimeout: 5000,
    navigationTimeout: 5000,
    baseURL: "http://localhost:3000",
    // Enhanced debugging artifacts
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    // Remove slowdown for speed
    launchOptions: {
      slowMo: 0,
    },
    // Standard viewport size
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
  ],
  webServer: {
    command: "bun run dev",
    port: 3000,
    reuseExistingServer: false,
    timeout: 15000,
    stdout: "pipe",
    stderr: "pipe",
  },
};

export default config;
