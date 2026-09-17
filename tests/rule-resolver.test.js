'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  resolveConfig,
  buildRuleDocument,
  loadRepoRegistry,
  resolveRepoRules,
  findRepoEntry,
  detectRepoName,
} = require('../lib/rule-resolver');

const repoRoot = path.resolve(__dirname, '..');
const fixturesDir = path.join(__dirname, 'fixtures');
const registry = loadRepoRegistry(path.join(repoRoot, 'repos.json'));

test('resolveConfig parses a valid frontend config', () => {
  const config = resolveConfig(path.join(repoRoot, 'examples', 'frontend.cc.config.yml'));
  assert.strictEqual(config.project.type, 'frontend');
  assert.deepStrictEqual(config.rules, ['common', 'frontend/common']);
});

test('resolveConfig throws on a config missing "rules"', () => {
  assert.throws(
    () => resolveConfig(path.join(fixturesDir, 'missing-rules.config.yml')),
    /missing or invalid "rules"/
  );
});

test('buildRuleDocument concatenates layers in order', () => {
  const document = buildRuleDocument(repoRoot, ['common', 'frontend/common']);
  const commonIndex = document.indexOf('<!-- layer: common -->');
  const frontendIndex = document.indexOf('<!-- layer: frontend/common -->');
  assert.ok(commonIndex >= 0, 'expected common layer marker');
  assert.ok(frontendIndex >= 0, 'expected frontend/common layer marker');
  assert.ok(commonIndex < frontendIndex, 'expected common layer before frontend/common layer');
});

test('buildRuleDocument throws when a rule layer file is missing', () => {
  assert.throws(
    () => buildRuleDocument(repoRoot, ['common', 'nonexistent/layer']),
    /Rule layer "nonexistent\/layer" not found/
  );
});

test('dashboard config resolves common + frontend/common + frontend/dashboard', () => {
  const dashboardConfig = resolveConfig(path.join(repoRoot, 'examples', 'dashboard.cc.config.yml'));
  assert.deepStrictEqual(dashboardConfig.rules, ['common', 'frontend/common', 'frontend/dashboard']);

  const dashboardDoc = buildRuleDocument(repoRoot, dashboardConfig.rules);
  assert.ok(dashboardDoc.includes('<!-- layer: frontend/dashboard -->'), 'expected frontend/dashboard layer marker');
});

test('ob config resolves common + frontend/common + frontend/ob', () => {
  const obConfig = resolveConfig(path.join(repoRoot, 'examples', 'ob.cc.config.yml'));
  assert.deepStrictEqual(obConfig.rules, ['common', 'frontend/common', 'frontend/ob']);

  const obDoc = buildRuleDocument(repoRoot, obConfig.rules);
  assert.ok(obDoc.includes('<!-- layer: frontend/ob -->'), 'expected frontend/ob layer marker');
});

test('resolveRepoRules resolves a repo by its registry key', () => {
  const entry = resolveRepoRules(registry, 'dashboard');
  assert.deepStrictEqual(entry.rules, ['common', 'frontend/common', 'frontend/dashboard']);
});

test('resolveRepoRules resolves a repo by alias, case-insensitively', () => {
  const entry = resolveRepoRules(registry, 'Classcard-Online-Booking');
  assert.deepStrictEqual(entry.rules, ['common', 'frontend/common', 'frontend/ob']);
});

test('resolveRepoRules throws with the known-repo list on an unknown repo', () => {
  assert.throws(
    () => resolveRepoRules(registry, 'nonexistent'),
    /Unknown repo "nonexistent"\. Known repos: dashboard, ob/
  );
});

test('detectRepoName reads the "name" field from cwd/package.json', () => {
  const name = detectRepoName(path.join(fixturesDir, 'detect-dashboard'));
  assert.strictEqual(name, 'classcard-dashboard');
});

test('detectRepoName returns null when there is no package.json', () => {
  const name = detectRepoName(fixturesDir);
  assert.strictEqual(name, null);
});

test('findRepoEntry returns null (not a throw) for an unmatched name', () => {
  assert.strictEqual(findRepoEntry(registry, 'some-other-repo'), null);
  assert.strictEqual(findRepoEntry(registry, null), null);
});

test('auto-detect chain: detected package.json name resolves via the registry', () => {
  const name = detectRepoName(path.join(fixturesDir, 'detect-dashboard'));
  const entry = findRepoEntry(registry, name);
  assert.ok(entry, 'expected a registry match for classcard-dashboard');
  assert.deepStrictEqual(entry.rules, ['common', 'frontend/common', 'frontend/dashboard']);
});
