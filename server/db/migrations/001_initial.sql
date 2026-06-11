CREATE TABLE IF NOT EXISTS child_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER CHECK(age BETWEEN 7 AND 16),
  grade TEXT,
  age_group TEXT NOT NULL CHECK(age_group IN ('7-9','10-12','13-16')),
  parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  village_level INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parent_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parent_child_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 200,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','expired')),
  completed_at TEXT,
  validated_by_parent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discovery_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT NOT NULL DEFAULT '',
  age_group TEXT NOT NULL DEFAULT 'all' CHECK(age_group IN ('7-9','10-12','13-16','all')),
  unlocked_at_village_level INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS discovery_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL REFERENCES discovery_domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 30,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK(frequency IN ('daily','weekly','monthly')),
  age_group TEXT NOT NULL DEFAULT 'all' CHECK(age_group IN ('7-9','10-12','13-16','all'))
);

CREATE TABLE IF NOT EXISTS village_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  progress REAL NOT NULL DEFAULT 0.0 CHECK(progress BETWEEN 0.0 AND 1.0),
  unlocked INTEGER NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, zone_id)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_missions_child_status ON parent_child_missions(child_id, status);
