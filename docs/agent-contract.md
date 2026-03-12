# Agent contract

`tailwind-motion-kit` ships a small JSON-first CLI and a machine-readable animation index for coding agents and tooling.

## Discovery surface

- `npx tmk --help` → copy-paste quickstart + command/action discovery
- `npx tmk manifest` → library/package manifest + available actions
- `npx tmk schema` → top-level contract summary
- `npx tmk schema <action>` → per-action input schema
- `npx tmk action <action> --input '{...}'` → execute an action and return JSON
- `npx tmk generate --input '{...}'` → convenience alias for generating a ready-to-paste class bundle
- `npx tmk resolve --input '{...}'` → convenience alias for parsing an existing class bundle

Recommended discovery order:
1. `npx tmk manifest`
2. `npx tmk schema <action>`
3. `npx tmk action <action> --input '{...}'` or the `generate` / `resolve` aliases

Primary machine-readable files:

- `./ai/index.json`
- `./ai/schema.json`
- `./llms.txt`

## Stability expectations

Current scope is intentionally small:

- command names are stable: `manifest`, `schema`, `action`, `generate`, `resolve`
- action names are stable: `list-animations`, `recommend`, `generate`, `resolve`
- outputs are JSON objects
- unknown commands/actions fail with JSON errors on stderr and exit code `1`
- unknown input properties are rejected to keep contracts deterministic

The `library_manifest` returned by `manifest` mirrors `ai/index.json` and is the best starting point for automated consumers.

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

Notes:

- `intent` accepts a string or string array
- `name` matches either animation name or class substring
- `limit` bounds the result set

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

Notes:

- ranks bundled animations by intent/context fit
- `exclude` accepts animation names or full classes
- `include_tokens` appends reusable timing/easing tokens for composition
- returns `recommendation: null` with `reasons.no_match: true` when nothing scores above zero

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

Notes:

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

Notes:

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
npx tmk schema generate
npx tmk generate --input '{"intent":"feedback","context":"cta click","duration":700}'
npx tmk resolve --input '{"className":"animate-jelly animate-duration-500 animate-ease-in-out motion-reduce:animate-none"}'
printf '{"intent":"error","context":"login form"}' | npx tmk action recommend
```
