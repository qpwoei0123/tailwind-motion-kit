'use strict';

const fade = require('./presets/fade');
const slide = require('./presets/slide');
const scale = require('./presets/scale');
const attention = require('./presets/attention');
const rotate = require('./presets/rotate');

function normalizeScale(scale, fallback) {
  if (!Array.isArray(scale) || scale.length === 0) return fallback;
  return scale;
}

function toMs(value) {
  return typeof value === 'number' ? `${value}ms` : String(value);
}

module.exports = function motionKit(options = {}) {
  const presets = { fade, slide, scale, attention, rotate };

  const keyframes = Object.values(presets).reduce((acc, preset) => {
    return { ...acc, ...preset.keyframes };
  }, {});

  const animation = Object.values(presets).reduce((acc, preset) => {
    return { ...acc, ...preset.animations };
  }, {});

  const durationScale = normalizeScale(options.durationScale, [150, 300, 500, 700, 1000]);
  const delayScale = normalizeScale(options.delayScale, [75, 150, 300, 500]);

  const durationUtilities = Object.fromEntries(
    durationScale.map((value) => [`.animate-duration-${value}`, { '--tmk-duration': toMs(value) }])
  );

  const delayUtilities = Object.fromEntries(
    delayScale.map((value) => [`.animate-delay-${value}`, { 'animation-delay': toMs(value) }])
  );

  return {
    options,
    presets,
    handler({ addUtilities }) {
      addUtilities({
        ...durationUtilities,
        ...delayUtilities,

        '.animate-ease-linear': { '--tmk-easing': 'linear' },
        '.animate-ease-in': { '--tmk-easing': 'cubic-bezier(0.4, 0, 1, 1)' },
        '.animate-ease-out': { '--tmk-easing': 'cubic-bezier(0, 0, 0.2, 1)' },
        '.animate-ease-in-out': { '--tmk-easing': 'cubic-bezier(0.4, 0, 0.2, 1)' },

        '.animate-repeat-1': { 'animation-iteration-count': '1' },
        '.animate-repeat-2': { 'animation-iteration-count': '2' },
        '.animate-repeat-3': { 'animation-iteration-count': '3' },
        '.animate-repeat-infinite': { 'animation-iteration-count': 'infinite' },

        '.animate-direction-normal': { 'animation-direction': 'normal' },
        '.animate-direction-reverse': { 'animation-direction': 'reverse' },
        '.animate-direction-alternate': { 'animation-direction': 'alternate' },

        '.animate-fill-none': { 'animation-fill-mode': 'none' },
        '.animate-fill-forwards': { 'animation-fill-mode': 'forwards' },
        '.animate-fill-backwards': { 'animation-fill-mode': 'backwards' },
        '.animate-fill-both': { 'animation-fill-mode': 'both' },
      });
    },
    config: {
      theme: {
        extend: {
          keyframes,
          animation,
        },
      },
    },
  };
};
