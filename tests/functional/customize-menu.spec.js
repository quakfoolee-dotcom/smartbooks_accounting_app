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
