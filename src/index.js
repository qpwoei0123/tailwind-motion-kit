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
    handler() {
      // no-op: config-only plugin
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
