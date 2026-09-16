/** @jsxImportSource @opentui/solid */
import { CacheHitSidebarHost } from "./sidebar-host.tsx"
import { StatusBarView } from "./status-bar-view.tsx"
import { loadPluginConfig } from "./load-config.ts"
import { createCostFormatter, createRateFormatter } from "./format-cost.ts"
import type { OpenCodeTuiApi } from "./types.ts"

export const PLUGIN_ID = "opencode-cache-hit"

export const tui = async (api: OpenCodeTuiApi) => {
  const pluginConfig = loadPluginConfig()
  const formatCost = createCostFormatter(pluginConfig.cost)
  const formatRate = createRateFormatter(pluginConfig.cost)

  api.slots.register({
    order: 56,
    slots: {
      sidebar_content(ctx, props) {
        return (
          <CacheHitSidebarHost
            sessionId={props.session_id ?? ""}
            theme={ctx.theme.current}
            display={pluginConfig.display}
            timeline={pluginConfig.timeline}
            cacheTTL={pluginConfig.cacheTTL}
            dynamicPricing={pluginConfig.dynamicPricing}
            formatCost={formatCost}
            formatRate={formatRate}
            api={api}
          />
        )
      },
    },
  })

  if (pluginConfig.display.showStatusBar) {
    api.slots.register({
      order: 56,
      slots: {
        session_prompt_right(ctx, props) {
          return (
            <StatusBarView
              sessionId={props.session_id ?? ""}
              theme={ctx.theme.current}
              useTps={pluginConfig.display.speedUnit === "tps"}
              formatCost={formatCost}
              api={api}
            />
          )
        },
      },
    })
  }
}

const plugin = { id: PLUGIN_ID, tui }
export default plugin
