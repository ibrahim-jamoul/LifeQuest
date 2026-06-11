ALTER TABLE discovery_completions RENAME TO discovery_completions_legacy;

CREATE TABLE discovery_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES discovery_challenges(id) ON DELETE CASCADE,
  completed_period TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(child_id, challenge_id, completed_period)
);

INSERT INTO discovery_completions (id, child_id, challenge_id, completed_period, completed_at)
SELECT id, child_id, challenge_id, strftime('%Y-W%W', completed_at), completed_at
FROM discovery_completions_legacy;

DROP TABLE discovery_completions_legacy;
