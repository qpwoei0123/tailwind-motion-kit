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
    'blur-in': {
      from: { filter: 'blur(10px)', opacity: '0.82' },
      to: { filter: 'blur(0)', opacity: '1' },
    },
    'blur-out': {
      from: { filter: 'blur(0)', opacity: '1' },
      to: { filter: 'blur(10px)', opacity: '0.8' },
    },
    'focus-in': {
      from: { opacity: '0', filter: 'blur(10px) contrast(0.86) saturate(0.8)' },
      to: { opacity: '1', filter: 'blur(0) contrast(1) saturate(1)' },
    },
    'focus-out': {
      from: { opacity: '1', filter: 'blur(0) contrast(1) saturate(1)' },
      to: { opacity: '0', filter: 'blur(8px) contrast(0.9) saturate(0.78)' },
    },
    'glow-in': {
      from: { opacity: '0', filter: 'brightness(0.86) drop-shadow(0 0 0 rgba(34,211,238,0))' },
      to: { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 16px rgba(34,211,238,0.32))' },
    },
  },
  animations: {
    'fade-in': 'fade-in var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'fade-out': 'fade-out var(--tmk-duration,300ms) var(--tmk-easing,ease) both',
    'fade-up': 'fade-up var(--tmk-duration,300ms) var(--tmk-easing,ease-out) both',
    'fade-down': 'fade-down var(--tmk-duration,300ms) var(--tmk-easing,ease-out) both',
    'fade-blur-in': 'fade-blur-in var(--tmk-duration,320ms) var(--tmk-easing,ease-out) both',
    'fade-blur-out': 'fade-blur-out var(--tmk-duration,260ms) var(--tmk-easing,ease-in) both',
    'blur-in': 'blur-in var(--tmk-duration,260ms) var(--tmk-easing,ease-out) both',
    'blur-out': 'blur-out var(--tmk-duration,220ms) var(--tmk-easing,ease-in) both',
    'focus-in': 'focus-in var(--tmk-duration,360ms) var(--tmk-easing,ease-out) both',
    'focus-out': 'focus-out var(--tmk-duration,280ms) var(--tmk-easing,ease-in) both',
    'glow-in': 'glow-in var(--tmk-duration,420ms) var(--tmk-easing,ease-out) both',
  },
};
