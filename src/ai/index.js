'use strict';

const { buildAiIndex, buildPairWith, parseAnimationDefaults } = require('./build-index');

const aiIndex = buildAiIndex();

module.exports = {
  aiIndex,
  buildAiIndex,
  buildPairWith,
  parseAnimationDefaults,
};
