// @bun
// src/plugin.tsx
import { createComponent as _$createComponent8 } from "@opentui/solid";
import { memo as _$memo6 } from "@opentui/solid";

// src/sidebar-host.tsx
import { createComponent as _$createComponent7 } from "@opentui/solid";
import { createSignal as createSignal6, createMemo as createMemo7, createEffect as createEffect2, onCleanup as onCleanup4, untrack } from "solid-js";

// src/widget.tsx
import { setProp as _$setProp4 } from "@opentui/solid";
import { effect as _$effect4 } from "@opentui/solid";
import { insert as _$insert4 } from "@opentui/solid";
import { createElement as _$createElement4 } from "@opentui/solid";
import { memo as _$memo5 } from "@opentui/solid";
import { createComponent as _$createComponent6 } from "@opentui/solid";
import { createMemo as createMemo6, createSignal as createSignal5, Show as Show6 } from "solid-js";
// package.json
var package_default = {
  name: "opencode-cache-hit",
  version: "0.7.5-fork.1",
  description: "OpenCode TUI sidebar: prompt cache hit rate, tokens & cost with sub-agent rollup. Works with opencode-visual-cache; optional per-call JSONL timeline.",
  type: "module",
  license: "MIT",
  author: "mengzhu.zhu <mengzhu.loveyou@gmail.com>",
  contributors: [
    "krzypra (fork maintainer: token distribution, prompt status bar)"
  ],
  repository: {
    type: "git",
    url: "https://github.com/krzypra/opencode-cache-hit"
  },
  homepage: "https://github.com/krzypra/opencode-cache-hit#readme",
  bugs: "https://github.com/krzypra/opencode-cache-hit/issues",
  keywords: [
    "opencode",
    "opencode-plugin",
    "tui",
    "sidebar",
    "cache",
    "cache-hit",
    "cache-hit-rate",
    "prompt-cache",
    "token",
    "cost",
    "cost-tracking",
    "sub-agent",
    "agent",
    "opencode-visual-cache",
    "jsonl",
    "timeline"
  ],
  exports: {
    ".": "./index.tsx",
    "./tui": "./dist/tui.js",
    "./tui-panel": "./src/tui-panel/index.ts"
  },
  files: [
    "index.tsx",
    "src",
    "dist",
    "cache-hit.config.example.json",
    "LICENSE",
    "CONTEXT.md",
    "README.md",
    "README.zh-CN.md",
    "AGENTS.md",
    "CONTRIBUTING.md",
    "docs",
    "scripts"
  ],
  scripts: {
    test: "bun test tests/",
    check: "bun test tests/",
    syntax: "bun test tests/module-load.test.ts",
    build: "bun run scripts/build-tui.ts",
    hooks: "simple-git-hooks",
    prepack: "bun run build",
    prepublishOnly: "bun test tests/"
  },
  "simple-git-hooks": {
    "pre-push": "bun run build && git diff --quiet -- dist/tui.js || { echo 'dist/tui.js is stale \u2014 run bun run build and commit it'; exit 1; } && bun test tests/"
  },
  dependencies: {
    "solid-js": "^1.9.0"
  },
  peerDependencies: {
    "@opencode-ai/plugin": ">=1.14.0",
    "@opencode-ai/sdk": ">=1.14.0",
    "@opentui/core": ">=0.2.0",
    "@opentui/solid": ">=0.2.0"
  },
  devDependencies: {
    "@opentui/solid": "^0.4.5",
    "simple-git-hooks": "^2.13.1"
  }
};

// src/version.ts
var PLUGIN_VERSION = package_default.version;

// src/agents-view.tsx
import { memo as _$memo3 } from "@opentui/solid";
import { createComponent as _$createComponent3 } from "@opentui/solid";
import { createMemo as createMemo2, For, Show as Show3 } from "solid-js";

// src/cache-hit-rows.tsx
import { memo as _$memo2 } from "@opentui/solid";
import { createComponent as _$createComponent2 } from "@opentui/solid";
import { Show as Show2 } from "solid-js";

// src/format-tokens.ts
function formatTokenCount(n) {
  if (n >= 1e6)
    return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000)
    return (n / 1000).toFixed(1) + "K";
  return String(Math.round(n));
}

