'use strict';

module.exports = {
  name: 'fade',
  keyframes: {
    'fade-in': {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    'fade-out': {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
  },
  animations: {
    'fade-in': 'fade-in var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'fade-out': 'fade-out var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
  },
};
