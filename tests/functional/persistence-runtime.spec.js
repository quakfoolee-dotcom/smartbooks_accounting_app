const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  openModal,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

async function openStorageSettingsPanel(page) {
  await page.evaluate(() => window.navigate("settings"));
  await expect(page.locator("#page-settings.active")).toBeVisible();
  const panel = page.locator("#page-settings .v30-persistence-panel");
  await expect(panel).toBeVisible();
  return panel;
}

test("backend mode loads startup state and saves through async persistence", async ({ page }) => {
  const writes = [];
  const requests = [];
  await page.route("**/api/state", async route => {
    const request = route.request();
    requests.push({
      method:request.method(),
      companyId:request.headers()["x-smartbooks-company-id"],
      requestId:request.headers()["x-smartbooks-request-id"],
      revision:request.headers()["x-smartbooks-state-revision"] || null
    });
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
            companyId:"playwright-company",
            revision:"rev_000030",
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
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:31:00.000Z", revision:"rev_000031" })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, "/?sb_persistence=backend&sb_company_id=playwright-company");
  await expect(page.locator("#topCompanyName")).toContainText("Backend Books");
  const panel = await openStorageSettingsPanel(page);
  await expect(panel).toContainText("Shared storage connected");
  await expect(panel.locator("[data-action='retry-backend-save']")).toContainText("Try saving again");

  await page.evaluate(() => window.navigate("dashboard"));
  await expect(page.locator("#page-dashboard.active")).toBeVisible();
  await page.locator('#page-dashboard [data-action="toggle-privacy"]').first().click();
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());

  expect(writes.length, "backend mode should write through PUT after a user save").toBeGreaterThan(0);
  expect(writes.at(-1).revision).toBe("rev_000030");
  expect(writes.at(-1).companyId).toBe("playwright-company");
  expect(writes.at(-1).state.settings.privacyMode).toBe(true);
  expect(requests[0]).toMatchObject({
    method:"GET",
    companyId:"playwright-company",
    revision:null
  });
  expect(requests[0].requestId).toMatch(/.+/);
  const saveRequest = requests.find(request => request.method === "PUT");
  expect(saveRequest).toMatchObject({
    method:"PUT",
    companyId:"playwright-company",
    revision:"rev_000030"
  });
  expect(saveRequest.requestId).toMatch(/.+/);
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
            revision:"rev_000040",
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
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:51:00.000Z", revision:"rev_000041" })
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
  let reads = 0;
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      reads++;
      if(reads === 1) {
        await route.fulfill({
          status:500,
          contentType:"application/json",
          body:JSON.stringify({ ok:false, error:"Backend unavailable" })
        });
      } else {
        await route.fulfill({
          status:200,
          contentType:"application/json",
          body:JSON.stringify({
            ok:true,
            data:{
              schemaVersion:1,
              savedAt:"2026-06-24T04:33:00.000Z",
              source:"backend",
              companyId:"demo-company",
              revision:"rev_000033",
              state:{ company:{ name:"Recovered Backend" }, settings:{} }
            }
          })
        });
      }
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
  const panel = await openStorageSettingsPanel(page);
  await expect(panel).toContainText("Company data needs attention");
  await expect(panel).toContainText("Try loading again");
  await expect(panel).toContainText("Try saving again");
  await expect(panel).toContainText("Export safety backup");
  await expect(panel).toContainText("Retry shared storage, then export or save a local copy if this warning stays visible.");
  await expect(panel.locator('[data-action="save-local-fallback-copy"]')).toContainText("Save local copy");
  await panel.locator('[data-action="save-local-fallback-copy"]').click();
  await expect.poll(() => page.evaluate(() => Boolean(sessionStorage.getItem("smartbooks_v71_state_manual_local_fallback_session_copy")))).toBe(true);
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem("smartbooks_v71_state_manual_local_fallback_backup")))).toBe(true);
  expect(writes, "saving a local fallback copy must not write to backend").toBe(0);
  await page.evaluate(() => window.navigate("dashboard"));
  await expect(page.locator("#page-dashboard.active")).toBeVisible();
  await page.locator('#page-dashboard [data-action="toggle-privacy"]').first().click();
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());

  expect(writes, "backend mode must not write fallback/demo state after a failed load").toBe(0);

  await openStorageSettingsPanel(page);
  await panel.locator('[data-action="retry-backend-load"]').click();
  await expect(page.locator("#topCompanyName")).toContainText("Recovered Backend");
  await expect(panel).toContainText("Shared storage connected");
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
            revision:"rev_000050",
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
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T04:41:00.000Z", revision:"rev_000051" })
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
  expect(writes[0].revision).toBe("rev_000050");
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
          data:{ schemaVersion:1, source:"backend", companyId:"demo-company", revision:"rev_000060", state:{} }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes++;
      await route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true, revision:"rev_000061" }) });
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
  const panel = await openStorageSettingsPanel(page);
  await expect(panel).toContainText("Migration storage connected");
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
          data:{ schemaVersion:1, source:"backend", companyId:"demo-company", revision:"rev_000070", state:{} }
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

test("backend revision conflict surfaces reload guidance without overwriting state", async ({ page }) => {
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
            savedAt:"2026-06-24T05:10:00.000Z",
            source:"backend",
            companyId:"demo-company",
            revision:"rev_000080",
            state:{ company:{ name:"Conflict Start" }, settings:{} }
          }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      const payload = JSON.parse(request.postData() || "{}");
      writes.push({
        revision:payload.revision,
        headerRevision:request.headers()["x-smartbooks-state-revision"],
        company:payload.state?.company?.name || null
      });
      await route.fulfill({
        status:409,
        contentType:"application/json",
        body:JSON.stringify({
          ok:false,
          error:"State revision conflict.",
          code:"STATE_REVISION_CONFLICT",
          expectedRevision:"rev_000080",
          currentRevision:"rev_000081"
        })
      });
      return;
    }
    await route.continue();
  });

  await openFreshApp(page, {
    path:"/?sb_persistence=backend",
    ignoredConsole:[/api\/state.*409|409.*api\/state|409 \(Conflict\)|State revision conflict/i]
  });
  await expect(page.locator("#topCompanyName")).toContainText("Conflict Start");

  await openModal(page, "company");
  await page.locator('#modalBody input[name="name"]').fill("Stale Local Edit");
  await submitModal(page);
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());

  await expect.poll(() => writes.length, { message:"save attempt should reach backend before conflict" }).toBeGreaterThan(0);
  expect(writes.at(-1).revision).toBe("rev_000080");
  expect(writes.at(-1).headerRevision).toBe("rev_000080");
  const panel = await openStorageSettingsPanel(page);
  await expect(panel).toContainText("Newer company data is available");
  await expect(panel).toContainText("reload before saving again");
  await expect(panel).toContainText("Reload only reads from shared storage.");
  await expect(panel.locator('[data-action="retry-backend-load"]')).toContainText("Reload company data");
  await expect(panel.locator('[data-action="export-persistence-backup"]')).toContainText("Export current session");
  await expect(panel.locator('[data-action="save-local-fallback-copy"]')).toContainText("Save local copy");
});
