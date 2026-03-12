'use strict';

const fs = require('node:fs');
const {
  getAction,
  getActionDiscoveryList,
  getCommandCatalog,
  getCommandNames,
  getDiscoveryFiles,
  getManifest,
  getQuickstartExamples,
  getSchema,
} = require('./actions');

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
  if (inlineIndex >= 0) {
    if (inlineIndex === args.length - 1) {
      throw new Error('Missing value for --input');
    }
    return parseInput(args[inlineIndex + 1]);
  }

  if (!process.stdin.isTTY) return parseInput(fs.readFileSync(0, 'utf8'));
  return {};
}

function getHelpPayload() {
  return {
    ok: true,
    summary: 'JSON-first CLI for discovering, recommending, generating, and resolving Tailwind motion classes.',
    start_here: 'tmk manifest',
    usage: [
      'tmk manifest',
      'tmk schema [action-name]',
      'tmk action <action-name> [--input <json>]',
      'tmk generate [--input <json>]',
      'tmk resolve [--input <json>]',
    ],
    examples: getQuickstartExamples().map((item) => item.command),
    quickstart: getQuickstartExamples(),
    commands: getCommandCatalog(),
    actions: getActionDiscoveryList().map(({ input_schema, ...action }) => action),
    discovery_files: getDiscoveryFiles(),
    notes: [
      'All successful responses are JSON on stdout.',
      'All command/action failures are JSON on stderr with exit code 1.',
      'Use `tmk manifest` as the primary discovery entrypoint for automation.',
      'Use `tmk schema <action>` before sending JSON when you want the exact input contract.',
      'generate and resolve are convenience aliases over the same JSON-first contract surface.',
    ],
  };
}

function runAction(actionName, argv) {
  const action = getAction(actionName);
  if (!action) {
    return fail(1, `Unknown action: ${actionName}`, {
      available_actions: getActionDiscoveryList().map(({ name }) => name),
      hint: 'Run `tmk manifest` or `tmk --help` to inspect the available actions.',
    });
  }

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
    if (!schema) {
      return fail(1, `Unknown action schema: ${subcommand}`, {
        available_actions: getActionDiscoveryList().map(({ name }) => name),
        hint: 'Run `tmk schema` for the top-level contract or `tmk manifest` for the full discovery payload.',
      });
    }
    printJson(schema);
    return;
  }

  if (command === 'generate' || command === 'resolve') {
    runAction(command, argv.slice(1));
    return;
  }

  if (command === 'action') {
    if (!subcommand) {
      return fail(1, 'Missing action name', {
        available_actions: getActionDiscoveryList().map(({ name }) => name),
        hint: 'Run `tmk manifest` or `tmk --help` to choose an action, then pass JSON with `--input` or stdin.',
      });
    }
    runAction(subcommand, argv.slice(2));
    return;
  }

  fail(1, `Unknown command: ${command}`, {
    available_commands: getCommandNames(),
    hint: 'Run `tmk --help` for copy-paste examples and discovery tips.',
  });
}

module.exports = { run };
