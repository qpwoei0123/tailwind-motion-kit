'use strict';

const fs = require('node:fs');
const { getAction, getManifest, getSchema, listActions } = require('./actions');

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function fail(code, message, extra = {}) {
  process.stderr.write(`${JSON.stringify({ ok: false, error: message, ...extra }, null, 2)}\n`);
  process.exitCode = code;
}

function parseInput(raw) {
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON input: ${error.message}`);
  }
}

function readJsonArgOrStdin(args) {
  const inlineIndex = args.indexOf('--input');
  if (inlineIndex >= 0) return parseInput(args[inlineIndex + 1]);
  if (!process.stdin.isTTY) return parseInput(fs.readFileSync(0, 'utf8'));
  return {};
}

function getHelpPayload() {
  return {
    ok: true,
    usage: [
      'tmk manifest',
      'tmk schema [action-name]',
      'tmk action <action-name> [--input <json>]',
      'tmk generate [--input <json>]',
      'tmk resolve [--input <json>]',
    ],
    examples: [
      'tmk manifest',
      'tmk schema recommend',
      'tmk action list-animations --input {"intent":"enter","limit":3}',
      'tmk generate --input {"intent":"feedback","context":"cta click","duration":700}',
      'tmk resolve --input {"className":"animate-jelly animate-duration-500 animate-ease-in-out motion-reduce:animate-none"}',
    ],
    notes: [
      'All successful responses are JSON on stdout.',
      'All command/action failures are JSON on stderr with exit code 1.',
      'Use manifest as the primary discovery entrypoint for automation.',
      'generate and resolve are convenience aliases over the same JSON-first contract surface.',
    ],
    actions: listActions().map(({ name, description }) => ({ name, description })),
  };
}

function runAction(actionName, argv) {
  const action = getAction(actionName);
  if (!action) return fail(1, `Unknown action: ${actionName}`);

  try {
    const input = readJsonArgOrStdin(argv);
    const result = action.run(input);
    printJson(result);
    return;
  } catch (error) {
    return fail(1, error.message, { action: actionName });
  }
}

function run(argv = process.argv.slice(2)) {
  const [command, subcommand] = argv;

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printJson(getHelpPayload());
    return;
  }

  if (command === 'manifest') {
    printJson(getManifest());
    return;
  }

  if (command === 'schema') {
    const schema = getSchema(subcommand);
    if (!schema) return fail(1, `Unknown action schema: ${subcommand}`);
    printJson(schema);
    return;
  }

  if (command === 'generate' || command === 'resolve') {
    runAction(command, argv.slice(1));
    return;
  }

  if (command === 'action') {
    if (!subcommand) return fail(1, 'Missing action name');
    runAction(subcommand, argv.slice(2));
    return;
  }

  fail(1, `Unknown command: ${command}`);
}

module.exports = { run };
