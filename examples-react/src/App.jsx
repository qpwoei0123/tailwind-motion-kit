import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const items = [
  { name: 'fade-in', group: 'fade', label: 'Fade In', animClass: 'animate-fade-in' },
  { name: 'fade-out', group: 'fade', label: 'Fade Out', animClass: 'animate-fade-out' },
  { name: 'slide-in-up', group: 'slide', label: 'Slide In Up', animClass: 'animate-slide-in-up' },
  { name: 'slide-out-down', group: 'slide', label: 'Slide Out Down', animClass: 'animate-slide-out-down' },
  { name: 'scale-in', group: 'scale', label: 'Scale In', animClass: 'animate-scale-in' },
  { name: 'scale-out', group: 'scale', label: 'Scale Out', animClass: 'animate-scale-out' },
  { name: 'bounce-in', group: 'attention', label: 'Bounce In', animClass: 'animate-bounce-in' },
  { name: 'wobble', group: 'attention', label: 'Wobble', animClass: 'animate-wobble' },
  { name: 'jelly', group: 'attention', label: 'Jelly', animClass: 'animate-jelly' },
  { name: 'rotate-in', group: 'rotate', label: 'Rotate In', animClass: 'animate-rotate-in' },
  { name: 'soft-pulse', group: 'attention', label: 'Soft Pulse', animClass: 'animate-soft-pulse' },
  { name: 'float', group: 'attention', label: 'Float', animClass: 'animate-float' },
]

const groupTone = {
  fade: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
  slide: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  scale: 'border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200',
  attention: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  rotate: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-200',
}

const useCaseTone = {
  'fade-in': 'Dialog enter',
  'fade-out': 'Dialog exit',
  'slide-in-up': 'Toast enter',
  'slide-out-down': 'Toast exit',
  'scale-in': 'Menu open',
  'scale-out': 'Menu close',
  'bounce-in': 'Badge pop',
  wobble: 'Error nudge',
  jelly: 'CTA feedback',
  'rotate-in': 'Icon reveal',
  'soft-pulse': 'Live status',
  float: 'Ambient card',
}

const durationPresets = [150, 300, 500, 700, 1000]
const delayPresets = [0, 75, 150, 300, 500]
const easingOptions = [
  { value: 'animate-ease-linear', label: 'linear', css: 'linear', desc: '처음부터 끝까지 같은 속도' },
  { value: 'animate-ease-in', label: 'ease-in', css: 'cubic-bezier(0.4, 0, 1, 1)', desc: '천천히 시작해서 점점 빨라짐' },
  { value: 'animate-ease-out', label: 'ease-out', css: 'cubic-bezier(0, 0, 0.2, 1)', desc: '빠르게 시작해서 끝으로 갈수록 감속' },
  { value: 'animate-ease-in-out', label: 'ease-in-out', css: 'cubic-bezier(0.4, 0, 0.2, 1)', desc: '처음/끝은 천천히, 중간이 빠름' },
]
const directionOptions = [
  { value: 'animate-direction-normal', label: 'normal', arrow: '→', desc: '정방향 재생' },
  { value: 'animate-direction-reverse', label: 'reverse', arrow: '←', desc: '역방향 재생' },
  { value: 'animate-direction-alternate', label: 'alternate', arrow: '↔', desc: '정/역방향 번갈아 재생' },
]
const fillOptions = [
  { value: 'animate-fill-none', label: 'none', desc: '시작/끝 상태 유지 안 함' },
  { value: 'animate-fill-forwards', label: 'forwards', desc: '종료 상태 유지' },
  { value: 'animate-fill-backwards', label: 'backwards', desc: '시작 상태를 지연 구간에 적용' },
  { value: 'animate-fill-both', label: 'both', desc: '시작+종료 상태 모두 유지' },
]

const guideNotes = [
  { title: 'Global output', body: '조합을 한 줄 클래스로 복사', arrow: '↘' },
  { title: 'Controls', body: 'duration/delay/easing/direction/fill 조작', arrow: '↘' },
  { title: 'Cards', body: '프리셋 확인 후 클래스 복사', arrow: '↘' },
]

const formatClass = (...tokens) => tokens.filter(Boolean).join(' ')

const parseBezier = (value) => {
  const map = {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
  }
  if (map[value]) return map[value]
  const matched = value.match(/cubic-bezier\(([^)]+)\)/)
  if (!matched) return map.ease
  const nums = matched[1].split(',').map((v) => Number(v.trim()))
  return nums.length === 4 ? nums : map.ease
}

