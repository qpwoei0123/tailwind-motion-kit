'use strict';

module.exports = {
  name: 'scale',
  keyframes: {
    'scale-in': {
      from: { opacity: '0', transform: 'scale(.96)' },
      to: { opacity: '1', transform: 'scale(1)' },
    },
    'scale-out': {
      from: { opacity: '1', transform: 'scale(1)' },
      to: { opacity: '0', transform: 'scale(.96)' },
    },
  },
  animations: {
    'scale-in': 'scale-in var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'scale-out': 'scale-out var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
  },
};
