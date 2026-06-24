const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  sidebarLabels,
  state,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

async function visibleHiddenNavLeaks(page, hiddenModules, rootSelector = "body") {
  return page.locator(rootSelector).evaluate((root, navs) => {
    const hidden = new Set(navs);
    const visible = element => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && (box.width > 0 || box.height > 0);
    };
    return Array.from(root.querySelectorAll("[data-nav]"))
      .filter(element => hidden.has(element.dataset.nav) && visible(element))
      .map(element => ({
        nav: element.dataset.nav,
        text: element.textContent.trim().replace(/\s+/g, " "),
        tag: element.tagName.toLowerCase()
      }));
  }, hiddenModules);
}

test("customize menu saves bookmarks and cancels unsaved changes", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#railCustomize").click();
  await expect(page.locator("#modalTitle")).toHaveText("Manage menu");
  await page.locator('.v29-menu-row[data-menu-id="banking"] [data-v29-action="bookmark-one"]').click();
  await page.locator("#cancelModal").click();
  await expect(page.locator("#modalBackdrop")).not.toHaveClass(/open/);
  await expect(page.locator(".bookmark-row", { hasText: "Banking" })).toHaveCount(0);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="banking"] [data-v29-action="bookmark-one"]').click();
  await submitModal(page);
  await expect(page.locator(".bookmark-row", { hasText: "Banking" })).toHaveCount(1);

  await page.locator("#railCustomize").click();
  await page.locator('[data-v29-action="add-checked-bookmarks"]').click();
  await submitModal(page);
  const saved = await state(page);
  expect(saved.settings.bookmarks).toContain("reports-favorites");
});

test("customize menu can hide, restore, and reorder modules", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="banking"] input[name="menuItem"]').uncheck();
  await submitModal(page);
  await expect(page.locator('#menuList [data-nav="banking"]')).toHaveCount(0);

  await page.locator("#railCustomize").click();
  await page.locator('[data-v29-action="reset-menu"]').click();
  await submitModal(page);
  await expect(page.locator('#menuList [data-nav="banking"]')).toHaveCount(1);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="taxes"] [data-dir="top"]').click();
  await submitModal(page);
  await expect.poll(() => sidebarLabels(page).then(labels => labels[0])).toBe("Taxes");
});

test("customize menu prevents duplicate bookmarks", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="banking"] [data-v29-action="bookmark-one"]').click();
  await page.locator('.v29-menu-row[data-menu-id="banking"] [data-v29-action="bookmark-one"]').click();
  await submitModal(page);

  const saved = await state(page);
  expect(saved.settings.bookmarks.filter(id => id === "banking")).toHaveLength(1);
  await expect(page.locator(".bookmark-row", { hasText: "Banking" })).toHaveCount(1);
});

test("hidden modules do not leave visible navigation actions", async ({ page }) => {
  await openFreshApp(page);

  const hiddenModules = [
    "apps",
    "setup",
    "banking",
    "transactions",
    "accounting",
    "sales",
    "customers",
    "expenses",
    "vendors",
    "inventory",
    "projects",
    "time",
    "payroll",
    "taxes"
  ];

  await page.locator("#railCustomize").click();
  for(const nav of hiddenModules) {
    const checkbox = page.locator(`.v29-menu-row[data-menu-id="${nav}"] input[name="menuItem"]`);
    if(await checkbox.count() && await checkbox.isChecked()) await checkbox.uncheck();
  }
  await submitModal(page);

  await expect.poll(() => visibleHiddenNavLeaks(page, hiddenModules), {
    message: "hidden modules should not leak onto visible app chrome"
  }).toEqual([]);

  await expect(page.locator('[data-action="open-setup-checklist"]')).toBeVisible();
  await page.locator('[data-action="open-setup-checklist"]').click();
  await expect(page.locator("#page-setup.active")).toContainText("Setup Checklist");
  await expect.poll(() => visibleHiddenNavLeaks(page, hiddenModules.filter(nav => nav !== "setup"), "#page-setup"), {
    message: "hidden modules should not leak into setup tasks"
  }).toEqual([]);

  await page.locator('#menuList [data-nav="getthingsdone"]').click();
  await expect(page.locator("#page-getthingsdone.active")).toContainText("Get Things Done");
  await expect.poll(() => visibleHiddenNavLeaks(page, hiddenModules, "#page-getthingsdone"), {
    message: "hidden modules should not leak into Get Things Done"
  }).toEqual([]);

  for(const panelButton of ["insightsBtn", "helpBtn", "settingsBtn", "notificationsBtn", "profileBtn"]) {
    await page.locator(`#${panelButton}`).click();
    await expect(page.locator("#topbarPopover.open")).toBeVisible();
    await expect.poll(() => visibleHiddenNavLeaks(page, hiddenModules, "#topbarPopover"), {
      message: `hidden modules should not leak into ${panelButton}`
    }).toEqual([]);
    await page.locator(".top-panel-close").click();
    await expect(page.locator("#topbarPopover")).not.toHaveClass(/open/);
  }
});
