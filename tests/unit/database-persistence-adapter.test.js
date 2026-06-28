const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const {
  INITIAL_REVISION,
  nextRevision,
  stateEnvelope
} = require(path.join(root, "backend/src/persistence-adapter.js"));
const {
  createInMemoryDatabaseStatePersistenceAdapter,
  databasePersistenceTables
} = require(path.join(root, "backend/src/database-persistence-adapter.js"));

function adapterFactory(){
  let tick = 0;
  return createInMemoryDatabaseStatePersistenceAdapter({
    now: () => new Date(Date.UTC(2026, 5, 28, 12, 0, tick++)).toISOString()
  });
}

async function test(name, fn){
  try{
    await fn();
    console.log(`ok - ${name}`);
  }catch(error){
    console.error(`not ok - ${name}`);
    throw error;
  }
}

(async () => {
  await test("database contract publishes the planned table shape", async () => {
    const tables = databasePersistenceTables();
    assert.deepEqual(Object.keys(tables), ["smartbooks_company_state", "smartbooks_state_backups"]);
    assert.ok(tables.smartbooks_company_state.includes("company_id"));
    assert.ok(tables.smartbooks_company_state.includes("revision"));
    assert.ok(tables.smartbooks_company_state.includes("state_json"));
    assert.ok(tables.smartbooks_state_backups.includes("backup_id"));
    assert.ok(tables.smartbooks_state_backups.includes("company_id"));
    assert.ok(tables.smartbooks_state_backups.includes("state_json"));
  });

  await test("database adapter returns an empty backend envelope per company", async () => {
    const adapter = adapterFactory();
    const envelope = await adapter.read({ companyId:"company-a" });

    assert.equal(envelope.schemaVersion, 1);
    assert.equal(envelope.source, "backend");
    assert.equal(envelope.companyId, "company-a");
    assert.equal(envelope.revision, INITIAL_REVISION);
    assert.deepEqual(envelope.state, {});
  });

  await test("database adapter writes and reads normalized envelopes", async () => {
    const adapter = adapterFactory();
    const saved = await adapter.write({
      schemaVersion:1,
      companyId:"company-a",
      source:"backend",
      state:{ company:{ name:"Database Co" }, invoices:[{ id:"INV-DB" }] }
    });

    assert.equal(saved.companyId, "company-a");
    assert.equal(saved.revision, nextRevision(INITIAL_REVISION));
    assert.ok(saved.savedAt);

    const loaded = await adapter.read({ companyId:"company-a" });
    assert.equal(loaded.source, "backend");
    assert.equal(loaded.revision, saved.revision);
    assert.deepEqual(loaded.state, { company:{ name:"Database Co" }, invoices:[{ id:"INV-DB" }] });
  });

  await test("database adapter rejects stale revisions without overwriting current state", async () => {
    const adapter = adapterFactory();
    const first = await adapter.write(stateEnvelope({ company:{ name:"First DB Co" } }, { companyId:"company-a" }));
    const second = await adapter.write(
      stateEnvelope({ company:{ name:"Second DB Co" } }, { companyId:"company-a", revision:first.revision }),
      { expectedRevision:first.revision }
    );

    await assert.rejects(
      () => adapter.write(
        stateEnvelope({ company:{ name:"Stale DB Co" } }, { companyId:"company-a", revision:first.revision }),
        { expectedRevision:first.revision }
      ),
      error => {
        assert.equal(error.statusCode, 409);
        assert.equal(error.code, "STATE_REVISION_CONFLICT");
        assert.equal(error.expectedRevision, first.revision);
        assert.equal(error.currentRevision, second.revision);
        return true;
      }
    );

    const loaded = await adapter.read({ companyId:"company-a" });
    assert.equal(loaded.revision, second.revision);
    assert.deepEqual(loaded.state, { company:{ name:"Second DB Co" } });
  });

  await test("database adapter keeps company state and backups isolated", async () => {
    const adapter = adapterFactory();
    await adapter.write(stateEnvelope({ company:{ name:"Company A" } }, { companyId:"company-a" }));
    await adapter.write(stateEnvelope({ company:{ name:"Company B" } }, { companyId:"company-b" }));

    const backupA = await adapter.backup("company-a-backup", { companyId:"company-a" });
    const backupB = await adapter.backup("company-b-backup", { companyId:"company-b" });

    const backupsA = await adapter.listBackups({ companyId:"company-a" });
    const backupsB = await adapter.listBackups({ companyId:"company-b" });
    assert.deepEqual(backupsA.map(backup => backup.id), [backupA.id]);
    assert.deepEqual(backupsB.map(backup => backup.id), [backupB.id]);

    const envelopeA = await adapter.read({ companyId:"company-a" });
    const changedA = await adapter.write(
      stateEnvelope({ company:{ name:"Company A Changed" } }, { companyId:"company-a", revision:envelopeA.revision }),
      { expectedRevision:envelopeA.revision }
    );
    const restoredA = await adapter.restoreBackup(backupA.id, {
      companyId:"company-a",
      expectedRevision:changedA.revision
    });

    assert.equal(restoredA.source, "restore");
    assert.deepEqual(restoredA.state, { company:{ name:"Company A" } });
    await assert.rejects(
      () => adapter.readBackup(backupA.id, { companyId:"company-b" }),
      /Backup not found/
    );
    const companyB = await adapter.read({ companyId:"company-b" });
    assert.deepEqual(companyB.state, { company:{ name:"Company B" } });
  });

  console.log("All database persistence adapter tests passed.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
