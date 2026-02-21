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
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">tailwind-motion-kit · React + shadcn/ui</h1>
      </header>

      <section className="mb-8 flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-zinc-400">Duration</p>
            <span className="text-xs text-zinc-300 tabular-nums">{duration}ms</span>
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

        <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <p className="mb-2 text-sm text-zinc-400">Easing</p>
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
          <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-2">
            <svg viewBox="0 0 100 100" className="h-14 w-full">
              <line x1="0" y1="100" x2="100" y2="0" stroke="rgb(63 63 70)" strokeWidth="1" strokeDasharray="3 3" />
              <path d={curve} fill="none" stroke="rgb(99 102 241)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-col justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 lg:w-[240px]">
          <Button className="w-full" onClick={() => setReplayTick((v) => v + 1)}>Replay all</Button>
          <label className="flex h-10 items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/70 px-3 text-xs text-zinc-300">
            Auto replay
            <Switch checked={autoReplay} onCheckedChange={setAutoReplay} />
          </label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ name, group, label, animClass }) => (
          <Card key={name} className="border-zinc-800 bg-zinc-900 text-zinc-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-zinc-100">{name}</h3>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">{group}</span>
              </div>
              <Button size="sm" variant="secondary" className="h-7 px-2 text-[11px]" onClick={() => copyText(animClass)}>
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <div
                key={`${name}-${replayTick}`}
                className={`${animClass} rounded-xl border border-zinc-700 bg-zinc-800 p-6 text-center font-medium text-zinc-100`}
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
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100">
          copied: {copied}
        </div>
      ) : null}
    </main>
  )
}
