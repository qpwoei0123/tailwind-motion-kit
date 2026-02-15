'use strict';

module.exports = function resolveOptions(options = {}) {
  return {
    duration: options.duration || '300ms',
    easing: options.easing || 'ease',
  };
};
