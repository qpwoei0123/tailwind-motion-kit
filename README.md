# tailwind-motion-kit

Tailwind CSS 애니메이션 플러그인 기본 템플릿.

## 설치

```bash
npm i tailwind-motion-kit
```

## 사용

`tailwind.config.js`:

```js
const motionKit = require('tailwind-motion-kit');

module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      keyframes: {
        ...motionKit().presets.fade.keyframes,
        ...motionKit().presets.slide.keyframes,
        ...motionKit().presets.scale.keyframes,
      },
      animation: {
        ...motionKit().presets.fade.animations,
        ...motionKit().presets.slide.animations,
        ...motionKit().presets.scale.animations,
      },
    },
  },
  plugins: [],
};
```

`index.html`:

```html
<div class="animate-fade-in">fade in</div>
<div class="animate-slide-in-up">slide in</div>
<div class="animate-scale-in">scale in</div>
```

## 기본 preset

- fade: `fade-in`, `fade-out`
- slide: `slide-in-up`, `slide-out-down`
- scale: `scale-in`, `scale-out`
