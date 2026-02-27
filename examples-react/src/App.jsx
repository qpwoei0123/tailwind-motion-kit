import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { gsap } from 'gsap'

const items = [
  { name: 'fade-in', group: 'fade', label: 'Fade In', animClass: 'animate-fade-in' },
  { name: 'fade-out', group: 'fade', label: 'Fade Out', animClass: 'animate-fade-out' },
  { name: 'fade-blur-in', group: 'fade', label: 'Fade Blur In', animClass: 'animate-fade-blur-in' },
  { name: 'fade-blur-out', group: 'fade', label: 'Fade Blur Out', animClass: 'animate-fade-blur-out' },
  { name: 'blur-in', group: 'fade', label: 'Blur In', animClass: 'animate-blur-in' },
  { name: 'blur-out', group: 'fade', label: 'Blur Out', animClass: 'animate-blur-out' },
  { name: 'focus-in', group: 'fade', label: 'Focus In', animClass: 'animate-focus-in' },
  { name: 'focus-out', group: 'fade', label: 'Focus Out', animClass: 'animate-focus-out' },
  { name: 'glow-in', group: 'fade', label: 'Glow In', animClass: 'animate-glow-in' },
  { name: 'slide-in-up', group: 'slide', label: 'Slide In Up', animClass: 'animate-slide-in-up' },
  { name: 'slide-out-down', group: 'slide', label: 'Slide Out Down', animClass: 'animate-slide-out-down' },
  { name: 'slide-in-bottom', group: 'slide', label: 'Slide In Bottom', animClass: 'animate-slide-in-bottom' },
  { name: 'slide-out-bottom', group: 'slide', label: 'Slide Out Bottom', animClass: 'animate-slide-out-bottom' },
  { name: 'accordion-down', group: 'slide', label: 'Accordion Down', animClass: 'animate-accordion-down' },
  { name: 'accordion-up', group: 'slide', label: 'Accordion Up', animClass: 'animate-accordion-up' },
  { name: 'scale-in', group: 'scale', label: 'Scale In', animClass: 'animate-scale-in' },
  { name: 'scale-out', group: 'scale', label: 'Scale Out', animClass: 'animate-scale-out' },
  { name: 'bounce-in', group: 'attention', label: 'Bounce In', animClass: 'animate-bounce-in' },
  { name: 'wobble', group: 'attention', label: 'Wobble', animClass: 'animate-wobble' },
  { name: 'jelly', group: 'attention', label: 'Jelly', animClass: 'animate-jelly' },
  { name: 'rotate-in', group: 'rotate', label: 'Rotate In', animClass: 'animate-rotate-in' },
  { name: 'soft-pulse', group: 'attention', label: 'Soft Pulse', animClass: 'animate-soft-pulse' },
  { name: 'float', group: 'attention', label: 'Float', animClass: 'animate-float' },
  { name: 'shake-x', group: 'attention', label: 'Shake X', animClass: 'animate-shake-x' },
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
  'fade-blur-in': 'Image reveal',
  'fade-blur-out': 'Overlay dismiss',
  'blur-in': 'Image sharpen',
  'blur-out': 'Depth transition',
  'focus-in': 'Hero reveal',
  'focus-out': 'Scene exit',
  'glow-in': 'Neon highlight',
  'slide-in-up': 'Toast enter',
  'slide-out-down': 'Toast exit',
  'slide-in-bottom': 'Bottom sheet enter',
  'slide-out-bottom': 'Bottom sheet exit',
  'accordion-down': 'FAQ open',
  'accordion-up': 'FAQ close',
  'scale-in': 'Menu open',
  'scale-out': 'Menu close',
  'bounce-in': 'Badge pop',
  wobble: 'Error nudge',
  jelly: 'CTA feedback',
  'rotate-in': 'Icon reveal',
  'soft-pulse': 'Live status',
  float: 'Ambient card',
  'shake-x': 'Form error',
}

const groupOptions = ['all', 'fade', 'slide', 'scale', 'attention', 'rotate']