// src/tui-panel/layout.ts
var MIN_PANEL_WIDTH = 20;
var DEFAULT_PANEL_WIDTH = 28;
var PANEL_GUTTER = 6;
var UNIT_GAP = 1;
var HEADER_PREFIX = 2;
var HIT_LABEL_GAP = 1;
var HIT_BAR_BRACKETS = 2;
var HIT_BAR_GAP = 1;
var HIT_PCT_FIXED_WIDTH = 5;
function charColumns(c) {
  const code = c.codePointAt(0) ?? 0;
  if (code < 32)
    return 0;
  if (code < 127)
    return 1;
  if (code < 160)
    return 0;
  if (code >= 4352 && code <= 4447 || code >= 11904 && code <= 42191 || code >= 44032 && code <= 55203 || code >= 63744 && code <= 64255 || code >= 65040 && code <= 65135 || code >= 65281 && code <= 65376 || code >= 65504 && code <= 65510 || code >= 127744 && code <= 128591 || code >= 131072 && code <= 262141)
    return 2;
  return 1;
}
function visualWidth(s) {
  let w = 0;
  for (const c of s)
    w += charColumns(c);
  return w;
}
function truncateVisual(s, maxCols) {
  if (visualWidth(s) <= maxCols)
    return s;
  let result = "";
  let w = 0;
  for (const c of s) {
    const cw = charColumns(c);
    if (w + cw > maxCols - 1) {
      result += "\u2026";
      break;
    }
    result += c;
    w += cw;
  }
  return result;
}
function computeHitBarWidth(hitLabel, rowWidth, trendText, showTrend) {
  const trendSpace = showTrend ? HIT_LABEL_GAP + visualWidth(trendText) : 0;
  const overhead = visualWidth(hitLabel) + HIT_LABEL_GAP + HIT_BAR_BRACKETS + HIT_BAR_GAP + HIT_PCT_FIXED_WIDTH + trendSpace;
  return Math.max(3, rowWidth - overhead);
}
function justifyRow(label, value, rowWidth, unit = "") {
  const used = visualWidth(label) + visualWidth(value) + (unit ? visualWidth(unit) + UNIT_GAP : 0);
  const gap = Math.max(1, rowWidth - used);
  return label + " ".repeat(gap) + value + (unit ? " " + unit : "");
}
function sepAfterPrefix(prefix, rowWidth) {
  const rest = Math.max(1, rowWidth - visualWidth(prefix));
  return "\u2500".repeat(rest);
}
function separatorLine(width = 28) {
  return "\u2500".repeat(Math.max(8, width));
}
function padBeforeTitleSummary(panelWidth, gutter, titleWidth, summaryWidth) {
  return Math.max(1, panelWidth - gutter - HEADER_PREFIX - titleWidth - summaryWidth);
}
// src/tui-panel/palette.ts
var FALLBACK = {
  primary: "#8B9DAF",
  text: "#C5C5BB",
  muted: "#7A7A72",
  success: "#9CAF8B",
  warning: "#C5B88D",
  error: "#B08A8A",
  border: "#6B6B63"
};
function rgb(raw) {
  if (typeof raw === "string" && raw.startsWith("#")) {
    const h = raw.slice(1);
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  if (raw && typeof raw === "object") {
    const o = raw;
    if (typeof o.r === "number" && typeof o.g === "number" && typeof o.b === "number") {
      const scale = o.r > 1 || o.g > 1 || o.b > 1 ? 1 : 255;
      return { r: Math.round(o.r * scale), g: Math.round(o.g * scale), b: Math.round(o.b * scale) };
    }
  }
  return null;
}
function saturation(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  if (delta === 0)
    return 0;
  const L = (max + min) / 2;
  return L <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
}
function desaturateTo(raw, maxSat, fallback) {
  const c = rgb(raw);
  if (!c)
    return fallback;
  const sat = saturation(c.r, c.g, c.b);
  if (sat <= maxSat) {
    return "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  const luma = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
  let lo = 0, hi = 1;
  for (let i = 0;i < 12; i++) {
    const mid = (lo + hi) / 2;
    const nr = Math.round(c.r + (luma - c.r) * mid);
    const ng = Math.round(c.g + (luma - c.g) * mid);
    const nb = Math.round(c.b + (luma - c.b) * mid);
    if (saturation(nr, ng, nb) > maxSat)
      lo = mid;
    else
      hi = mid;
  }
  const nr = Math.round(c.r + (luma - c.r) * hi);
  const ng = Math.round(c.g + (luma - c.g) * hi);
  const nb = Math.round(c.b + (luma - c.b) * hi);
  return "#" + [nr, ng, nb].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}
var MAX_SAT = 0.28;
function toneBrandHex(hex, fallback) {
  return desaturateTo(hex, MAX_SAT, fallback);
}
function buildPanelPalette(theme) {
  const sat = (k, fb) => desaturateTo(theme[k], MAX_SAT, fb);
  return {
    primary: sat("primary", FALLBACK.primary),
    text: sat("text", FALLBACK.text),
    muted: sat("textMuted", FALLBACK.muted),
    success: sat("success", FALLBACK.success),
    warning: sat("warning", FALLBACK.warning),
    error: sat("error", FALLBACK.error),
    border: sat("border", FALLBACK.border)
  };
}
// src/tui-panel/use-panel-layout.ts
import { createEffect, createMemo, createSignal } from "solid-js";
function createPanelLayout(options) {
  const [panelWidth, setPanelWidth] = createSignal(DEFAULT_PANEL_WIDTH);
  let boxEl;
  const gutter = createMemo(() => options.border() ? PANEL_GUTTER : 0);
  const gauge = createMemo(() => Math.max(MIN_PANEL_WIDTH, panelWidth() - gutter()));
  const sep = createMemo(() => separatorLine(gauge()));
  const syncWidth = () => {
    const w = boxEl?.width;
    if (typeof w === "number" && w > 0) {
      const next = Math.max(MIN_PANEL_WIDTH, w);
      setPanelWidth((prev) => prev === next ? prev : next);
    }
  };
  createEffect(() => {
    options.border();
    syncWidth();
  });
  const row = (label, value, unit = "") => justifyRow(label, value, gauge(), unit);
  return {
    panelWidth,
    gutter,
    gauge,
    sep,
    row,
    syncWidth,
    get boxRef() {
      return boxEl;
    },
    set boxRef(el) {
      boxEl = el;
    }
  };
}
function createSectionFold(initial = true) {
  const [open, setOpen] = createSignal(initial);
  return {
    open,
    setOpen,
    toggle: () => setOpen((o) => !o)
  };
}
// src/tui-panel/components.tsx
import { createComponent as _$createComponent } from "@opentui/solid";
import { setProp as _$setProp } from "@opentui/solid";
import { effect as _$effect } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { use as _$use } from "@opentui/solid";
import { spread as _$spread } from "@opentui/solid";
import { mergeProps as _$mergeProps } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { Show } from "solid-js";
function TuiPanel(props) {
  const bindRef = (el) => {
    props.layout.boxRef = el;
  };
  return (() => {
    var _el$ = _$createElement("box");
    _$use(bindRef, _el$);
    _$spread(_el$, _$mergeProps({
      get onSizeChange() {
        return props.layout.syncWidth;
      },
      get border() {
        return props.border;
      }
    }, () => props.border ? {
      borderColor: props.pal.border
    } : {}, {
      paddingTop: 0,
      paddingBottom: 0,
      get paddingLeft() {
        return props.border ? 2 : 0;
      },
      get paddingRight() {
        return props.border ? 2 : 0;
      },
      flexDirection: "column",
      gap: 0,
      width: "100%"
    }), true);
    _$insert(_el$, () => props.children);
    return _el$;
  })();
}
function TuiPanelTitle(props) {
  return (() => {
    var _el$2 = _$createElement("text"), _el$3 = _$createElement("span"), _el$4 = _$createElement("span"), _el$5 = _$createElement("b");
    _$insertNode(_el$2, _el$3);
    _$insertNode(_el$2, _el$4);
    _$insert(_el$3, () => props.open ? "\u25BC " : "\u25B6 ");
    _$insertNode(_el$4, _el$5);
    _$insert(_el$5, () => props.title);
    _$insert(_el$4, _$createComponent(Show, {
      get when() {
        return _$memo(() => !!props.open)() && props.version;
      },
      get children() {
        var _el$6 = _$createElement("span"), _el$7 = _$createTextNode(` (v`), _el$8 = _$createTextNode(`)`);
        _$insertNode(_el$6, _el$7);
        _$insertNode(_el$6, _el$8);
        _$insert(_el$6, () => props.version, _el$8);
        _$effect((_$p) => _$setProp(_el$6, "style", {
          fg: props.pal.muted
        }, _$p));
        return _el$6;
      }
    }), null);
    _$insert(_el$2, _$createComponent(Show, {
      get when() {
        return _$memo(() => !!!props.open)() && props.collapsed;
      },
      get children() {
        return props.collapsed;
      }
    }), null);
    _$effect((_p$) => {
      var _v$ = props.onToggle, _v$2 = {
        fg: props.pal.muted
      }, _v$3 = {
        fg: props.pal.primary
      };
      _v$ !== _p$.e && (_p$.e = _$setProp(_el$2, "onMouseUp", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp(_el$3, "style", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp(_el$4, "style", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$2;
  })();
}
function TuiTitleSummaryPad(props) {
  const spaces = () => padBeforeTitleSummary(props.layout.panelWidth(), props.layout.gutter(), props.titleWidth, props.summaryWidth);
  return (() => {
    var _el$9 = _$createElement("span");
    _$insert(_el$9, () => " ".repeat(spaces()), null);
    _$insert(_el$9, () => props.children, null);
    return _el$9;
  })();
}
function TuiPanelSep(props) {
  return (() => {
    var _el$0 = _$createElement("text");
    _$insert(_el$0, () => props.layout.sep());
    _$effect((_$p) => _$setProp(_el$0, "fg", props.pal.muted, _$p));
    return _el$0;
  })();
}
function TuiPanelNoData(props) {
  return [_$createComponent(TuiPanelSep, {
    get pal() {
      return props.pal;
    },
    get layout() {
      return props.layout;
    }
  }), (() => {
    var _el$1 = _$createElement("text"), _el$10 = _$createElement("span"), _el$12 = _$createElement("span");
    _$insertNode(_el$1, _el$10);
    _$insertNode(_el$1, _el$12);
    _$insertNode(_el$10, _$createTextNode(`> `));
    _$insert(_el$12, () => props.message);
    _$effect((_p$) => {
      var _v$4 = {
        fg: props.pal.muted
      }, _v$5 = {
        fg: props.pal.muted
      };
      _v$4 !== _p$.e && (_p$.e = _$setProp(_el$10, "style", _v$4, _p$.e));
      _v$5 !== _p$.t && (_p$.t = _$setProp(_el$12, "style", _v$5, _p$.t));
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$1;
  })()];
}
function TuiSection(props) {
  const prefix = () => `${props.open ? "\u25BC " : "\u25B6 "}${props.title}${props.suffix ?? ""}`;
  return [(() => {
    var _el$13 = _$createElement("text"), _el$14 = _$createElement("span"), _el$15 = _$createElement("span"), _el$16 = _$createElement("b"), _el$18 = _$createElement("span");
    _$insertNode(_el$13, _el$14);
    _$insertNode(_el$13, _el$15);
    _$insertNode(_el$13, _el$18);
    _$insert(_el$14, () => props.open ? "\u25BC " : "\u25B6 ");
    _$insertNode(_el$15, _el$16);
    _$insert(_el$16, () => props.title);
    _$insert(_el$13, _$createComponent(Show, {
      get when() {
        return props.suffix;
      },
      get children() {
        var _el$17 = _$createElement("span");
        _$insert(_el$17, () => props.suffix);
        _$effect((_$p) => _$setProp(_el$17, "style", {
          fg: props.pal.muted
        }, _$p));
        return _el$17;
      }
    }), _el$18);
    _$insert(_el$18, () => sepAfterPrefix(prefix(), props.layout.gauge()));
    _$effect((_p$) => {
      var _v$6 = props.onToggle, _v$7 = {
        fg: props.pal.muted
      }, _v$8 = {
        fg: props.pal.primary
      }, _v$9 = {
        fg: props.pal.muted
      };
      _v$6 !== _p$.e && (_p$.e = _$setProp(_el$13, "onMouseUp", _v$6, _p$.e));
      _v$7 !== _p$.t && (_p$.t = _$setProp(_el$14, "style", _v$7, _p$.t));
      _v$8 !== _p$.a && (_p$.a = _$setProp(_el$15, "style", _v$8, _p$.a));
      _v$9 !== _p$.o && (_p$.o = _$setProp(_el$18, "style", _v$9, _p$.o));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined
    });
    return _el$13;
  })(), _$createComponent(Show, {
    get when() {
      return props.open;
    },
    get children() {
      return props.children;
    }
  })];
}
function metricRowGap(label, value, unit, gauge) {
  const used = visualWidth(label) + visualWidth(value) + (unit ? visualWidth(unit) + UNIT_GAP : 0);
  return Math.max(1, gauge - used);
}
function TuiMetricRow(props) {
  const unit = props.unit ?? "";
  const unitSuffix = unit ? " " + unit : "";
  const split = props.labelFg !== undefined || props.valueFg !== undefined;
  if (split) {
    const gap = metricRowGap(props.label, props.value, unit, props.layout.gauge());
    const labelColor = props.labelFg ?? props.fg ?? props.pal.muted;
    const valueColor = props.valueFg ?? props.fg ?? props.pal.muted;
    return (() => {
      var _el$19 = _$createElement("text"), _el$20 = _$createElement("span"), _el$21 = _$createElement("span");
      _$insertNode(_el$19, _el$20);
      _$insertNode(_el$19, _el$21);
      _$setProp(_el$20, "style", {
        fg: labelColor
      });
      _$insert(_el$20, () => props.label);
      _$insert(_el$19, () => " ".repeat(gap), _el$21);
      _$setProp(_el$21, "style", {
        fg: valueColor
      });
      _$insert(_el$21, () => props.value, null);
      _$insert(_el$21, unitSuffix, null);
      return _el$19;
    })();
  }
  return (() => {
    var _el$22 = _$createElement("text");
    _$insert(_el$22, () => props.layout.row(props.label, props.value, unit));
    _$effect((_$p) => _$setProp(_el$22, "fg", props.fg ?? props.pal.muted, _$p));
    return _el$22;
  })();
}
function TuiHitRow(props) {
  return (() => {
    var _el$23 = _$createElement("text"), _el$24 = _$createElement("span"), _el$25 = _$createTextNode(` `), _el$26 = _$createElement("span"), _el$27 = _$createTextNode(`[`), _el$28 = _$createTextNode(`] `), _el$29 = _$createElement("span");
    _$insertNode(_el$23, _el$24);
    _$insertNode(_el$23, _el$26);
    _$insertNode(_el$23, _el$29);
    _$insertNode(_el$24, _el$25);
    _$insert(_el$24, () => props.label, _el$25);
    _$insertNode(_el$26, _el$27);
    _$insertNode(_el$26, _el$28);
    _$insert(_el$26, () => props.bar, _el$28);
    _$insert(_el$29, () => props.pct);
    _$insert(_el$23, _$createComponent(Show, {
      get when() {
        return props.trend;
      },
      get children() {
        var _el$30 = _$createElement("span"), _el$31 = _$createTextNode(` `);
        _$insertNode(_el$30, _el$31);
        _$insert(_el$30, () => props.trend?.text, null);
        _$effect((_$p) => _$setProp(_el$30, "style", {
          fg: props.trend?.color
        }, _$p));
        return _el$30;
      }
    }), null);
    _$effect((_p$) => {
      var _v$0 = {
        fg: props.textColor
      }, _v$1 = {
        fg: props.barColor
      }, _v$10 = {
        fg: props.textColor
      };
      _v$0 !== _p$.e && (_p$.e = _$setProp(_el$24, "style", _v$0, _p$.e));
      _v$1 !== _p$.t && (_p$.t = _$setProp(_el$26, "style", _v$1, _p$.t));
      _v$10 !== _p$.a && (_p$.a = _$setProp(_el$29, "style", _v$10, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$23;
  })();
}
// src/cache-hit-rows.tsx
function TokenDetailRows(props) {
  const tok = (n) => formatTokenCount(n);
  return [_$createComponent2(Show2, {
    get when() {
      return props.snap.cacheRead > 0;
    },
    get children() {
      return _$createComponent2(TuiMetricRow, {
        get pal() {
          return props.pal;
        },
        get layout() {
          return props.layout;
        },
        get label() {
          return props.t.read;
        },
        get value() {
          return tok(props.snap.cacheRead);
        },
        get unit() {
          return props.t.tok;
        }
      });
    }
  }), _$createComponent2(Show2, {
    get when() {
      return props.snap.cacheWrite > 0;
    },
    get children() {
      return _$createComponent2(TuiMetricRow, {
        get pal() {
          return props.pal;
        },
        get layout() {
          return props.layout;
        },
        get label() {
          return props.t.write;
        },
        get value() {
          return tok(props.snap.cacheWrite);
        },
        get unit() {
          return props.t.tok;
        }
      });
    }
  }), _$createComponent2(TuiMetricRow, {
    get pal() {
      return props.pal;
    },
    get layout() {
      return props.layout;
    },
    get label() {
      return props.t.miss;
    },
    get value() {
      return tok(props.snap.input);
    },
    get unit() {
      return props.t.tok;
    }
  }), _$createComponent2(TuiMetricRow, {
    get pal() {
      return props.pal;
    },
    get layout() {
      return props.layout;
    },
    get label() {
      return props.t.out;
    },
    get value() {
      return tok(props.snap.output);
    },
    get unit() {
      return props.t.tok;
    }
  }), _$createComponent2(Show2, {
    get when() {
      return props.snap.reasoning > 0;
    },
    get children() {
      return _$createComponent2(TuiMetricRow, {
        get pal() {
          return props.pal;
        },
        get layout() {
          return props.layout;
        },
        get label() {
          return props.t.reasoning;
        },
        get value() {
          return tok(props.snap.reasoning);
        },
        get unit() {
          return props.t.tok;
        }
      });
    }
  }), _$memo2(() => props.children)];
}

// src/stats.ts
function mainSessionHasStats(main) {
  return main.cacheRead > 0 || main.cacheWrite > 0 || main.cost > 0 || main.input > 0 || main.output > 0;
}
function emptySessionSnapshot() {
  return { model: "", providerID: "", input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, cost: 0 };
}
function aggregateFromSessionObject(session) {
  const t = session.tokens;
  const c = t?.cache;
  return {
    model: session.model?.id ?? "",
    providerID: session.model?.providerID ?? "",
    input: t?.input ?? 0,
    output: t?.output ?? 0,
    reasoning: t?.reasoning ?? 0,
    cacheRead: c?.read ?? 0,
    cacheWrite: c?.write ?? 0,
    cost: session.cost ?? 0
  };
}
function aggregateSessionFromMessages(messages) {
  let model = "", providerID = "", input = 0, output = 0, reasoning = 0, cacheRead = 0, cacheWrite = 0, cost = 0;
  for (const msg of messages) {
    if (msg.role !== "assistant" || !isInteractiveAssistantMessage(msg))
      continue;
    const t = msg.tokens ?? {};
    input += t.input ?? 0;
    output += t.output ?? 0;
    reasoning += t.reasoning ?? 0;
    cacheRead += t.cache?.read ?? 0;
    cacheWrite += t.cache?.write ?? 0;
    cost += msg.cost ?? 0;
    if (msg.modelID)
      model = msg.modelID;
    if (msg.providerID)
      providerID = msg.providerID;
  }
  return { model, providerID, input, output, reasoning, cacheRead, cacheWrite, cost };
}
function toSubAgentSummary(id, snap, speed, created) {
  return {
    id,
    model: snap.model,
    providerID: snap.providerID,
    cost: snap.cost,
    input: snap.input,
    output: snap.output,
    reasoning: snap.reasoning,
    cacheRead: snap.cacheRead,
    cacheWrite: snap.cacheWrite,
    speed,
    created
  };
}
function aggregateSubAgents(subs) {
  const total = emptySessionSnapshot();
  for (const s of subs) {
    total.input += s.input;
    total.output += s.output;
    total.reasoning += s.reasoning;
    total.cacheRead += s.cacheRead;
    total.cacheWrite += s.cacheWrite;
    total.cost += s.cost;
  }
  return total;
}
function cacheHitRatio(cacheRead, input) {
  const denom = cacheRead + input;
  return denom > 0 ? cacheRead / denom : 0;
}
function subAgentHasStats(snap) {
  return snap.cost > 0 || snap.cacheRead > 0 || snap.cacheWrite > 0 || snap.input > 0 || snap.output > 0 || snap.reasoning > 0;
}
function withModelFallback(snap, messages) {
  if (snap.model && snap.providerID)
    return snap;
  let model = snap.model;
  let providerID = snap.providerID;
  for (let i = messages.length - 1;i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant")
      continue;
    if (!model && m.modelID)
      model = m.modelID;
    if (!providerID && m.providerID)
      providerID = m.providerID;
    if (model && providerID)
      break;
  }
  return model === snap.model && providerID === snap.providerID ? snap : { ...snap, model, providerID };
}
var UNKNOWN_LINEAGE_KEY = "unknown";
function isInteractiveAssistantMessage(msg) {
  return msg.summary !== true && msg.agent !== "compaction";
}
function messageLineageKey(msg) {
  return msg.providerID && msg.modelID ? `${msg.providerID}:${msg.modelID}` : UNKNOWN_LINEAGE_KEY;
}
function compareAssistantMessages(a, b) {
  const aCompleted = a.time?.completed ?? -Infinity;
  const bCompleted = b.time?.completed ?? -Infinity;
  if (aCompleted !== bCompleted)
    return aCompleted - bCompleted;
  const aCreated = a.time?.created ?? -Infinity;
  const bCreated = b.time?.created ?? -Infinity;
  if (aCreated !== bCreated)
    return aCreated - bCreated;
  return (a.id ?? a.messageID ?? "").localeCompare(b.id ?? b.messageID ?? "");
}
function perMessageHitPercent(msg) {
  if (msg.role !== "assistant" || !isInteractiveAssistantMessage(msg))
    return null;
  const t = msg.tokens;
  if (!t)
    return null;
  const input = t.input ?? 0;
  const read = t.cache?.read ?? 0;
  const denom = read + input;
  if (denom <= 0)
    return null;
  return read / denom * 100;
}
function computePerCallHitTrend(messages) {
  const calls = messages.filter((msg) => msg.role === "assistant" && isInteractiveAssistantMessage(msg)).slice().sort(compareAssistantMessages).map((msg) => ({
    msg,
    hit: perMessageHitPercent(msg)
  })).filter((call) => call.hit !== null);
  const last = calls[calls.length - 1];
  if (!last) {
    return { hitPercent: 0, trendPercent: 0, hasTrend: false, state: "warming" };
  }
  const previous = calls[calls.length - 2];
  const hit = last.hit ?? 0;
  const switched = Boolean(previous && messageLineageKey(last.msg) !== messageLineageKey(previous.msg));
  const state = !previous ? "warming" : switched ? "switch" : "steady";
  return {
    hitPercent: hit,
    trendPercent: previous && !switched ? hit - (previous.hit ?? 0) : 0,
    hasTrend: Boolean(previous && !switched),
    state
  };
}
function shortModelName(modelId) {
  if (!modelId)
    return "";
  return modelId.includes("/") ? modelId.split("/").pop() ?? modelId : modelId;
}

// src/format-model.ts
var INDENT_COLS = 2;
var MIN_ROW_GAP = 1;
var MIN_LABEL_BUDGET = 6;
var ID_TAIL_DEFAULT = 6;
var ID_TAIL_MIN = 4;
var MODEL_BRAND_HEX = {
  claude: "#D4A574",
  deepseek: "#4D6BFE",
  openai: "#10A37F",
  gemini: "#5B8DEF",
  qwen: "#6157E5",
  glm: "#2F67F6",
  kimi: "#5B8FF9",
  minimax: "#FF6B35",
  grok: "#A8ADB8",
  mimo: "#7C6FE8",
  meta: "#0668E1",
  mistral: "#FF8200"
};
var UNKNOWN_BRAND_HEX = ["#8B9DAF", "#9CAF8B", "#A89BBF", "#B0A080"];
var MODEL_FAMILY_RULES = [
  {
    id: "claude",
    match: (n, p) => p === "anthropic" || n.startsWith("claude-") || /(^|-)(sonnet|opus|haiku)(-|$)/i.test(n)
  },
  {
    id: "deepseek",
    match: (n, p) => p === "deepseek" || n.startsWith("deepseek-")
  },
  {
    id: "openai",
    match: (n, p) => p === "openai" || n.startsWith("gpt-") || /^o[13](-|$)/.test(n) || n.startsWith("chatgpt-")
  },
  {
    id: "gemini",
    match: (n, p) => p === "google" || n.startsWith("gemini-")
  },
  {
    id: "qwen",
    match: (n, p) => p === "qwen" || p === "alibaba" || n.startsWith("qwen")
  },
  {
    id: "glm",
    match: (n, p) => p === "zhipu" || p === "zhipuai" || n.startsWith("glm-") || n.includes("chatglm")
  },
  {
    id: "kimi",
    match: (n, p) => p === "moonshot" || n.startsWith("kimi-")
  },
  {
    id: "minimax",
    match: (n, p) => p === "minimax" || n.startsWith("minimax")
  },
  {
    id: "grok",
    match: (n, p) => p === "x-ai" || p === "xai" || n.startsWith("grok-")
  },
  {
    id: "mimo",
    match: (n, p) => p === "mimo" || n.startsWith("mimo-")
  },
  {
    id: "meta",
    match: (n, p) => p === "meta" || n.startsWith("llama-") || n.includes("meta-llama")
  },
  {
    id: "mistral",
    match: (n, p) => p === "mistral" || n.startsWith("mistral-") || n.startsWith("codestral-")
  }
];
function stripModelDateSuffix(name) {
  return name.replace(/-20\d{6,}$/, "").replace(/-\d{8}$/, "");
}
function displayModelName(modelId) {
  const name = shortModelName(modelId);
  if (!name)
    return "";
  return stripModelDateSuffix(name);
}
function normalizeForFamilyMatch(s) {
  return s.toLowerCase();
}
function findFamilyRule(name, providerID) {
  const n = normalizeForFamilyMatch(name);
  const p = normalizeForFamilyMatch(providerID);
  return MODEL_FAMILY_RULES.find((r) => r.match(n, p));
}
function modelFamilyId(modelId, providerID) {
  const name = shortModelName(modelId);
  if (!name)
    return null;
  return findFamilyRule(name, providerID)?.id ?? null;
}
function stableHash(s) {
  let h = 5381;
  for (let i = 0;i < s.length; i++)
    h = h * 33 ^ s.charCodeAt(i);
  return h >>> 0;
}
function modelRowColor(modelId, providerID, pal) {
  const fallback = pal.muted;
  const family = modelFamilyId(modelId, providerID);
  if (family)
    return toneBrandHex(MODEL_BRAND_HEX[family], fallback);
  const name = shortModelName(modelId);
  const key = providerID || name.split("-")[0] || name;
  const idx = stableHash(key) % UNKNOWN_BRAND_HEX.length;
  return toneBrandHex(UNKNOWN_BRAND_HEX[idx], fallback);
}
function sessionIdTail(id, tailLen) {
  if (!id)
    return "";
  if (id.length <= tailLen)
    return id;
  return "\u2026" + id.slice(-tailLen);
}
function subAgentLabelBudget(gauge, value, unit) {
  const rightW = visualWidth(value) + (unit ? visualWidth(unit) + UNIT_GAP : 0);
  return Math.max(MIN_LABEL_BUDGET, gauge - rightW - INDENT_COLS - MIN_ROW_GAP);
}
function formatSubAgentLabel(sub, gauge, formatCost, tokUnit) {
  const value = sub.cost > 0 ? formatCost(sub.cost) : formatTokenCount(sub.input);
  const unit = sub.cost > 0 ? "" : tokUnit;
  const budget = subAgentLabelBudget(gauge, value, unit);
  if (!shortModelName(sub.model)) {
    return truncateVisual(sessionIdTail(sub.id, ID_TAIL_DEFAULT), budget);
  }
  const model = displayModelName(sub.model);
  return joinModelAndSessionId(model, sub.id, budget);
}
function joinModelAndSessionId(model, id, budget) {
  if (!model) {
    return truncateVisual(sessionIdTail(id, ID_TAIL_DEFAULT), budget);
  }
  const tryPair = (tailLen, trimModel) => {
    const idPart = sessionIdTail(id, tailLen);
    const idBlockW = visualWidth(idPart) + 1;
    if (budget <= idBlockW)
      return null;
    const modelPart = trimModel ? truncateVisual(model, budget - idBlockW) : model;
    if (!modelPart)
      return null;
    const combined = modelPart + " " + idPart;
    return visualWidth(combined) <= budget ? combined : null;
  };
  for (const tailLen of [ID_TAIL_DEFAULT, ID_TAIL_MIN]) {
    const full = tryPair(tailLen, false);
    if (full)
      return full;
  }
  for (const tailLen of [ID_TAIL_MIN, ID_TAIL_DEFAULT]) {
    const trimmed = tryPair(tailLen, true);
    if (trimmed)
      return trimmed;
  }
  return truncateVisual(model, budget);
}

// src/agents-view.tsx
function subHasActivity(sub) {
  return sub.cost > 0 || sub.cacheRead > 0 || sub.cacheWrite > 0 || sub.input > 0;
}
function AgentsView(props) {
  const {
    m,
    layout
  } = props;
  const total = () => aggregateSubAgents(m.subs());
  const subsSaved = () => m.subsSaved();
  const shownSubCost = createMemo2(() => {
    const map = m.subAgentDynamicCosts();
    let sum = 0;
    for (const sub of m.subs()) {
      const rec = map.get(sub.id);
      sum += rec !== undefined && rec !== null ? rec : sub.cost;
    }
    return sum;
  });
  return [_$createComponent3(TokenDetailRows, {
    get pal() {
      return m.pal();
    },
    layout,
    get t() {
      return m.t();
    },
    get snap() {
      return total();
    },
    get children() {
      return _$createComponent3(Show3, {
        get when() {
          return subsSaved() > 0;
        },
        get children() {
          return _$createComponent3(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().saved;
            },
            get value() {
              return props.formatCost(subsSaved());
            },
            get fg() {
              return m.pal().success;
            }
          });
        }
      });
    }
  }), _$createComponent3(Show3, {
    get when() {
      return shownSubCost() > 0;
    },
    get children() {
      return _$createComponent3(TuiMetricRow, {
        get pal() {
          return m.pal();
        },
        layout,
        get label() {
          return m.t().cost;
        },
        get value() {
          return props.formatCost(shownSubCost());
        },
        get fg() {
          return m.pal().success;
        }
      });
    }
  }), _$createComponent3(For, {
    get each() {
      return m.subs();
    },
    children: (sub) => _$createComponent3(Show3, {
      get when() {
        return subHasActivity(sub);
      },
      get children() {
        return [_$createComponent3(TuiMetricRow, {
          get pal() {
            return m.pal();
          },
          layout,
          get label() {
            return "  " + formatSubAgentLabel(sub, layout.gauge(), props.formatCost, m.t().tok);
          },
          get value() {
            return _$memo3(() => sub.cost > 0)() ? props.formatCost(sub.cost) : formatTokenCount(sub.input);
          },
          get unit() {
            return _$memo3(() => sub.cost > 0)() ? "" : m.t().tok;
          },
          get labelFg() {
            return modelRowColor(sub.model, sub.providerID, m.pal());
          },
          get valueFg() {
            return m.pal().muted;
          }
        }), _$createComponent3(Show3, {
          get when() {
            return sub.speed !== undefined;
          },
          get children() {
            return _$createComponent3(TuiMetricRow, {
              get pal() {
                return m.pal();
              },
              layout,
              label: "    ",
              get value() {
                return props.formatSpeed(sub.speed);
              },
              get fg() {
                return m.pal().muted;
              }
            });
          }
        })];
      }
    })
  })];
}

// src/main-session-view.tsx
import { setProp as _$setProp3 } from "@opentui/solid";
import { effect as _$effect3 } from "@opentui/solid";
import { insert as _$insert3 } from "@opentui/solid";
import { createElement as _$createElement3 } from "@opentui/solid";
import { createComponent as _$createComponent5 } from "@opentui/solid";
import { memo as _$memo4 } from "@opentui/solid";
import { Show as Show5, createMemo as createMemo4, createSignal as createSignal3, onCleanup as onCleanup2 } from "solid-js";

// src/cache-ttl-view.tsx
import { createComponent as _$createComponent4 } from "@opentui/solid";
import { setProp as _$setProp2 } from "@opentui/solid";
import { effect as _$effect2 } from "@opentui/solid";
import { insert as _$insert2 } from "@opentui/solid";
import { createElement as _$createElement2 } from "@opentui/solid";
import { createMemo as createMemo3, createSignal as createSignal2, onCleanup, Show as Show4 } from "solid-js";

// src/format-cost.ts
var CURRENCY_PRESETS = {
  USD: { symbol: "$", decimals: 4, minDisplay: 0.0001 },
  CNY: { symbol: "\xA5", decimals: 3, minDisplay: 0.01 },
  EUR: { symbol: "\u20AC", decimals: 3, minDisplay: 0.01 },
  GBP: { symbol: "\xA3", decimals: 3, minDisplay: 0.01 },
  JPY: { symbol: "\xA5", decimals: 2, minDisplay: 1 }
};
var DEFAULT_COST_DISPLAY = {
  currency: "CNY",
  costUnit: "USD",
  rate: 6.77
};
function resolveExchangeRate(cfg) {
  if (cfg.convert?.rate && cfg.convert.rate > 0)
    return cfg.convert.rate;
  if (cfg.rate && cfg.rate > 0)
    return cfg.rate;
  const unit = cfg.costUnit ?? "USD";
  if (unit === cfg.currency)
    return 1;
  return 1;
}
function normalizeCostDisplay(raw) {
  if (!raw || typeof raw !== "object")
    return structuredClone(DEFAULT_COST_DISPLAY);
  const o = raw;
  const currency = typeof o.currency === "string" && o.currency in CURRENCY_PRESETS ? o.currency : DEFAULT_COST_DISPLAY.currency;
  const cfg = { currency };
  if (typeof o.symbol === "string" && o.symbol.length > 0)
    cfg.symbol = o.symbol;
  if (typeof o.decimals === "number" && o.decimals >= 0)
    cfg.decimals = o.decimals;
  if (typeof o.minDisplay === "number" && o.minDisplay > 0)
    cfg.minDisplay = o.minDisplay;
  if (typeof o.costUnit === "string" && o.costUnit in CURRENCY_PRESETS) {
    cfg.costUnit = o.costUnit;
  }
  if (typeof o.rate === "number" && o.rate > 0)
    cfg.rate = o.rate;
  const c = o.convert;
  if (c && typeof c === "object") {
    const co = c;
    if (typeof co.from === "string" && co.from in CURRENCY_PRESETS && typeof co.rate === "number" && co.rate > 0) {
      cfg.convert = { from: co.from, rate: co.rate };
    }
  }
  if (!cfg.costUnit && !cfg.convert)
    cfg.costUnit = DEFAULT_COST_DISPLAY.costUnit;
  if (!cfg.rate && !cfg.convert?.rate && cfg.costUnit !== cfg.currency) {
    cfg.rate = DEFAULT_COST_DISPLAY.rate;
  }
  return cfg;
}
function createCostFormatter(config) {
  const preset = CURRENCY_PRESETS[config.currency];
  const symbol = config.symbol ?? preset.symbol;
  const decimals = config.decimals ?? preset.decimals;
  const minDisplay = config.minDisplay ?? preset.minDisplay;
  const unit = config.costUnit ?? config.convert?.from ?? "USD";
  const rate = unit === config.currency ? 1 : resolveExchangeRate(config);
  return (amount) => {
    if (amount <= 0)
      return "";
    const v = amount * rate;
    if (v < minDisplay)
      return `<${symbol}${minDisplay}`;
    return "~" + symbol + v.toFixed(decimals);
  };
}
function createRateFormatter(config) {
  const preset = CURRENCY_PRESETS[config.currency];
  const symbol = config.symbol ?? preset.symbol;
  const unit = config.costUnit ?? config.convert?.from ?? "USD";
  const rate = unit === config.currency ? 1 : resolveExchangeRate(config);
  return (perMillion) => {
    const v = perMillion * rate;
    return symbol + v.toFixed(2);
  };
}

// src/i18n.ts
var EN = {
  title: "Cache Hit",
  hit: "Hit",
  totalHit: "Total Hit:",
  historyIncomplete: "* history truncated",
  read: "Read:",
  write: "Write:",
  miss: "Miss:",
  out: "Out:",
  reasoning: "Reason:",
  cost: "Cost:",
  saved: "Saved:",
  readSavings: "Read save:",
  writePremium: "Write cost:",
  netCacheValue: "Net cache:",
  rate: "Rate:",
  rateIn: "/M in",
  rateOut: "/M out",
  rateCache: "/M cache",
  hitFolded: "hit",
  noData: "Waiting for cache data...",
  secDetail: "Detail",
  secModel: "Model",
  secLineages: "Models",
  model: "Model:",
  unknown: "unknown",
  secAgents: "Agents",
  agentsScopeHint: " \xB7 sub-sessions",
  secTTL: "TTL:",
  tok: "tok",
  secDist: "Estimated Token Dist.",
  distSys: "System:",
  distUser: "User:",
  distAgent: "Sub-Agent Instr:",
  distToolCall: "Tool Call:",
  distToolResult: "Tool Result:",
  distReasoning: "Reasoning:",
  secSpeed: "Speed",
  lastCall: "Last:",
  avg: "Avg:",
  now: "Now:",
  trend: "Trend:",
  switchState: "switch",
  warmingState: "warming",
  ttft: "TTFT:",
  streamingIdle: "\xB7",
  peakBadge: "peak",
  offpeakBadge: "offpeak",
  over200kBadge: ">200k"
};
var ZH = {
  title: "\u7F13\u5B58\u547D\u4E2D",
  hit: "\u547D\u4E2D\u7387",
  totalHit: "\u603B\u547D\u4E2D:",
  historyIncomplete: "* \u5386\u53F2\u8BB0\u5F55\u53EF\u80FD\u5DF2\u622A\u65AD",
  read: "\u7F13\u5B58\u8BFB:",
  write: "\u7F13\u5B58\u5199:",
  miss: "\u672A\u547D\u4E2D:",
  out: "\u8F93\u51FA:",
  reasoning: "\u63A8\u7406:",
  cost: "\u8D39\u7528:",
  saved: "\u8282\u7701:",
  readSavings: "\u8BFB\u53D6\u8282\u7701:",
  writePremium: "\u5199\u5165\u6210\u672C:",
  netCacheValue: "\u7F13\u5B58\u51C0\u503C:",
  rate: "\u5355\u4EF7:",
  rateIn: "/M \u8F93\u5165",
  rateOut: "/M \u8F93\u51FA",
  rateCache: "/M \u7F13\u5B58",
  hitFolded: "\u547D\u4E2D",
  noData: "\u7B49\u5F85\u7F13\u5B58\u6570\u636E...",
  secDetail: "\u660E\u7EC6",
  secModel: "\u6A21\u578B",
  secLineages: "\u6A21\u578B",
  model: "\u6A21\u578B:",
  unknown: "\u672A\u77E5",
  secAgents: "\u5B50 Agent",
  agentsScopeHint: " \xB7 \u4EC5\u5B50\u4F1A\u8BDD",
  secTTL: "\u5B58\u6D3B:",
  tok: "tok",
  secDist: "\u4F30\u7B97 Token \u5206\u5E03",
  distSys: "\u7CFB\u7EDF\u63D0\u793A:",
  distUser: "\u7528\u6237\u8F93\u5165:",
  distAgent: "\u5B50\u4EE3\u7406\u6307\u4EE4:",
  distToolCall: "\u5DE5\u5177\u8C03\u7528:",
  distToolResult: "\u5DE5\u5177\u8FD4\u56DE:",
  distReasoning: "\u601D\u8003\u8FC7\u7A0B:",
  secSpeed: "\u901F\u5EA6",
  lastCall: "\u6700\u8FD1:",
  avg: "\u5E73\u5747:",
  now: "\u5B9E\u65F6:",
  trend: "\u8D8B\u52BF:",
  switchState: "\u5207\u6362",
  warmingState: "\u9884\u70ED",
  ttft: "\u9996Token:",
  streamingIdle: "\xB7",
  peakBadge: "\u9AD8\u5CF0",
  offpeakBadge: "\u7A7A\u95F2",
  over200kBadge: ">200k"
};
function resolveLang(raw) {
  if (raw === "zh" || raw === "cn" || raw === "zh-CN")
    return "zh";
  if (raw === "en")
    return "en";
  if (raw === "auto") {
    try {
      return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith("zh") ? "zh" : "en";
    } catch {
      return "en";
    }
  }
  return "en";
}
function getUiStrings(lang) {
  return lang === "zh" ? ZH : EN;
}

// src/dynamic-pricing/types.ts
var DEFAULT_SCHEDULE = [
  { level: "peak", windows: [
    { start: 9 * 60, end: 12 * 60, days: [1, 2, 3, 4, 5] },
    { start: 14 * 60, end: 18 * 60, days: [1, 2, 3, 4, 5] }
  ] },
  { level: "offpeak", windows: [] }
];
var DEFAULT_DYNAMIC_PRICING = {
  enabled: true,
  timezone: "Asia/Shanghai",
  schedule: DEFAULT_SCHEDULE,
  contextThreshold: 200000,
  providers: {}
};

// src/dynamic-pricing/schedule.ts
function parseClockTime(raw) {
  const m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!m)
    return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59)
    return null;
  return h * 60 + min;
}
function prevWeekday(weekday) {
  return (weekday - 2 + 7) % 7 + 1;
}
function isEveryDayWindow(w) {
  return !w.days || w.days.length === 0;
}
function inWindow(dayMinute, weekday, w) {
  const anyDay = isEveryDayWindow(w);
  if (w.start <= w.end) {
    if (!anyDay && !w.days.includes(weekday))
      return false;
    return dayMinute >= w.start && dayMinute < w.end;
  }
  if (dayMinute >= w.start)
    return anyDay || w.days.includes(weekday);
  const prev = prevWeekday(weekday);
  return dayMinute < w.end && (anyDay || w.days.includes(prev));
}
var tzFormatterCache = new Map;
function tzFormatter(timezone) {
  let f = tzFormatterCache.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    tzFormatterCache.set(timezone, f);
  }
  return f;
}
function tzPartsOf(ts, timezone) {
  const parts = Object.fromEntries(tzFormatter(timezone).formatToParts(new Date(ts)).map((p) => [p.type, p.value]));
  let year = Number(parts.year);
  let month = Number(parts.month);
  let day = Number(parts.day);
  let hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  if (hour === 24) {
    hour = 0;
    const d = new Date(Date.UTC(year, month - 1, day + 1));
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  }
  return { year, month, day, hour, minute, second };
}
function startOfDayEpoch(ts, timezone) {
  const p = tzPartsOf(ts, timezone);
  const elapsedMs = p.hour * 3600000 + p.minute * 60000 + p.second * 1000;
  return Math.floor(ts / 1000) * 1000 - elapsedMs;
}
function dayMinuteOf(ts, timezone) {
  const p = tzPartsOf(ts, timezone);
  return p.hour * 60 + p.minute + p.second / 60;
}
function tzWeekdayOf(ts, timezone) {
  const p = tzPartsOf(ts, timezone);
  const dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  return (dow + 6) % 7 + 1;
}
function isLevelAt(now, schedule, timezone) {
  if (schedule.length === 0)
    return;
  const min = dayMinuteOf(now, timezone);
  const weekday = tzWeekdayOf(now, timezone);
  let fallback;
  for (const lvl of schedule) {
    if (lvl.windows.length === 0) {
      fallback = lvl.level;
      continue;
    }
    for (const w of lvl.windows) {
      if (inWindow(min, weekday, w))
        return lvl.level;
    }
  }
  return fallback;
}
function nextBoundaryMs(now, schedule, timezone) {
  let best = Number.POSITIVE_INFINITY;
  const t0 = startOfDayEpoch(now, timezone);
  for (let d = 0;d <= 7; d++) {
    const dayStart = t0 + d * 86400000;
    const wd = tzWeekdayOf(dayStart, timezone);
    for (const lvl of schedule) {
      for (const w of lvl.windows) {
        for (const m of [w.start, w.end]) {
          const b = dayStart + m * 60000;
          if (b > now && boundaryCarriedByDay(m, wd, w)) {
            best = Math.min(best, b - now);
          }
        }
      }
    }
  }
  return Number.isFinite(best) ? best : 86400000;
}
function boundaryCarriedByDay(m, weekday, w) {
  if (w.start <= w.end) {
    return isEveryDayWindow(w) || w.days.includes(weekday);
  }
  const anyDay = isEveryDayWindow(w);
  if (m === w.start)
    return anyDay || w.days.includes(weekday);
  return anyDay || w.days.includes(prevWeekday(weekday));
}

// src/plugin-config.ts
var DEFAULT_DISPLAY = {
  lang: "en",
  panelBorder: true,
  showSpeed: true,
  speedUnit: "tpot",
  showDistribution: true,
  showStatusBar: true
};
var DEFAULT_TIMELINE = {
  enabled: false,
  dir: "",
  flushIncomplete: false,
  logSummaryMessages: true,
  maxMemoryRows: 50,
  maxLinesPerFile: 0,
  rotateMaxBytes: 0,
  retainRotated: 5,
  maxAgeDays: 0,
  maxLogFiles: 0,
  toolSummary: { allTools: true, bash: false }
};
var DEFAULT_CACHE_TTL = {
  enabled: true,
  providers: {}
};
var DEFAULT_PLUGIN_CONFIG = {
  cost: { ...DEFAULT_COST_DISPLAY },
  display: { ...DEFAULT_DISPLAY },
  timeline: { ...DEFAULT_TIMELINE },
  cacheTTL: { ...DEFAULT_CACHE_TTL },
  dynamicPricing: structuredClone(DEFAULT_DYNAMIC_PRICING)
};
var TOOL_SUMMARY_KEYS = new Set([
  "allTools",
  "bash",
  "read",
  "write",
  "edit",
  "grep",
  "glob",
  "webfetch",
  "websearch",
  "task",
  "question"
]);
function parseToolSummarySetting(raw) {
  if (typeof raw === "boolean")
    return raw;
  if (!raw || typeof raw !== "object")
    return true;
  const o = raw;
  const result = { allTools: true };
  if (typeof o.allTools === "boolean")
    result.allTools = o.allTools;
  for (const key of TOOL_SUMMARY_KEYS) {
    if (key === "allTools")
      continue;
    if (typeof o[key] === "boolean") {
      result[key] = o[key];
    }
  }
  return result;
}
function isToolSummaryEnabled(setting, tool) {
  if (typeof setting === "boolean")
    return setting;
  const override = setting[tool];
  if (typeof override === "boolean")
    return override;
  return setting.allTools;
}
function normalizeTimelineConfig(raw) {
  const t = structuredClone(DEFAULT_TIMELINE);
  if (!raw || typeof raw !== "object")
    return t;
  const o = raw;
  if (typeof o.enabled === "boolean")
    t.enabled = o.enabled;
  if (typeof o.dir === "string")
    t.dir = o.dir;
  if (typeof o.flushIncomplete === "boolean")
    t.flushIncomplete = o.flushIncomplete;
  if (typeof o.logSummaryMessages === "boolean")
    t.logSummaryMessages = o.logSummaryMessages;
  if (typeof o.maxMemoryRows === "number" && o.maxMemoryRows > 0) {
    t.maxMemoryRows = Math.floor(o.maxMemoryRows);
  }
  if (typeof o.maxLinesPerFile === "number" && o.maxLinesPerFile >= 0) {
    t.maxLinesPerFile = Math.floor(o.maxLinesPerFile);
  }
  if (typeof o.rotateMaxBytes === "number" && o.rotateMaxBytes >= 0) {
    t.rotateMaxBytes = Math.floor(o.rotateMaxBytes);
  }
  if (typeof o.retainRotated === "number" && o.retainRotated >= 0) {
    t.retainRotated = Math.floor(o.retainRotated);
  }
  if (typeof o.maxAgeDays === "number" && o.maxAgeDays >= 0) {
    t.maxAgeDays = Math.floor(o.maxAgeDays);
  }
  if (typeof o.maxLogFiles === "number" && o.maxLogFiles >= 0) {
    t.maxLogFiles = Math.floor(o.maxLogFiles);
  }
  if (o.toolSummary !== undefined) {
    t.toolSummary = parseToolSummarySetting(o.toolSummary);
  }
  return t;
}
function normalizeDisplayConfig(raw) {
  const d = structuredClone(DEFAULT_DISPLAY);
  if (!raw || typeof raw !== "object")
    return d;
  const o = raw;
  if (typeof o.lang === "string") {
    d.lang = o.lang === "auto" ? "auto" : resolveLang(o.lang);
  }
  if (typeof o.mainHitLabel === "string" && o.mainHitLabel.length > 0)
    d.mainHitLabel = o.mainHitLabel;
  if (typeof o.panelBorder === "boolean")
    d.panelBorder = o.panelBorder;
  else if (typeof o.agentsBorder === "boolean")
    d.panelBorder = o.agentsBorder;
  if (typeof o.showSpeed === "boolean")
    d.showSpeed = o.showSpeed;
  if (typeof o.showDistribution === "boolean")
    d.showDistribution = o.showDistribution;
  if (typeof o.showStatusBar === "boolean")
    d.showStatusBar = o.showStatusBar;
  if (typeof o.speedUnit === "string") {
    const v = o.speedUnit.toLowerCase();
    if (v === "tps" || v === "tpot")
      d.speedUnit = v;
  }
  return d;
}
function normalizeCacheTTLConfig(raw) {
  const t = structuredClone(DEFAULT_CACHE_TTL);
  if (!raw || typeof raw !== "object")
    return t;
  const o = raw;
  if (typeof o.enabled === "boolean")
    t.enabled = o.enabled;
  if (o.providers && typeof o.providers === "object") {
    const providers = o.providers;
    for (const [key, value] of Object.entries(providers)) {
      if (typeof value === "string") {
        t.providers[key] = value;
      }
    }
  }
  return t;
}
var TIME_UNITS = {
  s: 1000,
  sec: 1000,
  second: 1000,
  seconds: 1000,
  m: 60000,
  min: 60000,
  minute: 60000,
  minutes: 60000,
  h: 3600000,
  hr: 3600000,
  hour: 3600000,
  hours: 3600000
};
function parseDuration(raw) {
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/i);
  if (!match) {
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? Math.floor(num) : null;
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = TIME_UNITS[unit];
  if (!multiplier || !Number.isFinite(value) || value <= 0)
    return null;
  return Math.floor(value * multiplier);
}
function normalizeModelPricingRule(raw) {
  const rule = {};
  if (!raw || typeof raw !== "object")
    return rule;
  const o = raw;
  if (typeof o.currency === "string" && o.currency.toUpperCase() in CURRENCY_PRESETS) {
    rule.currency = o.currency.toUpperCase();
  }
  if (typeof o.rate === "number" && Number.isFinite(o.rate) && o.rate > 0) {
    rule.rate = o.rate;
  }
  const levels = o.levels;
  if (levels && typeof levels === "object") {
    const out = {};
    for (const [level, v] of Object.entries(levels)) {
      const lv = v;
      if (!lv || typeof lv !== "object")
        continue;
      const num = (x) => typeof x === "number" && Number.isFinite(x) ? x : 0;
      const nestCache = lv.cache;
      out[level] = {
        input: num(lv.input),
        output: num(lv.output),
        cache: {
          read: num(lv.cacheRead ?? lv.cache_read ?? nestCache?.read),
          write: num(lv.cacheWrite ?? lv.cache_write ?? nestCache?.write)
        }
      };
    }
    if (Object.keys(out).length > 0)
      rule.levels = out;
  }
  const multipliers = o.multipliers;
  if (multipliers && typeof multipliers === "object") {
    const out = {};
    for (const [level, v] of Object.entries(multipliers)) {
      if (typeof v === "number" && Number.isFinite(v) && v > 0)
        out[level] = v;
    }
    if (Object.keys(out).length > 0)
      rule.multipliers = out;
  }
  if (typeof o.contextThreshold === "number" && Number.isFinite(o.contextThreshold) && o.contextThreshold > 0) {
    rule.contextThreshold = Math.floor(o.contextThreshold);
  }
  return rule;
}
function normalizeDays(raw) {
  if (!Array.isArray(raw))
    return;
  const seen = new Set;
  for (const v of raw) {
    if (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 7) {
      seen.add(v);
    } else {
      console.warn(`dynamicPricing: ignoring invalid schedule days value ${JSON.stringify(v)}` + " (expected integer 1..7, ISO 1=Monday \u2026 7=Sunday)");
    }
  }
  return seen.size > 0 ? [...seen].sort() : undefined;
}
function normalizeSchedule(raw) {
  if (!Array.isArray(raw))
    return structuredClone(DEFAULT_DYNAMIC_PRICING.schedule);
  const out = [];
  for (const item of raw) {
    const o = item;
    if (!o || typeof o !== "object")
      continue;
    if (typeof o.level !== "string" || !Array.isArray(o.windows))
      continue;
    if (o.windows.length === 0) {
      out.push({ level: o.level, windows: [] });
      continue;
    }
    const windows = o.windows.map((w) => {
      const ww = w;
      if (!ww || typeof ww !== "object")
        return null;
      const start = typeof ww.start === "string" ? parseClockTime(ww.start) : null;
      const end = typeof ww.end === "string" ? parseClockTime(ww.end) : null;
      if (start === null || end === null)
        return null;
      const days = normalizeDays(ww.days);
      return days ? { start, end, days } : { start, end };
    }).filter((w) => w !== null);
    if (windows.length > 0)
      out.push({ level: o.level, windows });
  }
  const windowed = out.filter((l) => l.windows.length > 0);
  const fallbacks = out.filter((l) => l.windows.length === 0);
  if (fallbacks.length > 1) {
    console.warn("dynamicPricing: schedule has more than one fallback level (level with empty windows); " + "keeping only the first as the catch-all");
  }
  const merged = [...windowed, ...fallbacks.slice(0, 1)];
  return merged.length > 0 ? merged : structuredClone(DEFAULT_DYNAMIC_PRICING.schedule);
}
function normalizeDynamicPricingConfig(raw, opts) {
  const d = structuredClone(DEFAULT_DYNAMIC_PRICING);
  if (!raw || typeof raw !== "object")
    return d;
  const o = raw;
  if (typeof o.enabled === "boolean")
    d.enabled = o.enabled;
  if (typeof o.timezone === "string" && o.timezone.length > 0)
    d.timezone = o.timezone;
  if (o.schedule !== undefined)
    d.schedule = normalizeSchedule(o.schedule);
  if (typeof o.contextThreshold === "number" && Number.isFinite(o.contextThreshold) && o.contextThreshold > 0) {
    d.contextThreshold = Math.floor(o.contextThreshold);
  }
  if (o.providers && typeof o.providers === "object") {
    const providers = {};
    for (const [pid, pv] of Object.entries(o.providers)) {
      const po = pv;
      if (!po || typeof po !== "object")
        continue;
      const modelsRaw = po.models;
      if (!modelsRaw || typeof modelsRaw !== "object")
        continue;
      const models = {};
      for (const [mid, mv] of Object.entries(modelsRaw)) {
        const rule = normalizeModelPricingRule(mv);
        if (rule.levels && rule.currency && rule.currency !== "USD") {
          let usdPerLevel = rule.rate;
          if (usdPerLevel === undefined && rule.currency === opts?.displayCurrency && opts?.usdRate && opts.usdRate > 0) {
            usdPerLevel = opts.usdRate;
          }
          if (usdPerLevel === undefined || usdPerLevel <= 0) {
            console.error(`dynamicPricing: cannot convert ${rule.currency} levels to USD for ${pid}/${mid} \u2014 ` + `set "rate" (USD\u2192${rule.currency}) or use cost.currency = ${rule.currency}; treating values as USD`);
          } else {
            for (const [level, rates] of Object.entries(rule.levels)) {
              rule.levels[level] = {
                input: rates.input / usdPerLevel,
                output: rates.output / usdPerLevel,
                cache: { read: rates.cache.read / usdPerLevel, write: rates.cache.write / usdPerLevel }
              };
            }
            delete rule.currency;
          }
        }
        if (Object.keys(rule).length > 0)
          models[mid] = rule;
      }
      if (Object.keys(models).length > 0)
        providers[pid] = { models };
    }
    if (Object.keys(providers).length > 0)
      d.providers = providers;
  }
  return d;
}
function normalizePluginConfig(raw) {
  if (!raw || typeof raw !== "object")
    return structuredClone(DEFAULT_PLUGIN_CONFIG);
  const o = raw;
  const cost = normalizeCostDisplay(raw);
  const displayRaw = o.display;
  const usdRate = cost.currency === "USD" ? DEFAULT_COST_DISPLAY.rate ?? 6.77 : resolveExchangeRate(cost);
  return {
    cost,
    display: normalizeDisplayConfig(displayRaw),
    timeline: normalizeTimelineConfig(o.timeline),
    cacheTTL: normalizeCacheTTLConfig(o.cacheTTL),
    dynamicPricing: normalizeDynamicPricingConfig(o.dynamicPricing, {
      usdRate,
      displayCurrency: cost.currency
    })
  };
}

// src/cache-ttl.ts
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DEFAULT_TTL_MS = 5 * MINUTE;
var BUILT_IN_TTL = {
  anthropic: 5 * MINUTE,
  openai: 5 * MINUTE,
  deepseek: 2 * HOUR,
  google: 1 * HOUR,
  xai: 5 * MINUTE,
  minimax: 5 * MINUTE,
  xiaomi: 5 * MINUTE,
  qwen: 5 * MINUTE,
  moonshot: 5 * MINUTE
};
function findLastCacheActivityByLineage(messages) {
  const result = new Map;
  for (const message of messages) {
    if (message.role !== "assistant" || !isInteractiveAssistantMessage(message) || message.time?.completed === undefined || (message.tokens?.cache?.read ?? 0) === 0 && (message.tokens?.cache?.write ?? 0) === 0) {
      continue;
    }
    const key = messageLineageKey(message);
    const previous = result.get(key);
    if (!previous || compareAssistantMessages(previous, message) < 0)
      result.set(key, message);
  }
  return result;
}
function getTTL(providerID, modelID, config) {
  const userProviders = config?.providers ?? {};
  const specific = userProviders[`${providerID}:${modelID}`];
  if (specific !== undefined) {
    const parsed = parseDuration(specific);
    if (parsed !== null)
      return parsed;
  }
  const userProvider = userProviders[providerID];
  if (userProvider !== undefined) {
    const parsed = parseDuration(userProvider);
    if (parsed !== null)
      return parsed;
  }
  const builtIn = BUILT_IN_TTL[providerID];
  if (builtIn !== undefined)
    return builtIn;
  return DEFAULT_TTL_MS;
}
function formatElapsed(ms) {
  if (ms <= 0)
    return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)
    return `${hours}h ${minutes}m`;
  if (minutes > 0)
    return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// src/cache-ttl-view.tsx
function CacheTTLView(props) {
  const [localNow, setLocalNow] = createSignal2(Date.now());
  const tick = props.now ? undefined : setInterval(() => setLocalNow(Date.now()), 1000);
  onCleanup(() => {
    if (tick !== undefined)
      clearInterval(tick);
  });
  const now = () => props.now?.() ?? localNow();
  const activities = createMemo3(() => findLastCacheActivityByLineage(props.messages?.() ?? []));
  const lastCache = createMemo3(() => {
    const key = props.lineageKey?.();
    if (key)
      return activities().get(key) ?? null;
    let latest = null;
    for (const message of activities().values()) {
      if (!latest || (message.time?.completed ?? 0) > (latest.time?.completed ?? 0))
        latest = message;
    }
    return latest;
  });
  const safeConfig = createMemo3(() => props.config?.providers ? props.config : DEFAULT_CACHE_TTL);
  const ttlMs = createMemo3(() => {
    const m = lastCache();
    if (!m || !m.providerID)
      return DEFAULT_TTL_MS;
    return getTTL(m.providerID, m.modelID ?? "", safeConfig());
  });
  const elapsed = createMemo3(() => {
    const m = lastCache();
    if (!m || m.time.completed === undefined)
      return null;
    return now() - m.time.completed;
  });
  const statusIcon = createMemo3(() => {
    const e = elapsed();
    const ttl = ttlMs();
    if (e === null)
      return "";
    if (e < ttl)
      return "\u25CF";
    if (e < ttl * 2)
      return "\u25D0";
    return "\u25CB";
  });
  const statusColor = createMemo3(() => {
    const e = elapsed();
    const ttl = ttlMs();
    if (e === null)
      return props.pal.textMuted;
    if (e < ttl)
      return props.pal.success;
    if (e < ttl * 2)
      return props.pal.warning;
    return props.pal.error;
  });
  return _$createComponent4(Show4, {
    get when() {
      return elapsed() !== null;
    },
    get children() {
      var _el$ = _$createElement2("text");
      _$insert2(_el$, () => props.layout.row(props.label, `${statusIcon()} ${formatElapsed(elapsed() ?? 0)}`, ""));
      _$effect2((_$p) => _$setProp2(_el$, "fg", statusColor(), _$p));
      return _el$;
    }
  });
}

// src/message-timing.ts
function timingFromAssistantMessage(msg) {
  const t = msg.time;
  if (!t || typeof t.created !== "number")
    return null;
  const completedAt = typeof t.completed === "number" ? t.completed : undefined;
  return {
    created: t.created,
    completedAt,
    durationMs: completedAt !== undefined ? completedAt - t.created : undefined,
    isComplete: completedAt !== undefined
  };
}
function generationDurationMs(timing, firstPartTime) {
  if (!timing.isComplete || timing.completedAt === undefined)
    return;
  if (firstPartTime !== undefined && firstPartTime > timing.created) {
    return timing.completedAt - firstPartTime;
  }
  return timing.durationMs;
}

// src/token-speed.ts
function computeTokenSpeed(output, reasoning, durationMs) {
  if (durationMs < 500)
    return 0;
  return (output + reasoning) / durationMs * 1000;
}
function computeTokenTpotMs(output, reasoning, generationMs) {
  if (generationMs < 500)
    return;
  const tokens = output + reasoning;
  if (tokens <= 1)
    return;
  return generationMs / (tokens - 1);
}
function computeAvgTokenSpeed(messages, firstPartTime) {
  let totalTokens = 0;
  let totalMs = 0;
  for (const msg of messages) {
    if (!isInteractiveAssistantMessage(msg))
      continue;
    const timing = timingFromAssistantMessage(msg);
    if (!timing?.isComplete)
      continue;
    const output = msg.tokens?.output ?? 0;
    const reasoning = msg.tokens?.reasoning ?? 0;
    if (output + reasoning === 0)
      continue;
    const msgID = msg.id ?? msg.messageID;
    const firstTime = msgID ? firstPartTime?.get(msgID) : undefined;
    const duration = generationDurationMs(timing, firstTime);
    if (duration === undefined || duration < 500)
      continue;
    totalTokens += output + reasoning;
    totalMs += duration;
  }
  return totalMs > 0 ? totalTokens / totalMs * 1000 : 0;
}
function computeAvgTokenTpotMs(messages, firstPartTime) {
  let totalGenerationMs = 0;
  let totalTokenIntervals = 0;
  for (const msg of messages) {
    if (!isInteractiveAssistantMessage(msg))
      continue;
    const timing = timingFromAssistantMessage(msg);
    if (!timing?.isComplete)
      continue;
    const output = msg.tokens?.output ?? 0;
    const reasoning = msg.tokens?.reasoning ?? 0;
    const tokens = output + reasoning;
    if (tokens <= 1)
      continue;
    const msgID = msg.id ?? msg.messageID;
    const firstTime = msgID ? firstPartTime?.get(msgID) : undefined;
    const duration = generationDurationMs(timing, firstTime);
    if (duration === undefined || duration < 500)
      continue;
    totalGenerationMs += duration;
    totalTokenIntervals += tokens - 1;
  }
  return totalTokenIntervals > 0 ? totalGenerationMs / totalTokenIntervals : undefined;
}
function formatTokenSpeed(tps) {
  if (tps < 1)
    return "<1 tok/s";
  return `${Math.round(tps)} tok/s`;
}
function formatTokenTpot(ms) {
  if (ms === undefined)
    return "\u2014";
  if (ms < 1)
    return "<1 ms/tok";
  if (ms >= 1000)
    return `${(ms / 1000).toFixed(1)}s/tok`;
  return `${Math.round(ms)} ms/tok`;
}
function estimateStreamingSpeed(text, created, now, firstPartTime) {
  if (!text)
    return 0;
  const start = firstPartTime !== undefined && firstPartTime > created ? firstPartTime : created;
  const elapsed = (now - start) / 1000;
  if (elapsed < 0.5)
    return 0;
  const estimated = Math.max(1, Math.round(text.length / 4));
  return estimated / elapsed;
}
function lastCompletedTokenSpeed(messages, firstPartTime) {
  for (let i = messages.length - 1;i >= 0; i--) {
    const msg = messages[i];
    if (!isInteractiveAssistantMessage(msg))
      continue;
    const timing = timingFromAssistantMessage(msg);
    if (!timing?.isComplete)
      continue;
    const output = msg.tokens?.output ?? 0;
    const reasoning = msg.tokens?.reasoning ?? 0;
    if (output + reasoning === 0)
      continue;
    const msgID = msg.id ?? msg.messageID;
    const firstTime = msgID ? firstPartTime?.get(msgID) : undefined;
    const durationMs = generationDurationMs(timing, firstTime);
    if (durationMs === undefined)
      continue;
    const speed = computeTokenSpeed(output, reasoning, durationMs);
    if (speed > 0)
      return speed;
  }
  return;
}

// src/first-part-time.ts
var STREAM_PART_TYPES = new Set(["text", "reasoning", "tool"]);
function createFirstPartTimeTracker() {
  let disposed = false;
  const firstPartTime = new Map;
  const firstPartSource = new Map;
  const handlePart = (messageID, partType, startTime, source = "sdk") => {
    if (disposed || !messageID || !STREAM_PART_TYPES.has(partType))
      return false;
    const existing = firstPartTime.get(messageID);
    const existingSource = firstPartSource.get(messageID);
    if (existing !== undefined && existingSource === "sdk")
      return false;
    if (existing !== undefined && existingSource === "tui" && source === "sdk") {
      firstPartTime.set(messageID, startTime);
      firstPartSource.set(messageID, source);
      return true;
    }
    if (existing === undefined) {
      firstPartTime.set(messageID, startTime);
      firstPartSource.set(messageID, source);
      return true;
    }
    return false;
  };
  return {
    handlePart,
    getSource: (messageID) => firstPartSource.get(messageID),
    get: () => firstPartTime,
    reset: () => {
      firstPartTime.clear();
      firstPartSource.clear();
    },
    dispose: () => {
      disposed = true;
      firstPartTime.clear();
      firstPartSource.clear();
    }
  };
}
function earliestPartStart(parts, created) {
  if (!parts?.length)
    return;
  let earliest;
  for (const p of parts) {
    if (!STREAM_PART_TYPES.has(p.type))
      continue;
    const start = p.time?.start;
    if (typeof start !== "number" || start <= created)
      continue;
    if (earliest === undefined || start < earliest)
      earliest = start;
  }
  return earliest;
}

// src/streaming-state.ts
var STREAMING_HOLD_MS = 2000;
var initialStreamingTickState = () => ({
  holdUntil: 0,
  lastActiveSpeed: 0,
  wasInFlight: false
});
function formatStreamingNowDisplay(phase, speed, idleLabel, useTps = false) {
  const format = useTps ? (spd) => spd !== undefined && spd > 0 ? formatTokenSpeed(spd) : "\u2014" : (spd) => formatTokenTpot(spd !== undefined && spd > 0 ? 1000 / spd : undefined);
  const prefixEstimate = (val) => val !== "\u2014" && !val.startsWith("<") ? "~" : "";
  switch (phase) {
    case "idle":
      return { value: idleLabel, tone: "idle" };
    case "warmup":
      return { value: format(undefined), tone: "live" };
    case "active": {
      const val = format(speed > 0 ? speed : undefined);
      return { value: prefixEstimate(val) + val, tone: "live" };
    }
    case "hold": {
      const val = format(speed > 0 ? speed : undefined);
      return { value: prefixEstimate(val) + val, tone: "fading" };
    }
  }
}
function inFlightAssistant(messages) {
  if (!messages.length)
    return;
  const last = messages[messages.length - 1];
  if (last.role !== "assistant" || last.time?.completed)
    return;
  return last;
}
function measureInFlightSpeed(msg, part, now, firstPartTime) {
  const messageId = msg.id ?? msg.messageID;
  const created = msg.time?.created;
  if (!messageId || typeof created !== "number" || !part)
    return 0;
  const parts = part(messageId);
  if (!parts?.length)
    return 0;
  const text = parts.filter((p) => STREAM_PART_TYPES.has(p.type)).map((p) => p.text ?? "").join("");
  const firstTime = firstPartTime?.get(messageId);
  return estimateStreamingSpeed(text, created, now, firstTime);
}
function advanceStreamingNow(prev, input) {
  const inFlight = inFlightAssistant(input.messages);
  if (inFlight) {
    const speed = measureInFlightSpeed(inFlight, input.part, input.now, input.firstPartTime);
    const phase = speed > 0 ? "active" : "warmup";
    return {
      holdUntil: 0,
      lastActiveSpeed: speed > 0 ? speed : prev.lastActiveSpeed,
      wasInFlight: true,
      phase,
      speed: phase === "active" ? speed : 0
    };
  }
  let holdUntil = prev.holdUntil;
  if (prev.wasInFlight && prev.lastActiveSpeed > 0) {
    holdUntil = input.now + STREAMING_HOLD_MS;
  }
  if (holdUntil > input.now && prev.lastActiveSpeed > 0) {
    return {
      holdUntil,
      lastActiveSpeed: prev.lastActiveSpeed,
      wasInFlight: false,
      phase: "hold",
      speed: prev.lastActiveSpeed
    };
  }
  return {
    holdUntil: 0,
    lastActiveSpeed: prev.lastActiveSpeed,
    wasInFlight: false,
    phase: "idle",
    speed: 0
  };
}

// src/token-distribution.ts
function estimateTokens(text) {
  if (!text || text.length === 0)
    return 0;
  let ascii = 0;
  let cjk = 0;
  for (const c of text) {
    const code = c.codePointAt(0) ?? 0;
    if (code >= 19968 && code <= 40959)
      cjk++;
    else if (code >= 12352 && code <= 12543)
      cjk++;
    else if (code >= 44032 && code <= 55203)
      cjk++;
    else if (code >= 4352 && code <= 4607)
      cjk++;
    else if (code >= 11904 && code <= 12031)
      cjk++;
    else
      ascii++;
  }
  const trimmed = text.trimStart();
  const strippedFence = trimmed.replace(/^`{3}\w*\s*\n?/, "");
  const jsonLike = (strippedFence.startsWith("{") || strippedFence.startsWith("[")) && /"[^"]+"\s*:/.test(text);
  const codeLike = !jsonLike && /```|^import |^export |^function |^const |^let |^var |^class |^interface |^type |^def |^fn |^pub |^use |^mod |^package /m.test(text);
  const asciiPerToken = jsonLike ? 3.5 : codeLike ? 3.5 : 4;
  return Math.max(1, Math.ceil(ascii / asciiPerToken + cjk / 1));
}
function formatDistTokenCount(n) {
  if (n >= 1e6)
    return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e4)
    return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}
var emptyTokenDist = () => ({
  system: 0,
  user: 0,
  agent: 0,
  toolCall: 0,
  toolResult: 0,
  reasoning: 0,
  hasData: false
});
function computeTokenDistribution(messages, partGetter, systemPrompt) {
  const dist = emptyTokenDist();
  if (systemPrompt) {
    dist.system += estimateTokens(systemPrompt);
  }
  for (const rawMsg of messages) {
    if (!rawMsg || typeof rawMsg !== "object")
      continue;
    const msg = rawMsg;
    const role = msg.role;
    const msgId = String(msg.id ?? msg.messageID ?? "");
    if (role === "user") {
      if (typeof msg.system === "string") {
        dist.system += estimateTokens(msg.system);
      }
      const parts = msgId && partGetter ? partGetter(msgId) : undefined;
      if (Array.isArray(parts)) {
        for (const rawPart of parts) {
          if (!rawPart || typeof rawPart !== "object")
            continue;
          const p = rawPart;
          if (p.type === "text" && !p.synthetic && !p.ignored && typeof p.text === "string") {
            dist.user += estimateTokens(p.text);
          } else if (p.type === "file") {
            const src = p.source;
            const textVal = src?.text?.value;
            if (typeof textVal === "string") {
              dist.user += estimateTokens(textVal);
            }
          }
        }
      }
    } else if (role === "assistant") {
      const tokens = msg.tokens;
      if (typeof tokens?.reasoning === "number") {
        dist.reasoning += tokens.reasoning;
      }
      const parts = msgId && partGetter ? partGetter(msgId) : undefined;
      if (Array.isArray(parts)) {
        for (const rawPart of parts) {
          if (!rawPart || typeof rawPart !== "object")
            continue;
          const p = rawPart;
          if (p.type === "tool") {
            const state = p.state;
            let rawInput = "";
            if (typeof state?.raw === "string") {
              rawInput = state.raw;
            } else if (state?.input != null) {
              rawInput = typeof state.input === "string" ? state.input : JSON.stringify(state.input);
            }
            if (p.tool === "task" && state?.input && typeof state.input === "object") {
              const ti = state.input;
              const prompt = typeof ti.prompt === "string" ? ti.prompt : "";
              const desc = typeof ti.description === "string" ? ti.description : "";
              dist.agent += estimateTokens(prompt || desc);
            } else if (rawInput) {
              dist.toolCall += estimateTokens(rawInput);
            }
            if (state?.status === "completed" && state.output != null) {
              const out = typeof state.output === "string" ? state.output : JSON.stringify(state.output);
              dist.toolResult += estimateTokens(out);
            } else if (state?.status === "error" && state.error != null) {
              const err = typeof state.error === "string" ? state.error : JSON.stringify(state.error);
              dist.toolResult += estimateTokens(err);
            }
          } else if (p.type === "subtask") {
            const prompt = typeof p.prompt === "string" ? p.prompt : "";
            const desc = typeof p.description === "string" ? p.description : "";
            dist.agent += estimateTokens(prompt || desc);
          }
        }
      }
    }
  }
  dist.hasData = dist.system + dist.user + dist.agent + dist.toolCall + dist.toolResult + dist.reasoning > 0;
  return dist;
}

// src/format-cache-ui.ts
function formatTrendLabel(deltaPercent) {
  const t = deltaPercent;
  return (t > 0 ? "\u2191" : t < 0 ? "\u2193" : "-") + (t !== 0 ? Math.abs(t).toFixed(1) + "%" : "");
}
function formatPercentOneDecimal(percent0to100) {
  return (Math.floor(percent0to100 * 10) / 10).toFixed(1) + "%";
}
function formatRatioAsPercent(ratio0to1) {
  return formatPercentOneDecimal(ratio0to1 * 100);
}
function formatHitBar(ratio, width = 16) {
  const filled = Math.max(0, Math.min(width, Math.round(ratio * width)));
  const empty = Math.max(0, width - filled);
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

// src/main-session-view.tsx
function MainSessionView(props) {
  const {
    m,
    layout
  } = props;
  const [ttlNow, setTtlNow] = createSignal3(Date.now());
  const ttlTimer = props.cacheTTL?.enabled ? setInterval(() => setTtlNow(Date.now()), 1000) : undefined;
  onCleanup2(() => {
    if (ttlTimer !== undefined)
      clearInterval(ttlTimer);
  });
  const streamingNowRow = createMemo4(() => {
    const now = props.streamingNow();
    return formatStreamingNowDisplay(now.phase, now.speed, m.t().streamingIdle, m.useTps());
  });
  const distData = createMemo4(() => props.tokenDist?.() ?? emptyTokenDist());
  const shownCost = createMemo4(() => {
    const pricing = m.sessionPricing();
    if (pricing.counted > 0 && pricing.dynamic && pricing.unpriced === 0) {
      return pricing.cost;
    }
    return m.blendedMain().cost;
  });
  const rateLabel = createMemo4(() => {
    const p = m.pricing();
    const badges = [];
    if (p.level === "peak")
      badges.push(m.t().peakBadge);
    else if (p.level === "offpeak")
      badges.push(m.t().offpeakBadge);
    if (p.contextTier === "over")
      badges.push(m.t().over200kBadge);
    return badges.length > 0 ? `${m.t().rate} ${badges.join("\xB7")}` : m.t().rate;
  });
  return [_$createComponent5(TuiHitRow, {
    get label() {
      return m.hitLabel();
    },
    get bar() {
      return m.bar();
    },
    get pct() {
      return m.pctLabel();
    },
    get barColor() {
      return m.hitColor();
    },
    get textColor() {
      return m.pal().text;
    },
    get trend() {
      return _$memo4(() => !!m.trendLabel())() ? {
        text: m.trendLabel(),
        color: m.trendFg()
      } : undefined;
    }
  }), _$createComponent5(Show5, {
    get when() {
      return m.metricMessageStatus() !== "complete";
    },
    get children() {
      var _el$ = _$createElement3("text");
      _$insert3(_el$, () => m.t().historyIncomplete);
      _$effect3((_$p) => _$setProp3(_el$, "fg", m.pal().muted, _$p));
      return _el$;
    }
  }), _$createComponent5(TuiMetricRow, {
    get pal() {
      return m.pal();
    },
    layout,
    get label() {
      return m.t().totalHit;
    },
    get value() {
      return m.sessionPct();
    }
  }), _$createComponent5(Show5, {
    get when() {
      return _$memo4(() => !!props.cacheTTL?.enabled)() && props.cacheTTL?.providers;
    },
    get children() {
      return _$createComponent5(CacheTTLView, {
        get messages() {
          return m.metricMessages;
        },
        get lineageKey() {
          return m.activeLineageKey;
        },
        now: ttlNow,
        get config() {
          return props.cacheTTL;
        },
        get pal() {
          return m.pal();
        },
        layout,
        get label() {
          return m.t().secTTL;
        }
      });
    }
  }), _$createComponent5(TuiSection, {
    get pal() {
      return m.pal();
    },
    layout,
    get open() {
      return props.detail.open();
    },
    get title() {
      return m.t().secDetail;
    },
    get onToggle() {
      return props.detail.toggle;
    },
    get children() {
      return _$createComponent5(TokenDetailRows, {
        get pal() {
          return m.pal();
        },
        layout,
        get t() {
          return m.t();
        },
        get snap() {
          return m.main();
        },
        get children() {
          return [_$createComponent5(Show5, {
            get when() {
              return m.sessionPricing().readSavings !== 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().readSavings;
                },
                get value() {
                  return props.formatCost(m.sessionPricing().readSavings);
                },
                get fg() {
                  return m.pal().success;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return m.sessionPricing().writePremium !== 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().writePremium;
                },
                get value() {
                  return props.formatCost(m.sessionPricing().writePremium);
                },
                get fg() {
                  return m.pal().warning;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return m.sessionPricing().netCacheValue !== 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().netCacheValue;
                },
                get value() {
                  return props.formatCost(m.sessionPricing().netCacheValue);
                },
                get fg() {
                  return _$memo4(() => m.sessionPricing().netCacheValue > 0)() ? m.pal().success : m.pal().error;
                }
              });
            }
          })];
        }
      });
    }
  }), _$createComponent5(Show5, {
    get when() {
      return props.showSpeed;
    },
    get children() {
      return _$createComponent5(TuiSection, {
        get pal() {
          return m.pal();
        },
        layout,
        get open() {
          return props.speed.open();
        },
        get title() {
          return m.t().secSpeed;
        },
        get onToggle() {
          return props.speed.toggle;
        },
        get children() {
          return [_$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().now;
            },
            get value() {
              return streamingNowRow().value;
            },
            get fg() {
              return _$memo4(() => streamingNowRow().tone === "live")() ? m.pal().success : m.pal().muted;
            }
          }), _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().lastCall;
            },
            get value() {
              return m.lastSpeedLabel();
            }
          }), _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().avg;
            },
            get value() {
              return m.avgSpeedLabel();
            }
          }), _$createComponent5(Show5, {
            get when() {
              return m.sparkline();
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().trend;
                },
                get value() {
                  return m.sparkline();
                }
              });
            }
          }), _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().ttft;
            },
            get value() {
              return m.lastTtftLabel();
            },
            get fg() {
              return _$memo4(() => m.lastTtft() !== undefined)() ? m.pal().text : m.pal().muted;
            }
          })];
        }
      });
    }
  }), _$createComponent5(TuiSection, {
    get pal() {
      return m.pal();
    },
    layout,
    get open() {
      return props.model.open();
    },
    get title() {
      return m.t().secModel;
    },
    get onToggle() {
      return props.model.toggle;
    },
    get children() {
      return [_$createComponent5(Show5, {
        get when() {
          return shownCost() > 0;
        },
        get children() {
          return _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().cost;
            },
            get value() {
              return props.formatCost(shownCost());
            },
            get fg() {
              return m.pal().text;
            }
          });
        }
      }), _$createComponent5(Show5, {
        get when() {
          return m.modelShort();
        },
        get children() {
          return _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return m.t().model;
            },
            get value() {
              return m.modelShort();
            }
          });
        }
      }), _$createComponent5(Show5, {
        get when() {
          return m.pricing().inputRate > 0;
        },
        get children() {
          return [_$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            get label() {
              return rateLabel();
            },
            get value() {
              return `${props.formatRate(m.pricing().inputRate)}${m.t().rateIn}`;
            },
            get fg() {
              return m.pal().muted;
            }
          }), _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            label: "",
            get value() {
              return `${props.formatRate(m.pricing().cacheReadRate)}${m.t().rateCache}`;
            },
            get fg() {
              return m.pal().muted;
            }
          }), _$createComponent5(TuiMetricRow, {
            get pal() {
              return m.pal();
            },
            layout,
            label: "",
            get value() {
              return `${props.formatRate(m.pricing().outputRate)}${m.t().rateOut}`;
            },
            get fg() {
              return m.pal().muted;
            }
          })];
        }
      })];
    }
  }), _$createComponent5(Show5, {
    get when() {
      return _$memo4(() => props.showDistribution !== false)() && distData().hasData;
    },
    get children() {
      return _$createComponent5(TuiSection, {
        get pal() {
          return m.pal();
        },
        layout,
        get open() {
          return props.dist.open();
        },
        get title() {
          return m.t().secDist;
        },
        get onToggle() {
          return props.dist.toggle;
        },
        get children() {
          return [_$createComponent5(Show5, {
            get when() {
              return distData().system > 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().distSys;
                },
                get value() {
                  return formatDistTokenCount(distData().system);
                },
                get unit() {
                  return m.t().tok;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return distData().user > 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().distUser;
                },
                get value() {
                  return formatDistTokenCount(distData().user);
                },
                get unit() {
                  return m.t().tok;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return distData().agent > 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().distAgent;
                },
                get value() {
                  return formatDistTokenCount(distData().agent);
                },
                get unit() {
                  return m.t().tok;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return distData().toolCall > 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().distToolCall;
                },
                get value() {
                  return formatDistTokenCount(distData().toolCall);
                },
                get unit() {
                  return m.t().tok;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return distData().toolResult > 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().distToolResult;
                },
                get value() {
                  return formatDistTokenCount(distData().toolResult);
                },
                get unit() {
                  return m.t().tok;
                }
              });
            }
          }), _$createComponent5(Show5, {
            get when() {
              return distData().reasoning > 0;
            },
            get children() {
              return _$createComponent5(TuiMetricRow, {
                get pal() {
                  return m.pal();
                },
                layout,
                get label() {
                  return m.t().distReasoning;
                },
                get value() {
                  return formatDistTokenCount(distData().reasoning);
                },
                get unit() {
                  return m.t().tok;
                }
              });
            }
          })];
        }
      });
    }
  }), _$createComponent5(Show5, {
    get when() {
      return m.lineages().length > 1;
    },
    get children() {
      return _$createComponent5(TuiSection, {
        get pal() {
          return m.pal();
        },
        layout,
        get open() {
          return props.lineages.open();
        },
        get title() {
          return m.t().secLineages;
        },
        get onToggle() {
          return props.lineages.toggle;
        },
        get children() {
          return m.recentLineages().map((lineage) => {
            const model = lineage.modelID ? `${lineage.providerID}/${lineage.modelID.split("/").pop()}` : m.t().unknown;
            const agents = Object.entries(lineage.agentCounts).map(([agent, count]) => `${agent}:${count}`).join(",");
            const label = truncateVisual(agents ? `${model} ${agents}` : model, Math.max(8, layout.gauge() - 10));
            return [_$createComponent5(TuiMetricRow, {
              get pal() {
                return m.pal();
              },
              layout,
              label,
              get value() {
                return formatRatioAsPercent(lineage.cacheRatio);
              },
              get unit() {
                return `${lineage.callCount}c`;
              },
              get labelFg() {
                return _$memo4(() => lineage.key === m.activeLineageKey())() ? m.pal().text : m.pal().muted;
              }
            }), _$createComponent5(Show5, {
              get when() {
                return _$memo4(() => !!props.cacheTTL?.enabled)() && props.cacheTTL?.providers;
              },
              get children() {
                return _$createComponent5(CacheTTLView, {
                  get messages() {
                    return m.metricMessages;
                  },
                  lineageKey: () => lineage.key,
                  now: ttlNow,
                  get config() {
                    return props.cacheTTL;
                  },
                  get pal() {
                    return m.pal();
                  },
                  layout,
                  get label() {
                    return `${m.t().secTTL} ${truncateVisual(model, Math.max(8, layout.gauge() - 8))}`;
                  }
                });
              }
            })];
          });
        }
      });
    }
  })];
}

