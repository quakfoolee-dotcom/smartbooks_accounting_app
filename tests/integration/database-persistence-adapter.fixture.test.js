const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const {
  INITIAL_REVISION,
  stateEnvelope
} = require(path.join(root, "backend/src/persistence-adapter.js"));
const {
  createInMemoryDatabaseStatePersistenceAdapter
} = require(path.join(root, "backend/src/database-persistence-adapter.js"));

function createFixture() {
  let tick = 0;
  const tables = {
    companyState: new Map(),
    stateBackups: new Map()
  };
  const now = () => new Date(Date.UTC(2026, 6, 1, 12, 0, tick++)).toISOString();

  return {
    tables,
    adapter() {
      return createInMemoryDatabaseStatePersistenceAdapter({ tables, now });
    },
    clear() {
      tables.companyState.clear();
      tables.stateBackups.clear();
    }
  };
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

(async () => {
  await test("database fixture shares persisted state across adapter instances", async () => {
    const fixture = createFixture();
    try {
      const writer = fixture.adapter();
      const reader = fixture.adapter();

      const empty = await reader.read({ companyId:"company-fixture" });
      assert.equal(empty.companyId, "company-fixture");
      assert.equal(empty.revision, INITIAL_REVISION);
      assert.deepEqual(empty.state, {});

      const saved = await writer.write({
        schemaVersion:1,
        companyId:"company-fixture",
        source:"integration-fixture",
        state:{
          company:{ name:"Fixture Books" },
          invoices:[{ id:"INV-FIXTURE", subtotal:100, tax:5, paid:0 }]
        }
      });

      const loaded = await reader.read({ companyId:"company-fixture" });
      assert.equal(loaded.revision, saved.revision);
      assert.equal(loaded.source, "integration-fixture");
      assert.deepEqual(loaded.state.company, { name:"Fixture Books" });
      assert.equal(fixture.tables.companyState.size, 1);
    } finally {
      fixture.clear();
      assert.equal(fixture.tables.companyState.size, 0);
      assert.equal(fixture.tables.stateBackups.size, 0);
    }
  });

  await test("database fixture validates update lifecycle and stale revision protection", async () => {
    const fixture = createFixture();
    try {
      const firstSession = fixture.adapter();
      const secondSession = fixture.adapter();

      const created = await firstSession.write(stateEnvelope(
        { company:{ name:"Lifecycle Co" }, invoices:[] },
        { companyId:"company-lifecycle" }
      ));

      const updated = await secondSession.write(
        stateEnvelope(
          { company:{ name:"Lifecycle Co Updated" }, invoices:[{ id:"INV-2" }] },
          { companyId:"company-lifecycle", revision:created.revision }
        ),
        { expectedRevision:created.revision }
      );

      assert.notEqual(updated.revision, created.revision);
      assert.deepEqual((await firstSession.read({ companyId:"company-lifecycle" })).state, {
        company:{ name:"Lifecycle Co Updated" },
        invoices:[{ id:"INV-2" }]
      });

      await assert.rejects(
        () => firstSession.write(
          stateEnvelope(
            { company:{ name:"Stale Lifecycle Co" } },
            { companyId:"company-lifecycle", revision:created.revision }
          ),
          { expectedRevision:created.revision }
        ),
        error => {
          assert.equal(error.statusCode, 409);
          assert.equal(error.code, "STATE_REVISION_CONFLICT");
          assert.equal(error.expectedRevision, created.revision);
          assert.equal(error.currentRevision, updated.revision);
          return true;
        }
      );

      const final = await secondSession.read({ companyId:"company-lifecycle" });
      assert.equal(final.revision, updated.revision);
      assert.equal(final.state.company.name, "Lifecycle Co Updated");
    } finally {
      fixture.clear();
    }
  });

  await test("database fixture keeps company rows, backups, and restores isolated", async () => {
    const fixture = createFixture();
    try {
      const adapter = fixture.adapter();
      const companyA = await adapter.write(stateEnvelope(
        { company:{ name:"Company A" }, invoices:[{ id:"INV-A" }] },
        { companyId:"company-a" }
      ));
      const companyB = await adapter.write(stateEnvelope(
        { company:{ name:"Company B" }, invoices:[{ id:"INV-B" }] },
        { companyId:"company-b" }
      ));

      const backupA = await adapter.backup("pre-change-a", { companyId:"company-a" });
      const backupB = await adapter.backup("pre-change-b", { companyId:"company-b" });
      assert.notEqual(backupA.id, backupB.id);

      const changedA = await adapter.write(
        stateEnvelope(
          { company:{ name:"Company A Changed" }, invoices:[{ id:"INV-A2" }] },
          { companyId:"company-a", revision:companyA.revision }
        ),
        { expectedRevision:companyA.revision }
      );

      const restoredA = await adapter.restoreBackup(backupA.id, {
        companyId:"company-a",
        expectedRevision:changedA.revision
      });

      assert.equal(restoredA.companyId, "company-a");
      assert.equal(restoredA.source, "restore");
      assert.deepEqual(restoredA.state, { company:{ name:"Company A" }, invoices:[{ id:"INV-A" }] });

      await assert.rejects(
        () => adapter.readBackup(backupA.id, { companyId:"company-b" }),
        /Backup not found/
      );

      const loadedB = await adapter.read({ companyId:"company-b" });
      assert.equal(loadedB.revision, companyB.revision);
      assert.deepEqual(loadedB.state, { company:{ name:"Company B" }, invoices:[{ id:"INV-B" }] });
      assert.deepEqual((await adapter.listBackups({ companyId:"company-a" })).map(backup => backup.id), [backupA.id]);
      assert.deepEqual((await adapter.listBackups({ companyId:"company-b" })).map(backup => backup.id), [backupB.id]);
    } finally {
      fixture.clear();
    }
  });

  console.log("All database persistence adapter integration fixture tests passed.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
