'use strict';

const fade = require('../src/presets/fade');
const slide = require('../src/presets/slide');
const scale = require('../src/presets/scale');

console.log({
  fade: Object.keys(fade.keyframes),
  slide: Object.keys(slide.keyframes),
  scale: Object.keys(scale.keyframes),
});