// src/use-cache-hit-metrics.ts
import { createMemo as createMemo5, createSignal as createSignal4, onCleanup as onCleanup3 } from "solid-js";

// src/lineage-stats.ts
function emptyBucket(key, providerID, modelID) {
  return {
    key,
    providerID,
    modelID,
    callCount: 0,
    input: 0,
    output: 0,
    reasoning: 0,
    cacheRead: 0,
    cacheWrite: 0,
    cost: 0,
    cacheRatio: 0,
    agentCounts: {}
  };
}
function aggregateLineages(messages) {
  const buckets = new Map;
  const eligible = messages.filter((message) => message.role === "assistant" && isInteractiveAssistantMessage(message)).slice().sort(compareAssistantMessages);
  for (const message of eligible) {
    const providerID = message.providerID ?? "";
    const modelID = message.modelID ?? "";
    const key = messageLineageKey(message);
    const bucket = buckets.get(key) ?? emptyBucket(key, providerID, modelID);
    const tokens = message.tokens ?? {};
    const agent = message.agent ?? "unknown";
    bucket.callCount += 1;
    bucket.input += tokens.input ?? 0;
    bucket.output += tokens.output ?? 0;
    bucket.reasoning += tokens.reasoning ?? 0;
    bucket.cacheRead += tokens.cache?.read ?? 0;
    bucket.cacheWrite += tokens.cache?.write ?? 0;
    bucket.cost += message.cost ?? 0;
    bucket.agentCounts[agent] = (bucket.agentCounts[agent] ?? 0) + 1;
    bucket.cacheRatio = cacheHitRatio(bucket.cacheRead, bucket.input);
    bucket.lastCall = {
      id: message.id ?? message.messageID,
      created: message.time?.created,
      completed: message.time?.completed,
      agent: message.agent,
      hitPercent: perMessageHitPercent(message)
    };
    buckets.set(key, bucket);
  }
  return [...buckets.values()];
}
function activeLineageKey(messages) {
  const eligible = messages.filter((message) => message.role === "assistant" && isInteractiveAssistantMessage(message)).slice().sort(compareAssistantMessages);
  const last = eligible[eligible.length - 1];
  return last ? messageLineageKey(last) : undefined;
}
function recentLineages(buckets) {
  return buckets.slice().sort((a, b) => {
    const aTime = a.lastCall?.completed ?? a.lastCall?.created ?? -Infinity;
    const bTime = b.lastCall?.completed ?? b.lastCall?.created ?? -Infinity;
    return bTime - aTime || a.key.localeCompare(b.key);
  });
}

