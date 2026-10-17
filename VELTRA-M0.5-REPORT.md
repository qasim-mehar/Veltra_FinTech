# Veltra M0.5 — Pre-Lane Freeze Patch Report

Branch: `veltra/m0.5-freeze` (4 commits on top of `main`, which already carried the M0 work and the M0 report commit `4e5dbdd docs(m0): milestone 0 implementation report`).

| Commit | Message |
|---|---|
| `a9d7f3d` | `chore(deps): install all lane dependencies` |
| `32f1e69` | `fix(db): allow multiple cron runs per day (log table, one row per invocation)` |
| `aa4cb0a` | `feat(ui): initialize shadcn component set` |
| `392b679` | `chore(ui): trailing newline in globals.css (quality-pass nit)` |

## 1. Dependencies — installed vs already present

**Already present (skipped, no reinstall):** `@prisma/client@6.19.3`, `bcryptjs@3.0.3`, `prisma@6.19.3` (dev), `vitest@4.1.12` (dev), `tsx@4.23.15` (dev) — all landed in M0.

**Installed by this patch:**
- Runtime: `zod@4.6.7`, `lucide-react@1.59.0`
- Dev: `@types/bcryptjs@2.4.6` (per the install list; see note below)

**Transitively required by shadcn (auto-added by the CLI, all runtime):** `@base-ui/react@1.9.0`, `class-variance-authority@0.7.1`, `cn@0.5.0`, `sonner@2.0.8`, `next-themes@0.4.6` (sonner template imports `useTheme`), `tw-animate-css@1.4.0`, `shadcn@4.22.0` (globals.css imports `shadcn/tailwind.css` for accordion keyframes + data-* custom variants, so it must remain a runtime dep).

Note on `@types/bcryptjs`: it resolved to **2.4.6** (types for bcryptjs 2.x — no v3 stub exists). The quality agent proved via `tsc --traceResolution` that the **bundled bcryptjs 3.0.3 types win** for `import bcrypt from "bcryptjs"` (`Module … resolved to node_modules/bcryptjs/index.d.ts with Package ID 'bcryptjs/index.d.ts@3.0.3'`); `@types/bcryptjs` is harmless dead weight kept because it was on the mandated install list. Safe to drop during a later cleanup.

## 2. The `cron_runs` fix

**Why:** the earnings engine (Lane C) runs **multiple invocations per calendar day by design** — scheduled crons at 00:05 and 00:35 PKT, an admin "Run now" button, and batch-continuation runs — each writing its own `CronRun` row. M0's `run_date @unique` made every invocation after the first fail with a constraint violation. Money idempotency is already guaranteed by `daily_earnings UNIQUE(investment_id, credit_date)`; `CronRun` is an operational log and one row per invocation is the correct shape.

**Schema change** (`prisma/schema.prisma`, `CronRun` only): removed the field-level `@unique` from `runDate`, added `@@index([runDate])` (effective form of the prescribed `@@unique([runDate]) → @@index([runDate])`; M0 had declared it as field-level `@unique`).

**Important deviation, with evidence:** the prescribed migration body was `ALTER TABLE "cron_runs" DROP CONSTRAINT IF EXISTS "cron_runs_run_date_key"; CREATE INDEX …`. That is sufficient only when the unique was created **constraint-backed**. The M0 foundation migration created it as a **standalone unique index** (`CREATE UNIQUE INDEX "cron_runs_run_date_key" ON "cron_runs"("run_date");` at `20261017092010_foundation/migration.sql:302`), and Postgres's `ALTER TABLE … DROP CONSTRAINT IF EXISTS` only consults `pg_constraint` — so it silently no-ops in that shape. This was proven live: applying the prescribed SQL left the unique index in place and `prisma migrate dev` immediately prompted for a *further* migration (the schema↔DB diff it wants: drop the stale unique).

**Applied migration SQL** (`prisma/migrations/20261017102250_cron_runs_multiple_per_day/migration.sql`), which keeps the prescribed statements verbatim and adds the one line that works for the standalone-index shape:

```sql
DROP INDEX IF EXISTS "cron_runs_run_date_key";
ALTER TABLE "cron_runs" DROP CONSTRAINT IF EXISTS "cron_runs_run_date_key";
CREATE INDEX "cron_runs_run_date_idx" ON "cron_runs" ("run_date");
```

This is self-sufficient on a **fresh** database (`db:reset` replay passes) and idempotent for constraint-backed shapes. After a clean replay: `npx prisma migrate status` → "2 migrations found in prisma/migrations. Following migration have not yet been applied:"— none; **"Database schema is up to date!"**, no drift. `\d cron_runs` shows only `cron_runs_pkey` + the plain `cron_runs_run_date_idx`; `pg_constraint` has no unique constraint on `run_date`.

**Sanity proof (two inserts, same `run_date`):**
```
INSERT INTO cron_runs (... 'sanity-run-1', '2026-10-18', ...) → INSERT 0 1
INSERT INTO cron_runs (... 'sanity-run-2', '2026-10-18', ...) → INSERT 0 1
SELECT count(*) FROM cron_runs WHERE run_date='2026-10-18' → 2
DELETE FROM cron_runs WHERE id IN ('sanity-run-1','sanity-run-2') → DELETE 2
SELECT count(*) FROM cron_runs → 0
```
The M0 verification script still passes after the fix (`npm run verify:foundation` → 6/6, exit 0).

