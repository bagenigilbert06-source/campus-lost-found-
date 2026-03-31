import { defineConfig, devices } from '@playwright/test';

/**
 * E2E Testing Configuration for Campus Lost & Found Platform
 * Tests both student and admin workflows
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,  // Run tests in parallel to speed up execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,  // Retry once to handle flakiness
  workers: process.env.CI ? 1 : 4,  // Use 4 workers for faster local testing
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30000,  // Longer timeout for page navigation
    actionTimeout: 15000,  // Longer timeout for actions like fill, click
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Disable headless to see what's happening
        // headless: false,
        // Increase viewport
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      cwd: './frontend',
      timeout: 120000,  // Longer timeout for server startup
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      cwd: './backend',
      timeout: 120000,  // Longer timeout for server startup
    },
  ],
  timeout: 120000,  // Global test timeout: 120 seconds
  expect: {
    timeout: 15000,  // Longer timeout for expect statements
  },
});
