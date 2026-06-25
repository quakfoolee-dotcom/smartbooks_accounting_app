const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const {
  createFileStatePersistenceAdapter,
  INITIAL_REVISION,
  normalizeStatePayload,
  nextRevision,
  stateEnvelope
} = require(path.join(root, "backend/src/persistence-adapter.js"));

async function withAdapter(fn){
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "smartbooks-adapter-"));
  const stateFile = path.join(tempDir, "smartbooks-state.json");
  const backupDir = path.join(tempDir, "backups");
  const adapter = createFileStatePersistenceAdapter({ stateFile, backupDir });
  try{
    await fn({ adapter, stateFile, backupDir });
  }finally{
    fs.rmSync(tempDir, { recursive:true, force:true });
  }
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
  await test("file adapter returns an empty backend envelope before first save", async () => {
    await withAdapter(async ({ adapter }) => {
      const envelope = await adapter.read();
      assert.equal(envelope.schemaVersion, 1);
      assert.equal(envelope.source, "backend");
      assert.equal(envelope.companyId, "demo-company");
      assert.equal(envelope.revision, INITIAL_REVISION);
      assert.deepEqual(envelope.state, {});
    });
  });

  await test("file adapter writes and reads normalized state envelopes", async () => {
    await withAdapter(async ({ adapter, stateFile }) => {
      const saved = await adapter.write({
        schemaVersion:1,
        companyId:"demo-company",
        source:"backend",
        state:{ company:{ name:"Adapter Co" }, invoices:[{ id:"INV-1" }] }
      });

      assert.ok(saved.savedAt);
      assert.equal(saved.revision, nextRevision(INITIAL_REVISION));
      assert.equal(fs.existsSync(stateFile), true);

      const envelope = await adapter.read();
      assert.equal(envelope.schemaVersion, 1);
      assert.equal(envelope.companyId, "demo-company");
      assert.equal(envelope.source, "backend");
      assert.equal(envelope.revision, saved.revision);
      assert.deepEqual(envelope.state, { company:{ name:"Adapter Co" }, invoices:[{ id:"INV-1" }] });
    });
  });

  await test("file adapter rejects stale revisions without overwriting current state", async () => {
    await withAdapter(async ({ adapter }) => {
      const first = await adapter.write(stateEnvelope({ company:{ name:"Current Co" } }, { source:"backend" }));
      const second = await adapter.write(
        stateEnvelope({ company:{ name:"Updated Co" } }, { source:"backend", revision:first.revision }),
        { expectedRevision:first.revision }
      );

      await assert.rejects(
        () => adapter.write(
          stateEnvelope({ company:{ name:"Stale Co" } }, { source:"backend", revision:first.revision }),
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

      const envelope = await adapter.read();
      assert.equal(envelope.revision, second.revision);
      assert.deepEqual(envelope.state, { company:{ name:"Updated Co" } });
    });
  });

  await test("file adapter preserves migration source for legacy raw state", async () => {
    await withAdapter(async ({ adapter }) => {
      const normalized = normalizeStatePayload({ company:{ name:"Legacy Adapter Co" } });
      await adapter.write(normalized);

      const envelope = await adapter.read();
      assert.equal(envelope.source, "migration");
      assert.deepEqual(envelope.state, { company:{ name:"Legacy Adapter Co" } });
    });
  });

  await test("file adapter rejects unsupported envelope shapes", async () => {
    await withAdapter(async ({ adapter }) => {
      await assert.rejects(
        () => adapter.write({ schemaVersion:999, state:{} }),
        /Unsupported state schemaVersion/
      );
      await assert.rejects(
        () => adapter.write({ schemaVersion:1, state:[] }),
        /object state/
      );
    });
  });

  await test("file adapter creates restorable backup copies", async () => {
    await withAdapter(async ({ adapter, backupDir }) => {
      await adapter.write(stateEnvelope({ company:{ name:"Backup Co" } }, { source:"backend" }));
      const backup = await adapter.backup("before-migration");

      assert.equal(backup.ok, true);
      assert.equal(fs.existsSync(backup.path), true);
      assert.equal(path.dirname(backup.path), backupDir);

      const backupEnvelope = JSON.parse(fs.readFileSync(backup.path, "utf8"));
      assert.equal(backupEnvelope.companyId, "demo-company");
      assert.deepEqual(backupEnvelope.state, { company:{ name:"Backup Co" } });
    });
  });

  console.log("All persistence adapter tests passed.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