// src/dynamic-pricing/context.ts
function selectContextRates(cost, contextTokens, threshold = 200000) {
  if (!cost.context_over_200k)
    return cost;
  if (contextTokens === undefined)
    return cost;
  const eff = cost.contextThreshold ?? threshold;
  return contextTokens > eff ? cost.context_over_200k : cost;
}
function normalizeRuntimeCost(cost) {
  if (cost.context_over_200k)
    return cost;
  const raw = cost;
  if (raw.experimentalOver200K) {
    return { ...cost, context_over_200k: raw.experimentalOver200K, contextThreshold: 200000 };
  }
  const tier = raw.tiers?.find((t) => t.tier?.type === "context");
  if (tier) {
    return {
      ...cost,
      context_over_200k: {
        input: tier.input,
        output: tier.output,
        cache: { read: tier.cache?.read ?? 0, write: tier.cache?.write ?? 0 }
      },
      contextThreshold: tier.tier?.size ?? 200000
    };
  }
  return cost;
}
function scaleRates(cost, factor) {
  if (factor === 1)
    return cost;
  return {
    input: cost.input * factor,
    output: cost.output * factor,
    cache: { read: cost.cache.read * factor, write: cost.cache.write * factor },
    context_over_200k: cost.context_over_200k ? {
      input: cost.context_over_200k.input * factor,
      output: cost.context_over_200k.output * factor,
      cache: {
        read: cost.context_over_200k.cache.read * factor,
        write: cost.context_over_200k.cache.write * factor
      }
    } : undefined
  };
}
function billingCost(rates, input, output, cacheRead, cacheWrite) {
  return (input * rates.input + output * rates.output + cacheRead * rates.cache.read + cacheWrite * rates.cache.write) / 1e6;
}

