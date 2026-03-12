'use strict';

const aiIndex = require('../../ai/index.json');
const aiSchema = require('../../ai/schema.json');

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value == null || value === '') return [];
  return [value];
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function includesText(haystack, needle) {
  return normalizeText(haystack).includes(normalizeText(needle));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function scoreAnimation(animation, input) {
  let score = 0;
  const intents = toArray(input.intent);
  const context = normalizeText(input.context);

  for (const intent of intents) {
    if (animation.intent.some((item) => includesText(item, intent))) score += 4;
    if (animation.use_when.some((item) => includesText(item, intent))) score += 2;
  }

  if (context) {
    if (animation.use_when.some((item) => includesText(item, context) || includesText(context, item))) score += 3;
    if (animation.avoid_when.some((item) => includesText(item, context) || includesText(context, item))) score -= 5;
    if (includesText(animation.name, context)) score += 1;
  }

  return score;
}

function withAvailableActions(result, actions) {
  return {
    ok: true,
    ...result,
    available_actions: Object.keys(actions),
  };
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validatePrimitive(schema, value, path) {
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const actualType = typeOf(value);
  const matchesInteger = types.includes('integer') && actualType === 'number' && Number.isInteger(value);

  if (!types.includes(actualType) && !matchesInteger) {
    throw new Error(`Invalid input at ${path}: expected ${types.join(' | ')}, received ${actualType}`);
  }

  if (types.includes('integer')) {
    if (!Number.isInteger(value)) {
      throw new Error(`Invalid input at ${path}: expected integer, received ${typeOf(value)}`);
    }
    if (schema.minimum != null && value < schema.minimum) {
      throw new Error(`Invalid input at ${path}: expected integer >= ${schema.minimum}, received ${value}`);
    }
  }
}

function validateArray(schema, value, path) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid input at ${path}: expected array, received ${typeOf(value)}`);
  }

  if (schema.items) {
    value.forEach((item, index) => validateAgainstSchema(schema.items, item, `${path}[${index}]`));
  }
}

function validateObject(schema, value, path) {
  if (typeOf(value) !== 'object') {
    throw new Error(`Invalid input at ${path}: expected object, received ${typeOf(value)}`);
  }

  const properties = schema.properties || {};
  const required = schema.required || [];

  for (const key of required) {
    if (!(key in value)) {
      throw new Error(`Invalid input at ${path}: missing required property \`${key}\``);
    }
  }

  if (schema.additionalProperties === false) {
    for (const key of Object.keys(value)) {
      if (!(key in properties)) {
        throw new Error(`Invalid input at ${path}: unknown property \`${key}\``);
      }
    }
  }

  for (const [key, propertySchema] of Object.entries(properties)) {
    if (key in value) validateAgainstSchema(propertySchema, value[key], `${path}.${key}`);
  }
}

function validateAgainstSchema(schema, value, path = 'input') {
  if (schema.oneOf) {
    const errors = [];
    for (const candidate of schema.oneOf) {
      try {
        validateAgainstSchema(candidate, value, path);
        return;
      } catch (error) {
        errors.push(error.message);
      }
    }
    throw new Error(errors[0] || `Invalid input at ${path}`);
  }

  if (schema.type === 'object') return validateObject(schema, value, path);
  if (schema.type === 'array') return validateArray(schema, value, path);
  return validatePrimitive(schema, value, path);
}

function validateInput(schema, input) {
  validateAgainstSchema(
    {
      type: 'object',
      required: schema.required || [],
      properties: schema.properties || {},
      additionalProperties: schema.additionalProperties,
    },
    input,
    'input'
  );
}

function findAnimation(query) {
  const normalized = normalizeText(query);
  if (!normalized) return null;

  return (
    aiIndex.animations.find((animation) => normalizeText(animation.name) === normalized) ||
    aiIndex.animations.find((animation) => normalizeText(animation.class) === normalized) ||
    null
  );
}

function recommendAnimation(input = {}) {
  const excluded = new Set(toArray(input.exclude).map(normalizeText));
  const ranked = aiIndex.animations
    .filter((animation) => !excluded.has(normalizeText(animation.name)) && !excluded.has(normalizeText(animation.class)))
    .map((animation) => ({
      animation,
      score: scoreAnimation(animation, input),
    }))
    .sort((a, b) => b.score - a.score || a.animation.name.localeCompare(b.animation.name));

  const top = ranked[0];
  const recommendation = top && top.score > 0 ? top.animation : null;
  const reasons = recommendation
    ? {
        matched_intent: toArray(input.intent),
        matched_context: input.context || null,
        suggested_pair_with: recommendation.pair_with,
        reduced_motion: recommendation.a11y?.reduced_motion || null,
        score: top.score,
      }
    : {
        matched_intent: toArray(input.intent),
        matched_context: input.context || null,
        score: top ? top.score : null,
        no_match: true,
      };

  return {
    recommendation,
    reasons,
    alternatives: ranked
      .filter((item) => !recommendation || item.animation.name !== recommendation.name)
      .slice(0, 3)
      .map((item) => ({
        name: item.animation.name,
        class: item.animation.class,
        score: item.score,
      })),
  };
}

