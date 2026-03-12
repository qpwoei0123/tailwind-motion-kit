'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.join(__dirname, '..', 'bin', 'tmk.js');
const exportedContracts = require('../ai/contracts.json');
const { getContractBundle, validateAgainstSchema } = require('../src/cli/actions');

function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
    input: options.input,
  });

  return {
    ...result,
    stdoutJson: result.stdout ? JSON.parse(result.stdout) : null,
    stderrJson: result.stderr ? JSON.parse(result.stderr) : null,
  };
}

function assertMatchesSchema(schema, value, path = 'output') {
  assert.doesNotThrow(() => validateAgainstSchema(schema, value, path));
}

test('help output exposes discoverable command, action, and schema surface', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.command, 'help');
  assert.deepEqual(result.stdoutJson.usage, [
    'tmk manifest',
    'tmk schema',
    'tmk schema <command-or-action>',
    'tmk action <action-name> [--input <json>]',
    'tmk generate [--input <json>]',
    'tmk resolve [--input <json>]',
  ]);
  assert.ok(result.stdoutJson.examples.includes('tmk schema manifest'));
  assert.ok(result.stdoutJson.examples.includes('tmk schema recommend'));
  assert.deepEqual(
    result.stdoutJson.actions.map((item) => item.name),
    ['list-animations', 'recommend', 'generate', 'resolve']
  );
});

test('exported cli contract bundle stays in sync with runtime bundle', () => {
  assert.deepEqual(exportedContracts, getContractBundle());
});

test('manifest returns contract files, stable refs, and repeat tokens', () => {
  const result = runCli(['manifest']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.command, 'manifest');
  assert.equal(result.stdoutJson.ok, true);
  assert.deepEqual(result.stdoutJson.commands, ['manifest', 'schema', 'action', 'generate', 'resolve']);
  assert.equal(result.stdoutJson.contract_files.cli_contracts, './ai/contracts.json');
  assert.equal(result.stdoutJson.command_contracts.action.input_schema_ref, './ai/contracts.json#/$defs/actionEnvelope');
  assert.deepEqual(
    result.stdoutJson.actions.map((item) => item.name),
    ['list-animations', 'recommend', 'generate', 'resolve']
  );
  assert.deepEqual(result.stdoutJson.library_manifest.tokens.repeat, [
    'animate-repeat-1',
    'animate-repeat-2',
    'animate-repeat-3',
    'animate-repeat-infinite',
  ]);
  assertMatchesSchema(exportedContracts.$defs.manifestResponse, result.stdoutJson);
});

test('schema summary returns exported bundle and command contracts', () => {
  const result = runCli(['schema']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.command, 'schema');
  assert.equal(result.stdoutJson.target, 'all');
  assert.equal(result.stdoutJson.contract_files.cli_contracts, './ai/contracts.json');
  assert.equal(result.stdoutJson.cli_contracts.$id, exportedContracts.$id);
  assert.equal(result.stdoutJson.command_contracts.generate.output_schema_ref, './ai/contracts.json#/$defs/generateResponse');
  assert.deepEqual(
    result.stdoutJson.actions.map((item) => item.name),
    ['list-animations', 'recommend', 'generate', 'resolve']
  );
  assertMatchesSchema(exportedContracts.$defs.schemaSummaryResponse, result.stdoutJson);
});

test('schema supports command-specific views for manifest and action dispatch', () => {
  const manifestSchema = runCli(['schema', 'manifest']);
  const actionSchema = runCli(['schema', 'action']);

  assert.equal(manifestSchema.status, 0);
  assert.equal(manifestSchema.stdoutJson.kind, 'command');
  assert.equal(manifestSchema.stdoutJson.name, 'manifest');
  assert.equal(manifestSchema.stdoutJson.schema_refs.output, './ai/contracts.json#/$defs/manifestResponse');
  assertMatchesSchema(exportedContracts.$defs.commandSchemaResponse, manifestSchema.stdoutJson);

  assert.equal(actionSchema.status, 0);
  assert.equal(actionSchema.stdoutJson.kind, 'command');
  assert.equal(actionSchema.stdoutJson.name, 'action');
  assert.equal(actionSchema.stdoutJson.schema_refs.input, './ai/contracts.json#/$defs/actionEnvelope');
  assert.ok(actionSchema.stdoutJson.input_schema.properties.action.enum.includes('recommend'));
  assertMatchesSchema(exportedContracts.$defs.commandSchemaResponse, actionSchema.stdoutJson);
});

test('schema returns action-specific input and output schemas', () => {
  const result = runCli(['schema', 'recommend']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.kind, 'action');
  assert.equal(result.stdoutJson.name, 'recommend');
  assert.equal(result.stdoutJson.schema_refs.input, './ai/contracts.json#/$defs/recommendInput');
  assert.equal(result.stdoutJson.schema_refs.output, './ai/contracts.json#/$defs/recommendResponse');
  assert.ok(result.stdoutJson.output_schema.properties.recommendation);
  assert.ok(result.stdoutJson.output_schema.properties.reasons);
  assertMatchesSchema(exportedContracts.$defs.actionSchemaResponse, result.stdoutJson);
});