// src/dynamic-pricing/deepseek.ts
var DEEPSEEK_DEFAULT_RULE = {
  multipliers: { peak: 1, offpeak: 0.5 }
};
function isDeepSeek(providerID, modelID) {
  const pid = providerID.toLowerCase();
  const mid = modelID.toLowerCase();
  return pid.includes("deepseek") || mid.startsWith("deepseek/");
}

// src/dynamic-pricing/lookup.ts
function lookupModelCost(providers, providerID, modelID) {
  if (!providerID || !modelID)
    return null;
  for (const p of providers) {
    if (p.id !== providerID)
      continue;
    const model = p.models[modelID];
    return model?.cost ? normalizeRuntimeCost(model.cost) : null;
  }
  return null;
}
var warnedNoWeekday = new Set;
function maybeWarnDeepSeekWeekend(rules, providerID, modelID) {
  if (!rules?.enabled || !isDeepSeek(providerID, modelID))
    return;
  const hasWindowed = rules.schedule.some((l) => l.windows.length > 0);
  const hasDays = rules.schedule.some((l) => l.windows.some((w) => w.days && w.days.length > 0));
  if (!(hasWindowed && !hasDays))
    return;
  const key = `${providerID}/${modelID}`;
  if (warnedNoWeekday.has(key))
    return;
  warnedNoWeekday.add(key);
  console.warn(`[dynamicPricing] ${key} schedule is not weekday-aware \u2014 weekends 9:00-12:00/14:00-18:00 may still bill at peak. ` + `Add "days":[1,2,3,4,5] to the peak windows to match DeepSeek's weekend off-peak pricing.`);
}
function effectiveRule(rules, providerID, modelID) {
  if (!rules?.enabled)
    return;
  const explicit = rules.providers[providerID]?.models[modelID];
  if (explicit)
    return explicit;
  if (rules.schedule.length > 0 && isDeepSeek(providerID, modelID)) {
    return DEEPSEEK_DEFAULT_RULE;
  }
  return;
}
function resolveLevel(now, rules) {
  if (!rules?.enabled)
    return;
  const tz = rules.timezone || "UTC";
  return isLevelAt(now, rules.schedule, tz);
}
function tierOf(cost, tokens, threshold) {
  if (!cost.context_over_200k || tokens === undefined)
    return;
  const eff = cost.contextThreshold ?? threshold;
  return tokens > eff ? "over" : "base";
}
function resolveModelCost(providers, providerID, modelID, ctx = {}) {
  const base = lookupModelCost(providers, providerID, modelID);
  if (!base)
    return null;
  if (ctx.rules && !ctx.rules.enabled)
    return { rates: base, explicit: false };
  const now = ctx.now ?? Date.now();
  const rules = ctx.rules;
  const level = resolveLevel(now, rules);
  maybeWarnDeepSeekWeekend(rules, providerID, modelID);
  const rule = effectiveRule(rules, providerID, modelID);
  const effThreshold = rule?.contextThreshold ?? base.contextThreshold ?? rules?.contextThreshold ?? 200000;
  const effBase = base.contextThreshold === effThreshold ? base : { ...base, contextThreshold: effThreshold };
  const contextTier = tierOf(effBase, ctx.contextTokens, effThreshold);
  if (rule?.levels) {
    const absolute = level ? rule.levels[level] : undefined;
    if (absolute) {
      return { rates: absolute, level, contextTier: undefined, explicit: true };
    }
    return { rates: selectContextRates(effBase, ctx.contextTokens, effThreshold), level: undefined, contextTier, explicit: true };
  }
  if (rule?.multipliers) {
    const factor = level ? rule.multipliers[level] ?? 1 : 1;
    const levelShown = level !== undefined && rule.multipliers[level] !== undefined;
    return { rates: scaleRates(selectContextRates(effBase, ctx.contextTokens, effThreshold), factor), level: levelShown ? level : undefined, contextTier, explicit: true };
  }
  const levelAware = rule?.levels !== undefined || rule?.multipliers !== undefined;
  return { rates: selectContextRates(effBase, ctx.contextTokens, effThreshold), level: levelAware ? level : undefined, contextTier, explicit: rule !== undefined };
}