const durationPresets = [150, 300, 500, 700, 1000]
const delayPresets = [0, 75, 150, 300, 500]
const easingOptions = [
  { value: 'animate-ease-linear', label: 'linear', css: 'linear', desc: 'Constant speed from start to finish' },
  { value: 'animate-ease-in', label: 'ease-in', css: 'cubic-bezier(0.4, 0, 1, 1)', desc: 'Starts slowly, then accelerates' },
  { value: 'animate-ease-out', label: 'ease-out', css: 'cubic-bezier(0, 0, 0.2, 1)', desc: 'Starts fast, then decelerates toward the end' },
  { value: 'animate-ease-in-out', label: 'ease-in-out', css: 'cubic-bezier(0.4, 0, 0.2, 1)', desc: 'Slow at start/end, faster in the middle' },
]
const directionOptions = [
  { value: 'animate-direction-normal', label: 'normal', arrow: '→', desc: 'Plays forward' },
  { value: 'animate-direction-reverse', label: 'reverse', arrow: '←', desc: 'Plays in reverse' },
  { value: 'animate-direction-alternate', label: 'alternate', arrow: '↔', desc: 'Alternates forward and reverse' },
]
const fillOptions = [
  { value: 'animate-fill-none', label: 'none', desc: 'Does not retain start/end state' },
  { value: 'animate-fill-forwards', label: 'forwards', desc: 'Retains end state' },
  { value: 'animate-fill-backwards', label: 'backwards', desc: 'Applies start state during delay' },
  { value: 'animate-fill-both', label: 'both', desc: 'Retains both start and end states' },
]

