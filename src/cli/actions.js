'use strict';

const { isDeepStrictEqual } = require('node:util');
const { aiIndex } = require('../ai');
const aiSchema = require('../../ai/schema.json');

const CLI_VERSION = 1;
const CONTRACTS_SCHEMA_PATH = './ai/contracts.json';
const CONTRACTS_SCHEMA_ID = 'https://tailwind-motion-kit.dev/ai/contracts.json';
const COMMAND_NAMES = ['manifest', 'schema', 'action', 'generate', 'resolve'];
const REPEAT_TOKENS = aiIndex.tokens.repeat || [
  'animate-repeat-1',
  'animate-repeat-2',
  'animate-repeat-3',
  'animate-repeat-infinite',
];
const REDUCED_MOTION_TOKENS = [...new Set(aiIndex.animations.map((animation) => animation.a11y?.reduced_motion).filter(Boolean))];

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSchemaRef(definitionName) {
  return `${CONTRACTS_SCHEMA_PATH}#/$defs/${definitionName}`;
}

function nullable(schema) {
  return {
    oneOf: [schema, { type: 'null' }],
  };
}

function makeSuccessSchema(required, properties) {
  return {
    type: 'object',
    required: ['ok', ...required],
    properties: {
      ok: { const: true },
      ...properties,
    },
    additionalProperties: false,
  };
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

function withAvailableActions(result) {
  return {
    ok: true,
    ...result,
    available_actions: Object.keys(actionDefinitions),
  };
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validateLiteralConstraints(schema, value, path) {
  if (Object.prototype.hasOwnProperty.call(schema, 'const') && !isDeepStrictEqual(value, schema.const)) {
    throw new Error(`Invalid input at ${path}: expected ${JSON.stringify(schema.const)}, received ${JSON.stringify(value)}`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => isDeepStrictEqual(candidate, value))) {
    throw new Error(`Invalid input at ${path}: expected one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}, received ${JSON.stringify(value)}`);
  }
}

function validatePrimitive(schema, value, path) {
  validateLiteralConstraints(schema, value, path);

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
  validateLiteralConstraints(schema, value, path);

  if (!Array.isArray(value)) {
    throw new Error(`Invalid input at ${path}: expected array, received ${typeOf(value)}`);
  }

  if (schema.items) {
    value.forEach((item, index) => validateAgainstSchema(schema.items, item, `${path}[${index}]`));
  }
}

function validateObject(schema, value, path) {
  validateLiteralConstraints(schema, value, path);

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

  if (schema.anyOf) {
    const errors = [];
    for (const candidate of schema.anyOf) {
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
  if (!schema.type) {
    validateLiteralConstraints(schema, value, path);
    return;
  }
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
    repeat: new Set(REPEAT_TOKENS),
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
    repeat: 'animate-repeat-',
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
    repeat: resolveToken('repeat', input.repeat),
    direction: resolveToken('direction', input.direction),
    fill: resolveToken('fill', input.fill),
  };

  const prefixMap = {
    duration: 'animate-duration-',
    delay: 'animate-delay-',
    easing: 'animate-ease-',
    repeat: 'animate-repeat-',
    direction: 'animate-direction-',
    fill: 'animate-fill-',
  };

  for (const [group, token] of Object.entries(overrides)) {
    if (!token) continue;
    const groupPrefix = prefixMap[group];
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

const animationSchema = {
  type: 'object',
  required: ['name', 'class', 'intent', 'use_when', 'avoid_when', 'pair_with', 'a11y'],
  properties: {
    name: { type: 'string' },
    class: { type: 'string' },
    intent: { type: 'array', items: { type: 'string' } },
    use_when: { type: 'array', items: { type: 'string' } },
    avoid_when: { type: 'array', items: { type: 'string' } },
    pair_with: { type: 'array', items: { type: 'string' } },
    a11y: {
      type: 'object',
      required: ['reduced_motion'],
      properties: {
        reduced_motion: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

const tokensCatalogSchema = {
  type: 'object',
  required: ['duration', 'delay', 'easing', 'repeat', 'direction', 'fill'],
  properties: {
    duration: { type: 'array', items: { type: 'string', enum: aiIndex.tokens.duration } },
    delay: { type: 'array', items: { type: 'string', enum: aiIndex.tokens.delay } },
    easing: { type: 'array', items: { type: 'string', enum: aiIndex.tokens.easing } },
    repeat: { type: 'array', items: { type: 'string', enum: REPEAT_TOKENS } },
    direction: { type: 'array', items: { type: 'string', enum: aiIndex.tokens.direction } },
    fill: { type: 'array', items: { type: 'string', enum: aiIndex.tokens.fill } },
  },
  additionalProperties: false,
};

const resolvedTokensSchema = {
  type: 'object',
  required: ['duration', 'delay', 'easing', 'repeat', 'direction', 'fill', 'reduced_motion'],
  properties: {
    duration: nullable({ type: 'string', enum: aiIndex.tokens.duration }),
    delay: nullable({ type: 'string', enum: aiIndex.tokens.delay }),
    easing: nullable({ type: 'string', enum: aiIndex.tokens.easing }),
    repeat: nullable({ type: 'string', enum: REPEAT_TOKENS }),
    direction: nullable({ type: 'string', enum: aiIndex.tokens.direction }),
    fill: nullable({ type: 'string', enum: aiIndex.tokens.fill }),
    reduced_motion: nullable({ type: 'string', enum: REDUCED_MOTION_TOKENS }),
  },
  additionalProperties: false,
};

const recommendationAlternativeSchema = {
  type: 'object',
  required: ['name', 'class', 'score'],
  properties: {
    name: { type: 'string' },
    class: { type: 'string' },
    score: { type: 'integer' },
  },
  additionalProperties: false,
};

const recommendReasonsMatchSchema = {
  type: 'object',
  required: ['matched_intent', 'matched_context', 'suggested_pair_with', 'reduced_motion', 'score'],
  properties: {
    matched_intent: {
      type: 'array',
      items: { type: 'string' },
    },
    matched_context: nullable({ type: 'string' }),
    suggested_pair_with: {
      type: 'array',
      items: { type: 'string' },
    },
    reduced_motion: nullable({ type: 'string', enum: REDUCED_MOTION_TOKENS }),
    score: { type: 'integer' },
  },
  additionalProperties: false,
};

const recommendReasonsNoMatchSchema = {
  type: 'object',
  required: ['matched_intent', 'matched_context', 'score', 'no_match'],
  properties: {
    matched_intent: {
      type: 'array',
      items: { type: 'string' },
    },
    matched_context: nullable({ type: 'string' }),
    score: nullable({ type: 'integer' }),
    no_match: { const: true },
  },
  additionalProperties: false,
};

const errorResponseSchema = {
  type: 'object',
  required: ['ok', 'error'],
  properties: {
    ok: { const: false },
    error: { type: 'string' },
    command: { type: 'string' },
    action: { type: 'string' },
    target: { type: 'string' },
  },
  additionalProperties: false,
};

const actionEnvelopeSchema = {
  type: 'object',
  required: ['action'],
  properties: {
    action: { type: 'string', enum: ['list-animations', 'recommend', 'generate', 'resolve'] },
    input: { type: 'object' },
  },
  additionalProperties: false,
};

function createActionResponseSchema(actionName, properties, required = []) {
  return makeSuccessSchema(['action', 'available_actions', ...required], {
    action: { const: actionName },
    available_actions: {
      type: 'array',
      items: { type: 'string', enum: actionEnvelopeSchema.properties.action.enum },
    },
    ...properties,
  });
}

const actionDefinitions = {
  'list-animations': {
    description: 'List bundled animations with optional intent/name filtering.',
    schema_defs: {
      input: 'listAnimationsInput',
      output: 'listAnimationsResponse',
    },
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
    output_schema: createActionResponseSchema(
      'list-animations',
      {
        count: { type: 'integer', minimum: 0 },
        animations: { type: 'array', items: animationSchema },
      },
      ['count', 'animations']
    ),
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

      return withAvailableActions({
        action: 'list-animations',
        count: animations.length,
        animations,
      });
    },
  },
  recommend: {
    description: 'Recommend the best-fit animation for an agent request.',
    schema_defs: {
      input: 'recommendInput',
      output: 'recommendResponse',
    },
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
    output_schema: createActionResponseSchema(
      'recommend',
      {
        recommendation: nullable(animationSchema),
        reasons: {
          oneOf: [recommendReasonsMatchSchema, recommendReasonsNoMatchSchema],
        },
        alternatives: { type: 'array', items: recommendationAlternativeSchema },
        tokens: tokensCatalogSchema,
      },
      ['recommendation', 'reasons', 'alternatives']
    ),
    run(input = {}) {
      validateInput(this.input_schema, input);

      const result = recommendAnimation(input);
      return withAvailableActions({
        action: 'recommend',
        recommendation: result.recommendation,
        reasons: result.reasons,
        alternatives: result.alternatives,
        tokens: input.include_tokens ? { ...aiIndex.tokens, repeat: REPEAT_TOKENS } : undefined,
      });
    },
  },
  generate: {
    description: 'Generate a ready-to-use Tailwind motion className.',
    schema_defs: {
      input: 'generateInput',
      output: 'generateResponse',
    },
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
    output_schema: createActionResponseSchema(
      'generate',
      {
        animation: animationSchema,
        recommendation: animationSchema,
        className: { type: 'string' },
        classes: { type: 'array', items: { type: 'string' } },
      },
      ['animation', 'recommendation', 'className', 'classes']
    ),
    run(input = {}) {
      validateInput(this.input_schema, input);
      const plan = resolveMotionPlan(input);

      return withAvailableActions({
        action: 'generate',
        animation: plan.animation,
        recommendation: plan.animation,
        className: plan.className,
        classes: plan.classes,
      });
    },
  },
  resolve: {
    description: 'Resolve an existing Tailwind motion className into structured tokens.',
    schema_defs: {
      input: 'resolveInput',
      output: 'resolveResponse',
    },
    input_schema: {
      type: 'object',
      required: ['className'],
      properties: {
        className: { type: 'string' },
      },
      additionalProperties: false,
    },
    output_schema: createActionResponseSchema(
      'resolve',
      {
        className: { type: 'string' },
        animation: nullable(animationSchema),
        tokens: resolvedTokensSchema,
        unknown: { type: 'array', items: { type: 'string' } },
        unknown_tokens: { type: 'array', items: { type: 'string' } },
      },
      ['className', 'animation', 'tokens', 'unknown', 'unknown_tokens']
    ),
    run(input = {}) {
      validateInput(this.input_schema, input);
      const resolved = parseClassName(input.className);

      return withAvailableActions({
        action: 'resolve',
        className: input.className,
        animation: resolved.animation,
        tokens: resolved.tokens,
        unknown: resolved.unknown,
        unknown_tokens: resolved.unknown,
      });
    },
  },
};

actionEnvelopeSchema.properties.action.enum = Object.keys(actionDefinitions);

const contractFiles = {
  library_manifest: './ai/index.json',
  library_manifest_schema: './ai/schema.json',
  cli_contracts: CONTRACTS_SCHEMA_PATH,
  llms: './llms.txt',
};

function createContractRefDescriptor(inputSchemaRef, outputSchemaRef) {
  return {
    ...(inputSchemaRef ? { input_schema_ref: inputSchemaRef } : {}),
    output_schema_ref: outputSchemaRef,
    error_schema_ref: buildSchemaRef('errorResponse'),
  };
}

function listActionContracts() {
  return Object.entries(actionDefinitions).map(([name, definition]) => ({
    name,
    description: definition.description,
    ...createContractRefDescriptor(buildSchemaRef(definition.schema_defs.input), buildSchemaRef(definition.schema_defs.output)),
  }));
}

function getCommandContracts() {
  return {
    manifest: createContractRefDescriptor(null, buildSchemaRef('manifestResponse')),
    schema: createContractRefDescriptor(null, buildSchemaRef('schemaResponse')),
    action: createContractRefDescriptor(buildSchemaRef('actionEnvelope'), buildSchemaRef('actionResponse')),
    generate: createContractRefDescriptor(buildSchemaRef(actionDefinitions.generate.schema_defs.input), buildSchemaRef(actionDefinitions.generate.schema_defs.output)),
    resolve: createContractRefDescriptor(buildSchemaRef(actionDefinitions.resolve.schema_defs.input), buildSchemaRef(actionDefinitions.resolve.schema_defs.output)),
  };
}

const jsonSchemaObjectSchema = {
  type: 'object',
  additionalProperties: true,
};

const actionDescriptorSchema = {
  type: 'object',
  required: ['name', 'description', 'output_schema_ref', 'error_schema_ref'],
  properties: {
    name: { type: 'string', enum: Object.keys(actionDefinitions) },
    description: { type: 'string' },
    input_schema_ref: { type: 'string' },
    output_schema_ref: { type: 'string' },
    error_schema_ref: { type: 'string' },
  },
  additionalProperties: false,
};

const commandContractSchema = {
  type: 'object',
  required: ['output_schema_ref', 'error_schema_ref'],
  properties: {
    input_schema_ref: { type: 'string' },
    output_schema_ref: { type: 'string' },
    error_schema_ref: { type: 'string' },
  },
  additionalProperties: false,
};

const commandContractsSchema = {
  type: 'object',
  required: COMMAND_NAMES,
  properties: {
    manifest: commandContractSchema,
    schema: commandContractSchema,
    action: commandContractSchema,
    generate: commandContractSchema,
    resolve: commandContractSchema,
  },
  additionalProperties: false,
};

const contractFilesSchema = {
  type: 'object',
  required: ['library_manifest', 'library_manifest_schema', 'cli_contracts', 'llms'],
  properties: {
    library_manifest: { const: contractFiles.library_manifest },
    library_manifest_schema: { const: contractFiles.library_manifest_schema },
    cli_contracts: { const: contractFiles.cli_contracts },
    llms: { const: contractFiles.llms },
  },
  additionalProperties: false,
};

const actionResponseSchema = {
  oneOf: Object.values(actionDefinitions).map((definition) => definition.output_schema),
};

const manifestResponseSchema = makeSuccessSchema(
  ['command', 'cli_version', 'package', 'package_version', 'commands', 'command_contracts', 'actions', 'contract_files', 'library_manifest'],
  {
    command: { const: 'manifest' },
    cli_version: { type: 'integer', const: CLI_VERSION },
    package: { type: 'string' },
    package_version: { type: 'string' },
    commands: { type: 'array', items: { type: 'string', enum: COMMAND_NAMES } },
    command_contracts: commandContractsSchema,
    actions: { type: 'array', items: actionDescriptorSchema },
    contract_files: contractFilesSchema,
    library_manifest: clone(aiSchema),
  }
);

const schemaSummaryResponseSchema = makeSuccessSchema(
  ['command', 'target', 'contract_files', 'command_contracts', 'actions', 'library_manifest_schema', 'cli_contracts'],
  {
    command: { const: 'schema' },
    target: { const: 'all' },
    contract_files: contractFilesSchema,
    command_contracts: commandContractsSchema,
    actions: { type: 'array', items: actionDescriptorSchema },
    library_manifest_schema: jsonSchemaObjectSchema,
    cli_contracts: {
      type: 'object',
      required: ['$schema', '$id', '$defs'],
      properties: {
        $schema: { type: 'string' },
        $id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        $defs: { type: 'object' },
      },
      additionalProperties: true,
    },
  }
);

const commandSchemaResponseSchema = makeSuccessSchema(
  ['command', 'target', 'kind', 'name', 'description', 'output_schema', 'error_schema', 'schema_refs'],
  {
    command: { const: 'schema' },
    target: { type: 'string', enum: ['manifest', 'schema', 'action'] },
    kind: { const: 'command' },
    name: { type: 'string', enum: ['manifest', 'schema', 'action'] },
    description: { type: 'string' },
    input_schema: jsonSchemaObjectSchema,
    output_schema: jsonSchemaObjectSchema,
    error_schema: jsonSchemaObjectSchema,
    schema_refs: {
      type: 'object',
      required: ['output', 'error'],
      properties: {
        input: { type: 'string' },
        output: { type: 'string' },
        error: { type: 'string' },
      },
      additionalProperties: false,
    },
  }
);

const actionSchemaResponseSchema = makeSuccessSchema(
  ['command', 'target', 'kind', 'name', 'description', 'input_schema', 'output_schema', 'error_schema', 'schema_refs'],
  {
    command: { const: 'schema' },
    target: { type: 'string', enum: Object.keys(actionDefinitions) },
    kind: { const: 'action' },
    name: { type: 'string', enum: Object.keys(actionDefinitions) },
    description: { type: 'string' },
    input_schema: jsonSchemaObjectSchema,
    output_schema: jsonSchemaObjectSchema,
    error_schema: jsonSchemaObjectSchema,
    schema_refs: {
      type: 'object',
      required: ['input', 'output', 'error'],
      properties: {
        input: { type: 'string' },
        output: { type: 'string' },
        error: { type: 'string' },
      },
      additionalProperties: false,
    },
  }
);

const schemaResponseSchema = {
  oneOf: [schemaSummaryResponseSchema, commandSchemaResponseSchema, actionSchemaResponseSchema],
};

function getAction(name) {
  return actionDefinitions[name] || null;
}

function listActions() {
  return Object.entries(actionDefinitions).map(([name, definition]) => ({
    name,
    description: definition.description,
    input_schema: definition.input_schema,
    output_schema: definition.output_schema,
    schema_refs: {
      input: buildSchemaRef(definition.schema_defs.input),
      output: buildSchemaRef(definition.schema_defs.output),
      error: buildSchemaRef('errorResponse'),
    },
  }));
}

function getCommandSchemaDescriptor(name) {
  const commandContracts = getCommandContracts();
  const definitions = {
    manifest: {
      name: 'manifest',
      description: 'Return the package manifest, contract file locations, and command/action discovery metadata.',
      output_schema: manifestResponseSchema,
      schema_refs: {
        output: commandContracts.manifest.output_schema_ref,
        error: commandContracts.manifest.error_schema_ref,
      },
    },
    schema: {
      name: 'schema',
      description: 'Inspect CLI contract schemas or fetch the exported CLI contract bundle.',
      output_schema: schemaResponseSchema,
      schema_refs: {
        output: commandContracts.schema.output_schema_ref,
        error: commandContracts.schema.error_schema_ref,
      },
    },
    action: {
      name: 'action',
      description: 'Dispatch a named action and return the matching JSON response payload.',
      input_schema: actionEnvelopeSchema,
      output_schema: actionResponseSchema,
      schema_refs: {
        input: commandContracts.action.input_schema_ref,
        output: commandContracts.action.output_schema_ref,
        error: commandContracts.action.error_schema_ref,
      },
    },
  };

  return definitions[name] || null;
}

function getManifest() {
  return {
    ok: true,
    command: 'manifest',
    cli_version: CLI_VERSION,
    package: aiIndex.library.name,
    package_version: aiIndex.library.version,
    commands: COMMAND_NAMES,
    command_contracts: getCommandContracts(),
    actions: listActionContracts(),
    contract_files: contractFiles,
    library_manifest: aiIndex,
  };
}

function getContractBundle() {
  const defs = {
    animation: animationSchema,
    tokensCatalog: tokensCatalogSchema,
    resolvedTokens: resolvedTokensSchema,
    recommendationAlternative: recommendationAlternativeSchema,
    recommendReasonsMatch: recommendReasonsMatchSchema,
    recommendReasonsNoMatch: recommendReasonsNoMatchSchema,
    errorResponse: errorResponseSchema,
    actionEnvelope: actionEnvelopeSchema,
    actionDescriptor: actionDescriptorSchema,
    commandContract: commandContractSchema,
    commandContracts: commandContractsSchema,
    contractFiles: contractFilesSchema,
    manifestResponse: manifestResponseSchema,
    schemaSummaryResponse: schemaSummaryResponseSchema,
    commandSchemaResponse: commandSchemaResponseSchema,
    actionSchemaResponse: actionSchemaResponseSchema,
    schemaResponse: schemaResponseSchema,
    actionResponse: actionResponseSchema,
  };

  for (const [name, definition] of Object.entries(actionDefinitions)) {
    defs[definition.schema_defs.input] = definition.input_schema;
    defs[definition.schema_defs.output] = definition.output_schema;
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: CONTRACTS_SCHEMA_ID,
    title: 'tailwind-motion-kit CLI contracts',
    description: 'JSON-first command/action contract schemas for agent and tooling integrations.',
    type: 'object',
    $defs: defs,
  };
}

function getSchema(name) {
  if (!name) {
    return {
      ok: true,
      command: 'schema',
      target: 'all',
      contract_files: contractFiles,
      command_contracts: getCommandContracts(),
      actions: listActionContracts(),
      library_manifest_schema: aiSchema,
      cli_contracts: getContractBundle(),
    };
  }

  const commandDefinition = getCommandSchemaDescriptor(name);
  if (commandDefinition) {
    return {
      ok: true,
      command: 'schema',
      target: name,
      kind: 'command',
      name,
      description: commandDefinition.description,
      ...(commandDefinition.input_schema ? { input_schema: commandDefinition.input_schema } : {}),
      output_schema: commandDefinition.output_schema,
      error_schema: errorResponseSchema,
      schema_refs: commandDefinition.schema_refs,
    };
  }

  const action = getAction(name);
  if (!action) return null;

  return {
    ok: true,
    command: 'schema',
    target: name,
    kind: 'action',
    name,
    description: action.description,
    input_schema: action.input_schema,
    output_schema: action.output_schema,
    error_schema: errorResponseSchema,
    schema_refs: {
      input: buildSchemaRef(action.schema_defs.input),
      output: buildSchemaRef(action.schema_defs.output),
      error: buildSchemaRef('errorResponse'),
    },
  };
}

module.exports = {
  COMMAND_NAMES,
  CLI_VERSION,
  buildSchemaRef,
  getAction,
  getContractBundle,
  getManifest,
  getSchema,
  listActions,
  recommendAnimation,
  resolveMotionPlan,
  parseClassName,
  validateAgainstSchema,
};
