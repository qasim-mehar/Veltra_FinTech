-- The foundation migration created `cron_runs_run_date_key` as a standalone unique
-- INDEX (CREATE UNIQUE INDEX), not as a table constraint, so hands the drop to
-- DROP INDEX. The DROP CONSTRAINT line below keeps this migration idempotent for
-- environments where the unique was created constraint-backed.
-- Why: the earnings engine runs MULTIPLE invocations per calendar day (00:05 / 00:35
-- PKT crons, admin "Run now", batch continuation) and writes one CronRun row each.
-- Day-level money idempotency lives in daily_earnings UNIQUE(investment_id, credit_date).
DROP INDEX IF EXISTS "cron_runs_run_date_key";
ALTER TABLE "cron_runs" DROP CONSTRAINT IF EXISTS "cron_runs_run_date_key";
CREATE INDEX "cron_runs_run_date_idx" ON "cron_runs" ("run_date");
