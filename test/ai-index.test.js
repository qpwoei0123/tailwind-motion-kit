'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const checkedInAiIndex = require('../ai/index.json');
const { aiIndex, buildAiIndex, buildPairWith, parseAnimationDefaults } = require('../src/ai');
const fade = require('../src/presets/fade');
const slide = require('../src/presets/slide');
const scale = require('../src/presets/scale');
const attention = require('../src/presets/attention');
const rotate = require('../src/presets/rotate');

const presetModules = [fade, slide, scale, attention, rotate];

function getAnimationEntries() {
  return presetModules.flatMap((preset) => Object.entries(preset.animations));
}

test('generated ai index stays synced with checked-in ai/index.json', () => {
  assert.deepEqual(buildAiIndex(), checkedInAiIndex);
  assert.deepEqual(aiIndex, checkedInAiIndex);
});

test('generated ai tokens expose every reusable timing utility group', () => {
  assert.deepEqual(Object.keys(aiIndex.tokens), ['duration', 'delay', 'easing', 'repeat', 'direction', 'fill']);
  assert.deepEqual(aiIndex.tokens.repeat, [
    'animate-repeat-1',
    'animate-repeat-2',
    'animate-repeat-3',
    'animate-repeat-infinite',
  ]);
});

test('every bundled preset animation has generated AI metadata and valid pair_with tokens', () => {
  const animationNames = new Set(aiIndex.animations.map((animation) => animation.name));
  const tokenClasses = new Set(Object.values(aiIndex.tokens).flat());

  for (const [name, animationValue] of getAnimationEntries()) {
    assert.ok(animationNames.has(name), `missing AI animation entry: ${name}`);

    const generatedPairWith = buildPairWith(animationValue, aiIndex.tokens);
    const aiAnimation = aiIndex.animations.find((animation) => animation.name === name);

    assert.deepEqual(aiAnimation.pair_with, generatedPairWith, `pair_with drift detected for ${name}`);

    for (const token of aiAnimation.pair_with) {
      assert.ok(tokenClasses.has(token), `unknown pair_with token for ${name}: ${token}`);
    }
  }
});

test('pair_with generation only emits exact utility matches from preset defaults', () => {
  assert.deepEqual(parseAnimationDefaults('soft-pulse var(--tmk-duration,1200ms) var(--tmk-easing,ease-in-out) infinite'), {
    duration: 1200,
    easing: 'ease-in-out',
    tail: ['infinite'],
  });

  assert.deepEqual(
    buildPairWith('soft-pulse var(--tmk-duration,1200ms) var(--tmk-easing,ease-in-out) infinite', aiIndex.tokens),
    ['animate-ease-in-out', 'animate-repeat-infinite']
  );
  assert.deepEqual(
    buildPairWith('fade-blur-in var(--tmk-duration,320ms) var(--tmk-easing,ease-out) both', aiIndex.tokens),
    ['animate-ease-out', 'animate-fill-both']
  );
});
