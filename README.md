# tailwind-motion-kit

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     _____  _    ___ _ __        _____ _   _ ____      ┃
┃    |_   _|/ \  |_ _| |\ \      / /_ _| \ | |  _ \     ┃
┃      | | / _ \  | || | \ \ /\ / / | ||  \| | | | |    ┃
┃      | |/ ___ \ | || |__\ V  V /  | || |\  | |_| |    ┃
┃      |_/_/   \_\___|_____\_/\_/  |___|_| \_|____/     ┃
┃                                                       ┃
┃   __  __  ___ _____ ___ ___  _   _   _  _____ _____   ┃
┃  |  \/  |/ _ \_   _|_ _/ _ \| \ | | | |/ /_ _|_   _|  ┃
┃  | |\/| | | | || |  | | | | |  \| | | ' / | |  | |    ┃
┃  | |  | | |_| || |  | | |_| | |\  | | . \ | |  | |    ┃
┃  |_|  |_|\___/ |_| |___\___/|_| \_| |_|\_\___| |_|    ┃
┃                                                       ┃
┃    ┌───────────┐    ┌──────────┐    ┌───────────┐     ┃
┃    │ animate.* │ -> │ fast UI  │ -> │  motion   │     ┃
┃    └───────────┘    └──────────┘    └───────────┘     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

Tiny Tailwind animation kit ⚡

[Preview →](https://qpwoei0123.github.io/tailwind-motion-kit/)

![React + shadcn preview](./docs/assets/preview-react-shadcn.jpg)

Current preview UI (React + shadcn/ui)

---

## 1) Install

```bash
npm i tailwind-motion-kit
```

## 2) Plug in

```js
// tailwind.config.js
const motionKit = require('tailwind-motion-kit')

module.exports = {
  content: ['./index.html'],
  plugins: [motionKit()],
}
```

## 3) Use

```html
<div class="animate-fade-in">A</div>
<div class="animate-slide-in-up">B</div>
<div class="animate-jelly animate-duration-700 animate-ease-out">C</div>
```

---

## Presets (21)

- fade → `fade-in` · `fade-out` · `fade-up` · `fade-down`
- slide → `slide-in-up` · `slide-in-left` · `slide-in-right` · `slide-out-down` · `slide-out-up` · `slide-out-left` · `slide-out-right`
- scale → `scale-in` · `scale-out` · `zoom-in` · `zoom-out`
- attention → `bounce-in` · `wobble` · `jelly` · `soft-pulse` · `float`
- rotate → `rotate-in`

## Timing utils

- duration → `animate-duration-150|300|500|700|1000`
- delay → `animate-delay-75|150|300|500`
- easing → `animate-ease-linear|in|out|in-out`
- repeat → `animate-repeat-1|2|3|infinite`
- direction → `animate-direction-normal|reverse|alternate`
- fill mode → `animate-fill-none|forwards|backwards|both`

---

## Accessibility (reduced motion)

Use Tailwind motion variants to reduce animation for users who request it:

```html
<div class="animate-fade-up motion-reduce:animate-none">Content</div>
```

Recommended pattern for UI transitions:

- default: subtle motion (`animate-fade-up`, `animate-duration-300`)
- reduced motion: disable or simplify (`motion-reduce:animate-none`)

## Plugin options (custom scales)

```js
// tailwind.config.js
const motionKit = require('tailwind-motion-kit')

module.exports = {
  plugins: [
    motionKit({
      durationScale: [120, 240, 360, 480],
      delayScale: [50, 100, 150],
    }),
  ],
}
```

This generates matching classes:

- `animate-duration-120|240|360|480`
- `animate-delay-50|100|150`

## Quick flow

Install → Plug in → Add class → Tune duration/easing/repeat → Ship 🚀

---

## Recipes

### Toast enter

```html
<div class="animate-slide-in-right animate-duration-300 animate-ease-out">Saved!</div>
```

### Modal open

```html
<div class="animate-zoom-in animate-duration-240 motion-reduce:animate-none">...</div>
```

### Attention ping

```html
<button class="animate-soft-pulse animate-repeat-infinite">Notify</button>
```

## Local preview (HTML)

```bash
cd examples
npx tailwindcss -c tailwind.config.js -i input.css -o output.css --watch
```

Open `examples/index.html`.

## Local preview (React + shadcn/ui)

```bash
cd examples-react
npm install
npm run dev
```

Open `http://localhost:5173`.

## Pages deploy

Push `main` → Action runs → `examples/` deploys to GitHub Pages.

Workflow: `.github/workflows/deploy-pages.yml`

> Note: private repo may fail on GitHub Pages depending on plan.
