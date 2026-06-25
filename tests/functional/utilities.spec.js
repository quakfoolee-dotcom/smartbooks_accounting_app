const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  openModal,
  state,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

test("utilities export data and reset company data", async ({ page }) => {
  await openFreshApp(page);

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportData").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^smartbooks.*\.json$/);

  await openModal(page, "invoice");
  await page.locator('[name="desc"]').fill("Temporary reset invoice");
  await submitModal(page);
  expect((await state(page)).invoices).toHaveLength(5);

  await page.locator("#resetDemo").scrollIntoViewIfNeeded();
  page.once("dialog", dialog => dialog.accept());
  await page.locator("#resetDemo").click();
  await expect.poll(() => state(page).then(saved => saved.invoices.length)).toBe(4);
});

test("CSV import previews and applies customer rows with a backup", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#settingsBtn").click();
  await expect(page.locator("#topbarPopover")).toHaveClass(/open/);
  await expect(page.locator("#topbarPopover")).toContainText("Import CSV data");
  await page.locator('#topbarPopover [data-action="open-import-data"]').click();
  await expect(page.locator("#modalBackdrop")).toHaveClass(/open/);
  await expect(page.locator("#modalTitle")).toHaveText("Import data");
  await expect(page.locator("#importSubmit")).toBeDisabled();

  await page.locator("#importFile").setInputFiles({
    name: "customers.csv",
    mimeType: "text/csv",
    buffer: Buffer.from([
      "id,name,company,email,phone,type",
      ",River City Foods,River City Foods,ap@rivercity.example.com,555-7100,Commercial",
      ",Northside Clinic,Northside Clinic,billing@northside.example.com,555-7101,Healthcare"
    ].join("\n"))
  });

  await expect(page.locator("#importStatus")).toContainText("2 rows ready to import");
  await expect(page.locator("#importSubmit")).toBeEnabled();
  await page.locator("#importSubmit").click();
  await expect(page.locator("#modalBackdrop")).not.toHaveClass(/open/);

  const saved = await state(page);
  expect(saved.customers).toHaveLength(7);
  expect(saved.customers.map(customer => customer.name)).toEqual(expect.arrayContaining(["River City Foods", "Northside Clinic"]));
  const backupExists = await page.evaluate(() => Boolean(localStorage.getItem("smartbooks_v71_state_pre_csv_import_backup")));
  expect(backupExists).toBe(true);
});
