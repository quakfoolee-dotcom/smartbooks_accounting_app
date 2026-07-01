const { defineConfig, devices } = require("@playwright/test");

const ciReporters = [
  ["list"],
  ["html", { outputFolder: "playwright-report", open: "never" }],
  ["json", { outputFile: "test-results/playwright-results.json" }]
];

module.exports = defineConfig({
  testDir: "tests/functional",
  testMatch: "*.spec.js",
  testIgnore: "pages-smoke.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: process.env.CI ? ciReporters : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3217",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3217/api/health",
    reuseExistingServer: true,
    timeout: 30000,
    env: { PORT: "3217" }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
