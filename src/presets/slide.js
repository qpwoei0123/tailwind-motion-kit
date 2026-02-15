'use strict';

module.exports = {
  name: 'slide',
  keyframes: {
    'slide-in-up': {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    'slide-out-down': {
      from: { opacity: '1', transform: 'translateY(0)' },
      to: { opacity: '0', transform: 'translateY(8px)' },
    },
  },
  animations: {
    'slide-in-up': 'slide-in-up var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-down': 'slide-out-down var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
  },
};
