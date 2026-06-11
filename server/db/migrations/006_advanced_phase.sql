ALTER TABLE child_profiles ADD COLUMN avatar_icon TEXT NOT NULL DEFAULT 'spark';
ALTER TABLE child_profiles ADD COLUMN avatar_color TEXT NOT NULL DEFAULT '#75a876';
ALTER TABLE user_preferences ADD COLUMN push_reminders INTEGER NOT NULL DEFAULT 0;

INSERT OR IGNORE INTO discovery_domains (name, icon, description, age_group, unlocked_at_village_level) VALUES
  ('Community & Helping', 'heart-handshake', 'Explore useful ways to help people and strengthen your community.', 'all', 1),
  ('Money & Life Skills', 'coins', 'Practice practical choices, planning, saving, and everyday independence.', '10-12', 2),
  ('Movement & Wellbeing', 'activity', 'Discover how movement, rest, food, and emotions support wellbeing.', 'all', 1);
INSERT OR IGNORE INTO discovery_domains (name, icon, description, age_group, unlocked_at_village_level) VALUES
  ('History & Geography', 'map', 'Explore places, people, timelines, and how communities change.', 'all', 1),
  ('Reading & Writing', 'book-open', 'Use stories and words to understand, imagine, and communicate.', 'all', 1),
  ('Mathematics & Logic', 'shapes', 'Solve useful puzzles and notice patterns in the real world.', 'all', 2);

INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
SELECT id, 'Do one quiet helpful action', 'Notice something useful that needs doing and complete it without being asked.', 30, 'weekly', 'all'
FROM discovery_domains WHERE name = 'Community & Helping'
AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = 'Do one quiet helpful action');

INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
SELECT id, 'Plan a small budget', 'Choose a pretend amount and decide how much to save, spend, and share.', 30, 'weekly', '10-12'
FROM discovery_domains WHERE name = 'Money & Life Skills'
AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = 'Plan a small budget');

INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
SELECT id, 'Design a ten-minute movement break', 'Create and complete a short movement routine that feels good.', 30, 'weekly', 'all'
FROM discovery_domains WHERE name = 'Movement & Wellbeing'
AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = 'Design a ten-minute movement break');

INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
SELECT id, 'Map a meaningful place', 'Draw a simple map of a place you know and mark three useful landmarks.', 30, 'weekly', 'all'
FROM discovery_domains WHERE name = 'History & Geography'
AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = 'Map a meaningful place');

INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
SELECT id, 'Write a tiny field guide', 'Describe something you noticed today clearly enough for another person to recognise it.', 30, 'weekly', 'all'
FROM discovery_domains WHERE name = 'Reading & Writing'
AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = 'Write a tiny field guide');

INSERT INTO discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
SELECT id, 'Find three patterns', 'Find and explain three number, shape, or sequence patterns around you.', 30, 'weekly', 'all'
FROM discovery_domains WHERE name = 'Mathematics & Logic'
AND NOT EXISTS (SELECT 1 FROM discovery_challenges WHERE title = 'Find three patterns');