// src/pricing.ts
var EMPTY_PRICING = {
  inputRate: 0,
  outputRate: 0,
  cacheReadRate: 0,
  cacheWriteRate: 0,
  saved: 0,
  dynamic: false
};
var EMPTY_SESSION_PRICING = {
  cost: 0,
  readSavings: 0,
  writePremium: 0,
  netCacheValue: 0,
  counted: 0,
  unpriced: 0,
  dynamic: false
};
function computeSessionPricing(messages, providers, rules) {
  const result = { ...EMPTY_SESSION_PRICING };
  for (const message of messages) {
    if (message.role !== "assistant" || !isInteractiveAssistantMessage(message))
      continue;
    const tokens = message.tokens;
    if (!tokens) {
      if ((message.cost ?? 0) !== 0)
        result.unpriced += 1;
      continue;
    }
    const input = tokens.input ?? 0;
    const output = tokens.output ?? 0;
    const cacheRead = tokens.cache?.read ?? 0;
    const cacheWrite = tokens.cache?.write ?? 0;
    if (input + output + cacheRead + cacheWrite === 0) {
      if ((message.cost ?? 0) !== 0)
        result.unpriced += 1;
      continue;
    }
    const resolved = resolveModelCost(providers, message.providerID ?? "", message.modelID ?? "", {
      now: message.time?.created,
      contextTokens: input + cacheRead,
      rules
    });
    if (!resolved) {
      result.unpriced += 1;
      continue;
    }
    const rates = resolved.rates;
    result.cost += billingCost(rates, input, output, cacheRead, cacheWrite);
    result.readSavings += cacheRead * (rates.input - rates.cache.read) / 1e6;
    result.writePremium += cacheWrite * (rates.cache.write - rates.input) / 1e6;
    result.counted += 1;
    result.dynamic ||= resolved.explicit;
  }
  result.netCacheValue = result.readSavings - result.writePremium;
  return result;
}
function computePricing(providers, providerID, modelID, cacheRead, ctx = {}) {
  const resolved = resolveModelCost(providers, providerID ?? "", modelID ?? "", {
    now: ctx.now,
    contextTokens: ctx.contextTokens,
    rules: ctx.rules
  });
  if (!resolved)
    return EMPTY_PRICING;
  const cost = resolved.rates;
  const inputRate = cost.input;
  const outputRate = cost.output;
  const cacheReadRate = cost.cache.read;
  const cacheWriteRate = cost.cache.write;
  const saved = inputRate > cacheReadRate ? cacheRead * (inputRate - cacheReadRate) / 1e6 : 0;
  return {
    inputRate,
    outputRate,
    cacheReadRate,
    cacheWriteRate,
    saved,
    level: resolved.level,
    contextTier: resolved.contextTier,
    dynamic: resolved.explicit
  };
}
function computeSubsSaved(subs, providers, ctx = {}) {
  let total = 0;
  for (const sub of subs) {
    const p = computePricing(providers, sub.providerID, sub.model, sub.cacheRead, {
      ...ctx,
      contextTokens: sub.input + sub.cacheRead
    });
    total += p.saved;
  }
  return total;
}

// src/dynamic-pricing/recompute.ts
function recomputeSubAgentCost(sub, providers, rules) {
  if (sub.created === undefined)
    return null;
  const input = sub.input;
  const output = sub.output;
  const cacheRead = sub.cacheRead;
  const cacheWrite = sub.cacheWrite;
  if (input + output + cacheRead + cacheWrite === 0)
    return null;
  const resolved = resolveModelCost(providers, sub.providerID, sub.model, {
    now: sub.created,
    contextTokens: input + cacheRead,
    rules
  });
  if (!resolved)
    return null;
  return resolved.explicit ? billingCost(resolved.rates, input, output, cacheRead, cacheWrite) : null;
}

