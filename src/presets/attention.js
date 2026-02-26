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
    'soft-pulse': {
      '0%, 100%': { transform: 'scale(1)', opacity: '1' },
      '50%': { transform: 'scale(1.03)', opacity: '0.86' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-8px)' },
    },
    'shake-x': {
      '0%, 100%': { transform: 'translateX(0)' },
      '20%': { transform: 'translateX(-6px)' },
      '40%': { transform: 'translateX(6px)' },
      '60%': { transform: 'translateX(-4px)' },
      '80%': { transform: 'translateX(4px)' },
    },
  },
  animations: {
    'bounce-in': 'bounce-in var(--tmk-duration,600ms) var(--tmk-easing,ease-out) both',
    wobble: 'wobble var(--tmk-duration,700ms) var(--tmk-easing,ease-in-out) both',
    jelly: 'jelly var(--tmk-duration,700ms) var(--tmk-easing,ease-out) both',
    'soft-pulse': 'soft-pulse var(--tmk-duration,1200ms) var(--tmk-easing,ease-in-out) infinite',
    float: 'float var(--tmk-duration,1800ms) var(--tmk-easing,ease-in-out) infinite',
    'shake-x': 'shake-x var(--tmk-duration,420ms) var(--tmk-easing,ease-in-out) both',
  },
};
