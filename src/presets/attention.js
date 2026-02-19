'use strict';

module.exports = {
  name: 'attention',
  keyframes: {
    'bounce-in': {
      '0%': { opacity: '0', transform: 'scale(0.92)' },
      '60%': { opacity: '1', transform: 'scale(1.04)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    wobble: {
      '0%, 100%': { transform: 'translateX(0)' },
      '25%': { transform: 'translateX(-4px) rotate(-1deg)' },
      '75%': { transform: 'translateX(4px) rotate(1deg)' },
    },
    jelly: {
      '0%': { transform: 'scale(1, 1)' },
      '30%': { transform: 'scale(1.08, 0.92)' },
      '50%': { transform: 'scale(0.92, 1.08)' },
      '70%': { transform: 'scale(1.04, 0.96)' },
      '100%': { transform: 'scale(1, 1)' },
    },
  },
  animations: {
    'bounce-in': 'bounce-in var(--tmk-duration,600ms) var(--tmk-easing,ease-out) both',
    wobble: 'wobble var(--tmk-duration,700ms) var(--tmk-easing,ease-in-out) both',
    jelly: 'jelly var(--tmk-duration,700ms) var(--tmk-easing,ease-out) both',
  },
};
