import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900/70 text-zinc-100', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-center justify-between p-4 pb-2', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4 pt-2', className)} {...props} />
}
