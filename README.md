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
    extend: {},
  },
  plugins: [motionKit()],
};
```

> 커스텀 조합이 필요하면 `motionKit().presets`로 개별 preset만 골라 쓸 수도 있습니다.

`index.html`:

```html
<div class="animate-fade-in">fade in</div>
<div class="animate-slide-in-up">slide in</div>
<div class="animate-scale-in">scale in</div>
```

## 기본 preset (핵심 10개)

- fade: `fade-in`, `fade-out`
- slide: `slide-in-up`, `slide-out-down`
- scale: `scale-in`, `scale-out`
- attention: `bounce-in`, `wobble`, `jelly`
- rotate: `rotate-in`

## Preview 페이지 실행

`examples/`에 tailwind-animations.com 스타일을 참고한 프리뷰 페이지가 포함되어 있습니다.

```bash
cd examples
npx tailwindcss -c tailwind.config.js -i input.css -o output.css --watch
```

그 다음 `examples/index.html`을 열면 duration/easing 조절과 replay 테스트를 할 수 있습니다.

## GitHub Pages 배포

이 저장소는 `main` 브랜치에 push 하면 GitHub Actions가 `examples/`를 Pages로 배포하도록 설정되어 있습니다.

- 워크플로우: `.github/workflows/deploy-pages.yml`
- 예상 URL: `https://qpwoei0123.github.io/tailwind-motion-kit/`

최초 1회는 GitHub 저장소 설정에서 **Settings → Pages → Build and deployment → Source: GitHub Actions**로 설정해 주세요.