## 3. shadcn/ui component set

- `npx shadcn@latest init --yes --defaults` (shadcn **v4.22**, "base-nova" style, Base-UI-based — not the classic Radix-era set) → created `components.json`, `src/lib/utils.ts` (`cn`, re-exporting the `cn@0.5.0` package — clsx + tailwind-merge drop-in), `src/app/theme` scaffolding in `globals.css`.
- One-pass add: `npx shadcn@latest add button card input label badge table dialog select textarea tabs dropdown-menu accordion alert separator skeleton avatar sonner` → **all 17 components** now live in `src/components/ui/`: `accordion.tsx, alert.tsx, avatar.tsx, badge.tsx, button.tsx, card.tsx, dialog.tsx, dropdown-menu.tsx, input.tsx, label.tsx, select.tsx, separator.tsx, skeleton.tsx, sonner.tsx, table.tsx, tabs.tsx, textarea.tsx`.
- **No env vars are required** by shadcn, so `.env.example` needed no update; `components.json` aliases already match the existing `tsconfig` `@/* → ./src/*`.

**globals.css reconciliation (shadcn wanted to rewrite the file; five fixes applied so the landing page is untouched and every M0 token survives):**
1. Restored the landing `:root` pair (`--background: #f5f2e9`, `--foreground: #1a1e1c`) that init deleted (init's appended `:root` used white/dark-neutral, which would have repainted the landing body).
2. Restored `body { color: var(--foreground); }` which init removed.
3. Restored the original `--font-sans` chain (`--font-inter-tight → --font-geist-sans → …`) which init mangled into a self-referencing `var(--font-sans)`.
4. Removed `bg-background` from init's appended `@layer base` body rule (the `bg-background` utility resolves to the M0 locked navy `#0f172a`, which would have repainted the landing's cream background; the base rule now applies only `text-foreground`).
5. Themed all shadcn runtime variables (`:root` and a mirroring `.dark` scope) to the Veltra palette — `card/popover = #1e293b`, `primary/ring = #00e6c3`, `border/input/secondary/muted = #334155`, `muted-foreground = #94a3b8`, `primary/card-foreground etc. = white/navy` — so shadcn surfaces render correctly on the dark app, with or without a `className="dark"` wrapper.

**Verified preservation:** the M0 token block in `@theme inline` is byte-identical to M0 (diff-compared: `--color-background: #0f172a`, `--color-surface: #1e293b`, `--color-accent: #00e6c3`, `--color-success: #33c98e` (+ emerald rule comment), `--color-content: #ffffff`, `--color-muted: #94a3b8`, legacy `--color-foreground: var(--foreground)`, `--color-paper`, `--color-ink`, and all three font chains). Landing `git diff` against `main` for `page.tsx`, `layout.tsx`, `src/components/*` (pre-existing), `public/`, `src/lib/db/**`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `README.md` is **empty**.

## 4. Verification commands and exit codes

| Command | Result | Exit code |
|---|---|---|
| `npm run build` | compiled successfully; `/` (landing) still the only route, prerendered static | 0 |
| `npx tsc --noEmit` | clean (incl. the seed's `bcrypt.hash` types) | 0 |
| `npm test` | 32/32 M0 money tests green | 0 |
| `npx prisma migrate status` | "Database schema is up to date!", no drift, 2 migrations | 0 |
| `git diff --check` | clean (unstaged and vs `main`) | 0 |
| `npm run verify:foundation` | 6/6 checks PASS | 0 |
| Two-insert cron sanity (psql) | INSERT 0 1 ×2, count 2, DELETE 2, count 0 | 0 |
| `npx prisma validate` | valid schema | 0 |

## 5. Unrelated bugs / issues noticed but not fixed (per the rules)

- **`package.json#prisma.seed` deprecation warning** (Prisma 6.19; removed in Prisma 7 — migrate to `prisma.config.ts` when Prisma 7 is adopted). Carried over from M0; every `prisma` CLI run prints it. Not fixed (out of scope).
- **`@types/bcryptjs@2.4.6` shadows nothing in practice** — bundled bcryptjs 3 types win; the package is dead weight kept per the mandated list. Not fixed (mandated).
- **shadcn-generated components hardcode token utilities whose cascade resolves to M0 literals:** `focus:bg-accent` (dropdown/select/sub-trigger items) resolves to the locked full-teal `#00e6c3` with `--accent-foreground: #ffffff` (~1.6:1 contrast on hover/focus); `bg-background` (Dialog shell, Tabs active trigger, outline Button) resolves to the literal navy even in light scope. The landing page never consumes these utilities (verified), but lanes should either render app trees inside a `className="dark"` wrapper (the intended pattern; `.dark` mirrors all variables) or override hover classes per-component — `src/components/ui/*` is **not** frozen.
- **Landing focus outline tint:** shadcn's base layer applies `outline-ring/50` globally; the landing's `:focus-visible` outline (browser default before) now renders teal-tinted. No change to any default (non-focused) paint of the landing page.
- Untracked `.agent/SKILLS/no-ai-slop-text.md` remains a local artifact, deliberately not committed (as in M0). Ensure it isn't swept into a lane commit.

## 6. Freeze confirmation

"Lockfile and schema are now frozen. Lanes may branch from this commit."
