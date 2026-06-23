const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const c8Root = path.dirname(require.resolve("c8/package.json"));
const c8Bin = path.join(c8Root, "bin", "c8.js");
const tempDirectory = path.join(os.tmpdir(), `smartbooks-c8-${process.pid}`);
const c8Args = [
  "--temp-directory",
  tempDirectory,
  ...process.argv.slice(2),
  "npm",
  "run",
  "test:unit"
];

function removeTempDirectory(){
  try{
    fs.rmSync(tempDirectory, { recursive:true, force:true });
  }catch(error){
    // Coverage temp files are disposable; report generation has already finished.
  }
}

removeTempDirectory();
const result = spawnSync(process.execPath, [c8Bin, ...c8Args], { stdio:"inherit" });
removeTempDirectory();

if(result.error) throw result.error;
process.exit(result.status ?? 1);
