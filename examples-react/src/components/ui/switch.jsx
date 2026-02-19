import * as SwitchPrimitive from '@radix-ui/react-switch'

export function Switch(props) {
  return (
    <SwitchPrimitive.Root
      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-zinc-600 bg-zinc-800 transition-colors data-[state=checked]:bg-indigo-500/30 data-[state=checked]:border-indigo-400"
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-4 w-4 translate-x-1 rounded-full bg-zinc-300 ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-indigo-300" />
    </SwitchPrimitive.Root>
  )
}
