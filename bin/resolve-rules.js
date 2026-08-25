#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { resolveConfig, buildRuleDocument } = require('../lib/rule-resolver');

function parseArgs(argv) {
  const args = { config: './cc.config.yml', out: '.claude/rules/cc/code-review.md' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--config') {
      args.config = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--out') {
      args.out = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(process.cwd(), args.config);
  const outPath = path.resolve(process.cwd(), args.out);

  const config = resolveConfig(configPath);
  const document = buildRuleDocument(repoRoot, config.rules);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, document);

  process.stdout.write(`${outPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
