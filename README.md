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

## Presets (10)

- fade → `fade-in` · `fade-out`
- slide → `slide-in-up` · `slide-out-down`
- scale → `scale-in` · `scale-out`
- attention → `bounce-in` · `wobble` · `jelly`
- rotate → `rotate-in`

## Timing utils

- duration → `animate-duration-150|300|500|700|1000`
- delay → `animate-delay-75|150|300|500`
- easing → `animate-ease-linear|in|out|in-out`

---

## Quick flow

Install → Plug in → Add class → Tune duration/easing → Ship 🚀

---

## Local preview

```bash
cd examples
npx tailwindcss -c tailwind.config.js -i input.css -o output.css --watch
```

Open `examples/index.html`.

## Pages deploy

Push `main` → Action runs → `examples/` deploys to GitHub Pages.

Workflow: `.github/workflows/deploy-pages.yml`

> Note: private repo may fail on GitHub Pages depending on plan.
