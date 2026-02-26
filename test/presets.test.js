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
  'fade-up',
  'fade-down',
  'slide-in-up',
  'slide-in-left',
  'slide-in-right',
  'slide-out-down',
  'slide-out-up',
  'slide-out-left',
  'slide-out-right',
  'scale-in',
  'scale-out',
  'zoom-in',
  'zoom-out',
  'bounce-in',
  'wobble',
  'jelly',
  'soft-pulse',
  'float',
  'rotate-in',
  'slide-in-bottom',
  'slide-out-bottom',
  'fade-blur-in',
  'fade-blur-out',
  'blur-in',
  'blur-out',
  'focus-in',
  'focus-out',
  'glow-in',
  'shake-x',
  'accordion-down',
  'accordion-up',
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

test('motionKit() config contains keyframes/animation entries for bundled animations', () => {
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
    '.animate-repeat-1',
    '.animate-repeat-2',
    '.animate-repeat-3',
    '.animate-repeat-infinite',
    '.animate-direction-normal',
    '.animate-direction-reverse',
    '.animate-direction-alternate',
    '.animate-fill-none',
    '.animate-fill-forwards',
    '.animate-fill-backwards',
    '.animate-fill-both',
  ];

  for (const cls of expectedUtilities) {
    assert.ok(captured[cls], `missing utility class: ${cls}`);
  }

  assert.equal(captured['.animate-duration-500']['--tmk-duration'], '500ms');
  assert.equal(captured['.animate-delay-300']['animation-delay'], '300ms');
  assert.equal(captured['.animate-ease-linear']['--tmk-easing'], 'linear');
  assert.equal(captured['.animate-repeat-3']['animation-iteration-count'], '3');
  assert.equal(captured['.animate-direction-alternate']['animation-direction'], 'alternate');
  assert.equal(captured['.animate-fill-forwards']['animation-fill-mode'], 'forwards');
});

test('plugin keeps options payload for future extension', () => {
  const plugin = motionKit({ prefix: 'tmk' });
  assert.deepEqual(plugin.options, { prefix: 'tmk' });
});

test('plugin supports custom duration/delay scales', () => {
  const plugin = motionKit({ durationScale: [120, 240], delayScale: [50, 100] });
  let captured = null;

  plugin.handler({
    addUtilities(utils) {
      captured = utils;
    },
  });

  assert.ok(captured['.animate-duration-120']);
  assert.ok(captured['.animate-duration-240']);
  assert.ok(captured['.animate-delay-50']);
  assert.ok(captured['.animate-delay-100']);

  assert.equal(captured['.animate-duration-120']['--tmk-duration'], '120ms');
  assert.equal(captured['.animate-delay-50']['animation-delay'], '50ms');
});
