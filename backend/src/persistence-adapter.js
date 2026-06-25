const fs = require("fs");
const path = require("path");

const STATE_SCHEMA_VERSION = 1;
const DEFAULT_COMPANY_ID = "demo-company";
const INITIAL_REVISION = "rev_000001";
const STATE_REVISION_CONFLICT = "STATE_REVISION_CONFLICT";

function nowISO() {
  return new Date().toISOString();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stateHasContent(envelope) {
  return Boolean(envelope?.state && Object.keys(envelope.state).length > 0);
}

function revisionNumber(revision) {
  const match = /^rev_(\d+)$/.exec(String(revision || ""));
  return match ? Number(match[1]) : 0;
}

function nextRevision(revision) {
  const next = Math.max(1, revisionNumber(revision) + 1);
  return `rev_${String(next).padStart(6, "0")}`;
}

function stateEnvelope(state = {}, options = {}) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    savedAt: options.savedAt || nowISO(),
    source: options.source || "backend",
    companyId: options.companyId || DEFAULT_COMPANY_ID,
    revision: options.revision || INITIAL_REVISION,
    state: isPlainObject(state) ? state : {}
  };
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function revisionConflictError(expectedRevision, currentRevision) {
  const error = new Error("State revision conflict.");
  error.statusCode = 409;
  error.code = STATE_REVISION_CONFLICT;
  error.expectedRevision = expectedRevision || null;
  error.currentRevision = currentRevision || null;
  return error;
}

function enforceExpectedRevision(current, expectedRevision) {
  if (!stateHasContent(current)) return;
  if (expectedRevision && expectedRevision === current.revision) return;
  throw revisionConflictError(expectedRevision, current.revision);
}

function normalizeStatePayload(payload, options = {}) {
  if (!isPlainObject(payload)) throw validationError("State payload must be a JSON object.");

  if (Object.prototype.hasOwnProperty.call(payload, "state")) {
    if (payload.schemaVersion !== undefined && Number(payload.schemaVersion) !== STATE_SCHEMA_VERSION) {
      throw validationError(`Unsupported state schemaVersion: ${payload.schemaVersion}.`);
    }
    if (!isPlainObject(payload.state)) throw validationError("State envelope must include an object state.");
    return stateEnvelope(payload.state, {
      savedAt: payload.savedAt || options.savedAt,
      source: payload.source || options.source || "backend",
      companyId: payload.companyId || options.companyId || DEFAULT_COMPANY_ID,
      revision: payload.revision || options.revision || INITIAL_REVISION
    });
  }

  return stateEnvelope(payload, {
    source: options.source || "migration",
    companyId: options.companyId || DEFAULT_COMPANY_ID,
    revision: options.revision || INITIAL_REVISION
  });
}

function safeLabel(label) {
  return String(label || "manual")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "manual";
}

function backupFileName(label, date = new Date()) {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  return `${stamp}-${safeLabel(label)}.json`;
}

function safeBackupId(id) {
  const value = String(id || "").trim();
  if (!/^[A-Za-z0-9_.-]+\.json$/.test(value)) throw validationError("Backup id must be a JSON backup filename.");
  if (path.basename(value) !== value) throw validationError("Backup id must not include a path.");
  return value;
}

function backupMetadata(backupPath, envelope) {
  const id = path.basename(backupPath);
  const stat = fs.statSync(backupPath);
  return {
    id,
    label: id.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-/, "").replace(/\.json$/, ""),
    createdAt: stat.birthtime?.toISOString?.() || stat.mtime.toISOString(),
    sizeBytes: stat.size,
    savedAt: envelope.savedAt,
    companyId: envelope.companyId,
    source: envelope.source,
    revision: envelope.revision
  };
}

class FileStatePersistenceAdapter {
  constructor(options = {}) {
    if (!options.stateFile) throw new Error("FileStatePersistenceAdapter requires a stateFile path.");
    this.stateFile = options.stateFile;
    this.backupDir = options.backupDir || path.join(path.dirname(options.stateFile), "backups");
  }

  async read() {
    if (!fs.existsSync(this.stateFile)) return stateEnvelope({}, { source: "backend", revision: INITIAL_REVISION });
    const saved = JSON.parse(fs.readFileSync(this.stateFile, "utf8"));
    return normalizeStatePayload(saved, { source: "backend" });
  }

  async write(envelope, options = {}) {
    const current = await this.read();
    const expectedRevision = options.expectedRevision || envelope?.expectedRevision || envelope?.revision || null;
    enforceExpectedRevision(current, expectedRevision);

    const normalized = normalizeStatePayload(envelope, {
      source: "backend",
      revision: expectedRevision || current.revision
    });
    const saved = stateEnvelope(normalized.state, {
      source: normalized.source,
      companyId: normalized.companyId,
      revision: nextRevision(current.revision)
    });
    fs.mkdirSync(path.dirname(this.stateFile), { recursive: true });
    fs.writeFileSync(this.stateFile, JSON.stringify(saved, null, 2));
    return saved;
  }

  async backup(label = "manual") {
    const envelope = await this.read();
    fs.mkdirSync(this.backupDir, { recursive: true });
    const backupPath = path.join(this.backupDir, backupFileName(label));
    fs.writeFileSync(backupPath, JSON.stringify(envelope, null, 2));
    return {
      ok: true,
      ...backupMetadata(backupPath, envelope)
    };
  }

  async listBackups() {
    if (!fs.existsSync(this.backupDir)) return [];
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith(".json"))
      .sort()
      .reverse();
    const backups = [];
    for (const file of files) {
      const backupPath = path.join(this.backupDir, file);
      try {
        const envelope = normalizeStatePayload(JSON.parse(fs.readFileSync(backupPath, "utf8")), { source: "backend" });
        backups.push(backupMetadata(backupPath, envelope));
      } catch (error) {
        backups.push({
          id: file,
          label: file.replace(/\.json$/, ""),
          createdAt: fs.statSync(backupPath).mtime.toISOString(),
          sizeBytes: fs.statSync(backupPath).size,
          invalid: true,
          error: error.message
        });
      }
    }
    return backups;
  }

  async readBackup(id) {
    const backupId = safeBackupId(id);
    const backupPath = path.join(this.backupDir, backupId);
    if (!backupPath.startsWith(this.backupDir)) throw validationError("Backup id is outside the backup directory.");
    if (!fs.existsSync(backupPath)) {
      const error = new Error("Backup not found.");
      error.statusCode = 404;
      throw error;
    }
    return normalizeStatePayload(JSON.parse(fs.readFileSync(backupPath, "utf8")), { source: "backend" });
  }

  async restoreBackup(id, options = {}) {
    const backup = await this.readBackup(id);
    const restored = stateEnvelope(backup.state, {
      companyId: options.companyId || backup.companyId,
      source: options.source || "restore",
      revision: options.expectedRevision || backup.revision
    });
    return this.write(restored, { expectedRevision: options.expectedRevision });
  }
}

function createFileStatePersistenceAdapter(options = {}) {
  return new FileStatePersistenceAdapter(options);
}

module.exports = {
  DEFAULT_COMPANY_ID,
  FileStatePersistenceAdapter,
  INITIAL_REVISION,
  STATE_SCHEMA_VERSION,
  STATE_REVISION_CONFLICT,
  backupFileName,
  createFileStatePersistenceAdapter,
  enforceExpectedRevision,
  normalizeStatePayload,
  nextRevision,
  revisionConflictError,
  safeBackupId,
  stateEnvelope
};
