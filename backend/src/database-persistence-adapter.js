const {
  DEFAULT_COMPANY_ID,
  INITIAL_REVISION,
  backupFileName,
  enforceExpectedRevision,
  normalizeStatePayload,
  nextRevision,
  safeBackupId,
  stateEnvelope
} = require("./persistence-adapter");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function byteSize(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function defaultTables() {
  return {
    companyState: new Map(),
    stateBackups: new Map()
  };
}

function backupKey(companyId, backupId) {
  return `${companyId}::${backupId}`;
}

class InMemoryDatabaseStatePersistenceAdapter {
  constructor(options = {}) {
    this.tables = options.tables || defaultTables();
    this.now = typeof options.now === "function" ? options.now : () => new Date().toISOString();
  }

  async read(options = {}) {
    const companyId = options.companyId || DEFAULT_COMPANY_ID;
    const row = this.tables.companyState.get(companyId);
    if (!row) {
      return stateEnvelope({}, {
        companyId,
        source: "backend",
        revision: INITIAL_REVISION,
        savedAt: this.now()
      });
    }
    return clone(row.envelope);
  }

  async write(envelope, options = {}) {
    const normalized = normalizeStatePayload(envelope, {
      companyId: envelope?.companyId || options.companyId || DEFAULT_COMPANY_ID,
      source: options.source || envelope?.source || "backend"
    });
    const companyId = normalized.companyId;
    const current = await this.read({ companyId });
    const expectedRevision = options.expectedRevision || envelope?.expectedRevision || envelope?.revision || null;
    enforceExpectedRevision(current, expectedRevision);

    const saved = stateEnvelope(normalized.state, {
      companyId,
      source: normalized.source,
      revision: nextRevision(current.revision),
      savedAt: this.now()
    });

    this.tables.companyState.set(companyId, {
      companyId,
      revision: saved.revision,
      savedAt: saved.savedAt,
      envelope: clone(saved)
    });
    return clone(saved);
  }

  async backup(label = "manual", options = {}) {
    const companyId = options.companyId || DEFAULT_COMPANY_ID;
    const envelope = await this.read({ companyId });
    const id = options.id || backupFileName(label, new Date(this.now()));
    const row = {
      id,
      label: id.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-/, "").replace(/\.json$/, ""),
      createdAt: this.now(),
      sizeBytes: byteSize(envelope),
      savedAt: envelope.savedAt,
      companyId,
      source: envelope.source,
      revision: envelope.revision,
      envelope: clone(envelope)
    };
    this.tables.stateBackups.set(backupKey(companyId, id), row);
    const metadata = clone(row);
    delete metadata.envelope;
    return { ok: true, ...metadata };
  }

  async listBackups(options = {}) {
    const companyId = options.companyId || DEFAULT_COMPANY_ID;
    return Array.from(this.tables.stateBackups.values())
      .filter(row => row.companyId === companyId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map(row => {
        const copy = clone(row);
        delete copy.envelope;
        return copy;
      });
  }

  async readBackup(id, options = {}) {
    const backupId = safeBackupId(id);
    const companyId = options.companyId || DEFAULT_COMPANY_ID;
    const row = this.tables.stateBackups.get(backupKey(companyId, backupId));
    if (!row) {
      const error = new Error("Backup not found.");
      error.statusCode = 404;
      throw error;
    }
    return clone(row.envelope);
  }

  async restoreBackup(id, options = {}) {
    const companyId = options.companyId || DEFAULT_COMPANY_ID;
    const backup = await this.readBackup(id, { companyId });
    const restored = stateEnvelope(backup.state, {
      companyId,
      source: options.source || "restore",
      revision: options.expectedRevision || backup.revision,
      savedAt: this.now()
    });
    return this.write(restored, {
      companyId,
      expectedRevision: options.expectedRevision
    });
  }
}

function createInMemoryDatabaseStatePersistenceAdapter(options = {}) {
  return new InMemoryDatabaseStatePersistenceAdapter(options);
}

function databasePersistenceTables() {
  return {
    smartbooks_company_state: [
      "company_id",
      "schema_version",
      "revision",
      "source",
      "saved_at",
      "state_json",
      "created_at",
      "updated_at"
    ],
    smartbooks_state_backups: [
      "backup_id",
      "company_id",
      "label",
      "revision",
      "source",
      "saved_at",
      "created_at",
      "size_bytes",
      "state_json"
    ]
  };
}

module.exports = {
  InMemoryDatabaseStatePersistenceAdapter,
  createInMemoryDatabaseStatePersistenceAdapter,
  databasePersistenceTables
};
