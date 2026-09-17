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

module.exports = { resolveConfig, buildRuleDocument };
