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
    'slide-in-bottom': {
      from: { opacity: '0', transform: 'translateY(16px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
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
    'slide-out-bottom': {
      from: { opacity: '1', transform: 'translateY(0)' },
      to: { opacity: '0', transform: 'translateY(16px)' },
    },
    'accordion-down': {
      from: { height: '0', opacity: '0' },
      to: { height: 'var(--tmk-accordion-content-height, 16rem)', opacity: '1' },
    },
    'accordion-up': {
      from: { height: 'var(--tmk-accordion-content-height, 16rem)', opacity: '1' },
      to: { height: '0', opacity: '0' },
    },
  },
  animations: {
    'slide-in-up': 'slide-in-up var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-in-left': 'slide-in-left var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-in-right': 'slide-in-right var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-in-bottom': 'slide-in-bottom var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-down': 'slide-out-down var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-up': 'slide-out-up var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-left': 'slide-out-left var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-right': 'slide-out-right var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'slide-out-bottom': 'slide-out-bottom var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'accordion-down': 'accordion-down var(--tmk-duration,260ms) var(--tmk-easing,ease-out) both',
    'accordion-up': 'accordion-up var(--tmk-duration,240ms) var(--tmk-easing,ease-in) both',
  },
};
