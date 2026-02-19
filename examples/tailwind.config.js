const motionKit = require('../src');

module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {},
  },
  plugins: [motionKit()],
};