// src/sparkline.ts
var BLOCKS = ["\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];
function formatSparkline(values, width = 7) {
  if (values.length === 0)
    return "";
  const recent = values.slice(-width);
  const min = Math.min(...recent);
  const max = Math.max(...recent);
  const range = max - min;
  return recent.map((v) => {
    if (range === 0)
      return BLOCKS[3];
    const normalized = (v - min) / range;
    const index = Math.min(Math.floor(normalized * BLOCKS.length), BLOCKS.length - 1);
    return BLOCKS[index];
  }).join("");
}
function collectSpeedValues(records, maxPoints = 7) {
  const speeds = [];
  for (const rec of records) {
    const tokens = (rec.output ?? 0) + (rec.reasoning ?? 0);
    if (!rec.durationMs || !tokens || rec.durationMs < 500)
      continue;
    const speed = tokens / rec.durationMs * 1000;
    if (speed > 0)
      speeds.push(speed);
  }
  return speeds.slice(-maxPoints);
}
function collectTpotValues(records, maxPoints = 7) {
  const values = [];
  for (const rec of records) {
    const tokens = (rec.output ?? 0) + (rec.reasoning ?? 0);
    if (!rec.durationMs || tokens <= 1 || rec.durationMs < 500)
      continue;
    const tpot = rec.durationMs / (tokens - 1);
    if (tpot > 0)
      values.push(tpot);
  }
  return values.slice(-maxPoints);
}

// src/use-cache-hit-metrics.ts
function activeLang(display) {
  return display.lang === "auto" ? resolveLang("auto") : display.lang;
}
function hitRateColor(pct, pal) {
  if (pct >= 85)
    return pal.success;
  if (pct >= 70)
    return pal.warning;
  return pal.muted;
}
function useCacheHitMetrics(props) {
  const pal = createMemo5(() => buildPanelPalette(props.theme()));
  const t = createMemo5(() => getUiStrings(activeLang(props.display)));
  const hitLabel = createMemo5(() => props.display.mainHitLabel ?? t().hit);
  const subs = createMemo5(() => props.subAgents());
  const metricInput = () => props.metricMessages?.() ?? props.messages();
  const lineages = createMemo5(() => aggregateLineages(metricInput()));
  const activeKey = createMemo5(() => activeLineageKey(metricInput()));
  const activeLineage = createMemo5(() => lineages().find((lineage) => lineage.key === activeKey()));
  const blendedMain = createMemo5(() => {
    const base = props.main();
    return mainSessionHasStats(base) ? base : aggregateSessionFromMessages(metricInput());
  });
  const main = createMemo5(() => {
    const base = props.main();
    const active = activeLineage();
    if (mainSessionHasStats(base)) {
      return {
        ...base,
        lineageKey: active?.key ?? base.lineageKey,
        model: active?.modelID ?? base.model,
        providerID: active?.providerID ?? base.providerID
      };
    }
    if (active) {
      return {
        lineageKey: active.key,
        model: active.modelID,
        providerID: active.providerID,
        input: active.input,
        output: active.output,
        reasoning: active.reasoning,
        cacheRead: active.cacheRead,
        cacheWrite: active.cacheWrite,
        cost: active.cost
      };
    }
    return aggregateSessionFromMessages(metricInput());
  });
  const perCall = createMemo5(() => computePerCallHitTrend(metricInput()));
  const sessionRatio = createMemo5(() => cacheHitRatio(main().cacheRead, main().input));
  const [now, setNow] = createSignal4(Date.now());
  let boundaryTimer;
  const scheduleBoundary = () => {
    const rules = props.dynamicPricing;
    const ms = rules.schedule.length > 0 ? nextBoundaryMs(now(), rules.schedule, rules.timezone || "UTC") : 0;
    if (ms <= 0)
      return;
    boundaryTimer = setTimeout(() => {
      setNow(Date.now());
      scheduleBoundary();
    }, ms);
  };
  onCleanup3(() => {
    if (boundaryTimer !== undefined)
      clearTimeout(boundaryTimer);
  });
  scheduleBoundary();
  const pricing = createMemo5(() => computePricing(props.providers(), main().providerID, main().model, main().cacheRead, {
    now: now(),
    contextTokens: main().input + main().cacheRead,
    rules: props.dynamicPricing
  }));
  const sessionPricing = createMemo5(() => computeSessionPricing(metricInput(), props.providers(), props.dynamicPricing));
  const subsSaved = createMemo5(() => computeSubsSaved(subs(), props.providers(), {
    now: now(),
    rules: props.dynamicPricing
  }));
  const subAgentDynamicCosts = createMemo5(() => {
    const rules = props.dynamicPricing;
    const providers = props.providers();
    return new Map(subs().map((s) => [s.id, recomputeSubAgentCost(s, providers, rules)]));
  });
  const mainHasStats = createMemo5(() => mainSessionHasStats(main()));
  const hasData = createMemo5(() => mainSessionHasStats(main()) || lineages().length > 0 || subs().length > 0);
  const noMainData = createMemo5(() => lineages().length === 0);
  const trendLabel = createMemo5(() => {
    if (noMainData())
      return "";
    if (perCall().state === "switch")
      return t().switchState;
    if (perCall().state === "warming")
      return t().warmingState;
    return perCall().hasTrend ? formatTrendLabel(perCall().trendPercent) : "";
  });
  const bar = createMemo5(() => formatHitBar(perCall().hitPercent / 100, computeHitBarWidth(hitLabel(), props.layout.gauge(), trendLabel(), trendLabel().length > 0)));
  const hitColor = createMemo5(() => noMainData() ? pal().text : hitRateColor(perCall().hitPercent, pal()));
  const trendFg = createMemo5(() => {
    if (noMainData())
      return pal().text;
    if (perCall().state === "switch")
      return pal().warning;
    if (perCall().state === "warming")
      return pal().muted;
    const tr = perCall().trendPercent;
    if (Math.abs(tr) < 0.05)
      return pal().text;
    return tr > 0 ? pal().success : pal().error;
  });
  const collapsedHitSummary = createMemo5(() => {
    const left = noMainData() ? "-" : formatPercentOneDecimal(perCall().hitPercent);
    const right = trendLabel() ? `${left} ${t().hitFolded} ${trendLabel()}` : `${left} ${t().hitFolded}`;
    return { text: right, width: visualWidth(right) };
  });
  const useTps = createMemo5(() => props.display.speedUnit === "tps");
  const lastSpeed = createMemo5(() => {
    const msgs = props.messages();
    const firstPartTime = props.firstPartTime();
    for (let i = msgs.length - 1;i >= 0; i--) {
      if (!isInteractiveAssistantMessage(msgs[i]))
        continue;
      const timing = timingFromAssistantMessage(msgs[i]);
      if (!timing?.isComplete)
        continue;
      const output = msgs[i].tokens?.output ?? 0;
      const reasoning = msgs[i].tokens?.reasoning ?? 0;
      if (output + reasoning === 0)
        continue;
      const msgID = msgs[i].id ?? msgs[i].messageID;
      const firstTime = msgID ? firstPartTime.get(msgID) : undefined;
      const durationMs = generationDurationMs(timing, firstTime);
      if (durationMs === undefined)
        continue;
      const v = useTps() ? computeTokenSpeed(output, reasoning, durationMs) : computeTokenTpotMs(output, reasoning, durationMs);
      return v === 0 ? undefined : v;
    }
    return;
  });
  const avgSpeed = createMemo5(() => {
    if (useTps()) {
      const v = computeAvgTokenSpeed(props.messages(), props.firstPartTime());
      return v === 0 ? undefined : v;
    }
    return computeAvgTokenTpotMs(props.messages(), props.firstPartTime());
  });
  const speedValues = createMemo5(() => {
    const msgs = props.messages();
    const firstPartTime = props.firstPartTime();
    const records = msgs.filter((msg) => isInteractiveAssistantMessage(msg) && msg.time?.completed).map((msg) => {
      const timing = timingFromAssistantMessage(msg);
      const msgID = msg.id ?? msg.messageID;
      const firstTime = msgID ? firstPartTime.get(msgID) : undefined;
      return {
        durationMs: timing ? generationDurationMs(timing, firstTime) : undefined,
        output: msg.tokens?.output ?? 0,
        reasoning: msg.tokens?.reasoning ?? 0
      };
    });
    return useTps() ? collectSpeedValues(records) : collectTpotValues(records);
  });
  const lastSpeedLabel = createMemo5(() => useTps() ? formatTokenSpeed(lastSpeed() ?? 0) : formatTokenTpot(lastSpeed()));
  const avgSpeedLabel = createMemo5(() => useTps() ? formatTokenSpeed(avgSpeed() ?? 0) : formatTokenTpot(avgSpeed()));
  const sparkline = createMemo5(() => formatSparkline(speedValues()));
  const lastTtft = createMemo5(() => {
    const msgs = props.messages();
    for (let i = msgs.length - 1;i >= 0; i--) {
      if (!isInteractiveAssistantMessage(msgs[i]))
        continue;
      const msgID = msgs[i].id ?? msgs[i].messageID;
      if (!msgID)
        continue;
      const firstTime = props.firstPartTime().get(msgID);
      if (firstTime === undefined)
        continue;
      const timing = timingFromAssistantMessage(msgs[i]);
      if (!timing)
        continue;
      if (firstTime <= timing.created)
        continue;
      return firstTime - timing.created;
    }
    return;
  });
  const lastTtftLabel = createMemo5(() => {
    const ttft = lastTtft();
    if (ttft === undefined)
      return "\u2014";
    if (ttft < 1000)
      return `${ttft}ms`;
    return `${(ttft / 1000).toFixed(1)}s`;
  });
  return {
    pal,
    t,
    hitLabel,
    subs,
    main,
    blendedMain,
    lineages,
    activeLineage,
    activeLineageKey: activeKey,
    metricMessages: metricInput,
    recentLineages: createMemo5(() => recentLineages(lineages())),
    metricMessageStatus: () => props.metricMessageStatus?.() ?? "complete",
    mainHasStats,
    perCall,
    pricing,
    sessionPricing,
    sessionPct: createMemo5(() => mainSessionHasStats(main()) ? formatRatioAsPercent(sessionRatio()) : "-"),
    hasData,
    trendLabel,
    bar,
    hitColor,
    trendFg,
    pctLabel: createMemo5(() => noMainData() ? "-" : formatPercentOneDecimal(perCall().hitPercent)),
    modelShort: createMemo5(() => shortModelName(main().model)),
    totalSubCost: createMemo5(() => subs().reduce((s, a) => s + a.cost, 0)),
    subAgentDynamicCosts,
    subsSaved,
    collapsedHitSummary,
    useTps,
    lastSpeed,
    lastSpeedLabel,
    avgSpeed,
    avgSpeedLabel,
    sparkline,
    lastTtft,
    lastTtftLabel
  };
}

// src/widget.tsx
function CacheHitSidebar(props) {
  const [panelOpen, setPanelOpen] = createSignal5(true);
  const detail = createSectionFold(true);
  const speed = createSectionFold(true);
  const dist = createSectionFold(true);
  const model = createSectionFold(true);
  const lineages = createSectionFold(true);
  const agents = createSectionFold(true);
  const borderOn = () => props.display.panelBorder;
  const layout = createPanelLayout({
    border: borderOn
  });
  const m = useCacheHitMetrics({
    theme: () => props.theme,
    display: props.display,
    messages: props.messages,
    metricMessages: props.metricMessages ?? props.messages,
    metricMessageStatus: props.metricMessageStatus,
    main: props.main,
    subAgents: props.subAgents,
    providers: props.providers,
    dynamicPricing: props.dynamicPricing,
    layout,
    firstPartTime: props.firstPartTime
  });
  const formatSpeed = createMemo6(() => props.display.speedUnit === "tps" ? (v) => formatTokenSpeed(v ?? 0) : (v) => formatTokenTpot(v));
  const agentsSuffix = createMemo6(() => {
    const n = m.subs().length;
    if (n === 0)
      return "";
    return ` (${n})${m.t().agentsScopeHint}`;
  });
  return _$createComponent6(Show6, {
    get when() {
      return props.sessionId().length > 0;
    },
    get children() {
      return _$createComponent6(TuiPanel, {
        get pal() {
          return m.pal();
        },
        get border() {
          return borderOn();
        },
        layout,
        get children() {
          return [_$createComponent6(TuiPanelTitle, {
            get pal() {
              return m.pal();
            },
            layout,
            get open() {
              return panelOpen();
            },
            onToggle: () => setPanelOpen((o) => !o),
            get title() {
              return m.t().title;
            },
            version: PLUGIN_VERSION,
            get collapsed() {
              return [_$createComponent6(Show6, {
                get when() {
                  return _$memo5(() => !!m.hasData())() && m.mainHasStats();
                },
                get children() {
                  return _$createComponent6(TuiTitleSummaryPad, {
                    layout,
                    get titleWidth() {
                      return visualWidth(m.t().title);
                    },
                    get summaryWidth() {
                      return m.collapsedHitSummary().width;
                    },
                    get children() {
                      var _el$ = _$createElement4("span");
                      _$insert4(_el$, () => m.collapsedHitSummary().text);
                      _$effect4((_$p) => _$setProp4(_el$, "style", {
                        fg: m.hitColor()
                      }, _$p));
                      return _el$;
                    }
                  });
                }
              }), _$createComponent6(Show6, {
                get when() {
                  return _$memo5(() => !!(m.hasData() && !m.mainHasStats()))() && m.subs().length > 0;
                },
                get children() {
                  return _$createComponent6(TuiTitleSummaryPad, {
                    layout,
                    get titleWidth() {
                      return visualWidth(m.t().title);
                    },
                    get summaryWidth() {
                      return visualWidth(props.formatCost(m.totalSubCost()));
                    },
                    get children() {
                      var _el$2 = _$createElement4("span");
                      _$insert4(_el$2, () => props.formatCost(m.totalSubCost()));
                      _$effect4((_$p) => _$setProp4(_el$2, "style", {
                        fg: m.pal().success
                      }, _$p));
                      return _el$2;
                    }
                  });
                }
              })];
            }
          }), _$createComponent6(Show6, {
            get when() {
              return panelOpen();
            },
            get children() {
              return _$createComponent6(Show6, {
                get when() {
                  return m.hasData();
                },
                get fallback() {
                  return _$createComponent6(TuiPanelNoData, {
                    get pal() {
                      return m.pal();
                    },
                    layout,
                    get message() {
                      return m.t().noData;
                    }
                  });
                },
                get children() {
                  return [_$createComponent6(TuiPanelSep, {
                    get pal() {
                      return m.pal();
                    },
                    layout
                  }), _$createComponent6(MainSessionView, {
                    m,
                    layout,
                    detail,
                    speed,
                    dist,
                    model,
                    lineages,
                    get showSpeed() {
                      return props.display.showSpeed;
                    },
                    get showDistribution() {
                      return props.display.showDistribution;
                    },
                    get tokenDist() {
                      return props.tokenDist;
                    },
                    get streamingNow() {
                      return props.streamingNow;
                    },
                    get formatCost() {
                      return props.formatCost;
                    },
                    get formatRate() {
                      return props.formatRate;
                    },
                    get cacheTTL() {
                      return props.cacheTTL;
                    },
                    get messages() {
                      return props.messages;
                    }
                  }), _$createComponent6(Show6, {
                    get when() {
                      return m.subs().length > 0;
                    },
                    get children() {
                      return _$createComponent6(TuiSection, {
                        get pal() {
                          return m.pal();
                        },
                        layout,
                        get open() {
                          return agents.open();
                        },
                        get title() {
                          return m.t().secAgents;
                        },
                        get suffix() {
                          return agentsSuffix();
                        },
                        get onToggle() {
                          return agents.toggle;
                        },
                        get children() {
                          return _$createComponent6(AgentsView, {
                            m,
                            layout,
                            get formatCost() {
                              return props.formatCost;
                            },
                            get formatSpeed() {
                              return formatSpeed();
                            }
                          });
                        }
                      });
                    }
                  })];
                }
              });
            }
          })];
        }
      });
    }
  });
}

// src/timeline/records.ts
function msToISOString(ms) {
  const d = new Date(ms);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, "0");
  const mm = String(Math.abs(off) % 60).padStart(2, "0");
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` + `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` + `.${pad(d.getMilliseconds(), 3)}${sign}${hh}:${mm}`;
}
function messageKeyFor(msg, sessionId) {
  const id = msg.id ?? msg.messageID;
  if (typeof id === "string" && id.length > 0)
    return `${sessionId}:${id}`;
  const created = msg.time?.created ?? 0;
  return `${sessionId}:${created}:${msg.modelID ?? ""}`;
}
function assistantMessageToRecord(msg, sessionId, rootSessionId, scope, recordedAt, firstPartTime, ttftSource, toolDurations, itlP50, itlP90, itlCount) {
  if (msg.role !== "assistant")
    return null;
  const timing = timingFromAssistantMessage(msg);
  if (!timing)
    return null;
  const t = msg.tokens ?? {};
  const skippedForMetrics = !isInteractiveAssistantMessage(msg);
  const output = t.output ?? 0;
  const reasoning = t.reasoning ?? 0;
  const tokens = output + reasoning;
  const ttftMs = firstPartTime !== undefined && firstPartTime > timing.created ? firstPartTime - timing.created : undefined;
  const genTimeMs = generationDurationMs(timing, firstPartTime);
  const tps = genTimeMs !== undefined && genTimeMs > 0 && tokens > 0 ? tokens / genTimeMs * 1000 : undefined;
  const tpot = genTimeMs !== undefined && genTimeMs >= 500 && tokens > 1 ? genTimeMs / (tokens - 1) : undefined;
  return {
    schema: 1,
    recordedAt: msToISOString(recordedAt),
    sessionId,
    rootSessionId,
    scope,
    messageKey: messageKeyFor(msg, sessionId),
    modelId: msg.modelID ?? "",
    providerId: msg.providerID ?? "",
    created: msToISOString(timing.created),
    completedAt: timing.completedAt !== undefined ? msToISOString(timing.completedAt) : undefined,
    durationMs: timing.durationMs,
    isComplete: timing.isComplete,
    input: t.input ?? 0,
    output,
    reasoning: t.reasoning ?? 0,
    cacheRead: t.cache?.read ?? 0,
    cacheWrite: t.cache?.write ?? 0,
    cost: msg.cost ?? 0,
    hitPercent: perMessageHitPercent(msg),
    skippedForHit: skippedForMetrics,
    skippedForMetrics,
    ttftMs,
    ttftSource,
    tps,
    tpot,
    itlP50,
    itlP90,
    itlCount,
    finish: msg.finish,
    toolDurations
  };
}

// src/timeline/writer.ts
import { appendFile, mkdir, readdir, stat as stat2, unlink as unlink2 } from "fs/promises";
import { homedir } from "os";
import { dirname, join } from "path";

// src/timeline/rotation.ts
import { readFile, rename, stat, unlink, writeFile } from "fs/promises";
async function trimFileToMaxLines(logPath, maxLines) {
  if (maxLines <= 0)
    return;
  let text;
  try {
    text = await readFile(logPath, "utf8");
  } catch {
    return;
  }
  const lines = text.split(`
`).filter((line) => line.length > 0);
  if (lines.length <= maxLines)
    return;
  await writeFile(logPath, lines.slice(-maxLines).join(`
`) + `
`, "utf8");
}
async function rotateFileBySize(logPath, maxBytes, retainRotated) {
  if (maxBytes <= 0)
    return;
  let size = 0;
  try {
    size = (await stat(logPath)).size;
  } catch {
    return;
  }
  if (size < maxBytes)
    return;
  const retain = Math.max(0, Math.floor(retainRotated));
  if (retain === 0) {
    await unlink(logPath).catch(() => {});
    return;
  }
  const oldest = `${logPath}.${retain}`;
  await unlink(oldest).catch(() => {});
  for (let i = retain - 1;i >= 1; i--) {
    await rename(`${logPath}.${i}`, `${logPath}.${i + 1}`).catch(() => {});
  }
  await rename(logPath, `${logPath}.1`);
}

// src/timeline/writer.ts
var DEFAULT_TIMELINE_DIR = join(homedir(), ".local", "share", "opencode", "logs", "cache-hit");
var TIMELINE_FILE_PREFIX = "timeline";
function resolveTimelineDir(config) {
  const raw = (config.dir ?? "").trim();
  if (!raw)
    return DEFAULT_TIMELINE_DIR;
  return raw.startsWith("~/") ? join(homedir(), raw.slice(2)) : raw;
}
function localDateKey(ms = Date.now()) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function timelineDailyLogPath(logsDir, dateKey) {
  return join(logsDir, `${TIMELINE_FILE_PREFIX}-${dateKey}.jsonl`);
}
function serializeRecord(record) {
  return JSON.stringify(record) + `
`;
}
var TIMELINE_FILE_RE = /^timeline-\d{4}-\d{2}-\d{2}\.jsonl(\.\d+)?$/;
function parseTimelineLogBasename(name) {
  const m = /^timeline-(\d{4}-\d{2}-\d{2})\.jsonl(?:\.(\d+))?$/.exec(name);
  if (!m)
    return null;
  return { dateKey: m[1], roll: m[2] ? Number.parseInt(m[2], 10) : 0 };
}
function compareTimelineLogsForPurge(aPath, bPath) {
  const a = parseTimelineLogBasename(aPath.split(/[/\\]/).pop() ?? "");
  const b = parseTimelineLogBasename(bPath.split(/[/\\]/).pop() ?? "");
  if (!a || !b)
    return 0;
  if (a.dateKey !== b.dateKey)
    return a.dateKey.localeCompare(b.dateKey);
  return b.roll - a.roll;
}
async function listTimelineLogFiles(logsDir) {
  let names;
  try {
    names = await readdir(logsDir);
  } catch {
    return [];
  }
  const entries = [];
  for (const name of names) {
    if (!TIMELINE_FILE_RE.test(name))
      continue;
    const path = join(logsDir, name);
    try {
      entries.push({ path, mtimeMs: (await stat2(path)).mtimeMs });
    } catch {}
  }
  return entries;
}
async function purgeTimelineLogsOlderThan(logsDir, maxAgeDays) {
  if (maxAgeDays <= 0)
    return;
  const cutoff = Date.now() - maxAgeDays * 86400000;
  for (const { path, mtimeMs } of await listTimelineLogFiles(logsDir)) {
    if (mtimeMs < cutoff)
      await unlink2(path).catch(() => {});
  }
}
async function purgeTimelineLogsOverCount(logsDir, maxLogFiles) {
  if (maxLogFiles <= 0)
    return;
  const entries = await listTimelineLogFiles(logsDir);
  if (entries.length <= maxLogFiles)
    return;
  entries.sort((a, b) => {
    const byLog = compareTimelineLogsForPurge(a.path, b.path);
    if (byLog !== 0)
      return byLog;
    return a.mtimeMs - b.mtimeMs;
  });
  const remove = entries.length - maxLogFiles;
  for (let i = 0;i < remove; i++) {
    await unlink2(entries[i].path).catch(() => {});
  }
}
async function purgeTimelineLogDir(logsDir, opts) {
  await purgeTimelineLogsOlderThan(logsDir, opts.maxAgeDays);
  await purgeTimelineLogsOverCount(logsDir, opts.maxLogFiles);
}
async function appendTimelineRecord(logPath, record, rotation) {
  await mkdir(dirname(logPath), { recursive: true });
  const maxLines = rotation?.maxLinesPerFile ?? 0;
  const maxBytes = rotation?.rotateMaxBytes ?? 0;
  const retain = rotation?.retainRotated ?? 5;
  if (maxBytes > 0) {
    await rotateFileBySize(logPath, maxBytes, retain);
  }
  await appendFile(logPath, serializeRecord(record), "utf8");
  if (maxLines > 0) {
    await trimFileToMaxLines(logPath, maxLines);
  }
}

// src/timeline/collector.ts
function createTimelineCollector(opts) {
  const ttft = opts.firstPartTime;
  const toolTiming = opts.toolTiming;
  const itlTracker = opts.itlTracker;
  const defaultAppend = opts.append ?? ((path, record, cfg) => appendTimelineRecord(path, record, {
    maxLinesPerFile: cfg.maxLinesPerFile,
    rotateMaxBytes: cfg.rotateMaxBytes,
    retainRotated: cfg.retainRotated
  }));
  let activeDateKey = localDateKey();
  let memory = [];
  let disposed = false;
  let purgeDone = false;
  const ensureDateKey = () => {
    const today = localDateKey();
    if (today !== activeDateKey) {
      activeDateKey = today;
    }
    return today;
  };
  const maybePurge = (config) => {
    if (purgeDone)
      return;
    if (config.maxAgeDays <= 0 && config.maxLogFiles <= 0)
      return;
    purgeDone = true;
    purgeTimelineLogDir(resolveTimelineDir(config), {
      maxAgeDays: config.maxAgeDays,
      maxLogFiles: config.maxLogFiles
    });
  };
  const handleMessage = (sessionID, msg) => {
    if (disposed)
      return;
    const config = opts.getConfig();
    if (!config.enabled)
      return;
    const rootId = opts.getRootSessionId();
    if (!rootId)
      return;
    let scope;
    if (sessionID === rootId) {
      scope = "main";
    } else if (opts.getChildIds().includes(sessionID)) {
      scope = "child";
    } else {
      return;
    }
    if (msg.role !== "assistant")
      return;
    if (!config.logSummaryMessages && !isInteractiveAssistantMessage(msg))
      return;
    maybePurge(config);
    const msgID = msg.id ?? msg.messageID ?? "";
    const q = itlTracker?.getQuantiles(msgID);
    const rec = assistantMessageToRecord(msg, sessionID, rootId, scope, Date.now(), ttft.get().get(msgID), ttft.getSource(msgID), toolTiming.getDurations(msgID), q && q.p50, q && q.p90, q && q.count);
    if (!rec)
      return;
    if (!config.flushIncomplete && !rec.isComplete)
      return;
    if (rec.created.startsWith("1970"))
      return;
    const logsDir = resolveTimelineDir(config);
    const logPath = timelineDailyLogPath(logsDir, ensureDateKey());
    defaultAppend(logPath, rec, config).catch(() => {});
    memory.push(rec);
    const max = config.maxMemoryRows;
    while (memory.length > max)
      memory.shift();
  };
  return {
    handleMessage,
    resetForRootChange: () => {
      memory = [];
    },
    dispose: () => {
      disposed = true;
      memory = [];
    },
    memoryRecords: () => {
      const max = opts.getConfig().maxMemoryRows;
      if (memory.length <= max)
        return memory;
      return memory.slice(-max);
    }
  };
}

// src/tool-timing.ts
function strField(value) {
  return typeof value === "string" ? value : undefined;
}
function truncate(s, maxLen) {
  return s.length > maxLen ? s.slice(0, maxLen - 3) + "..." : s;
}
function basename(path) {
  const sep = path.lastIndexOf("/");
  return sep >= 0 ? path.slice(sep + 1) : path;
}
function stripUrlQuery(raw) {
  const q = raw.indexOf("?");
  return q >= 0 ? raw.slice(0, q) : raw;
}
function urlDomainPath(url) {
  try {
    const u = new URL(url);
    return truncate(u.pathname ? u.hostname + u.pathname : u.hostname, 80);
  } catch {
    return truncate(stripUrlQuery(url), 80);
  }
}
function toolSummary(tool, input) {
  if (!input)
    return;
  if (tool === "bash")
    return truncate(strField(input.command) ?? "", 60) || undefined;
  if (tool === "read" || tool === "write" || tool === "edit") {
    const fp = strField(input.filePath);
    return fp ? basename(fp) : undefined;
  }
  if (tool === "grep" || tool === "glob") {
    const pattern = strField(input.pattern);
    return pattern ? truncate(pattern, 60) : undefined;
  }
  if (tool === "webfetch") {
    const url = strField(input.url);
    return url ? urlDomainPath(url) : undefined;
  }
  if (tool === "task") {
    const desc = strField(input.description);
    return desc ? truncate(desc, 60) : undefined;
  }
  if (tool === "websearch") {
    const query = strField(input.query);
    return query ? truncate(query, 60) : undefined;
  }
  if (tool === "lsp_diagnostics" || tool === "lsp_symbols" || tool === "lsp_find_references" || tool === "lsp_goto_definition") {
    const fp = strField(input.filePath);
    return fp ? basename(fp) : undefined;
  }
  if (tool === "question") {
    const questions = input.questions;
    if (!Array.isArray(questions) || questions.length === 0)
      return;
    const q = questions[0];
    if (!q || typeof q !== "object")
      return;
    const item = q;
    const header = strField(item.header);
    if (header)
      return truncate(header, 60);
    const question = strField(item.question);
    return question ? truncate(question, 60) : undefined;
  }
  return;
}
function createToolTimingTracker(opts) {
  let disposed = false;
  const timing = new Map;
  const isSummaryEnabled = opts?.isSummaryEnabled ?? (() => true);
  const handleToolPart = (messageID, part) => {
    if (disposed || !messageID || part.type !== "tool")
      return;
    if (!part.callID || !part.tool)
      return;
    const state = part.state;
    if (!state?.status)
      return;
    const entries = timing.get(messageID) ?? [];
    let entry = entries.find((e) => e.callID === part.callID);
    if (!entry) {
      entry = {
        tool: part.tool,
        callID: part.callID,
        summary: isSummaryEnabled(part.tool) ? toolSummary(part.tool, state.input) : undefined,
        status: "running"
      };
      entries.push(entry);
      timing.set(messageID, entries);
    }
    if (entry.summary === undefined && state.input && isSummaryEnabled(part.tool)) {
      entry.summary = toolSummary(part.tool, state.input);
    }
    if (state.status === "running" && entry.status === "running" && entry.start === undefined) {
      entry.start = state.time?.start ?? Date.now();
    }
    if ((state.status === "completed" || state.status === "error") && entry.status === "running") {
      if (entry.start === undefined && typeof state.time?.start === "number") {
        entry.start = state.time.start;
      }
      entry.status = state.status;
      entry.end = state.time?.end ?? Date.now();
      if (typeof entry.start === "number" && entry.end >= entry.start) {
        entry.durationMs = entry.end - entry.start;
      }
    }
  };
  const getDurations = (messageID) => {
    const entries = timing.get(messageID);
    if (!entries?.length)
      return;
    const result = entries.filter((e) => e.durationMs !== undefined).map((e) => ({ tool: e.tool, summary: e.summary, durationMs: e.durationMs }));
    return result.length > 0 ? result : undefined;
  };
  return {
    handleToolPart,
    getDurations,
    reset: () => timing.clear(),
    dispose: () => {
      disposed = true;
      timing.clear();
    }
  };
}

// src/itl-tracker.ts
var MAX_SAMPLES = 500;
function quantile(sorted, k) {
  const idx = Math.max(0, Math.ceil(sorted.length * k) - 1);
  return sorted[idx];
}
function createItlTracker() {
  const chunks = new Map;
  function trackChunk(messageId, timestampMs) {
    let list = chunks.get(messageId);
    if (!list) {
      list = [];
      chunks.set(messageId, list);
    }
    if (list.length >= MAX_SAMPLES)
      return;
    list.push(timestampMs ?? Date.now());
  }
  function getQuantiles(messageId) {
    const list = chunks.get(messageId);
    if (!list || list.length < 2)
      return;
    const deltas = [];
    for (let i = 1;i < list.length; i++) {
      const dt = list[i] - list[i - 1];
      if (dt > 0)
        deltas.push(dt);
    }
    if (deltas.length === 0)
      return;
    deltas.sort((a, b) => a - b);
    return {
      p50: quantile(deltas, 0.5),
      p90: quantile(deltas, 0.9),
      count: deltas.length
    };
  }
  function reset() {
    chunks.clear();
  }
  return { trackChunk, getQuantiles, reset };
}

// src/types.ts
function isPartUpdatedEvent(event) {
  const p = event.properties?.part;
  return typeof p === "object" && p !== null && typeof p.type === "string" && typeof p.messageID === "string";
}

// src/session-messages.ts
var SESSION_MESSAGE_LIMIT = 1e4;
var TUI_MIRROR_LIMIT = 100;
function responseEntries(raw) {
  if (Array.isArray(raw))
    return raw;
  if (!raw || typeof raw !== "object")
    return null;
  const data = raw.data;
  return Array.isArray(data) ? data : null;
}
function normalizeEntries(entries) {
  const messages = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object")
      return null;
    const info = entry.info;
    if (!info || typeof info !== "object")
      return null;
    const message = info;
    if (typeof message.role !== "string")
      return null;
    if (message.role === "assistant")
      messages.push(message);
  }
  return messages;
}
function fallbackResult(fallback, reason) {
  const messages = [...fallback];
  if (messages.length < TUI_MIRROR_LIMIT) {
    return { messages, status: "complete", source: "mirror" };
  }
  return { messages, status: "unavailable", source: "mirror", reason };
}
async function loadSessionMessages(opts) {
  const fallback = opts.fallback;
  const request = opts.client.messages;
  if (!request) {
    return fallbackResult(fallback, "missing-client");
  }
  let raw;
  try {
    raw = await request({
      path: { id: opts.sessionId },
      query: { directory: opts.directory, limit: opts.limit ?? SESSION_MESSAGE_LIMIT }
    });
  } catch {
    return fallbackResult(fallback, "request-failed");
  }
  const entries = responseEntries(raw);
  const messages = entries ? normalizeEntries(entries) : null;
  if (!entries || !messages) {
    return fallbackResult(fallback, "malformed-response");
  }
  const limit = opts.limit ?? SESSION_MESSAGE_LIMIT;
  if (entries.length >= limit) {
    return { messages, status: "capped", source: "direct", reason: "limit-reached" };
  }
  return { messages, status: "complete", source: "direct" };
}

// src/session-list.ts
function parseSessionListResponse(all) {
  const list = Array.isArray(all) ? all : all?.data ?? [];
  if (!Array.isArray(list))
    return [];
  return list.map((raw) => {
    const s = raw;
    return {
      id: s.id ?? "",
      parentID: s.parentID,
      created: s.time?.created ?? s.createdAt
    };
  }).filter((e) => e.id.length > 0);
}
function childSessionEntriesForParent(list, parentId) {
  return list.filter((s) => s.parentID === parentId);
}

// src/child-session-sync.ts
var CHILD_LIST_DEBOUNCE_MS = 200;
function createChildSessionSync(opts) {
  let listGen = 0;
  let debounceTimer;
  const clearDebounce = () => {
    if (debounceTimer !== undefined)
      clearTimeout(debounceTimer);
    debounceTimer = undefined;
  };
  const loadChildren = () => {
    clearDebounce();
    const parentId = opts.getParentId();
    if (!parentId) {
      opts.setChildIds([]);
      opts.setChildEntries?.([]);
      return;
    }
    const gen = listGen;
    const directory = opts.getDirectory();
    opts.client.list({ query: { directory } }).then((all) => {
      if (gen !== listGen || opts.getParentId() !== parentId)
        return;
      const entries = childSessionEntriesForParent(parseSessionListResponse(all), parentId);
      opts.setChildIds(entries.map((e) => e.id));
      opts.setChildEntries?.(entries);
      opts.onSynced?.();
    }, () => {
      if (gen !== listGen || opts.getParentId() !== parentId)
        return;
      opts.setChildIds([]);
      opts.setChildEntries?.([]);
    });
  };
  const scheduleLoad = () => {
    clearDebounce();
    if (!opts.getParentId())
      return;
    const ms = opts.debounceMs ?? CHILD_LIST_DEBOUNCE_MS;
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      loadChildren();
    }, ms);
  };
  const resetForParentChange = () => {
    listGen++;
    clearDebounce();
    opts.setChildIds([]);
  };
  const onForeignSessionActivity = (sessionId) => {
    const parentId = opts.getParentId();
    if (!parentId || !sessionId || sessionId === parentId)
      return;
    scheduleLoad();
  };
  const dispose = () => {
    listGen++;
    clearDebounce();
  };
  return {
    loadChildren,
    scheduleLoad,
    resetForParentChange,
    onForeignSessionActivity,
    dispose,
    _generation: () => listGen
  };
}

// src/load-config.ts
import { existsSync, readFileSync } from "fs";
import { homedir as homedir2 } from "os";
import { join as join2 } from "path";
import { fileURLToPath } from "url";

// src/jsonc.ts
var JSON_WHITESPACE = new Set([" ", "\t", `
`, "\r"]);
function withoutTrailingComma(out) {
  let end = out.length;
  while (end > 0 && JSON_WHITESPACE.has(out[end - 1]))
    end--;
  return end > 0 && out[end - 1] === "," ? out.slice(0, end - 1) : out;
}
function stripJsonc(src) {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0;i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (inStr) {
      out += c;
      if (esc)
        esc = false;
      else if (c === "\\")
        esc = true;
      else if (c === '"')
        inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      out += c;
      continue;
    }
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== `
`)
        i++;
      continue;
    }
    if (c === "/" && n === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/"))
        i++;
      i++;
      continue;
    }
    if (c === "}" || c === "]") {
      out = withoutTrailingComma(out);
    }
    out += c;
  }
  return out;
}
function parseJsonc(src) {
  return JSON.parse(stripJsonc(src));
}

// src/load-config.ts
var PLUGIN_ROOT = fileURLToPath(new URL("..", import.meta.url));
var XDG_CONFIG_PATH = join2(homedir2(), ".config", "opencode", "cache-hit.json");
var CONFIG_PATH = join2(PLUGIN_ROOT, "cache-hit.config.json");
function cloneDefault() {
  return structuredClone(DEFAULT_PLUGIN_CONFIG);
}
function tryRead(path) {
  try {
    return normalizePluginConfig(parseJsonc(readFileSync(path, "utf8")));
  } catch {
    return null;
  }
}
function loadPluginConfig() {
  if (existsSync(XDG_CONFIG_PATH)) {
    const cfg = tryRead(XDG_CONFIG_PATH);
    if (cfg)
      return cfg;
  }
  if (existsSync(CONFIG_PATH)) {
    const cfg = tryRead(CONFIG_PATH);
    if (cfg)
      return cfg;
  }
  return cloneDefault();
}

// src/sidebar-host.tsx
function CacheHitSidebarHost(props) {
  const [refreshTick, setRefreshTick] = createSignal6(0);
  const [childIds, setChildIds] = createSignal6([]);
  const [childEntries, setChildEntries] = createSignal6([]);
  const [historyMessages, setHistoryMessages] = createSignal6([]);
  const [historyStatus, setHistoryStatus] = createSignal6("complete");
  const pendingHistoryUpdates = new Map;
  let historyLoadGeneration = 0;
  const runtimeConfig = createMemo7(() => {
    props.sessionId;
    return loadPluginConfig();
  });
  const display = createMemo7(() => runtimeConfig().display);
  const cacheTTL = createMemo7(() => runtimeConfig().cacheTTL);
  const dynamicPricing = createMemo7(() => runtimeConfig().dynamicPricing);
  const timelineConfig = createMemo7(() => runtimeConfig().timeline);
  const bumpRefresh = () => setRefreshTick((v) => v + 1);
  const firstPartTracker = createFirstPartTimeTracker();
  onCleanup4(() => firstPartTracker.dispose());
  const toolTiming = createToolTimingTracker({
    isSummaryEnabled: (tool) => isToolSummaryEnabled(timelineConfig().toolSummary, tool)
  });
  onCleanup4(() => toolTiming.dispose());
  const itlTracker = createItlTracker();
  const timeline = createTimelineCollector({
    getConfig: () => timelineConfig(),
    getRootSessionId: () => props.sessionId,
    getChildIds: childIds,
    firstPartTime: firstPartTracker,
    toolTiming,
    itlTracker
  });
  onCleanup4(() => timeline.dispose());
  const childSync = createChildSessionSync({
    client: props.api.client.session,
    getDirectory: () => props.api.state.path.directory,
    getParentId: () => props.sessionId,
    setChildIds,
    setChildEntries,
    onSynced: () => {
      bumpRefresh();
    }
  });
  onCleanup4(() => childSync.dispose());
  const mainSnap = createMemo7(() => {
    refreshTick();
    const sid = props.sessionId;
    if (!sid)
      return emptySessionSnapshot();
    const session = props.api.state.session.get?.(sid);
    if (session) {
      const snap = aggregateFromSessionObject(session);
      if (mainSessionHasStats(snap)) {
        const msgs = props.api.state.session.messages(sid);
        return msgs ? withModelFallback(snap, msgs) : snap;
      }
    }
    const msgs = props.api.state.session.messages(sid);
    return msgs?.length ? aggregateSessionFromMessages(msgs) : emptySessionSnapshot();
  });
  const mainMessages = createMemo7(() => {
    refreshTick();
    const sid = props.sessionId;
    if (!sid)
      return [];
    return props.api.state.session.messages(sid) ?? [];
  });
  const mergeHistoryMessage = (messages, update) => {
    const id = update.id ?? update.messageID;
    const next = [...messages];
    const index = id ? next.findIndex((message) => (message.id ?? message.messageID) === id) : -1;
    if (index >= 0)
      next[index] = update;
    else
      next.push(update);
    next.sort((a, b) => (a.time?.created ?? 0) - (b.time?.created ?? 0));
    return next;
  };
  const loadHistory = (sid) => {
    const generation = ++historyLoadGeneration;
    pendingHistoryUpdates.clear();
    const mirror = untrack(mainMessages);
    setHistoryMessages(mirror);
    setHistoryStatus("complete");
    if (!sid)
      return;
    loadSessionMessages({
      client: props.api.client.session,
      sessionId: sid,
      directory: props.api.state.path.directory,
      fallback: mirror
    }).then((result) => {
      if (generation !== historyLoadGeneration)
        return;
      let merged = result.messages;
      for (const update of pendingHistoryUpdates.values()) {
        merged = mergeHistoryMessage(merged, update);
      }
      setHistoryMessages(merged);
      setHistoryStatus(result.status);
    });
  };
  const subAgentList = createMemo7(() => {
    refreshTick();
    const useTps = display().speedUnit === "tps";
    const createdById = new Map(childEntries().map((e) => [e.id, e.created]));
    return childIds().map((cid) => {
      const created = createdById.get(cid);
      const session = props.api.state.session.get?.(cid);
      if (session) {
        const snap = aggregateFromSessionObject(session);
        if (subAgentHasStats(snap)) {
          const msgs = props.api.state.session.messages(cid);
          const merged = msgs ? withModelFallback(snap, msgs) : snap;
          const speed = msgs ? useTps ? computeAvgTokenSpeed(msgs) || undefined : computeAvgTokenTpotMs(msgs) : undefined;
          return toSubAgentSummary(cid, merged, speed, created);
        }
      }
      const msgs = props.api.state.session.messages(cid);
      if (!msgs?.length)
        return null;
      const snap = aggregateSessionFromMessages(msgs);
      if (!subAgentHasStats(snap))
        return null;
      const speed = useTps ? computeAvgTokenSpeed(msgs) || undefined : computeAvgTokenTpotMs(msgs);
      return toSubAgentSummary(cid, snap, speed, created);
    }).filter(Boolean);
  });
  const [streamingNow, setStreamingNow] = createSignal6({
    phase: "idle",
    speed: 0
  });
  let streamingTickState = initialStreamingTickState();
  const firstPartTime = createMemo7(() => {
    refreshTick();
    return firstPartTracker.get();
  });
  const recordPart = (messageID, partType, startTime, source) => {
    const first = firstPartTracker.handlePart(messageID, partType, startTime, source);
    if (first)
      bumpRefresh();
    return first;
  };
  const seedTtftFromParts = (msg) => {
    const msgID = msg.id ?? msg.messageID;
    const created = msg.time?.created;
    if (!msgID || typeof created !== "number" || firstPartTracker.get().has(msgID))
      return;
    if (!props.api.state.part)
      return;
    const start = earliestPartStart(props.api.state.part(msgID), created);
    if (start !== undefined) {
      recordPart(msgID, "text", start, "sdk");
    }
  };
  const trackStreaming = () => {
    const messages = mainMessages();
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && !last.time?.completed) {
      seedTtftFromParts(last);
    }
    const result = advanceStreamingNow(streamingTickState, {
      messages,
      part: props.api.state.part,
      now: Date.now(),
      firstPartTime: firstPartTracker.get()
    });
    streamingTickState = result;
    setStreamingNow({
      phase: result.phase,
      speed: result.speed
    });
  };
  createEffect2(() => {
    const ms = streamingNow().phase === "idle" ? 3000 : 1000;
    const timer = setTimeout(trackStreaming, ms);
    onCleanup4(() => clearTimeout(timer));
  });
  createEffect2(() => {
    const sid = props.sessionId;
    props.api.state.path.directory;
    childSync.resetForParentChange();
    timeline.resetForRootChange();
    firstPartTracker.reset();
    toolTiming.reset();
    itlTracker.reset();
    streamingTickState = initialStreamingTickState();
    setStreamingNow({
      phase: "idle",
      speed: 0
    });
    loadHistory(sid);
    if (sid) {
      childSync.loadChildren();
    }
  });
  createEffect2(() => {
    const unsub = props.api.event.on("message.updated", (event) => {
      bumpRefresh();
      const msg = event.properties?.info;
      const sid = msg?.sessionID;
      childSync.onForeignSessionActivity(sid);
      if (msg?.role === "assistant") {
        seedTtftFromParts(msg);
      }
      if (sid && msg) {
        if (sid === props.sessionId && msg.role === "assistant") {
          pendingHistoryUpdates.set(msg.id ?? msg.messageID ?? String(msg.time?.created ?? Date.now()), msg);
          setHistoryMessages((messages) => mergeHistoryMessage(messages, msg));
        }
        timeline.handleMessage(sid, msg);
      }
    });
    onCleanup4(() => unsub?.());
  });
  createEffect2(() => {
    const unsub1 = props.api.event.on("message.part.updated", (event) => {
      if (!isPartUpdatedEvent(event))
        return;
      const {
        part
      } = event.properties;
      if (STREAM_PART_TYPES.has(part.type) && typeof part.time?.start === "number") {
        const recorded = recordPart(part.messageID, part.type, part.time.start, "sdk");
        if (recorded)
          trackStreaming();
      }
      if (part.type === "tool" && !part.time?.start && part.state?.status === "pending") {
        const recorded = recordPart(part.messageID, "tool", Date.now(), "tui");
        if (recorded)
          trackStreaming();
      }
      if (part.type === "tool") {
        toolTiming.handleToolPart(part.messageID, part);
      }
    });
    const unsub2 = props.api.event.on("message.part.delta", (event) => {
      const props_ = event.properties;
      const messageID = props_?.messageID;
      const field = props_?.field;
      if (typeof messageID === "string" && typeof field === "string" && STREAM_PART_TYPES.has(field)) {
        const recorded = recordPart(messageID, field, Date.now(), "tui");
        itlTracker.trackChunk(messageID);
        if (recorded)
          trackStreaming();
      }
    });
    onCleanup4(() => {
      unsub1?.();
      unsub2?.();
    });
  });
  const tokenDist = createMemo7(() => {
    refreshTick();
    return computeTokenDistribution(mainMessages(), props.api.state.part);
  });
  return _$createComponent7(CacheHitSidebar, {
    sessionId: () => props.sessionId,
    get theme() {
      return props.theme;
    },
    get display() {
      return display();
    },
    get cacheTTL() {
      return cacheTTL();
    },
    get dynamicPricing() {
      return dynamicPricing();
    },
    messages: mainMessages,
    metricMessages: () => historyMessages(),
    metricMessageStatus: () => historyStatus(),
    main: mainSnap,
    subAgents: subAgentList,
    providers: () => props.api.state.provider ?? [],
    get formatCost() {
      return props.formatCost;
    },
    get formatRate() {
      return props.formatRate;
    },
    streamingNow,
    firstPartTime,
    tokenDist
  });
}

// src/status-bar-view.tsx
import { setProp as _$setProp5 } from "@opentui/solid";
import { effect as _$effect5 } from "@opentui/solid";
import { insert as _$insert5 } from "@opentui/solid";
import { createElement as _$createElement5 } from "@opentui/solid";
import { createMemo as createMemo8, createSignal as createSignal7, onCleanup as onCleanup5 } from "solid-js";

// src/status-bar.ts
var STATUS_BAR_SEPARATOR = " \xB7 ";
function statusBarContextTokens(snapshot) {
  return snapshot.input + snapshot.cacheRead + snapshot.cacheWrite;
}
function composeStatusBarSegments(input) {
  const { snapshot } = input;
  const segments = [];
  const contextTokens = statusBarContextTokens(snapshot);
  if (contextTokens > 0) {
    segments.push(formatRatioAsPercent(cacheHitRatio(snapshot.cacheRead, snapshot.input)));
    segments.push(`${formatTokenCount(contextTokens)} tok`);
  }
  if (input.speedTps !== undefined && input.speedTps > 0) {
    segments.push(input.useTps ? formatTokenSpeed(input.speedTps) : formatTokenTpot(1000 / input.speedTps));
  }
  return segments;
}
function composeStatusBarText(input) {
  return composeStatusBarSegments(input).join(STATUS_BAR_SEPARATOR);
}

// src/status-bar-view.tsx
var TICK_MS = 1000;
function StatusBarView(props) {
  const [tick, setTick] = createSignal7(0);
  const bump = () => setTick((v) => v + 1);
  const unsubscribe = props.api.event.on("message.updated", bump);
  const timer = setInterval(bump, TICK_MS);
  onCleanup5(() => {
    unsubscribe?.();
    clearInterval(timer);
  });
  const pal = createMemo8(() => buildPanelPalette(props.theme));
  const messages = createMemo8(() => {
    tick();
    const sid = props.sessionId;
    if (!sid)
      return [];
    return props.api.state.session.messages(sid) ?? [];
  });
  const snapshot = createMemo8(() => {
    tick();
    const sid = props.sessionId;
    if (!sid)
      return emptySessionSnapshot();
    const session = props.api.state.session.get?.(sid);
    if (session) {
      const snap = aggregateFromSessionObject(session);
      if (mainSessionHasStats(snap))
        return snap;
    }
    return aggregateSessionFromMessages(messages());
  });
  let streamState = initialStreamingTickState();
  const speed = createMemo8(() => {
    tick();
    const next = advanceStreamingNow(streamState, {
      messages: messages(),
      part: props.api.state.part,
      now: Date.now()
    });
    streamState = next;
    if (next.speed > 0)
      return next.speed;
    return lastCompletedTokenSpeed(messages());
  });
  const text = createMemo8(() => composeStatusBarText({
    snapshot: snapshot(),
    speedTps: speed(),
    useTps: props.useTps
  }));
  return (() => {
    var _el$ = _$createElement5("text");
    _$insert5(_el$, text);
    _$effect5((_$p) => _$setProp5(_el$, "fg", pal().muted, _$p));
    return _el$;
  })();
}

// src/plugin.tsx
var PLUGIN_ID = "opencode-cache-hit";
var tui = async (api) => {
  const pluginConfig = loadPluginConfig();
  const formatCost = createCostFormatter(pluginConfig.cost);
  const formatRate = createRateFormatter(pluginConfig.cost);
  api.slots.register({
    order: 56,
    slots: {
      sidebar_content(ctx, props) {
        return _$createComponent8(CacheHitSidebarHost, {
          get sessionId() {
            return props.session_id ?? "";
          },
          get theme() {
            return ctx.theme.current;
          },
          get display() {
            return pluginConfig.display;
          },
          get timeline() {
            return pluginConfig.timeline;
          },
          get cacheTTL() {
            return pluginConfig.cacheTTL;
          },
          get dynamicPricing() {
            return pluginConfig.dynamicPricing;
          },
          formatCost,
          formatRate,
          api
        });
      }
    }
  });
  if (pluginConfig.display.showStatusBar) {
    api.slots.register({
      order: 56,
      slots: {
        session_prompt_right(ctx, props) {
          return _$createComponent8(StatusBarView, {
            get sessionId() {
              return props.session_id ?? "";
            },
            get theme() {
              return ctx.theme.current;
            },
            get useTps() {
              return pluginConfig.display.speedUnit === "tps";
            },
            api
          });
        }
      }
    });
  }
};
var plugin = {
  id: PLUGIN_ID,
  tui
};
var plugin_default = plugin;
export {
  plugin_default as default
};