test('action dispatch supports inline JSON input and response matches exported schema', () => {
  const result = runCli(['action', 'list-animations', '--input', '{"intent":"feedback"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'list-animations');
  assert.ok(result.stdoutJson.count >= 1);
  assert.ok(result.stdoutJson.animations.some((item) => item.name === 'jelly'));
  assertMatchesSchema(exportedContracts.$defs.listAnimationsResponse, result.stdoutJson);
  assertMatchesSchema(exportedContracts.$defs.actionResponse, result.stdoutJson);
});

test('action dispatch supports stdin JSON input and exposes repeat tokens when requested', () => {
  const result = runCli(['action', 'recommend'], {
    input: JSON.stringify({ intent: 'feedback', context: 'cta click', include_tokens: true }),
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'recommend');
  assert.equal(result.stdoutJson.recommendation.name, 'jelly');
  assert.deepEqual(result.stdoutJson.tokens.repeat, [
    'animate-repeat-1',
    'animate-repeat-2',
    'animate-repeat-3',
    'animate-repeat-infinite',
  ]);
  assertMatchesSchema(exportedContracts.$defs.recommendResponse, result.stdoutJson);
});

test('generate builds a paste-ready className and matches schema', () => {
  const result = runCli(['generate', '--input', '{"intent":"feedback","context":"cta click","duration":700,"easing":"out"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'generate');
  assert.equal(result.stdoutJson.recommendation.name, 'jelly');
  assert.match(result.stdoutJson.className, /animate-jelly/);
  assert.match(result.stdoutJson.className, /animate-duration-700/);
  assert.match(result.stdoutJson.className, /animate-ease-out/);
  assertMatchesSchema(exportedContracts.$defs.generateResponse, result.stdoutJson);
});

test('resolve extracts animation and token groups, including repeat', () => {
  const result = runCli([
    'resolve',
    '--input',
    '{"className":"animate-soft-pulse animate-duration-1000 animate-repeat-infinite animate-ease-in-out motion-reduce:animate-none"}',
  ]);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'resolve');
  assert.equal(result.stdoutJson.animation.name, 'soft-pulse');
  assert.equal(result.stdoutJson.tokens.duration, 'animate-duration-1000');
  assert.equal(result.stdoutJson.tokens.repeat, 'animate-repeat-infinite');
  assert.equal(result.stdoutJson.tokens.easing, 'animate-ease-in-out');
  assert.equal(result.stdoutJson.tokens.reduced_motion, 'motion-reduce:animate-none');
  assertMatchesSchema(exportedContracts.$defs.resolveResponse, result.stdoutJson);
});

test('recommend returns no_match instead of arbitrary fallback when nothing scores', () => {
  const result = runCli(['action', 'recommend', '--input', '{"intent":"layout","context":"spreadsheet grid"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'recommend');
  assert.equal(result.stdoutJson.recommendation, null);
  assert.equal(result.stdoutJson.reasons.no_match, true);
  assertMatchesSchema(exportedContracts.$defs.recommendResponse, result.stdoutJson);
});

test('action input is validated against schema', () => {
  const result = runCli(['action', 'list-animations', '--input', '{"intent":123}']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.equal(result.stderrJson.command, 'action');
  assert.equal(result.stderrJson.action, 'list-animations');
  assert.match(result.stderrJson.error, /Invalid input at input.intent/);
  assertMatchesSchema(exportedContracts.$defs.errorResponse, result.stderrJson, 'error');
});

test('unknown properties are rejected for stable contracts', () => {
  const result = runCli(['action', 'recommend', '--input', '{"intent":"enter","foo":"bar"}']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.equal(result.stderrJson.command, 'action');
  assert.match(result.stderrJson.error, /unknown property `foo`/);
  assertMatchesSchema(exportedContracts.$defs.errorResponse, result.stderrJson, 'error');
});

test('invalid JSON input fails with JSON error payload', () => {
  const result = runCli(['action', 'recommend', '--input', '{bad json']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.equal(result.stderrJson.command, 'action');
  assert.equal(result.stderrJson.action, 'recommend');
  assert.match(result.stderrJson.error, /Invalid JSON input/);
  assertMatchesSchema(exportedContracts.$defs.errorResponse, result.stderrJson, 'error');
});

test('unknown schema targets and unknown actions fail with JSON errors', () => {
  const unknownSchema = runCli(['schema', 'nope']);
  const unknownAction = runCli(['action', 'nope']);

  assert.equal(unknownSchema.status, 1);
  assert.equal(unknownSchema.stderrJson.ok, false);
  assert.equal(unknownSchema.stderrJson.command, 'schema');
  assert.equal(unknownSchema.stderrJson.target, 'nope');
  assert.match(unknownSchema.stderrJson.error, /Unknown action or command schema/);
  assertMatchesSchema(exportedContracts.$defs.errorResponse, unknownSchema.stderrJson, 'error');

  assert.equal(unknownAction.status, 1);
  assert.equal(unknownAction.stderrJson.ok, false);
  assert.equal(unknownAction.stderrJson.command, 'action');
  assert.equal(unknownAction.stderrJson.action, 'nope');
  assert.match(unknownAction.stderrJson.error, /Unknown action/);
  assertMatchesSchema(exportedContracts.$defs.errorResponse, unknownAction.stderrJson, 'error');
});
