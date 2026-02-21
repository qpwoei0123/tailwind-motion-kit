'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const motionKit = require('../src');
const fade = require('../src/presets/fade');
const slide = require('../src/presets/slide');
const scale = require('../src/presets/scale');
const attention = require('../src/presets/attention');
const rotate = require('../src/presets/rotate');

const requiredPresetNames = ['fade', 'slide', 'scale', 'attention', 'rotate'];
const requiredAnimationKeys = [
  'fade-in',
  'fade-out',
  'slide-in-up',
  'slide-out-down',
  'scale-in',
  'scale-out',
  'bounce-in',
  'wobble',
  'jelly',
  'soft-pulse',
  'float',
  'rotate-in',
];

test('preset modules expose required structure', () => {
  const presets = { fade, slide, scale, attention, rotate };

  for (const [name, preset] of Object.entries(presets)) {
    assert.equal(preset.name, name);
    assert.ok(preset.keyframes && typeof preset.keyframes === 'object');
    assert.ok(preset.animations && typeof preset.animations === 'object');

    for (const [animName, animValue] of Object.entries(preset.animations)) {
      assert.match(animValue, /var\(--tmk-duration,/);
      assert.match(animValue, /var\(--tmk-easing,/);
      assert.ok(preset.keyframes[animName], `${name} preset missing keyframe for ${animName}`);
    }
  }
});

test('motionKit() exposes all required presets', () => {
  const plugin = motionKit();
  const presetNames = Object.keys(plugin.presets);
  assert.deepEqual(presetNames.sort(), requiredPresetNames.slice().sort());
});

test('motionKit() config contains keyframes/animation entries for core 12 animations', () => {
  const plugin = motionKit();
  const keyframes = plugin.config?.theme?.extend?.keyframes;
  const animations = plugin.config?.theme?.extend?.animation;

  assert.ok(keyframes, 'missing keyframes config');
  assert.ok(animations, 'missing animation config');

  for (const key of requiredAnimationKeys) {
    assert.ok(keyframes[key], `missing keyframe: ${key}`);
    assert.ok(animations[key], `missing animation utility: ${key}`);
  }
});

test('motionKit() handler adds timing utility classes', () => {
  const plugin = motionKit();
  let captured = null;

  plugin.handler({
    addUtilities(utils) {
      captured = utils;
    },
  });

  assert.ok(captured, 'handler did not call addUtilities');

  const expectedUtilities = [
    '.animate-duration-150',
    '.animate-duration-300',
    '.animate-duration-500',
    '.animate-duration-700',
    '.animate-duration-1000',
    '.animate-delay-75',
    '.animate-delay-150',
    '.animate-delay-300',
    '.animate-delay-500',
    '.animate-ease-linear',
    '.animate-ease-in',
    '.animate-ease-out',
    '.animate-ease-in-out',
  ];

  for (const cls of expectedUtilities) {
    assert.ok(captured[cls], `missing utility class: ${cls}`);
  }

  assert.equal(captured['.animate-duration-500']['--tmk-duration'], '500ms');
  assert.equal(captured['.animate-delay-300']['animation-delay'], '300ms');
  assert.equal(captured['.animate-ease-linear']['--tmk-easing'], 'linear');
});

test('plugin keeps options payload for future extension', () => {
  const plugin = motionKit({ prefix: 'tmk' });
  assert.deepEqual(plugin.options, { prefix: 'tmk' });
});
