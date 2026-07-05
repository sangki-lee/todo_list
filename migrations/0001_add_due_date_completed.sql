-- D1 rejects non-constant defaults (e.g. CURRENT_DATE) on ADD COLUMN, so use a literal date.
ALTER TABLE todos ADD COLUMN due_date TEXT NOT NULL DEFAULT '2026-07-05';
ALTER TABLE todos ADD COLUMN completed INTEGER NOT NULL DEFAULT 0;
