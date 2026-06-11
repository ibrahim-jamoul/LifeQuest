ALTER TABLE parent_child_missions RENAME TO parent_child_missions_legacy;

CREATE TABLE parent_child_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 200,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','child_submitted','completed','expired')),
  completed_at TEXT,
  validated_by_parent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO parent_child_missions (id, child_id, parent_id, title, description, xp_reward, status, completed_at, validated_by_parent, created_at)
SELECT id, child_id, parent_id, title, description, xp_reward, status, completed_at, validated_by_parent, created_at
FROM parent_child_missions_legacy;

DROP TABLE parent_child_missions_legacy;
CREATE INDEX IF NOT EXISTS idx_missions_child_status ON parent_child_missions(child_id, status);
