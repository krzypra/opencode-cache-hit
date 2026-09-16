/**
 * Preview the prompt status bar without running the TUI.
 *
 * Prints the composed one-line text for a few representative session states,
 * so the layout can be judged (and reviewed in a PR) before enabling the slot.
 *
 * Usage: bun run scripts/preview-status-bar.ts
 */
import { composeStatusBarText } from "../src/status-bar.ts"
import { createCostFormatter } from "../src/format-cost.ts"
import type { SessionSnapshot } from "../src/types.ts"

const usd = createCostFormatter({ currency: "USD", costUnit: "USD", rate: 1 })

const snapshot = (over: Partial<SessionSnapshot>): SessionSnapshot => ({
  model: "claude-opus-5",
  providerID: "github-copilot",
  input: 0,
  output: 0,
  reasoning: 0,
  cacheRead: 0,
  cacheWrite: 0,
  cost: 0,
  ...over,
})

const cases: Array<{ label: string; text: string }> = [
  {
    label: "fresh session (no calls yet)",
    text: composeStatusBarText({ snapshot: snapshot({}), useTps: true, formatCost: usd }),
  },
  {
    label: "first call, still streaming",
    text: composeStatusBarText({
      snapshot: snapshot({ input: 24_100, output: 320, cacheRead: 0, cacheWrite: 24_000, cost: 0.184 }),
      speedTps: 118,
      useTps: true,
      formatCost: usd,
    }),
  },
  {
    label: "warm session (tok/s)",
    text: composeStatusBarText({
      snapshot: snapshot({
        input: 26_000_000,
        output: 528_000,
        reasoning: 114_400,
        cacheRead: 473_500_000,
        cacheWrite: 9_700_000,
        cost: 162.15,
      }),
      speedTps: 90,
      useTps: true,
      formatCost: usd,
    }),
  },
  {
    label: "warm session (ms/tok)",
    text: composeStatusBarText({
      snapshot: snapshot({
        input: 26_000_000,
        output: 528_000,
        cacheRead: 473_500_000,
        cacheWrite: 9_700_000,
        cost: 162.15,
      }),
      speedTps: 90,
      useTps: false,
      formatCost: usd,
    }),
  },
  {
    label: "idle between calls (no speed yet)",
    text: composeStatusBarText({
      snapshot: snapshot({ input: 1_400_000, cacheRead: 6_000_000, cacheWrite: 120_000, cost: 1.5037 }),
      useTps: true,
      formatCost: usd,
    }),
  },
]

const width = Math.max(...cases.map((c) => c.label.length))
console.log("prompt hint row, right side:\n")
for (const { label, text } of cases) {
  console.log(`  ${label.padEnd(width)}  │ ${text || "(empty — nothing rendered)"}`)
}
console.log()
