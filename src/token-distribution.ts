/**
 * Estimated token distribution breakdown across roles and content types.
 *
 * OpenCode/API reports total token usage per assistant message, but does not split
 * context across system prompt, user messages, tool calls, tool results, and reasoning.
 * This module estimates the footprint of each component using character-based BPE
 * heuristics (~3.5 chars/tok for code/JSON, ~4 chars/tok for prose, ~1 tok/char CJK),
 * matching real-world cl100k_base / o200k_base ratios.
 *
 * The estimation heuristic and the per-role split are ported from
 * opencode-visual-cache (MIT, Hotakus) — https://github.com/Hotakus/opencode-visual-cache
 * — whose sidebar showed the same breakdown. Reimplemented here as a standalone,
 * unit-tested module instead of inline panel code.
 */

export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0
  let ascii = 0
  let cjk = 0
  for (const c of text) {
    const code = c.codePointAt(0) ?? 0
    if (code >= 0x4e00 && code <= 0x9fff) cjk++ // CJK Unified
    else if (code >= 0x3040 && code <= 0x30ff) cjk++ // Hiragana/Katakana
    else if (code >= 0xac00 && code <= 0xd7a3) cjk++ // Hangul
    else if (code >= 0x1100 && code <= 0x11ff) cjk++ // Hangul Jamo
    else if (code >= 0x2e80 && code <= 0x2eff) cjk++ // CJK Radicals
    else ascii++
  }

  const trimmed = text.trimStart()
  const strippedFence = trimmed.replace(/^`{3}\w*\s*\n?/, "")
  const jsonLike =
    (strippedFence.startsWith("{") || strippedFence.startsWith("[")) &&
    /"[^"]+"\s*:/.test(text)
  const codeLike =
    !jsonLike &&
    /```|^import |^export |^function |^const |^let |^var |^class |^interface |^type |^def |^fn |^pub |^use |^mod |^package /m.test(
      text,
    )

  const asciiPerToken = jsonLike ? 3.5 : codeLike ? 3.5 : 4
  return Math.max(1, Math.ceil(ascii / asciiPerToken + cjk / 1.0))
}

export function formatDistTokenCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 10_000) return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString("en-US")
}

export interface TokenDist {
  system: number
  user: number
  agent: number
  toolCall: number
  toolResult: number
  reasoning: number
  hasData: boolean
}

export const emptyTokenDist = (): TokenDist => ({
  system: 0,
  user: 0,
  agent: 0,
  toolCall: 0,
  toolResult: 0,
  reasoning: 0,
  hasData: false,
})

export function computeTokenDistribution(
  messages: ReadonlyArray<unknown>,
  partGetter?: (messageId: string) => ReadonlyArray<unknown> | undefined,
  systemPrompt?: string,
): TokenDist {
  const dist = emptyTokenDist()
  if (systemPrompt) {
    dist.system += estimateTokens(systemPrompt)
  }

  for (const rawMsg of messages) {
    if (!rawMsg || typeof rawMsg !== "object") continue
    const msg = rawMsg as Record<string, unknown>
    const role = msg.role
    const msgId = String(msg.id ?? msg.messageID ?? "")

    if (role === "user") {
      if (typeof msg.system === "string") {
        dist.system += estimateTokens(msg.system)
      }
      const parts = msgId && partGetter ? partGetter(msgId) : undefined
      if (Array.isArray(parts)) {
        for (const rawPart of parts) {
          if (!rawPart || typeof rawPart !== "object") continue
          const p = rawPart as Record<string, unknown>
          if (p.type === "text" && !p.synthetic && !p.ignored && typeof p.text === "string") {
            dist.user += estimateTokens(p.text)
          } else if (p.type === "file") {
            const src = p.source as Record<string, unknown> | undefined
            const textVal = (src?.text as Record<string, unknown> | undefined)?.value
            if (typeof textVal === "string") {
              dist.user += estimateTokens(textVal)
            }
          }
        }
      }
    } else if (role === "assistant") {
      const tokens = msg.tokens as Record<string, unknown> | undefined
      if (typeof tokens?.reasoning === "number") {
        dist.reasoning += tokens.reasoning
      }

      const parts = msgId && partGetter ? partGetter(msgId) : undefined
      if (Array.isArray(parts)) {
        for (const rawPart of parts) {
          if (!rawPart || typeof rawPart !== "object") continue
          const p = rawPart as Record<string, unknown>
          if (p.type === "tool") {
            const state = p.state as Record<string, unknown> | undefined
            let rawInput = ""
            if (typeof state?.raw === "string") {
              rawInput = state.raw
            } else if (state?.input != null) {
              rawInput = typeof state.input === "string" ? state.input : JSON.stringify(state.input)
            }

            if (p.tool === "task" && state?.input && typeof state.input === "object") {
              const ti = state.input as Record<string, unknown>
              const prompt = typeof ti.prompt === "string" ? ti.prompt : ""
              const desc = typeof ti.description === "string" ? ti.description : ""
              dist.agent += estimateTokens(prompt || desc)
            } else if (rawInput) {
              dist.toolCall += estimateTokens(rawInput)
            }

            if (state?.status === "completed" && state.output != null) {
              const out = typeof state.output === "string" ? state.output : JSON.stringify(state.output)
              dist.toolResult += estimateTokens(out)
            } else if (state?.status === "error" && state.error != null) {
              const err = typeof state.error === "string" ? state.error : JSON.stringify(state.error)
              dist.toolResult += estimateTokens(err)
            }
          } else if (p.type === "subtask") {
            const prompt = typeof p.prompt === "string" ? p.prompt : ""
            const desc = typeof p.description === "string" ? p.description : ""
            dist.agent += estimateTokens(prompt || desc)
          }
        }
      }
    }
  }

  dist.hasData =
    dist.system + dist.user + dist.agent + dist.toolCall + dist.toolResult + dist.reasoning > 0
  return dist
}
