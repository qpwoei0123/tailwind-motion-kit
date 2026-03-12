'use strict';

const DEFAULT_DURATION_SCALE = [150, 300, 500, 700, 1000];
const DEFAULT_DELAY_SCALE = [0, 75, 150, 300, 500];
const DEFAULT_EASING_VALUES = ['linear', 'in', 'out', 'in-out'];
const DEFAULT_REPEAT_VALUES = ['1', '2', '3', 'infinite'];
const DEFAULT_DIRECTION_VALUES = ['normal', 'reverse', 'alternate'];
const DEFAULT_FILL_VALUES = ['none', 'forwards', 'backwards', 'both'];

function toTokenClass(group, value) {
  const normalized = String(value);

  switch (group) {
    case 'duration':
      return `animate-duration-${normalized}`;
    case 'delay':
      return `animate-delay-${normalized}`;
    case 'easing':
      return `animate-ease-${normalized}`;
    case 'repeat':
      return `animate-repeat-${normalized}`;
    case 'direction':
      return `animate-direction-${normalized}`;
    case 'fill':
      return `animate-fill-${normalized}`;
    default:
      throw new Error(`Unknown token group: ${group}`);
  }
}

function getTokenGroups({ durationScale = DEFAULT_DURATION_SCALE, delayScale = DEFAULT_DELAY_SCALE } = {}) {
  return {
    duration: durationScale.map((value) => toTokenClass('duration', value)),
    delay: delayScale.map((value) => toTokenClass('delay', value)),
    easing: DEFAULT_EASING_VALUES.map((value) => toTokenClass('easing', value)),
    repeat: DEFAULT_REPEAT_VALUES.map((value) => toTokenClass('repeat', value)),
    direction: DEFAULT_DIRECTION_VALUES.map((value) => toTokenClass('direction', value)),
    fill: DEFAULT_FILL_VALUES.map((value) => toTokenClass('fill', value)),
  };
}

module.exports = {
  DEFAULT_DURATION_SCALE,
  DEFAULT_DELAY_SCALE,
  DEFAULT_EASING_VALUES,
  DEFAULT_REPEAT_VALUES,
  DEFAULT_DIRECTION_VALUES,
  DEFAULT_FILL_VALUES,
  toTokenClass,
  getTokenGroups,
};
