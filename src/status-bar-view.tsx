/** @jsxImportSource @opentui/solid */
import { createMemo, createSignal, onCleanup } from "solid-js"
import { composeStatusBarText } from "./status-bar.ts"
import {
  aggregateFromSessionObject,
  aggregateSessionFromMessages,
  emptySessionSnapshot,
  mainSessionHasStats,
} from "./stats.ts"
import { lastCompletedTokenSpeed } from "./token-speed.ts"
import { advanceStreamingNow, initialStreamingTickState } from "./streaming-state.ts"
import { buildPanelPalette } from "./tui-panel/palette.ts"
import type { AssistantMessage, OpenCodeTuiApi } from "./types.ts"

/** Poll interval while a stream is in flight; idle ticks are skipped by the phase check. */
const TICK_MS = 1000

/**
 * One-line metrics rendered to the right of the prompt hint row. Reads the same
 * session aggregate as the sidebar, so both surfaces cannot disagree.
 */
export function StatusBarView(props: {
  sessionId: string
  theme: Record<string, unknown>
  useTps: boolean
  api: OpenCodeTuiApi
}) {
  const [tick, setTick] = createSignal(0)
  const bump = () => setTick((v) => v + 1)

  const unsubscribe = props.api.event.on("message.updated", bump)
  const timer = setInterval(bump, TICK_MS)
  onCleanup(() => {
    unsubscribe?.()
    clearInterval(timer)
  })

  const pal = createMemo(() => buildPanelPalette(props.theme))

  const messages = createMemo(() => {
    void tick()
    const sid = props.sessionId
    if (!sid) return [] as AssistantMessage[]
    return (props.api.state.session.messages(sid) ?? []) as AssistantMessage[]
  })

  const snapshot = createMemo(() => {
    void tick()
    const sid = props.sessionId
    if (!sid) return emptySessionSnapshot()
    const session = props.api.state.session.get?.(sid)
    if (session) {
      const snap = aggregateFromSessionObject(session)
      if (mainSessionHasStats(snap)) return snap
    }
    return aggregateSessionFromMessages(messages())
  })

  let streamState = initialStreamingTickState()
  const speed = createMemo(() => {
    void tick()
    const next = advanceStreamingNow(streamState, {
      messages: messages(),
      part: props.api.state.part,
      now: Date.now(),
    })
    streamState = next
    if (next.speed > 0) return next.speed
    return lastCompletedTokenSpeed(messages())
  })

  const text = createMemo(() =>
    composeStatusBarText({
      snapshot: snapshot(),
      speedTps: speed(),
      useTps: props.useTps,
    }),
  )

  return <text fg={pal().muted}>{text()}</text>
}
