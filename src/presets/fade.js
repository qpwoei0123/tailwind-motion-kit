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
    'fade-up': {
      from: { opacity: '0', transform: 'translateY(6px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-down': {
      from: { opacity: '0', transform: 'translateY(-6px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-blur-in': {
      from: { opacity: '0', filter: 'blur(8px)', transform: 'translateY(4px)' },
      to: { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
    },
    'fade-blur-out': {
      from: { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
      to: { opacity: '0', filter: 'blur(8px)', transform: 'translateY(4px)' },
    },
  },
  animations: {
    'fade-in': 'fade-in var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'fade-out': 'fade-out var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'fade-up': 'fade-up var(--tmk-duration,300ms) var(--tmk-easing,ease-out) both',
    'fade-down': 'fade-down var(--tmk-duration,300ms) var(--tmk-easing,ease-out) both',
    'fade-blur-in': 'fade-blur-in var(--tmk-duration,320ms) var(--tmk-easing,ease-out) both',
    'fade-blur-out': 'fade-blur-out var(--tmk-duration,260ms) var(--tmk-easing,ease-in) both',
  },
};
