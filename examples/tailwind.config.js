const motionKit = require('../src');

const tmk = motionKit();

module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      keyframes: {
        ...tmk.presets.fade.keyframes,
        ...tmk.presets.slide.keyframes,
        ...tmk.presets.scale.keyframes,
      },
      animation: {
        ...tmk.presets.fade.animations,
        ...tmk.presets.slide.animations,
        ...tmk.presets.scale.animations,
      },
    },
  },
  plugins: [],
};
