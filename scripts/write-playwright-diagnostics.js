const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const shard = process.argv[2] || process.env.PLAYWRIGHT_SHARD || "functional";
const outputDir = path.join(ROOT, "playwright-diagnostics");
const jsonReportPath = path.join(ROOT, "test-results", "playwright-results.json");

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function collectTests(suite, pathParts = []) {
  const titlePath = [...pathParts, suite.title].filter(Boolean);
  const nested = (suite.suites || []).flatMap(child => collectTests(child, titlePath));
  const specs = (suite.specs || []).flatMap(spec => {
    return (spec.tests || []).map(test => ({
      title: [...titlePath, spec.title].filter(Boolean).join(" > "),
      outcome: test.outcome,
      status: test.status,
      expectedStatus: test.expectedStatus,
      projectName: test.projectName,
      durationMs: (test.results || []).reduce((total, result) => total + (result.duration || 0), 0),
      errors: (test.results || []).flatMap(result => result.errors || [])
    }));
  });
  return [...nested, ...specs];
}

function readJsonReport() {
  if (!fs.existsSync(jsonReportPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(jsonReportPath, "utf8"));
  } catch (error) {
    return { parseError: error.message };
  }
}

function writeDiagnostics() {
  fs.mkdirSync(outputDir, { recursive: true });
  const report = readJsonReport();
  const tests = report?.suites ? report.suites.flatMap(suite => collectTests(suite)) : [];
  const failed = tests.filter(test => test.outcome === "unexpected" || test.status === "failed");
  const skipped = tests.filter(test => test.outcome === "skipped" || test.status === "skipped");
  const artifactFiles = [
    ...walkFiles(path.join(ROOT, "test-results")),
    ...walkFiles(path.join(ROOT, "playwright-report"))
  ].map(filePath => {
    const stat = fs.statSync(filePath);
    return {
      path: relative(filePath),
      sizeBytes: stat.size
    };
  }).sort((a, b) => a.path.localeCompare(b.path));

  const lines = [
    `# Playwright Diagnostics: ${shard}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total tests in JSON report: ${tests.length || "unknown"}`,
    `- Failed tests: ${failed.length}`,
    `- Skipped tests: ${skipped.length}`,
    `- Artifact files found: ${artifactFiles.length}`,
    ""
  ];

  if (report?.parseError) {
    lines.push("## JSON Report Error", "", report.parseError, "");
  }

  if (failed.length) {
    lines.push("## Failed Tests", "");
    failed.forEach((test, index) => {
      lines.push(`${index + 1}. ${test.title}`);
      lines.push(`   - Project: ${test.projectName || "unknown"}`);
      lines.push(`   - Status: ${test.status || "unknown"}`);
      lines.push(`   - Duration: ${Math.round(test.durationMs || 0)} ms`);
      const firstError = test.errors[0]?.message || test.errors[0]?.value;
      if (firstError) lines.push(`   - Error: ${String(firstError).split("\n")[0]}`);
    });
    lines.push("");
  }

  lines.push("## How To Inspect", "");
  lines.push("- Open the HTML report locally with `npx playwright show-report playwright-report`.");
  lines.push("- Open trace ZIP files with `npx playwright show-trace path/to/trace.zip`.");
  lines.push("- Screenshots, videos, traces, and attached JSON metrics live under `test-results/`.");
  lines.push("");

  lines.push("## Artifact Manifest", "");
  artifactFiles.slice(0, 200).forEach(file => {
    lines.push(`- ${file.path} (${file.sizeBytes} bytes)`);
  });
  if (artifactFiles.length > 200) lines.push(`- ... ${artifactFiles.length - 200} more file(s) omitted from summary`);
  lines.push("");

  fs.writeFileSync(path.join(outputDir, `${shard}-summary.md`), `${lines.join("\n")}\n`);
  fs.writeFileSync(path.join(outputDir, `${shard}-manifest.json`), `${JSON.stringify({
    shard,
    generatedAt: new Date().toISOString(),
    failedTests: failed,
    skippedTests: skipped.length,
    artifacts: artifactFiles
  }, null, 2)}\n`);
}

writeDiagnostics();