function getTokenGroupMap() {
  return {
    duration: new Set(aiIndex.tokens.duration),
    delay: new Set(aiIndex.tokens.delay),
    easing: new Set(aiIndex.tokens.easing),
    direction: new Set(aiIndex.tokens.direction),
    fill: new Set(aiIndex.tokens.fill),
  };
}

function resolveToken(group, value) {
  if (value == null || value === '') return null;

  const normalized = normalizeText(value);
  const groupMap = getTokenGroupMap();
  const candidates = groupMap[group];
  if (!candidates) throw new Error(`Unknown token group: ${group}`);

  const prefixMap = {
    duration: 'animate-duration-',
    delay: 'animate-delay-',
    easing: 'animate-ease-',
    direction: 'animate-direction-',
    fill: 'animate-fill-',
  };

  const directClass = normalized.startsWith('animate-') ? normalized : `${prefixMap[group]}${normalized}`;
  if (!candidates.has(directClass)) {
    const allowed = [...candidates].join(', ');
    throw new Error(`Invalid ${group} token: ${value}. Allowed: ${allowed}`);
  }

  return directClass;
}

function resolveRepeatToken(value) {
  if (value == null || value === '') return null;
  const normalized = normalizeText(value);
  const directClass = normalized.startsWith('animate-repeat-') ? normalized : `animate-repeat-${normalized}`;
  const allowed = ['animate-repeat-1', 'animate-repeat-2', 'animate-repeat-3', 'animate-repeat-infinite'];

  if (!allowed.includes(directClass)) {
    throw new Error(`Invalid repeat token: ${value}. Allowed: ${allowed.join(', ')}`);
  }

  return directClass;
}

function resolveMotionPlan(input = {}) {
  const animation = input.animation ? findAnimation(input.animation) : null;
  const recommendationResult = animation ? null : recommendAnimation(input);
  const chosenAnimation = animation || recommendationResult?.recommendation;

  if (!chosenAnimation) {
    throw new Error('Could not resolve an animation. Provide animation, intent, or context that matches the catalog.');
  }

  const pairWith = new Set(chosenAnimation.pair_with || []);
  const overrides = {
    duration: resolveToken('duration', input.duration),
    delay: resolveToken('delay', input.delay),
    easing: resolveToken('easing', input.easing),
    direction: resolveToken('direction', input.direction),
    fill: resolveToken('fill', input.fill),
    repeat: resolveRepeatToken(input.repeat),
  };

  for (const [group, token] of Object.entries(overrides)) {
    if (!token) continue;
    const groupPrefix = group === 'repeat' ? 'animate-repeat-' : `${group === 'easing' ? 'animate-ease' : `animate-${group}`}-`;
    for (const existing of [...pairWith]) {
      if (existing.startsWith(groupPrefix)) pairWith.delete(existing);
    }
    pairWith.add(token);
  }

  const classes = [chosenAnimation.class, ...unique([...pairWith])];
  if (input.reduced_motion !== false && chosenAnimation.a11y?.reduced_motion) {
    classes.push(chosenAnimation.a11y.reduced_motion);
  }

  return {
    animation: chosenAnimation,
    classes: unique(classes),
    className: unique(classes).join(' '),
  };
}

function parseClassName(className) {
  const tokens = unique(String(className || '').split(/\s+/).filter(Boolean));
  const animation = tokens.map(findAnimation).find(Boolean) || null;
  const resolved = {
    duration: tokens.find((token) => token.startsWith('animate-duration-')) || null,
    delay: tokens.find((token) => token.startsWith('animate-delay-')) || null,
    easing: tokens.find((token) => token.startsWith('animate-ease-')) || null,
    repeat: tokens.find((token) => token.startsWith('animate-repeat-')) || null,
    direction: tokens.find((token) => token.startsWith('animate-direction-')) || null,
    fill: tokens.find((token) => token.startsWith('animate-fill-')) || null,
    reduced_motion: tokens.find((token) => token.includes('motion-reduce:')) || null,
  };

  const known = new Set(Object.values(resolved).filter(Boolean));
  if (animation) known.add(animation.class);

  return {
    animation,
    tokens: resolved,
    unknown: tokens.filter((token) => token.startsWith('animate-') && !known.has(token)),
  };
}

