import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Packaging guards for issue #15: the published `./tui` entry must be a
 * pre-transformed bundle, because opencode's loader skips the Solid transform
 * for TSX under node_modules (opencode#39986). See
 * docs/adr/0001-prebundled-tui-entry.md.
 *
 * The bundle inspection below is deliberately string-based and therefore
 * heuristic — a half-transformed bundle could slip past it. The authoritative
 * guard is tests/tui-fold-runtime.test.ts, which clicks a built artifact.
 */

const root = join(import.meta.dir, "..")
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  version: string
  exports: Record<string, string>
  files: string[]
  scripts: Record<string, string>
}
const bundlePath = join(root, "dist", "tui.js")

async function run(cmd: string[]) {
  const proc = Bun.spawn(cmd, { cwd: root, stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

// Build once for this file: the committed dist/tui.js must stay in sync with src/,
// so every run rebuilds it before the assertions below inspect the artifact.
const build = await run(["bun", "run", "bundle"])
const bundle = existsSync(bundlePath) ? readFileSync(bundlePath, "utf8") : ""

describe("TUI build artifact", () => {
  test("build succeeds and emits dist/tui.js", () => {
    expect(build.exitCode, `build failed:\n${build.stderr}`).toBe(0)
    expect(existsSync(bundlePath)).toBe(true)
    expect(bundle.length).toBeGreaterThan(1000)
  })

  test("bundle is the output of the Solid transform, not generic JSX", () => {
    // Transform output pulls its primitives from the opentui Solid runtime.
    for (const helper of ["createElement", "insert", "insertNode", "setProp", "effect"]) {
      expect(bundle).toContain(helper)
    }
    expect(bundle).toMatch(/from\s*"@opentui\/solid"/)
    // Generic JSX (what shipped in 0.7.4) leaves these behind.
    expect(bundle).not.toContain("jsxDEV(")
    expect(bundle).not.toContain("@opentui/solid/jsx-dev-runtime")
  })

  test("runtime packages stay external so the host supplies one reactive runtime", () => {
    expect(bundle).toMatch(/from\s*"solid-js"/)
    expect(bundle).toMatch(/from\s*"@opentui\/solid"/)
    // Inlining either package creates a second runtime instance: signals stop
    // notifying the host renderer and folds silently stop repainting.
    expect(bundle).not.toContain("function createSignal(")
    expect(bundle).not.toContain("function createComputation(")
    expect(bundle).not.toContain("node_modules/solid-js")
    expect(bundle).not.toContain("node_modules/@opentui/solid")
  })

  test("built entry loads and still exports the plugin", async () => {
    // Smoke only: a fully untransformed bundle passes this too. It catches
    // "the artifact is missing or no longer a module", nothing more.
    const mod = (await import(bundlePath)) as { default?: { id?: string; tui?: unknown } }
    expect(mod.default?.id).toBe("opencode-cache-hit")
    expect(typeof mod.default?.tui).toBe("function")
  })
})

describe("packaging contract", () => {
  test("./tui export points at the built file", () => {
    expect(pkg.exports["./tui"]).toBe("./dist/tui.js")
    expect(existsSync(join(root, pkg.exports["./tui"]))).toBe(true)
  })

  test("dist is published and committed", () => {
    // Fork deviation from upstream: opencode's plugin installer runs Arborist with
    // ignoreScripts and aborts with "git dep preparation failed" for any git
    // dependency that declares a `prepare` script — verified with a minimal probe
    // package whose prepare was only `node -e "..."`. Without `prepare` nothing
    // builds the bundle on install, so `dist/tui.js` has to be in the repository
    // for `opencode plugin <name>@github:<owner>/<repo>` to resolve `./tui`.
    expect(pkg.files).toContain("dist")
    expect(readFileSync(join(root, ".gitignore"), "utf8")).not.toMatch(/^dist\/$/m)
  })

  test("no npm lifecycle script that blocks installs from a git remote", () => {
    // pacote (npm's fetcher) prepares a git dependency — shelling out to `npm install`
    // inside the clone — when package.json declares any of these scripts. opencode runs
    // that install from its bundled runtime, where it fails as "git dep preparation
    // failed". Keeping the build entry point named `bundle` is what makes
    // `opencode plugin "<name>@github:<owner>/<repo>"` resolve at all.
    // Source: pacote/lib/git.js → #prepareDir.
    for (const script of ["prepare", "prepack", "build", "install", "preinstall", "postinstall"]) {
      expect(pkg.scripts[script], `scripts.${script} blocks git installs`).toBeUndefined()
    }
  })

  test("the bundle entry point is reachable from the scripts", () => {
    expect(pkg.scripts.bundle).toContain("scripts/build-tui.ts")
  })

  test("packing ships the committed bundle", async () => {
    // `bun pm pack --dry-run` prints the file list without writing a tarball. npm's pack
    // is avoided on purpose: it needs a writable ~/.npm cache. Without a prepack hook the
    // committed dist/tui.js is what ends up in the tarball, so it must exist beforehand.
    expect(existsSync(bundlePath)).toBe(true)

    const pack = await run(["bun", "pm", "pack", "--dry-run"])
    expect(pack.exitCode, `pack failed:\n${pack.stderr}`).toBe(0)
    const packed = pack.stdout
      .split("\n")
      .map((line) => /^packed\s+\S+\s+(.+?)\s*$/.exec(line)?.[1])
      .filter((value): value is string => Boolean(value))

    // Guard the parser itself: a silent format change must fail loudly.
    expect(packed.length).toBeGreaterThan(50)
    expect(packed).toContain("dist/tui.js")
    for (const [subpath, target] of Object.entries(pkg.exports)) {
      expect(packed, `exports["${subpath}"] target is missing from the tarball`).toContain(
        target.replace(/^\.\//, ""),
      )
    }
    expect(packed).toContain("index.tsx")
    expect(packed.some((file) => file.startsWith("tests/"))).toBe(false)
  }, 30_000)
})
