import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

export function Select({ children, ...props }) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
}

export function SelectTrigger({ className = '', children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={`flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectValue(props) {
  return <SelectPrimitive.Value {...props} />
}

export function SelectContent({ children }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-md">
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ children, ...props }) {
  return (
    <SelectPrimitive.Item
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-zinc-800"
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
