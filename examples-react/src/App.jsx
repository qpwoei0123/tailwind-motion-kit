import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
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

const easingMap = {
  ease: [0.25, 0.1, 0.25, 1],
  linear: [0, 0, 1, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
}

const durationPresets = [150, 300, 500, 700, 1000]

const parseBezier = (value) => {
  if (easingMap[value]) return easingMap[value]
  const matched = value.match(/cubic-bezier\(([^)]+)\)/)
  if (!matched) return easingMap.ease
  const nums = matched[1].split(',').map((v) => Number(v.trim()))
  return nums.length === 4 ? nums : easingMap.ease
}

export default function App() {
  const [duration, setDuration] = useState(600)
  const [easing, setEasing] = useState('cubic-bezier(0.22, 1, 0.36, 1)')
  const [autoReplay, setAutoReplay] = useState(false)
  const [replayTick, setReplayTick] = useState(0)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--tmk-duration', `${duration}ms`)
    root.style.setProperty('--tmk-easing', easing)
  }, [duration, easing])

  useEffect(() => {
    if (!autoReplay) return
    const t = setInterval(() => setReplayTick((v) => v + 1), Math.max(500, duration + 250))
    return () => clearInterval(t)
  }, [autoReplay, duration])

  const curve = useMemo(() => {
    const [x1, y1, x2, y2] = parseBezier(easing)
    return `M0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`
  }, [easing])

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
        <p className="mt-2 text-sm text-zinc-300">React + shadcn/ui · high-contrast UI · motion tuning</p>
      </header>

      <section className="mb-8 flex flex-col gap-2 rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-xl shadow-black/20 lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-zinc-300">Duration</p>
            <span className="text-xs text-zinc-200 tabular-nums">{duration}ms</span>
          </div>
          <Slider min={150} max={1600} step={50} value={[duration]} onValueChange={(v) => setDuration(v[0])} />
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {durationPresets.map((ms) => (
              <Button
                key={ms}
                size="sm"
                variant={duration === ms ? 'default' : 'secondary'}
                className="h-8 px-0 text-xs"
                onClick={() => setDuration(ms)}
              >
                {ms}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <p className="mb-2 text-sm text-zinc-300">Easing</p>
          <Select value={easing} onValueChange={setEasing}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ease">ease</SelectItem>
              <SelectItem value="linear">linear</SelectItem>
              <SelectItem value="ease-in">ease-in</SelectItem>
              <SelectItem value="ease-out">ease-out</SelectItem>
              <SelectItem value="ease-in-out">ease-in-out</SelectItem>
              <SelectItem value="cubic-bezier(0.22, 1, 0.36, 1)">smooth (default)</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-2 rounded-lg border border-zinc-700/80 bg-zinc-900 p-2">
            <svg viewBox="0 0 100 100" className="h-14 w-full">
              <line x1="0" y1="100" x2="100" y2="0" stroke="rgb(82 82 91)" strokeWidth="1" strokeDasharray="3 3" />
              <path d={curve} fill="none" stroke="rgb(129 140 248)" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-col justify-between gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3 lg:w-[240px]">
          <Button className="w-full bg-indigo-400 text-zinc-950 hover:bg-indigo-300" onClick={() => setReplayTick((v) => v + 1)}>Replay all</Button>
          <label className="flex h-10 items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-200">
            Auto replay
            <Switch checked={autoReplay} onCheckedChange={setAutoReplay} />
          </label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ name, group, label, animClass }) => (
          <Card key={name} className="border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-100 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-zinc-600">
            <CardHeader>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-zinc-100">{name}</h3>
                <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-200">{group}</span>
              </div>
              <Button size="sm" variant="secondary" className="h-7 px-2 text-[11px]" onClick={() => copyText(animClass)}>
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <div
                key={`${name}-${replayTick}`}
                className={`${animClass} rounded-xl border border-zinc-600 bg-zinc-800/90 p-6 text-center font-medium text-zinc-50`}
              >
                {label}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 h-8 w-full text-xs"
                onClick={() => copyText(`${animClass} | --tmk-duration:${duration}ms; --tmk-easing:${easing};`)}
              >
                Copy combo
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {copied ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-indigo-400/40 bg-zinc-900 px-3 py-2 text-xs text-indigo-100 shadow-lg shadow-black/30">
          copied: {copied}
        </div>
      ) : null}
    </main>
  )
}
