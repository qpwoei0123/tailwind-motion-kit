'use strict';

module.exports = {
  name: 'slide',
  keyframes: {
    'slide-in-up': {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    'slide-in-left': {
      from: { opacity: '0', transform: 'translateX(-8px)' },
      to: { opacity: '1', transform: 'translateX(0)' },
    },
    'slide-in-right': {
      from: { opacity: '0', transform: 'translateX(8px)' },
      to: { opacity: '1', transform: 'translateX(0)' },
    },
    'slide-out-down': {
      from: { opacity: '1', transform: 'translateY(0)' },
      to: { opacity: '0', transform: 'translateY(8px)' },
    },
    'slide-out-up': {
      from: { opacity: '1', transform: 'translateY(0)' },
      to: { opacity: '0', transform: 'translateY(-8px)' },
    },
    'slide-out-left': {
      from: { opacity: '1', transform: 'translateX(0)' },
      to: { opacity: '0', transform: 'translateX(-8px)' },
    },
    'slide-out-right': {
      from: { opacity: '1', transform: 'translateX(0)' },
      to: { opacity: '0', transform: 'translateX(8px)' },
    },
  },
  animations: {
    'slide-in-up': 'slide-in-up var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-in-left': 'slide-in-left var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-in-right': 'slide-in-right var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-down': 'slide-out-down var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-up': 'slide-out-up var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-left': 'slide-out-left var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-right': 'slide-out-right var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
  },
};
