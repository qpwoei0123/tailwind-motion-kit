'use strict';

const fade = require('./presets/fade');
const slide = require('./presets/slide');
const scale = require('./presets/scale');

module.exports = function motionKit(options = {}) {
  return {
    options,
    presets: {
      fade,
      slide,
      scale,
    },
  };
};