export default function App() {
  const [duration, setDuration] = useState(1000)
  const [delay, setDelay] = useState(0)
  const [easingClass, setEasingClass] = useState('animate-ease-out')
  const [directionClass, setDirectionClass] = useState('animate-direction-normal')
  const [fillClass, setFillClass] = useState('animate-fill-both')
  const [replayTick, setReplayTick] = useState(0)
  const [copied, setCopied] = useState('')
  const [syncFx, setSyncFx] = useState(false)
  const [dirTick, setDirTick] = useState(0)
  const featured = new Set(['slide-in-up', 'jelly'])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--tmk-duration', `${duration}ms`)
  }, [duration])

  useEffect(() => {
    const t = setInterval(() => setReplayTick((v) => v + 1), Math.max(500, duration + delay + 250))
    return () => clearInterval(t)
  }, [duration, delay])

  useEffect(() => {
    const t = setInterval(() => setDirTick((v) => v + 1), 1800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setSyncFx(true)
    const t = setTimeout(() => setSyncFx(false), 320)
    return () => clearTimeout(t)
  }, [duration, delay, easingClass, directionClass, fillClass])

  const easing = useMemo(() => easingOptions.find((o) => o.value === easingClass) ?? easingOptions[0], [easingClass])
  const direction = useMemo(() => directionOptions.find((o) => o.value === directionClass) ?? directionOptions[0], [directionClass])
  const fillMode = useMemo(() => fillOptions.find((o) => o.value === fillClass) ?? fillOptions[0], [fillClass])
  const previewRepeatClass = directionClass === 'animate-direction-alternate' ? 'animate-repeat-2' : 'animate-repeat-1'

  useEffect(() => {
    document.documentElement.style.setProperty('--tmk-easing', easing.css)
  }, [easing.css])

  const curve = useMemo(() => {
    const [x1, y1, x2, y2] = parseBezier(easing.css)
    return `M0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`
  }, [easing.css])

  const globalClassCombo = useMemo(() => {
    const durationToken = `animate-duration-${duration}`
    const delayToken = delay > 0 ? `animate-delay-${delay}` : ''
    return formatClass(durationToken, delayToken, easingClass, directionClass, fillClass)
  }, [duration, delay, easingClass, directionClass, fillClass])

  const fillTimeline = useMemo(() => {
    if (fillClass === 'animate-fill-none') return [false, true, false]
    if (fillClass === 'animate-fill-forwards') return [false, true, true]
    if (fillClass === 'animate-fill-backwards') return [true, true, false]
    return [true, true, true]
  }, [fillClass])

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    window.clearTimeout(copyText.t)
    copyText.t = window.setTimeout(() => setCopied(''), 1000)
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-6">
        <div>
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
        <p className="relative mb-2 text-xs tracking-[0.2em] text-zinc-400">PREVIEW PLAYGROUND</p>
        <h1 className="relative text-2xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">tailwind-motion-kit</h1>
        <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ['animate-fade-up', '진입 모션'],
            ['animate-slide-in-right', '빠른 반응'],
            ['animate-jelly', '강조 인터랙션'],
          ].map(([cls, text]) => (
            <div key={cls} className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3 text-xs text-zinc-300">
              <div key={`${cls}-${replayTick}`} className={`${cls} text-sm font-medium text-zinc-100`}>{text}</div>
              <code className="mt-1 block text-[11px] text-zinc-500">{cls}</code>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ name, group, label, animClass }) => {
          const durationToken = `animate-duration-${duration}`
          const delayToken = delay > 0 ? `animate-delay-${delay}` : ''
          const finalClass = formatClass(animClass, durationToken, delayToken, easingClass, directionClass, fillClass)
          return (
            <Card key={name} className={`border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-100 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-zinc-600 ${featured.has(name) ? 'lg:col-span-2' : ''}` }>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-zinc-100">{name}</h3><span className={`rounded-full border px-2 py-1 text-xs ${groupTone[group]}`}>{group}</span><span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300">{useCaseTone[name]}</span></div>
              </CardHeader>
              <CardContent>
                <div key={`${name}-${replayTick}`} className={`${finalClass} rounded-xl border border-zinc-600 bg-zinc-800/90 p-6 text-center font-medium text-zinc-50`}>{label}</div>
                <code className="mt-3 block rounded-md border border-zinc-700 bg-zinc-950/80 p-2 text-[11px] text-zinc-300">{finalClass}</code>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary" className="h-8 w-full text-xs" onClick={() => copyText(animClass)}>Copy</Button>
                  <Button size="sm" variant="secondary" className="h-8 w-full text-xs" onClick={() => copyText(finalClass)}>Copy combo</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>


        </div>

        <aside className="relative hidden xl:block">
          <div className="sticky top-8 space-y-2 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-3 shadow-xl shadow-black/20">
            <p className="text-[11px] tracking-[0.18em] text-zinc-400">GUIDE LAYER</p>
            {guideNotes.map((note, idx) => (
              <div key={note.title} className="relative rounded-xl border border-zinc-700/80 bg-zinc-950/70 p-3">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-indigo-300">{note.arrow}</div>
                <p className="text-xs font-medium text-zinc-100">{idx + 1}. {note.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{note.body}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {copied ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-indigo-400/40 bg-zinc-900 px-3 py-2 text-xs text-indigo-100 shadow-lg shadow-black/30">copied: {copied}</div> : null}
    </main>
  )
}
