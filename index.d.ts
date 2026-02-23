export interface MotionKitOptions {
  durationScale?: Array<number | string>
  delayScale?: Array<number | string>
  [key: string]: unknown
}

declare function motionKit(options?: MotionKitOptions): {
  options: MotionKitOptions
  presets: Record<string, { name: string; keyframes: Record<string, unknown>; animations: Record<string, string> }>
  handler: (api: { addUtilities: (utils: Record<string, Record<string, string>>) => void }) => void
  config: {
    theme: {
      extend: {
        keyframes: Record<string, unknown>
        animation: Record<string, string>
      }
    }
  }
}

export = motionKit
