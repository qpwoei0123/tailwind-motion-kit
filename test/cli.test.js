'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.join(__dirname, '..', 'bin', 'tmk.js');

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

test('help output exposes discoverable command and action surface', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0);
  assert.deepEqual(result.stdoutJson.usage, [
    'tmk manifest',
    'tmk schema [action-name]',
    'tmk action <action-name> [--input <json>]',
    'tmk generate [--input <json>]',
    'tmk resolve [--input <json>]',
  ]);
  assert.ok(Array.isArray(result.stdoutJson.actions));
  assert.deepEqual(
    result.stdoutJson.actions.map((item) => item.name),
    ['list-animations', 'recommend', 'generate', 'resolve']
  );
});

test('manifest returns fixed command surface and actions', () => {
  const result = runCli(['manifest']);

  assert.equal(result.status, 0);
  assert.deepEqual(result.stdoutJson.commands, ['manifest', 'schema', 'action', 'generate', 'resolve']);
  assert.deepEqual(
    result.stdoutJson.actions.map((item) => item.name),
    ['list-animations', 'recommend', 'generate', 'resolve']
  );
});

test('schema returns top-level contract summary when no action is provided', () => {
  const result = runCli(['schema']);

  assert.equal(result.status, 0);
  assert.ok(result.stdoutJson.manifest);
  assert.ok(result.stdoutJson.action_envelope);
  assert.deepEqual(
    result.stdoutJson.actions.map((item) => item.name),
    ['list-animations', 'recommend', 'generate', 'resolve']
  );
});

test('schema returns action-specific schema', () => {
  const result = runCli(['schema', 'recommend']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.name, 'recommend');
  assert.ok(result.stdoutJson.input_schema.properties.intent);
  assert.ok(result.stdoutJson.input_schema.properties.context);
});

test('action dispatch supports inline JSON input', () => {
  const result = runCli(['action', 'list-animations', '--input', '{"intent":"feedback"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'list-animations');
  assert.ok(result.stdoutJson.count >= 1);
  assert.ok(result.stdoutJson.animations.some((item) => item.name === 'jelly'));
});

test('action dispatch supports stdin JSON input', () => {
  const result = runCli(['action', 'recommend'], {
    input: JSON.stringify({ intent: 'feedback', context: 'cta click', include_tokens: true }),
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'recommend');
  assert.equal(result.stdoutJson.recommendation.name, 'jelly');
  assert.ok(result.stdoutJson.tokens.duration);
});

test('generate builds a paste-ready className from intent and overrides', () => {
  const result = runCli(['generate', '--input', '{"intent":"feedback","context":"cta click","duration":700,"easing":"out"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'generate');
  assert.equal(result.stdoutJson.animation.name, 'jelly');
  assert.match(result.stdoutJson.className, /animate-jelly/);
  assert.match(result.stdoutJson.className, /animate-duration-700/);
  assert.match(result.stdoutJson.className, /animate-ease-out/);
});

test('resolve extracts animation and tokens from a className', () => {
  const result = runCli(['resolve', '--input', '{"className":"animate-jelly animate-duration-500 animate-ease-in-out motion-reduce:animate-none"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'resolve');
  assert.equal(result.stdoutJson.animation.name, 'jelly');
  assert.equal(result.stdoutJson.tokens.duration, 'animate-duration-500');
  assert.equal(result.stdoutJson.tokens.easing, 'animate-ease-in-out');
  assert.equal(result.stdoutJson.tokens.reduced_motion, 'motion-reduce:animate-none');
});

test('recommend returns no_match instead of arbitrary fallback when nothing scores', () => {
  const result = runCli(['action', 'recommend', '--input', '{"intent":"layout","context":"spreadsheet grid"}']);

  assert.equal(result.status, 0);
  assert.equal(result.stdoutJson.action, 'recommend');
  assert.equal(result.stdoutJson.recommendation, null);
  assert.equal(result.stdoutJson.reasons.no_match, true);
});

test('action input is validated against schema', () => {
  const result = runCli(['action', 'list-animations', '--input', '{"intent":123}']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.match(result.stderrJson.error, /Invalid input at input.intent/);
});

test('unknown properties are rejected for stable contracts', () => {
  const result = runCli(['action', 'recommend', '--input', '{"intent":"enter","foo":"bar"}']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.match(result.stderrJson.error, /unknown property `foo`/);
});

test('invalid JSON input fails with JSON error payload', () => {
  const result = runCli(['action', 'recommend', '--input', '{bad json']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.match(result.stderrJson.error, /Invalid JSON input/);
  assert.equal(result.stderrJson.action, 'recommend');
});

test('unknown actions fail with JSON errors', () => {
  const result = runCli(['action', 'nope']);

  assert.equal(result.status, 1);
  assert.equal(result.stderrJson.ok, false);
  assert.match(result.stderrJson.error, /Unknown action/);
});
