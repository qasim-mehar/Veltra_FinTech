# Veltra M0 Foundation — Implementation Report

## 1. Outcome

**Complete.**

- Branch: `veltra/m0-foundation`
- Base: `0a81088` — `chore: bootstrap Next.js landing page (pre-existing baseline)`
- Head: `b9ee7c4` — `chore(m0): quality-pass fixes`
- Note on the baseline: this repository had **no commits and no remote** (`git fetch origin --prune` was not possible; no `origin` exists). The finished landing page that was expected on `origin/main` existed only in the working tree, so it was committed verbatim as the baseline commit on `main` before creating the milestone branch. The landing page itself was never edited.

Commits on the branch (in order, staged with explicit paths only, not squashed):

| Commit | Message |
|---|---|
| `29bec02` | `chore(db): prisma setup, full schema, and partial unique tid index` |
| `00faa16` | `feat(db): seed script with locked plans, super admin, and settings` |
| `5d6bd43` | `feat(money): paisa money library with bps math and formatting` |
| `010dd3c` | `feat(theme): locked veltra palette as tailwind tokens` |
| `edc13f2` | `test(money): unit coverage for money math` |
| `694464a` | `feat(scripts): foundation verification script` |
| `b9ee7c4` | `chore(m0): quality-pass fixes (verify cleanup hardening, comment accuracy, vitest module config)` |

## 2. Schema

**17 models** in `prisma/schema.prisma` (default datasource name `db`, provider `postgresql`, `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`):

`User`, `Admin`, `MemberSession`, `AdminSession`, `Plan`, `Investment`, `Deposit`, `Withdrawal`, `Transaction`, `Referral`, `DailyEarning`, `Notification`, `AdminAction`, `Setting`, `LoginAttempt`, `CronRun`, `SupportMessage`.

**6 enums**: `UserStatus`, `DepositStatus`, `WithdrawalStatus`, `WithdrawalMethod`, `InvestmentStatus`, `TransactionType` (Prisma enums; enum **values** stored as the literal strings `ACTIVE`, `PENDING`, etc., so the hand-written index SQL predicate `status IN ('PENDING','APPROVED')` is exact).

One migration set: `prisma/migrations/20261017092010_foundation/migration.sql`. All tables/columns are `@@map`/`@map`-ed to snake_case, matching the raw-SQL table names the partial index references.

- **Partial unique TID index** (`migration.sql:352`-`361`, statement byte-exact as required):
  `CREATE UNIQUE INDEX "deposits_tid_live_unique" ON "deposits" ("tid") WHERE "status" IN ('PENDING', 'APPROVED');`
  Applied with the prescribed flow: `prisma migrate dev --create-only --name foundation` → append SQL → `prisma migrate dev`.
  **pg_indexes proof** (queried on the live dev DB):
  ```
  deposits_tid_live_unique | CREATE UNIQUE INDEX deposits_tid_live_unique ON public.deposits USING btree (tid) WHERE (status = ANY (ARRAY['PENDING'::deposit_status, 'APPROVED'::deposit_status]))
  ```
- **`daily_earnings` idempotency constraint**: `@@unique([investmentId, creditDate])` → `daily_earnings_investment_id_credit_date_key`, so a re-run cron day can never credit the same investment twice.
- Additional indexes per contract: `deposits (status, created_at)` + `(tid)`; `withdrawals (status, created_at)`; `transactions (user_id, created_at DESC)`; `daily_earnings (user_id, credit_date)`; `referrals.referee_id UNIQUE`; `cron_runs.run_date UNIQUE` (added so the M6 cron has a DB-level "one run per day" invariant — noted as the only schema decisions beyond the literal field list).
- Ledger immutability is structural: `transactions` has no meaningful mutation surface in this milestone and no helper exists that mutates it.

## 3. Seed

