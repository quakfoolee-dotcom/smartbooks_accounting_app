const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests/functional",
  fullyParallel: false,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [["list"]],
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
