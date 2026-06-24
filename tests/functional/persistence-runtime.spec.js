const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  openModal,
  submitModal,
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

test("backend mode restores saved state after reload without localStorage", async ({ page }) => {
  let backendState = { company:{ name:"Backend Start" }, settings:{} };
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
            savedAt:"2026-06-24T04:50:00.000Z",
            source:"backend",
            companyId:"demo-company",
            state:backendState
          }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      const payload = JSON.parse(request.postData() || "{}");
      backendState = payload.state;
      writes.push(payload);
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:51:00.000Z" })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, "/?sb_persistence=backend");
  await expect(page.locator("#topCompanyName")).toContainText("Backend Start");

  await openModal(page, "company");
  await page.locator('#modalBody input[name="name"]').fill("Backend Restored Co");
  await submitModal(page);
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());

  await expect.poll(() => writes.length, { message:"company settings save should write to backend" }).toBeGreaterThan(0);
  expect(writes.at(-1).state.company.name).toBe("Backend Restored Co");
  await expect(page.locator("#topCompanyName")).toContainText("Backend Restored Co");

  await page.reload();
  await expect(page.locator(".app")).toBeVisible();
  await expect(page.locator("#topCompanyName")).toContainText("Backend Restored Co");
  await expect.poll(() => page.evaluate(() => window.SmartBooks?.getState?.().company?.name)).toBe("Backend Restored Co");
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

test("hybrid mode migrates local state to empty backend after confirmation", async ({ page }) => {
  const writes = [];
  await page.addInitScript(() => {
    window.confirm = () => true;
  });
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
            savedAt:"2026-06-24T04:40:00.000Z",
            source:"backend",
            companyId:"demo-company",
            state:{}
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
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:41:00.000Z" })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, {
    path:"/?sb_persistence=hybrid",
    localState:{ company:{ name:"Local Books" }, settings:{ visibleModules:["dashboard"] } }
  });

  await expect(page.locator("#topCompanyName")).toContainText("Local Books");
  await expect.poll(() => writes.length).toBeGreaterThan(0);
  expect(writes[0].source).toBe("migration");
  expect(writes[0].state.company.name).toBe("Local Books");
  const backup = await page.evaluate(key => localStorage.getItem(`${key}_pre_backend_migration_backup`), "smartbooks_v71_state");
  expect(JSON.parse(backup).company.name).toBe("Local Books");
});

test("hybrid migration can be declined without backend writes", async ({ page }) => {
  let writes = 0;
  await page.addInitScript(() => {
    window.confirm = () => false;
  });
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({
          ok:true,
          data:{ schemaVersion:1, source:"backend", companyId:"demo-company", state:{} }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes++;
      await route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true }) });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, {
    path:"/?sb_persistence=hybrid",
    localState:{ company:{ name:"Declined Local" }, settings:{ visibleModules:["dashboard"] } }
  });
  await page.waitForTimeout(250);

  expect(writes).toBe(0);
  await expect(page.locator(".v30-persistence-panel")).toContainText("Backend persistence connected");
});

test("hybrid migration save failure keeps local mode active", async ({ page }) => {
  let writes = 0;
  await page.addInitScript(() => {
    window.confirm = () => true;
  });
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({
          ok:true,
          data:{ schemaVersion:1, source:"backend", companyId:"demo-company", state:{} }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes++;
      await route.fulfill({
        status:500,
        contentType:"application/json",
        body:JSON.stringify({ ok:false, error:"migration save failed" })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, {
    path:"/?sb_persistence=hybrid",
    localState:{ company:{ name:"Local After Failure" }, settings:{ visibleModules:["dashboard"] } },
    ignoredConsole:[/api\/state.*500|500.*api\/state|status of 500/i]
  });

  await expect(page.locator("#topCompanyName")).toContainText("Local After Failure");
  await expect.poll(() => writes).toBe(1);
  const mode = await page.evaluate(() => window.SmartBooksPersistence.mode);
  expect(mode).toBe("local");
});
