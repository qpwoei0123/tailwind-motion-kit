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

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--tmk-duration', `${duration}ms`)
  }, [duration])

  useEffect(() => {
    const t = setInterval(() => setReplayTick((v) => v + 1), Math.max(500, duration + delay + 250))
    return () => clearInterval(t)
  }, [duration, delay])

  useEffect(() => {
    setSyncFx(true)
    const t = setTimeout(() => setSyncFx(false), 320)
    return () => clearTimeout(t)
  }, [duration, delay, easingClass, directionClass, fillClass])

  const easing = useMemo(() => easingOptions.find((o) => o.value === easingClass) ?? easingOptions[0], [easingClass])
  const direction = useMemo(() => directionOptions.find((o) => o.value === directionClass) ?? directionOptions[0], [directionClass])
  const fillMode = useMemo(() => fillOptions.find((o) => o.value === fillClass) ?? fillOptions[0], [fillClass])

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-black/30 sm:p-7">
        <p className="mb-2 text-xs tracking-[0.2em] text-zinc-400">PREVIEW PLAYGROUND</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">tailwind-motion-kit</h1>
        <p className="mt-2 text-sm text-zinc-300">옵션 조작 + 클래스 동기화 + 시각 설명</p>
      </header>

      <section className="mb-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-xl shadow-black/20">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-zinc-200">Synchronized class output</p>
          <Button size="sm" variant="secondary" className="h-8 px-3 text-xs" onClick={() => copyText(globalClassCombo)}>
            Copy global class
          </Button>
        </div>
        <code className={`block overflow-x-auto rounded-lg border border-zinc-700/80 bg-zinc-950 p-3 text-xs text-indigo-200 transition ${syncFx ? 'ring-2 ring-indigo-400/60' : ''}`}>
          {globalClassCombo}
        </code>
      </section>

      <section className="mb-4 grid gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-xl shadow-black/20 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <p className="mb-2 text-sm text-zinc-300">Easing curve</p>
          <svg viewBox="0 0 100 100" className="h-20 w-full rounded-md border border-zinc-700 bg-zinc-900 p-1">
            <line x1="0" y1="100" x2="100" y2="0" stroke="rgb(82 82 91)" strokeWidth="1" strokeDasharray="3 3" />
            <path d={curve} fill="none" stroke="rgb(129 140 248)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className="mt-2 text-xs text-zinc-400">{easing.desc}</p>
        </div>

        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <p className="mb-2 text-sm text-zinc-300">Direction preview</p>
          <div className="rounded-md border border-zinc-700 bg-zinc-900 p-2">
            <div className="mb-2 text-lg text-center text-indigo-200">{direction.arrow}</div>
            <div key={`dir-${replayTick}`} className={`animate-slide-in-right animate-duration-${duration} ${directionClass} rounded bg-indigo-500/20 px-2 py-1 text-center text-xs text-indigo-100`}>
              {direction.label}
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400">{direction.desc}</p>
        </div>

        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <p className="mb-2 text-sm text-zinc-300">Fill mode timeline</p>
          <div className="grid grid-cols-3 gap-2 rounded-md border border-zinc-700 bg-zinc-900 p-2 text-center text-[11px]">
            {['before', 'active', 'after'].map((label, idx) => (
              <div key={label} className={`rounded px-1 py-2 ${fillTimeline[idx] ? 'bg-indigo-500/30 text-indigo-100' : 'bg-zinc-800 text-zinc-500'}`}>
                {label}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">{fillMode.desc}</p>
        </div>
      </section>

      <section className="mb-8 grid gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-xl shadow-black/20 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <div className="mb-2 flex items-center justify-between"><p className="text-sm text-zinc-300">Duration</p><span className="text-xs text-zinc-200 tabular-nums">{duration}ms</span></div>
          <Slider min={0} max={durationPresets.length - 1} step={1} value={[durationPresets.indexOf(duration)]} onValueChange={(v) => setDuration(durationPresets[v[0]] ?? 1000)} />
          <div className="mt-3 grid grid-cols-5 gap-1.5">{durationPresets.map((ms) => <Button key={ms} size="sm" variant={duration === ms ? 'default' : 'secondary'} className="h-8 px-0 text-xs" onClick={() => setDuration(ms)}>{ms}</Button>)}</div>
        </div>

        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <div className="mb-2 flex items-center justify-between"><p className="text-sm text-zinc-300">Delay</p><span className="text-xs text-zinc-200 tabular-nums">{delay}ms</span></div>
          <Slider min={0} max={delayPresets.length - 1} step={1} value={[delayPresets.indexOf(delay)]} onValueChange={(v) => setDelay(delayPresets[v[0]] ?? 0)} />
          <div className="mt-3 grid grid-cols-5 gap-1.5">{delayPresets.map((ms) => <Button key={ms} size="sm" variant={delay === ms ? 'default' : 'secondary'} className="h-8 px-0 text-xs" onClick={() => setDelay(ms)}>{ms}</Button>)}</div>
        </div>

        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <p className="mb-2 text-sm text-zinc-300">Easing</p>
          <Select value={easingClass} onValueChange={setEasingClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{easingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
        </div>

        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <p className="mb-2 text-sm text-zinc-300">Direction</p>
          <Select value={directionClass} onValueChange={setDirectionClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{directionOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
        </div>

        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3 lg:col-span-2">
          <p className="mb-2 text-sm text-zinc-300">Fill mode</p>
          <Select value={fillClass} onValueChange={setFillClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fillOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ name, group, label, animClass }) => {
          const durationToken = `animate-duration-${duration}`
          const delayToken = delay > 0 ? `animate-delay-${delay}` : ''
          const finalClass = formatClass(animClass, durationToken, delayToken, easingClass, directionClass, fillClass)
          return (
            <Card key={name} className="border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-100 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-zinc-600">
              <CardHeader>
                <div className="flex items-center gap-2"><h3 className="font-medium text-zinc-100">{name}</h3><span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-200">{group}</span></div>
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

      {copied ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-indigo-400/40 bg-zinc-900 px-3 py-2 text-xs text-indigo-100 shadow-lg shadow-black/30">copied: {copied}</div> : null}
    </main>
  )
}
