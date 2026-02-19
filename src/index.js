'use strict';

const fade = require('./presets/fade');
const slide = require('./presets/slide');
const scale = require('./presets/scale');
const attention = require('./presets/attention');
const rotate = require('./presets/rotate');

module.exports = function motionKit(options = {}) {
  const presets = { fade, slide, scale, attention, rotate };

  const keyframes = Object.values(presets).reduce((acc, preset) => {
    return { ...acc, ...preset.keyframes };
  }, {});

  const animation = Object.values(presets).reduce((acc, preset) => {
    return { ...acc, ...preset.animations };
  }, {});

  return {
    options,
    presets,
    handler({ addUtilities }) {
      addUtilities({
        '.animate-duration-150': { '--tmk-duration': '150ms' },
        '.animate-duration-300': { '--tmk-duration': '300ms' },
        '.animate-duration-500': { '--tmk-duration': '500ms' },
        '.animate-duration-700': { '--tmk-duration': '700ms' },
        '.animate-duration-1000': { '--tmk-duration': '1000ms' },

        '.animate-delay-75': { 'animation-delay': '75ms' },
        '.animate-delay-150': { 'animation-delay': '150ms' },
        '.animate-delay-300': { 'animation-delay': '300ms' },
        '.animate-delay-500': { 'animation-delay': '500ms' },

        '.animate-ease-linear': { '--tmk-easing': 'linear' },
        '.animate-ease-in': { '--tmk-easing': 'cubic-bezier(0.4, 0, 1, 1)' },
        '.animate-ease-out': { '--tmk-easing': 'cubic-bezier(0, 0, 0.2, 1)' },
        '.animate-ease-in-out': { '--tmk-easing': 'cubic-bezier(0.4, 0, 0.2, 1)' },
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