const quickPresets = [
  {
    key: 'snappy-ui',
    label: 'Snappy UI',
    hint: 'Fast interactions',
    config: { duration: 300, delay: 0, easingClass: 'animate-ease-out', directionClass: 'animate-direction-normal', fillClass: 'animate-fill-both' },
  },
  {
    key: 'dramatic-enter',
    label: 'Dramatic Enter',
    hint: 'Hero/modal entrance',
    config: { duration: 700, delay: 75, easingClass: 'animate-ease-in-out', directionClass: 'animate-direction-normal', fillClass: 'animate-fill-both' },
  },
  {
    key: 'loop-signal',
    label: 'Loop Signal',
    hint: 'Repeated state emphasis',
    config: { duration: 1000, delay: 0, easingClass: 'animate-ease-in-out', directionClass: 'animate-direction-alternate', fillClass: 'animate-fill-both' },
  },
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
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [replayTick, setReplayTick] = useState(0)
  const [copyState, setCopyState] = useState({ key: '', tone: 'success' })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [syncFx, setSyncFx] = useState(false)
  const [dirTick, setDirTick] = useState(0)
  const pageRef = useRef(null)
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const enteredAreasRef = useRef(new Set())

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
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tmk-reveal', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!cursorRef.current || !cursorDotRef.current) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    document.body.classList.add('tmk-cursor-active')

    const moveOuterX = gsap.quickTo(cursorRef.current, 'x', { duration: 0.25, ease: 'power3.out' })
    const moveOuterY = gsap.quickTo(cursorRef.current, 'y', { duration: 0.25, ease: 'power3.out' })
    const moveDotX = gsap.quickTo(cursorDotRef.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const moveDotY = gsap.quickTo(cursorDotRef.current, 'y', { duration: 0.12, ease: 'power3.out' })

    gsap.to(cursorDotRef.current, { scale: 0.9, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    const onMove = (e) => {
      moveOuterX(e.clientX)
      moveOuterY(e.clientY)
      moveDotX(e.clientX)
      moveDotY(e.clientY)
    }

    const setCursorTheme = (tone = 'default') => {
      const toneMap = {
        default: { ring: 'rgba(129, 140, 248, 0.12)', dot: '#67e8f9', scale: 1 },
        action: { ring: 'rgba(129, 140, 248, 0.28)', dot: '#a5b4fc', scale: 1.8 },
        fade: { ring: 'rgba(34, 211, 238, 0.22)', dot: '#22d3ee', scale: 1.5 },
        slide: { ring: 'rgba(52, 211, 153, 0.22)', dot: '#34d399', scale: 1.5 },
        scale: { ring: 'rgba(217, 70, 239, 0.22)', dot: '#d946ef', scale: 1.5 },
        attention: { ring: 'rgba(251, 191, 36, 0.24)', dot: '#fbbf24', scale: 1.6 },
        rotate: { ring: 'rgba(129, 140, 248, 0.24)', dot: '#818cf8', scale: 1.6 },
      }
      const style = toneMap[tone] ?? toneMap.default
      gsap.to(cursorRef.current, {
        scale: style.scale,
        duration: 0.2,
        backgroundColor: style.ring,
        borderColor: style.dot,
      })
      gsap.to(cursorDotRef.current, {
        duration: 0.2,
        backgroundColor: style.dot,
      })
    }

    const playEntryFx = (tone, animKey) => {
      const key = animKey || tone
      if (!key || enteredAreasRef.current.has(key)) return
      enteredAreasRef.current.add(key)

      const tl = gsap.timeline()
      if (tone === 'slide') {
        tl.to(cursorRef.current, { x: '+=10', duration: 0.08, ease: 'power2.out' })
          .to(cursorRef.current, { x: '-=10', duration: 0.12, ease: 'power2.inOut' })
      } else if (tone === 'fade') {
        tl.to(cursorRef.current, { opacity: 0.35, duration: 0.08 })
          .to(cursorRef.current, { opacity: 1, duration: 0.14 })
      } else if (tone === 'scale') {
        tl.to(cursorRef.current, { scale: '+=0.7', duration: 0.1, ease: 'back.out(2.5)' })
          .to(cursorRef.current, { scale: '-=0.7', duration: 0.16, ease: 'power2.out' })
      } else if (tone === 'attention') {
        tl.to(cursorRef.current, { scale: 2.2, duration: 0.09, ease: 'back.out(2)' })
          .to(cursorRef.current, { scale: 1.6, duration: 0.16, ease: 'elastic.out(1, 0.5)' })
      } else if (tone === 'rotate') {
        tl.to(cursorRef.current, { rotation: '+=25', duration: 0.12, ease: 'power2.out' })
          .to(cursorRef.current, { rotation: 0, duration: 0.16, ease: 'power2.inOut' })
      } else {
        tl.to(cursorDotRef.current, { scale: 1.8, duration: 0.1, ease: 'power2.out' })
          .to(cursorDotRef.current, { scale: 0.9, duration: 0.16, ease: 'power2.inOut' })
      }
    }

    const onOver = (e) => {
      const t = e.target
      const toneTarget = t.closest('[data-cursor]')
      if (toneTarget) {
        const tone = toneTarget.getAttribute('data-cursor')
        const animKey = toneTarget.getAttribute('data-anim')
        setCursorTheme(tone)
        playEntryFx(tone, animKey)
        return
      }
      if (t.closest('button, a, input, select, textarea, [role="button"]')) {
        setCursorTheme('action')
        return
      }
      setCursorTheme('default')
    }

    const onOut = () => setCursorTheme('default')

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.body.classList.remove('tmk-cursor-active')
    }
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

  const filteredItems = useMemo(() => {
    if (selectedGroup === 'all') return items
    return items.filter((item) => item.group === selectedGroup)
  }, [selectedGroup])

  const groupCountMap = useMemo(() => {
    const map = { all: items.length }
    for (const g of ['fade', 'slide', 'scale', 'attention', 'rotate']) {
      map[g] = items.filter((item) => item.group === g).length
    }
    return map
  }, [])


  const applyPreset = (preset) => {
    setDuration(preset.duration)
    setDelay(preset.delay)
    setEasingClass(preset.easingClass)
    setDirectionClass(preset.directionClass)
    setFillClass(preset.fillClass)
  }

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyState({ key, tone: 'success' })
    } catch {
      setCopyState({ key: 'error', tone: 'error' })
    }
    window.clearTimeout(copyText.t)
    copyText.t = window.setTimeout(() => setCopyState({ key: '', tone: 'success' }), 1200)
  }

  return (
    <main ref={pageRef} className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300/70 bg-indigo-400/10 xl:block" />
      <div ref={cursorDotRef} className="pointer-events-none fixed left-0 top-0 z-[91] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 xl:block" />
      <div className="fixed left-0 top-0 z-40 h-[2px] w-full bg-zinc-900/70">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 transition-[width] duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-6">
        <div>
      <header data-cursor="rotate" className="tmk-reveal relative mb-6 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
        <p className="relative mb-2 text-xs tracking-[0.2em] text-zinc-400">PREVIEW PLAYGROUND</p>
        <h1 className="relative text-2xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">tailwind-motion-kit</h1>
        <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ['animate-fade-up', 'Entry motion'],
            ['animate-slide-in-right', 'Quick response'],
            ['animate-jelly', 'Emphasis interaction'],
          ].map(([cls, text]) => (
            <div key={cls} className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 p-3 text-xs text-zinc-300">
              <div key={`${cls}-${replayTick}`} className={`${cls} text-sm font-medium text-zinc-100`}>{text}</div>
              <code className="mt-1 block text-[11px] text-zinc-500">{cls}</code>
            </div>
          ))}
        </div>
      </header>

      <section className="tmk-reveal mb-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {groupOptions.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGroup(g)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                selectedGroup === g
                  ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {g} <span className="text-zinc-400">{groupCountMap[g]}</span>
            </button>
          ))}
        </div>
      </section>


      <section className="tmk-reveal mb-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs tracking-[0.12em] text-zinc-400">QUICK PRESETS</p>
          <button
            type="button"
            onClick={() => applyPreset({ duration: 1000, delay: 0, easingClass: 'animate-ease-out', directionClass: 'animate-direction-normal', fillClass: 'animate-fill-both' })}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300 hover:border-zinc-500"
          >
            reset defaults
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {quickPresets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset.config)}
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/40"
            >
              <p className="text-sm font-medium text-zinc-100">{preset.label}</p>
              <p className="text-[11px] text-zinc-400">{preset.hint}</p>
              <code className="mt-2 block text-[10px] text-indigo-200">{preset.config.easingClass} · {preset.config.directionClass}</code>
            </button>
          ))}
        </div>
      </section>

      <section className="tmk-reveal grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredItems.map(({ name, group, label, animClass }) => {
          const durationToken = `animate-duration-${duration}`
          const delayToken = delay > 0 ? `animate-delay-${delay}` : ''
          const finalClass = formatClass(animClass, durationToken, delayToken, easingClass, directionClass, fillClass)
          return (
            <Card key={name} data-cursor={group} data-anim={name} className="h-[340px] border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-100 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-zinc-600">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-zinc-100">{name}</h3><span className={`rounded-full border px-2 py-1 text-xs ${groupTone[group]}`}>{group}</span><span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300">{useCaseTone[name]}</span></div>
              </CardHeader>
              <CardContent className="flex h-[272px] flex-col">
                <div key={`${name}-${replayTick}`} className={`${finalClass} flex min-h-[88px] items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/90 p-6 text-center font-medium text-zinc-50`}>{label}</div>
                <code className="mt-3 block max-h-[56px] overflow-auto rounded-md border border-zinc-700 bg-zinc-950/80 p-2 text-[11px] text-zinc-300">{finalClass}</code>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                  <Button size="sm" variant="secondary" className="h-8 w-full text-xs" onClick={() => copyText(animClass, `${name}:base`)}>{copyState.key === `${name}:base` ? 'Copied ✓' : 'Copy class'}</Button>
                  <Button size="sm" variant="secondary" className="h-8 w-full text-xs" onClick={() => copyText(finalClass, `${name}:combo`)}>{copyState.key === `${name}:combo` ? 'Copied ✓' : 'Copy combo'}</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {filteredItems.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
          No animations in this group.
        </div>
      ) : null}

        </div>

        <aside className="tmk-reveal relative hidden xl:block">
          <div data-cursor="action" className="sticky top-8 space-y-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.18em] text-zinc-400">MOTION CONTROLS · {Math.round(scrollProgress)}%</p>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 px-2 text-[10px]"
                onClick={() => {
                  setDuration(1000)
                  setDelay(0)
                  setEasingClass('animate-ease-out')
                  setDirectionClass('animate-direction-normal')
                  setFillClass('animate-fill-both')
                }}
              >
                Reset
              </Button>
            </div>

            <button
              type="button"
              onClick={() => copyText(globalClassCombo, 'global')}
              className="block w-full rounded-lg border border-zinc-700/80 bg-zinc-950 p-2 text-left text-[10px] text-indigo-200 transition hover:border-indigo-400/50"
            >
              {globalClassCombo}
            </button>

            <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
              <div className="mb-2 flex items-center justify-between"><p className="text-xs text-zinc-300">Duration</p><span className="text-[10px] text-zinc-400">{duration}ms</span></div>
              <Slider min={0} max={durationPresets.length - 1} step={1} value={[durationPresets.indexOf(duration)]} onValueChange={(v) => setDuration(durationPresets[v[0]] ?? 1000)} />
            </div>

            <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
              <div className="mb-2 flex items-center justify-between"><p className="text-xs text-zinc-300">Delay</p><span className="text-[10px] text-zinc-400">{delay}ms</span></div>
              <Slider min={0} max={delayPresets.length - 1} step={1} value={[delayPresets.indexOf(delay)]} onValueChange={(v) => setDelay(delayPresets[v[0]] ?? 0)} />
            </div>

            <div className="space-y-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
              <p className="text-xs text-zinc-300">Easing</p>
              <Select value={easingClass} onValueChange={setEasingClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{easingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
              <p className="text-xs text-zinc-300">Direction</p>
              <Select value={directionClass} onValueChange={setDirectionClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{directionOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
              <p className="text-xs text-zinc-300">Fill mode</p>
              <Select value={fillClass} onValueChange={setFillClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fillOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </aside>
      </div>


      <section className="tmk-reveal mt-5 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-3 xl:hidden">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs tracking-[0.12em] text-zinc-400">MOBILE CONTROLS</p>
          <button
            type="button"
            onClick={() => copyText(globalClassCombo, 'global-mobile')}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300 hover:border-zinc-500"
          >
            {copyState.key === 'global-mobile' ? 'Copied ✓' : 'Copy global combo'}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3">
          <div className="flex items-center justify-between"><p className="text-xs text-zinc-300">Duration</p><span className="text-[10px] text-zinc-400">{duration}ms</span></div>
          <Slider min={0} max={durationPresets.length - 1} step={1} value={[durationPresets.indexOf(duration)]} onValueChange={(v) => setDuration(durationPresets[v[0]] ?? 1000)} />

          <div className="mt-2 flex items-center justify-between"><p className="text-xs text-zinc-300">Delay</p><span className="text-[10px] text-zinc-400">{delay}ms</span></div>
          <Slider min={0} max={delayPresets.length - 1} step={1} value={[delayPresets.indexOf(delay)]} onValueChange={(v) => setDelay(delayPresets[v[0]] ?? 0)} />

          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={easingClass} onValueChange={setEasingClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{easingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
            <Select value={directionClass} onValueChange={setDirectionClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{directionOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
            <Select value={fillClass} onValueChange={setFillClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fillOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </section>

      {copyState.key ? (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-3 py-1.5 text-xs shadow-lg shadow-black/30 ${copyState.tone === 'error' ? 'border-rose-400/40 bg-zinc-900 text-rose-200' : 'border-emerald-400/40 bg-zinc-900 text-emerald-200'}`}>
          {copyState.tone === 'error' ? 'Copy failed' : 'Copied to clipboard'}
        </div>
      ) : null}
    </main>
  )
}
