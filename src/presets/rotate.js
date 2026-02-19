'use strict';

module.exports = {
  name: 'rotate',
  keyframes: {
    'rotate-in': {
      from: { opacity: '0', transform: 'rotate(-12deg) scale(0.96)' },
      to: { opacity: '1', transform: 'rotate(0deg) scale(1)' },
    },
  },
  animations: {
    'rotate-in': 'rotate-in var(--tmk-duration,500ms) var(--tmk-easing,ease-out) both',
  },
};
