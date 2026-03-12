'use strict';

const pkg = require('../../package.json');
const fade = require('../presets/fade');
const slide = require('../presets/slide');
const scale = require('../presets/scale');
const attention = require('../presets/attention');
const rotate = require('../presets/rotate');
const metadata = require('./metadata');
const { getTokenGroups, toTokenClass } = require('../tokens');

const presetModules = [fade, slide, scale, attention, rotate];
const easingTokenMap = {
  linear: 'linear',
  'ease-in': 'in',
  'ease-out': 'out',
  'ease-in-out': 'in-out',
};

function parseAnimationDefaults(animationValue) {
  const parts = String(animationValue).trim().split(/\s+/);
  const durationMatch = String(animationValue).match(/var\(--tmk-duration,(\d+)ms\)/);
  const easingMatch = String(animationValue).match(/var\(--tmk-easing,([^\)]+)\)/);

  return {
    duration: durationMatch ? Number(durationMatch[1]) : null,
    easing: easingMatch ? easingMatch[1].trim() : null,
    tail: parts.slice(3),
  };
}

function buildPairWith(animationValue, tokenGroups) {
  const defaults = parseAnimationDefaults(animationValue);
  const pairWith = [];

  if (defaults.duration != null) {
    const durationClass = toTokenClass('duration', defaults.duration);
    if (tokenGroups.duration.includes(durationClass)) pairWith.push(durationClass);
  }

  if (defaults.easing && easingTokenMap[defaults.easing]) {
    const easingClass = toTokenClass('easing', easingTokenMap[defaults.easing]);
    if (tokenGroups.easing.includes(easingClass)) pairWith.push(easingClass);
  }

  for (const value of defaults.tail) {
    if (['none', 'forwards', 'backwards', 'both'].includes(value)) {
      const fillClass = toTokenClass('fill', value);
      if (tokenGroups.fill.includes(fillClass)) pairWith.push(fillClass);
      continue;
    }

    if (['1', '2', '3', 'infinite'].includes(value)) {
      const repeatClass = toTokenClass('repeat', value);
      if (tokenGroups.repeat.includes(repeatClass)) pairWith.push(repeatClass);
    }
  }

  return pairWith;
}

function buildAnimations(tokenGroups) {
  const animations = [];
  const seen = new Set();

  for (const preset of presetModules) {
    for (const [name, animationValue] of Object.entries(preset.animations)) {
      const meta = metadata[name];
      if (!meta) {
        throw new Error(`Missing AI metadata for animation: ${name}`);
      }

      seen.add(name);
      animations.push({
        name,
        class: `animate-${name}`,
        intent: meta.intent,
        use_when: meta.use_when,
        avoid_when: meta.avoid_when,
        pair_with: buildPairWith(animationValue, tokenGroups),
        a11y: {
          reduced_motion: meta.reduced_motion || 'motion-reduce:animate-none',
        },
      });
    }
  }

  const orphanedMetadata = Object.keys(metadata).filter((name) => !seen.has(name));
  if (orphanedMetadata.length > 0) {
    throw new Error(`AI metadata has no matching preset animation: ${orphanedMetadata.join(', ')}`);
  }

  return animations;
}

function buildAiIndex() {
  const tokenGroups = getTokenGroups();

  return {
    spec_version: '0.1.0',
    library: {
      name: pkg.name,
      version: pkg.version,
      base_class_prefix: 'animate-',
    },
    tokens: tokenGroups,
    animations: buildAnimations(tokenGroups),
  };
}

module.exports = {
  buildAiIndex,
  buildPairWith,
  parseAnimationDefaults,
};
