'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function resolveConfig(configPath) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(raw);

  if (!config || typeof config !== 'object') {
    throw new Error(`Invalid config at ${configPath}: expected a YAML object`);
  }

  if (!config.project || typeof config.project.type !== 'string') {
    throw new Error(`Invalid config at ${configPath}: missing "project.type" string`);
  }

  if (!Array.isArray(config.rules) || config.rules.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Invalid config at ${configPath}: missing or invalid "rules" array of strings`);
  }

  return config;
}

function loadRepoRegistry(registryPath) {
  const raw = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(raw);

  if (!registry || typeof registry !== 'object') {
    throw new Error(`Invalid repo registry at ${registryPath}: expected a JSON object`);
  }

  return registry;
}

function findRepoEntry(registry, repoName) {
  if (!repoName) {
    return null;
  }

  const needle = repoName.toLowerCase();
  const key = Object.keys(registry).find((name) => {
    const entry = registry[name];
    const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
    return name.toLowerCase() === needle || aliases.some((alias) => alias.toLowerCase() === needle);
  });

  return key ? registry[key] : null;
}

function resolveRepoRules(registry, repoName) {
  const entry = findRepoEntry(registry, repoName);

  if (!entry) {
    const known = Object.keys(registry).join(', ');
    throw new Error(`Unknown repo "${repoName}". Known repos: ${known}`);
  }

  return entry;
}

function detectRepoName(cwd) {
  const pkgPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return typeof pkg.name === 'string' ? pkg.name : null;
}

function buildRuleDocument(repoRoot, ruleList) {
  const sections = ruleList.map((entry) => {
    const rulePath = path.join(repoRoot, 'rules', entry, 'code-review.md');

    if (!fs.existsSync(rulePath)) {
      throw new Error(`Rule layer "${entry}" not found: ${rulePath}`);
    }

    const content = fs.readFileSync(rulePath, 'utf8');
    return `<!-- layer: ${entry} -->\n\n${content.trim()}`;
  });

  return sections.join('\n\n---\n\n');
}

module.exports = {
  resolveConfig,
  buildRuleDocument,
  loadRepoRegistry,
  resolveRepoRules,
  findRepoEntry,
  detectRepoName,
};
