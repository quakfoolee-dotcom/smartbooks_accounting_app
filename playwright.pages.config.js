const { defineConfig, devices } = require("@playwright/test");

const pagesUrl = process.env.SMARTBOOKS_PAGES_URL || "https://quakfoolee-dotcom.github.io/smartbooks_accounting_app/";

module.exports = defineConfig({
  testDir: "tests/functional",
  testMatch: "pages-smoke.spec.js",
  fullyParallel: false,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [["list"]],
  use: {
    baseURL: pagesUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
