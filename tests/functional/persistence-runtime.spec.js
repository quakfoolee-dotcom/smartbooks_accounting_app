const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

test("backend mode loads startup state and saves through async persistence", async ({ page }) => {
  const writes = [];
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({
          ok:true,
          data:{
            schemaVersion:1,
            savedAt:"2026-06-24T04:30:00.000Z",
            source:"backend",
            companyId:"demo-company",
            state:{ company:{ name:"Backend Books" }, settings:{} }
          }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes.push(JSON.parse(request.postData() || "{}"));
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:31:00.000Z" })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, "/?sb_persistence=backend");
  await expect(page.locator("#topCompanyName")).toContainText("Backend Books");
  await expect(page.locator(".v30-persistence-panel")).toContainText("Backend persistence connected");

  await page.locator('[data-action="toggle-privacy"]').click();
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());

  expect(writes.length, "backend mode should write through PUT after a user save").toBeGreaterThan(0);
  expect(writes.at(-1).state.settings.privacyMode).toBe(true);
});

test("backend load failure does not save fallback state to backend", async ({ page }) => {
  let writes = 0;
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      await route.fulfill({
        status:500,
        contentType:"application/json",
        body:JSON.stringify({ ok:false, error:"Backend unavailable" })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes++;
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:32:00.000Z" })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, {
    path:"/?sb_persistence=backend",
    ignoredConsole:[/api\/state.*500|500.*api\/state|status of 500/i]
  });
  await expect(page.locator(".v30-persistence-panel")).toContainText("Persistence needs review");
  await page.locator('[data-action="toggle-privacy"]').click();
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());

  expect(writes, "backend mode must not write fallback/demo state after a failed load").toBe(0);
});
