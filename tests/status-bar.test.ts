import { describe, expect, test } from "bun:test"
import {
  STATUS_BAR_SEPARATOR,
  composeStatusBarSegments,
  composeStatusBarText,
  statusBarContextTokens,
} from "../src/status-bar.ts"
import { lastCompletedTokenSpeed } from "../src/token-speed.ts"
import type { AssistantMessage, SessionSnapshot } from "../src/types.ts"

const snapshot = (over: Partial<SessionSnapshot> = {}): SessionSnapshot => ({
  model: "claude-opus-5",
  providerID: "github-copilot",
  input: 26_000_000,
  output: 528_000,
  reasoning: 114_400,
  cacheRead: 473_500_000,
  cacheWrite: 9_700_000,
  cost: 162.15,
  ...over,
})

const usd = (n: number) => (n > 0 ? `~$${n.toFixed(4)}` : "")

describe("statusBarContextTokens", () => {
  test("sums the input side only (fresh input + cache read + cache write)", () => {
    expect(statusBarContextTokens(snapshot())).toBe(26_000_000 + 473_500_000 + 9_700_000)
  })

  test("ignores output and reasoning tokens", () => {
    const withoutOutput = statusBarContextTokens(snapshot({ output: 0, reasoning: 0 }))
    expect(withoutOutput).toBe(statusBarContextTokens(snapshot()))
  })
})

describe("composeStatusBarSegments", () => {
  test("renders hit rate, context tokens, speed and cost", () => {
    const segments = composeStatusBarSegments({
      snapshot: snapshot(),
      speedTps: 90,
      useTps: true,
      formatCost: usd,
    })
    expect(segments).toEqual(["94.7%", "509.2M tok", "90 tok/s", "~$162.1500"])
  })

  test("renders speed as ms/tok when tps display is off", () => {
    const segments = composeStatusBarSegments({
      snapshot: snapshot(),
      speedTps: 50,
      useTps: false,
      formatCost: usd,
    })
    expect(segments[2]).toBe("20 ms/tok")
  })

  test("omits the speed segment when no speed is known", () => {
    const segments = composeStatusBarSegments({
      snapshot: snapshot(),
      speedTps: undefined,
      useTps: true,
      formatCost: usd,
    })
    expect(segments).toEqual(["94.7%", "509.2M tok", "~$162.1500"])
  })

  test("omits the cost segment when the session has no cost", () => {
    const segments = composeStatusBarSegments({
      snapshot: snapshot({ cost: 0 }),
      speedTps: 90,
      useTps: true,
      formatCost: usd,
    })
    expect(segments).toEqual(["94.7%", "509.2M tok", "90 tok/s"])
  })

  test("returns no segments for an empty session", () => {
    const segments = composeStatusBarSegments({
      snapshot: snapshot({ input: 0, cacheRead: 0, cacheWrite: 0, cost: 0 }),
      speedTps: undefined,
      useTps: true,
      formatCost: usd,
    })
    expect(segments).toEqual([])
    expect(composeStatusBarText({
      snapshot: snapshot({ input: 0, cacheRead: 0, cacheWrite: 0, cost: 0 }),
      useTps: true,
      formatCost: usd,
    })).toBe("")
  })
})

describe("composeStatusBarText", () => {
  test("joins segments with the middle-dot separator", () => {
    const text = composeStatusBarText({
      snapshot: snapshot(),
      speedTps: 90,
      useTps: true,
      formatCost: usd,
    })
    expect(text).toBe(`94.7%${STATUS_BAR_SEPARATOR}509.2M tok${STATUS_BAR_SEPARATOR}90 tok/s${STATUS_BAR_SEPARATOR}~$162.1500`)
  })
})

describe("lastCompletedTokenSpeed", () => {
  const message = (over: Partial<AssistantMessage>): AssistantMessage =>
    ({
      id: "msg_1",
      role: "assistant",
      time: { created: 1_000, completed: 3_000 },
      tokens: { input: 10, output: 180, reasoning: 0, cache: { read: 0, write: 0 } },
      ...over,
    }) as AssistantMessage

  test("uses the most recent completed assistant message", () => {
    const speed = lastCompletedTokenSpeed([
      message({ id: "msg_1", tokens: { output: 100, reasoning: 0 } }),
      message({ id: "msg_2", time: { created: 10_000, completed: 12_000 }, tokens: { output: 180, reasoning: 0 } }),
    ])
    expect(speed).toBeCloseTo(90, 5)
  })

  test("skips in-flight messages", () => {
    const speed = lastCompletedTokenSpeed([
      message({ id: "msg_1", tokens: { output: 100, reasoning: 0 } }),
      message({ id: "msg_2", time: { created: 10_000 }, tokens: { output: 999, reasoning: 0 } }),
    ])
    expect(speed).toBeCloseTo(50, 5)
  })

  test("returns undefined when nothing completed", () => {
    expect(lastCompletedTokenSpeed([])).toBeUndefined()
  })
})
