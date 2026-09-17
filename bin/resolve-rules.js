#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const {
  resolveConfig,
  buildRuleDocument,
  loadRepoRegistry,
  resolveRepoRules,
  findRepoEntry,
  detectRepoName,
} = require('../lib/rule-resolver');

const FLAGS = { '--config': 'config', '--out': 'out', '--repo': 'repo' };

function parseArgs(argv) {
  const args = { config: null, out: '.claude/rules/cc/code-review.md', repo: null };
  for (let i = 0; i < argv.length; i += 1) {
    const key = FLAGS[argv[i]];
    if (key) {
      args[key] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function resolveRuleList(args, registry, cwd) {
  if (args.repo) {
    return { rules: resolveRepoRules(registry, args.repo).rules, source: `--repo ${args.repo}` };
  }

  if (args.config) {
    const configPath = path.resolve(cwd, args.config);
    return { rules: resolveConfig(configPath).rules, source: `--config ${args.config}` };
  }

  const detectedName = detectRepoName(cwd);
  const detectedEntry = findRepoEntry(registry, detectedName);

  if (detectedEntry) {
    return { rules: detectedEntry.rules, source: `auto-detected repo "${detectedName}"` };
  }

  const defaultConfigPath = path.resolve(cwd, './cc.config.yml');

  if (fs.existsSync(defaultConfigPath)) {
    return { rules: resolveConfig(defaultConfigPath).rules, source: 'cc.config.yml' };
  }

  const known = Object.keys(registry).join(', ');
  const detectedNote = detectedName ? `"${detectedName}"` : '(no package.json found)';
  throw new Error(
    `Could not detect which rules to use. package.json name ${detectedNote} doesn't match a known repo (${known}), ` +
      'and no cc.config.yml was found in the current directory. Pass --repo <name> or --config <path>.'
  );
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const cwd = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  if (args.repo && args.config) {
    throw new Error('Pass either --repo or --config, not both.');
  }

  const outPath = path.resolve(cwd, args.out);
  const registry = loadRepoRegistry(path.join(repoRoot, 'repos.json'));
  const { rules, source } = resolveRuleList(args, registry, cwd);
  const document = buildRuleDocument(repoRoot, rules);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, document);

  process.stdout.write(`${outPath}\n`);
  process.stderr.write(`(resolved via ${source})\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
