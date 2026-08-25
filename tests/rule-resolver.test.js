'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveConfig, buildRuleDocument } = require('../lib/rule-resolver');

const repoRoot = path.resolve(__dirname, '..');
const fixturesDir = path.join(__dirname, 'fixtures');

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
