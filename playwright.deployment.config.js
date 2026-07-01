const { defineConfig, devices } = require("@playwright/test");

const externalTarget = process.env.SMARTBOOKS_DEPLOYMENT_URL || process.env.SMARTBOOKS_PAGES_URL || "";
const localTarget = "http://127.0.0.1:3218/";
const targetUrl = externalTarget || localTarget;
const ciReporters = [
  ["list"],
  ["html", { outputFolder: "playwright-report", open: "never" }],
  ["json", { outputFile: "test-results/playwright-results.json" }]
];

module.exports = defineConfig({
  testDir: "tests/functional",
  testMatch: "deployment-smoke.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: process.env.CI ? ciReporters : [["list"]],
  use: {
    baseURL: targetUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: externalTarget ? undefined : {
    command: "npm start",
    url: "http://127.0.0.1:3218/api/health",
    reuseExistingServer: true,
    timeout: 30000,
    env: { PORT: "3218" }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
