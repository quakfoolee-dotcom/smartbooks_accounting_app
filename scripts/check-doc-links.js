const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOC_ROOTS = ["README.md", "docs"];
const EXTERNAL_LINK = /^(?:https?:|mailto:|tel:|#)/i;

function walkMarkdown(target) {
  const fullPath = path.join(ROOT, target);
  if(!fs.existsSync(fullPath)) return [];
  const stat = fs.statSync(fullPath);
  if(stat.isFile()) return target.endsWith(".md") ? [fullPath] : [];

  return fs.readdirSync(fullPath, { withFileTypes:true }).flatMap(entry => {
    const relative = path.join(target, entry.name);
    if(entry.isDirectory()) return walkMarkdown(relative);
    return entry.isFile() && entry.name.endsWith(".md") ? [path.join(ROOT, relative)] : [];
  });
}

function normalizeMarkdownTarget(rawTarget) {
  const trimmed = rawTarget.trim().replace(/^<|>$/g, "");
  if(!trimmed || EXTERNAL_LINK.test(trimmed)) return null;

  const withoutTitle = trimmed.match(/^([^ \t]+)(?:[ \t]+["'][^"']+["'])?$/)?.[1] || trimmed;
  const withoutAnchor = withoutTitle.split("#")[0];
  return withoutAnchor ? decodeURIComponent(withoutAnchor) : null;
}

function markdownLinks(markdown) {
  const links = [];
  const inlineLink = /!?\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while((match = inlineLink.exec(markdown))) {
    const target = normalizeMarkdownTarget(match[1]);
    if(target) links.push(target);
  }
  return links;
}

function checkFile(markdownFile) {
  const markdown = fs.readFileSync(markdownFile, "utf8");
  const baseDir = path.dirname(markdownFile);

  return markdownLinks(markdown)
    .filter(target => !target.startsWith("/"))
    .map(target => ({
      markdownFile,
      target,
      resolved: path.resolve(baseDir, target)
    }))
    .filter(link => !fs.existsSync(link.resolved));
}

const markdownFiles = DOC_ROOTS.flatMap(walkMarkdown);
const missingLinks = markdownFiles.flatMap(checkFile);

if(missingLinks.length) {
  console.error("Missing local documentation links:");
  missingLinks.forEach(link => {
    console.error(`- ${path.relative(ROOT, link.markdownFile)} -> ${link.target}`);
  });
  process.exit(1);
}

console.log(`Documentation links OK: ${markdownFiles.length} Markdown file(s) checked.`);
