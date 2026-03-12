#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildAiIndex } = require('../src/ai');

const outputPath = path.join(__dirname, '..', 'ai', 'index.json');
const output = `${JSON.stringify(buildAiIndex(), null, 2)}\n`;

fs.writeFileSync(outputPath, output);
process.stdout.write(`Synced ${path.relative(process.cwd(), outputPath)}\n`);