const actionDefinitions = {
  'list-animations': {
    description: 'List bundled animations with optional intent/name filtering.',
    input_schema: {
      type: 'object',
      properties: {
        intent: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },
        name: { type: 'string' },
        limit: { type: 'integer', minimum: 1 },
      },
      additionalProperties: false,
    },
    run(input = {}) {
      validateInput(this.input_schema, input);

      const intents = toArray(input.intent).map(normalizeText);
      const name = normalizeText(input.name);
      const limit = Number.isInteger(input.limit) && input.limit > 0 ? input.limit : aiIndex.animations.length;

      const animations = aiIndex.animations
        .filter((animation) => {
          if (name && !includesText(animation.name, name) && !includesText(animation.class, name)) return false;
          if (!intents.length) return true;
          return intents.some((intent) => animation.intent.some((item) => includesText(item, intent)));
        })
        .slice(0, limit);

      return withAvailableActions(
        {
          action: 'list-animations',
          count: animations.length,
          animations,
        },
        actionDefinitions
      );
    },
  },
  recommend: {
    description: 'Recommend the best-fit animation for an agent request.',
    input_schema: {
      type: 'object',
      properties: {
        intent: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },
        context: { type: 'string' },
        exclude: { type: 'array', items: { type: 'string' } },
        include_tokens: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    run(input = {}) {
      validateInput(this.input_schema, input);

      const result = recommendAnimation(input);
      return withAvailableActions(
        {
          action: 'recommend',
          recommendation: result.recommendation,
          reasons: result.reasons,
          alternatives: result.alternatives,
          tokens: input.include_tokens ? aiIndex.tokens : undefined,
        },
        actionDefinitions
      );
    },
  },
  generate: {
    description: 'Generate a ready-to-use Tailwind motion className.',
    input_schema: {
      type: 'object',
      properties: {
        animation: { type: 'string' },
        intent: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },
        context: { type: 'string' },
        duration: { type: ['string', 'integer'] },
        delay: { type: ['string', 'integer'] },
        easing: { type: 'string' },
        repeat: { type: ['string', 'integer'] },
        direction: { type: 'string' },
        fill: { type: 'string' },
        reduced_motion: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    run(input = {}) {
      validateInput(this.input_schema, input);
      const plan = resolveMotionPlan(input);

      return withAvailableActions(
        {
          action: 'generate',
          animation: plan.animation,
          recommendation: plan.animation,
          className: plan.className,
          classes: plan.classes,
        },
        actionDefinitions
      );
    },
  },
  resolve: {
    description: 'Resolve an existing Tailwind motion className into structured tokens.',
    input_schema: {
      type: 'object',
      required: ['className'],
      properties: {
        className: { type: 'string' },
      },
      additionalProperties: false,
    },
    run(input = {}) {
      validateInput(this.input_schema, input);
      const resolved = parseClassName(input.className);

      return withAvailableActions(
        {
          action: 'resolve',
          className: input.className,
          animation: resolved.animation,
          tokens: resolved.tokens,
          unknown: resolved.unknown,
          unknown_tokens: resolved.unknown,
        },
        actionDefinitions
      );
    },
  },
};

function getAction(name) {
  return actionDefinitions[name] || null;
}

function listActions() {
  return Object.entries(actionDefinitions).map(([name, definition]) => ({
    name,
    description: definition.description,
    input_schema: definition.input_schema,
  }));
}

function getManifest() {
  return {
    cli_version: 1,
    package: aiIndex.library.name,
    package_version: aiIndex.library.version,
    commands: ['manifest', 'schema', 'action', 'generate', 'resolve'],
    actions: listActions().map(({ name, description }) => ({ name, description })),
    library_manifest: aiIndex,
  };
}

function getSchema(name) {
  if (!name) {
    return {
      manifest: aiSchema,
      action_envelope: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string' },
          input: { type: 'object' },
        },
        additionalProperties: false,
      },
      actions: listActions(),
    };
  }

  const action = getAction(name);
  if (!action) return null;

  return {
    name,
    description: action.description,
    input_schema: action.input_schema,
  };
}

module.exports = {
  getAction,
  getManifest,
  getSchema,
  listActions,
  recommendAnimation,
  resolveMotionPlan,
  parseClassName,
};
