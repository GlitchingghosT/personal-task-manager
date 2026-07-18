#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
}).split("\0").filter(Boolean).sort();

const rules = [
  {
    id: "credential-in-mongodb-uri",
    pattern: /mongodb(?:\+srv)?:\/\/[^/\s:@]+:[^@\s/]+@/i,
  },
  {
    id: "private-key-material",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    id: "hardcoded-sensitive-assignment",
    pattern: /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*["'][^"'\s]{8,}["']/i,
  },
];

const findings = [];

for (const file of trackedFiles) {
  let contents;
  try {
    contents = readFileSync(file);
  } catch {
    findings.push({ file, rule: "unreadable-tracked-file" });
    continue;
  }

  if (contents.includes(0)) continue;
  const text = contents.toString("utf8");

  for (const rule of rules) {
    if (rule.pattern.test(text)) findings.push({ file, rule: rule.id });
  }
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(`[secret-scan] ${finding.rule}: ${finding.file}`);
  }
  console.error(`[secret-scan] failed with ${findings.length} finding(s)`);
  process.exit(1);
}

console.log(`[secret-scan] passed (${trackedFiles.length} tracked files checked)`);
