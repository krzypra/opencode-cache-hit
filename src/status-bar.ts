/**
 * Compact one-line session metrics for the prompt hint row (`session_prompt_right` slot).
 *
 * The sidebar only mounts when the TUI is wider than 120 columns, so this row is the
 * only place cache/speed/cost metrics stay visible on a narrow terminal. Kept as a pure
 * function so the composition is unit-testable without a renderer.
 */
import { cacheHitRatio } from "./stats.ts"
import { formatRatioAsPercent } from "./format-cache-ui.ts"
import { formatTokenCount } from "./format-tokens.ts"
import { formatTokenSpeed, formatTokenTpot } from "./token-speed.ts"
import type { SessionSnapshot } from "./types.ts"

export const STATUS_BAR_SEPARATOR = " · "

export type StatusBarInput = {
  snapshot: SessionSnapshot
  /** Tokens per second: live stream rate when streaming, else the last completed call. */
  speedTps?: number
  /** Render speed as tok/s (true) or ms/tok (false). */
  useTps: boolean
  formatCost: (amount: number) => string
}

/**
 * Input-side token total (fresh input + cache read + cache write), matching the
 * denominator used for the hit rate. Output tokens are excluded on purpose.
 */
export function statusBarContextTokens(snapshot: SessionSnapshot): number {
  return snapshot.input + snapshot.cacheRead + snapshot.cacheWrite
}

export function composeStatusBarSegments(input: StatusBarInput): string[] {
  const { snapshot } = input
  const segments: string[] = []

  const contextTokens = statusBarContextTokens(snapshot)
  if (contextTokens > 0) {
    segments.push(formatRatioAsPercent(cacheHitRatio(snapshot.cacheRead, snapshot.input)))
    segments.push(`${formatTokenCount(contextTokens)} tok`)
  }

  if (input.speedTps !== undefined && input.speedTps > 0) {
    segments.push(
      input.useTps ? formatTokenSpeed(input.speedTps) : formatTokenTpot(1000 / input.speedTps),
    )
  }

  if (snapshot.cost > 0) {
    const cost = input.formatCost(snapshot.cost)
    if (cost) segments.push(cost)
  }

  return segments
}

export function composeStatusBarText(input: StatusBarInput): string {
  return composeStatusBarSegments(input).join(STATUS_BAR_SEPARATOR)
}
