# Agent contract

`tailwind-motion-kit` ships a small JSON-first CLI and checked-in contract files for agents, editors, and automation.

## Discovery surface

Start here:

- `npx tmk manifest` → package/library manifest + stable schema refs
- `npx tmk schema` → exported CLI contract bundle + discovery metadata
- `npx tmk schema manifest` → manifest response schema
- `npx tmk schema action` → action-dispatch input/output schemas
- `npx tmk schema <action>` → per-action input/output schema
- `npx tmk action <action> --input '{...}'` → execute an action and return JSON
- `npx tmk generate --input '{...}'` → convenience alias for generating a ready-to-paste class bundle
- `npx tmk resolve --input '{...}'` → convenience alias for parsing an existing class bundle

Primary machine-readable files:

- `./ai/index.json`
- `./ai/schema.json`
- `./ai/contracts.json`
- `./llms.txt`

## Stability expectations

Current scope is intentionally small:

- command names are stable: `manifest`, `schema`, `action`, `generate`, `resolve`
- action names are stable: `list-animations`, `recommend`, `generate`, `resolve`
- successful action responses include `ok: true`
- unknown commands/actions fail with JSON errors on stderr and exit code `1`
- unknown input properties are rejected to keep contracts deterministic
- `manifest` and `schema` expose stable `*_schema_ref` pointers into `./ai/contracts.json`

The `library_manifest` returned by `manifest` mirrors `ai/index.json` and is the best starting point for automated consumers.

## Contract files

### `ai/index.json`

Machine-readable animation catalog and token surface.

### `ai/schema.json`

Validation schema for `ai/index.json`.

### `ai/contracts.json`

Checked-in JSON Schema bundle for CLI responses and action I/O.

Useful defs:

- `#/$defs/manifestResponse`
- `#/$defs/schemaResponse`
- `#/$defs/actionEnvelope`
- `#/$defs/actionResponse`
- `#/$defs/generateResponse`
- `#/$defs/resolveResponse`
- `#/$defs/recommendResponse`
- `#/$defs/errorResponse`

## Action contracts

### `list-animations`

Input:

```json
{
  "intent": "enter",
  "name": "slide",
  "limit": 5
}
```

Output highlights:

- `count`
- `animations[]`
- `available_actions`

### `recommend`

Input:

```json
{
  "intent": "feedback",
  "context": "cta click",
  "exclude": ["animate-jelly"],
  "include_tokens": true
}
```

Output highlights:

- `recommendation` object or `null`
- `reasons` with either match details or `no_match: true`
- `alternatives[]`
- optional `tokens` catalog, including repeat tokens

### `generate`

Input:

```json
{
  "intent": "feedback",
  "context": "cta click",
  "duration": 700,
  "easing": "out"
}
```

Output highlights:

- resolves a final animation from `animation` or recommendation inputs (`intent` / `context`)
- preserves preset `pair_with` defaults unless explicitly overridden
- automatically adds `motion-reduce:animate-none` unless `reduced_motion` is `false`
- returns both `className` and tokenized `classes`

### `resolve`

Input:

```json
{
  "className": "animate-jelly animate-duration-500 animate-ease-in-out motion-reduce:animate-none"
}
```

Output highlights:

- extracts the bundled animation when present
- returns recognized token groups (`duration`, `delay`, `easing`, `repeat`, `direction`, `fill`, `reduced_motion`)
- surfaces unknown `animate-*` classes via `unknown`

## Composition guidance

When generating code:

1. Prefer `pair_with` tokens from `ai/index.json`
2. Add `motion-reduce:animate-none` for non-essential motion
3. Use enter/exit primitives before decorative effects unless emphasis is explicitly requested
4. Treat `soft-pulse` and `float` as ambient loops, not default interaction feedback

## Examples

```bash
npx tmk manifest
npx tmk schema
npx tmk schema manifest
npx tmk schema action
npx tmk schema recommend
npx tmk generate --input '{"intent":"feedback","context":"cta click","duration":700}'
npx tmk resolve --input '{"className":"animate-jelly animate-duration-500 animate-ease-in-out motion-reduce:animate-none"}'
printf '{"intent":"error","context":"login form"}' | npx tmk action recommend
```