`prisma/seed.ts`, run via `tsx` (`npm run db:seed`, and wired as `prisma migrate reset`'s seed step through `"prisma": { "seed": "tsx prisma/seed.ts" }`).

- **Plans** (upsert **by name**, exact locked prices in paisa):

  | name | price (paisa) | placeholder dailyReturnRateBps | sortOrder |
  |---|---|---|---|
  | Beginner | 120000 | 100 | 1 |
  | Intermediate | 160000 | 125 | 2 |
  | Advanced | 260000 | 150 | 3 |
  | VIP Master | 400000 | 200 | 4 |

  The seed prints the required note: *“Daily rates are placeholders pending client confirmation.”*
- **Super admin**: `ADMIN_USERNAME` / `ADMIN_PASSWORD` read from env (missing vars throw with a pointer to `.env.example`). Created **only if the username does not exist**; existing admins are never mutated. Password hashed with **bcrypt cost 12 (bcryptjs)**. Neither the password nor its hash is ever printed. The admin row gets a deterministic placeholder email `<username>@veltra.local` (the `Admin.email @unique` requires some value; documented here as the convention M1 may revisit).
- **Settings** (upsert by key): `minWithdrawalPaisa = "0"`, `feedEnabled = "true"`.
- **Idempotency proven twice**: two consecutive `npm run db:seed` runs leave row counts identical (plans 4, admins 1, settings 2 — re-run logs “Super admin … already exists — skipping.”).

## 4. Money library

`src/lib/db/money.ts` — the single owner of money conversion; `src/lib/db/prisma.ts` holds the dev-hot-reload-safe Prisma singleton.

| Export | Formula / rule |
|---|---|
| `REFERRAL_BONUS_BPS` | `1000` (10% instant bonus on referee's first approved deposit) |
| `REFERRAL_DAILY_BPS` | `150` (1.5% daily commission on referee's daily profit) |
| `formatPaisa(paisa: bigint): string` | integer→“Rs. ” string; comma thousands (deterministic regex, no locale), whole rupees have no decimals, fractional exactly 2, negatives render `-Rs. …` |
| `parsePaisa(input: string): bigint` | strips optional `Rs.` prefix; plain (`^\d+(\.\d{1,2})?$`) or 3-3 comma-grouped form; max 2 decimals; throws on empty/letters/negatives/3+ decimals |
| `bpsToPercentString(bps: number): string` | 150 → `1.5%`, 100 → `1%`, 125 → `1.25%`, 1000 → `10%` |
| `calcProfitPaisa(pricePaisa, rateBps)` | `(price * bps + 5000) / 10000` — half-up in `BigInt` division |
| `calcCommissionPaisa(profitPaisa, bps = REFERRAL_DAILY_BPS)` | same formula (commission defaults to 1.5%) |
| `calcReferralBonusPaisa(depositPaisa)` | same formula with 1000 bps |
| `bigintToJSON(paisa: bigint): number` | `Number(paisa)`; throws beyond `Number.MAX_SAFE_INTEGER` — **the** JSON edge for every API response in later milestones |

All proportional math funnels through one private `scaleAmountHalfUp` — there is exactly one rounding implementation in the system, in integer math.

**Worked examples verified** (live `tsx` run and unit tests):

| Call | Result |
|---|---|
| `formatPaisa(120000n)` | `"Rs. 1,200"` |
| `formatPaisa(150n)` | `"Rs. 1.50"` |
| `formatPaisa(0n)` | `"Rs. 0"` |
| `formatPaisa(-2050n)` | `"-Rs. 20.50"` |
| `calcProfitPaisa(160000n, 125)` | `2000n` (Rs. 20) |
| `calcReferralBonusPaisa(160000n)` | `16000n` (exactly 10%) |
| `calcCommissionPaisa(10000n)` | `150n` (exactly 1.5%) |
| `parsePaisa("1,200.50")` | `120050n` |
| `calcProfitPaisa(1000n, 125)` | `13n` (exact-.5 half-up proof) |

## 5. Acceptance evidence

| Requirement | Status | Named test / step |
|---|---|---|
| One migration set with all 17 models / 6 enums | **Pass** | `20261017092010_foundation` (tables+enums enumerated in §2) |
| Partial unique TID index at DB level | **Pass** | exact SQL at `migration.sql:361`; `pg_indexes` proof above; live insert test |
| Duplicate-TID business rule proven live | **Pass** | verify check `…cannot be PENDING twice…` → second insert `Prisma P2002` |
| Rejected TID re-submittable | **Pass** | verify check `rejected TID may be re-submitted…` |
| Seed: 4 locked plans, exact paisa | **Pass** | verify check `4 plans with exact locked prices` |
| Seed: super admin from env, bcrypt 12, never printed | **Pass** | check `super admin exists` (prints username only; agent grep pass) |
| Seed: settings `minWithdrawalPaisa=0`, `feedEnabled=true` | **Pass** | check `both default settings exist` |
| Seed idempotent | **Pass** | agent double-run, identical counts (4/1/2) |
| Money: integer-paisa BigInt only | **Pass** | schema grep + `tests/money.test.ts` (32 tests) |
| Money: exact contract incl. json edge | **Pass** | 7 worked examples + rejection cases in `tests/money.test.ts` |
| Theme tokens exposed without breaking landing page | **Pass** | `git diff main -- <landing files>` **empty**; tokens added in `globals.css` `@theme inline` (landing never consumed the re-mapped utilities — verified by grep) |
| Env documentation + optional docker-compose | **Pass** | `.env.example` (all six vars, one-line comments), `docker-compose.yml` (postgres:16, port 5432, named volume, matching creds) |
| Vitest unit tests | **Pass** | `npm test` → 32/32, `tests/money.test.ts` |
| Verification script PASS/FAIL + non-zero exit on failure | **Pass** | `npm run verify:foundation` → 6/6, exit 0; failure paths set `process.exitCode = 1` |
| tsconfig ES2020+ (BigInt) | **Pass** | raised `ES2017` → `ES2020` (only change to `tsconfig.json`) |
| Landing page untouched | **Pass** | `git diff main` — empty for `page.tsx`, `layout.tsx`, `src/components`, `public`, `next.config.ts`, `eslint.config.mjs`, `README.md` |
| No secrets committed | **Pass** | `git ls-files` contains only `.env.example` (placeholders); `.env*` gitignored with `!.env.example` opt-in |
| No deploy / push / external API | **Pass** | nothing tagged/pushed/deployed; no HTTP calls in any milestone code |

## 6. Quality-agent findings

Subagent performed the full pass (read all milestone files, ran `npm test`, `npm run verify:foundation`, `npx tsc --noEmit`, `prisma migrate status`, double-seed idempotency test, byte-exact index SQL compare, float-arithmetic sweeps, secret sweeps, landing-page diff audit).

- **Verdict: PASS WITH P2** — **P0: none. P1: none.**
- **P2 fixed in `b9ee7c4`:**
  1. `scripts/verify-foundation.ts` — throwaway rows could leak if an unexpected error type fired mid-check → both TID checks now run inside `try/finally` with best-effort cleanup tasks.
  2. `src/lib/db/money.ts` comment said grouped inputs need “at least two digits” while the regex correctly allows a one-to-three-digit leading group → comment corrected (behaviour unchanged).
  3. `vitest.config.ts` emitted an “ESM loaded as CJS” warning → renamed to `vitest.config.mts` (already covered by `tsconfig`). During that fix a type-narrowing regression appeared in the verify script and was fixed; `tsc` re-ran clean.
- **P2 left open (documented, action deferred to M1+):**
  - `package.json#prisma.seed` is deprecated in Prisma 6.19 (removed in Prisma 7). Safe while Prisma is pinned at ^6.19. When Prisma 7 lands, migrate to `prisma.config.ts`.
  - `docker-compose.yml` / `.env.example` document the canonical `postgres:16 @ localhost:5432`; this dev machine's own Postgres 18 occupies 5432, so its local `.env` points at a disposable cluster on 5433 (not committed). Coords must match `DATABASE_URL` on any machine (see §8).
- **Second opinion after fixes** (re-run by mechanism): `npm test` 32/32 → exit 0; `npm run verify:foundation` 6/6 → exit 0; `npx tsc --noEmit` → exit 0.

## 7. Verification

All commands run from the repo root; every exit code captured:

| # | Command | Result | Exit code |
|---|---|---|---|
| 1 | `npm run db:reset` | provisioned from zero, applied the foundation migration, ran seed (via reset + explicit second seed, idempotent) | 0 |
| 2 | `npm run verify:foundation` | `[PASS]` ×6 (“4 plans…”, “super admin exists”, “both default settings exist”, “partial unique index deposits_tid_live_unique exists”, “same TID cannot be PENDING twice…”, “rejected TID may be re-submitted…”) | 0 |
| 3 | `npm test` | 32/32 tests passed (`tests/money.test.ts`) | 0 |
| 4 | `npx tsc --noEmit` | zero errors | 0 |
| 5 | `npm run build` | zero errors; landing page still the only route (`/` prerendered static) | 0 |
| 6 | `git diff --check` + `git diff main --check` | no whitespace errors (unstaged and branch-wide) | 0 |
| — | `npx prisma migrate status` | “Database schema is up to date!”, no drift | 0 |

## 8. Handoff notes

**Env variables to run locally** (copy `.env.example` → `.env`, then fill in):
- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL. Match `docker-compose.yml`: `postgresql://user:password@localhost:5432/veltra`. `DIRECT_URL` equals `DATABASE_URL` on Docker/local; differs only on Neon (pooled vs direct).
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — required for the seed to create the super admin.
- `CRON_SECRET` / `NEXT_PUBLIC_APP_URL` — reserved for later milestones (cron guard, absolute URLs); no code reads them yet.

**Local DB bootstrap:** `docker compose up -d` → `npm run db:reset` (drops, migrates, seeds) → `npm run verify:foundation`.

**Reseeding/reset:** `npm run db:reset` is destructive-but-reproducible; `npm run db:seed` alone is non-destructive and idempotent.

**What M1 (auth) builds on:**
- `MemberSession`/`AdminSession` with unique `token_hash` + `expiresAt` (hash the session token, never store it raw).
- `User.passwordHash`/`Admin.passwordHash` (bcrypt cost 12 seeded convention).
- `LoginAttempt` (`key @unique`) for throttling/lockout windows.
- `User.username` (lowercase convention), the `Referrals` self-relation (`referredById`) for signup-time referral capture, and `settings` rows (`minWithdrawalPaisa`, `feedEnabled`) already seeded.

**Known trade-offs / conventions carried forward:**
- Prisma is pinned at `^6.19.3` (classic `prisma-client-js` generator; `package.json#prisma.seed` deprecation warning is tolerable until a deliberate Prisma 7 migration).
- All models/columns are snake_case-mapped — future raw SQL must use the mapped names (`password_hash`, `credit_date`, …).
- `bg-background` now resolves to the Veltra navy (`#0f172a`) at the Tailwind-utility level while the landing page keeps painting through the legacy `:root` vars; M1+ app pages should use `bg-background`, `bg-surface`, `text-content`, `text-muted`, `accent`/`success` colors — and respect the emerald rule (`success` = money-positive only, documented in the comment in `globals.css`).
- A stray untracked `.agent/` directory (user's local agent-config) remains untracked by design.
