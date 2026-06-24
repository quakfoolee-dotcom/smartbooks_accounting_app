const fs = require("fs");
const path = require("path");

const STATE_SCHEMA_VERSION = 1;
const DEFAULT_COMPANY_ID = "demo-company";

function nowISO() {
  return new Date().toISOString();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stateEnvelope(state = {}, options = {}) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    savedAt: options.savedAt || nowISO(),
    source: options.source || "backend",
    companyId: options.companyId || DEFAULT_COMPANY_ID,
    state: isPlainObject(state) ? state : {}
  };
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
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
      companyId: payload.companyId || options.companyId || DEFAULT_COMPANY_ID
    });
  }

  return stateEnvelope(payload, {
    source: options.source || "migration",
    companyId: options.companyId || DEFAULT_COMPANY_ID
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

class FileStatePersistenceAdapter {
  constructor(options = {}) {
    if (!options.stateFile) throw new Error("FileStatePersistenceAdapter requires a stateFile path.");
    this.stateFile = options.stateFile;
    this.backupDir = options.backupDir || path.join(path.dirname(options.stateFile), "backups");
  }

  async read() {
    if (!fs.existsSync(this.stateFile)) return stateEnvelope({}, { source: "backend" });
    const saved = JSON.parse(fs.readFileSync(this.stateFile, "utf8"));
    return normalizeStatePayload(saved, { source: "backend" });
  }

  async write(envelope) {
    const normalized = normalizeStatePayload(envelope, { source: "backend" });
    const saved = stateEnvelope(normalized.state, {
      source: normalized.source,
      companyId: normalized.companyId
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
      path: backupPath,
      savedAt: envelope.savedAt,
      companyId: envelope.companyId,
      source: envelope.source
    };
  }
}

function createFileStatePersistenceAdapter(options = {}) {
  return new FileStatePersistenceAdapter(options);
}

module.exports = {
  DEFAULT_COMPANY_ID,
  FileStatePersistenceAdapter,
  STATE_SCHEMA_VERSION,
  backupFileName,
  createFileStatePersistenceAdapter,
  normalizeStatePayload,
  stateEnvelope
};
