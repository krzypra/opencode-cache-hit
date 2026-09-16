import { describe, expect, test } from "bun:test"
import {
  estimateTokens,
  formatDistTokenCount,
  computeTokenDistribution,
} from "../src/token-distribution.ts"

describe("estimateTokens", () => {
  test("returns 0 for empty or null strings", () => {
    expect(estimateTokens("")).toBe(0)
  })

  test("estimates ASCII prose at ~4 chars/token", () => {
    const text = "Hello world! This is a test sentence for estimating token counts."
    const est = estimateTokens(text)
    expect(est).toBe(Math.ceil(text.length / 4))
  })

  test("estimates JSON and code at ~3.5 chars/token", () => {
    const json = '{"name": "test", "value": 123, "enabled": true}'
    const est = estimateTokens(json)
    expect(est).toBe(Math.ceil(json.length / 3.5))

    const code = "import { foo } from 'bar';\nexport function test() { return 42; }"
    const codeEst = estimateTokens(code)
    expect(codeEst).toBe(Math.ceil(code.length / 3.5))
  })

  test("estimates CJK characters at ~1 token/character", () => {
    const cjk = "你好世界" // 4 CJK chars
    expect(estimateTokens(cjk)).toBe(4)
  })
})

describe("formatDistTokenCount", () => {
  test("formats numbers under 10k with commas", () => {
    expect(formatDistTokenCount(351)).toBe("351")
    expect(formatDistTokenCount(1169)).toBe("1,169")
    expect(formatDistTokenCount(9999)).toBe("9,999")
  })

  test("formats numbers between 10k and 1M as K", () => {
    expect(formatDistTokenCount(18900)).toBe("18.9K")
    expect(formatDistTokenCount(49100)).toBe("49.1K")
    expect(formatDistTokenCount(56200)).toBe("56.2K")
  })

  test("formats numbers over 1M as M", () => {
    expect(formatDistTokenCount(1200000)).toBe("1.2M")
  })
})

describe("computeTokenDistribution", () => {
  test("aggregates user messages, tool calls, tool results, and reasoning", () => {
    const messages = [
      {
        id: "msg_user_1",
        role: "user",
        system: "Custom system instruction",
      },
      {
        id: "msg_asst_1",
        role: "assistant",
        tokens: {
          output: 100,
          reasoning: 250,
        },
      },
    ]

    const partsMap: Record<string, unknown[]> = {
      msg_user_1: [
        { type: "text", text: "Please inspect the codebase." },
        { type: "file", source: { text: { value: "const x = 1;" } } },
      ],
      msg_asst_1: [
        {
          type: "tool",
          tool: "bash",
          state: {
            status: "completed",
            input: { command: "git status" },
            output: "On branch main\nnothing to commit",
          },
        },
        {
          type: "tool",
          tool: "task",
          state: {
            status: "completed",
            input: { prompt: "Explore authentication files", subagent_type: "explore" },
            output: "Finished exploration",
          },
        },
      ],
    }

    const dist = computeTokenDistribution(
      messages,
      (id) => partsMap[id],
      "Global system prompt",
    )

    expect(dist.hasData).toBe(true)
    expect(dist.system).toBeGreaterThan(0)
    expect(dist.user).toBeGreaterThan(0)
    expect(dist.reasoning).toBe(250)
    expect(dist.toolCall).toBeGreaterThan(0)
    expect(dist.toolResult).toBeGreaterThan(0)
    expect(dist.agent).toBeGreaterThan(0)
  })
})
