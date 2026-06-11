alter table public.child_profiles add column if not exists avatar_icon text not null default 'spark';
alter table public.child_profiles add column if not exists avatar_color text not null default '#75a876';
alter table public.user_preferences add column if not exists push_reminders boolean not null default false;

insert into public.discovery_domains (name, icon, description, age_group, unlocked_at_village_level) values
  ('Community & Helping', 'heart-handshake', 'Explore useful ways to help people and strengthen your community.', 'all', 1),
  ('Money & Life Skills', 'coins', 'Practice practical choices, planning, saving, and everyday independence.', '10-12', 2),
  ('Movement & Wellbeing', 'activity', 'Discover how movement, rest, food, and emotions support wellbeing.', 'all', 1)
on conflict (name) do nothing;
insert into public.discovery_domains (name, icon, description, age_group, unlocked_at_village_level) values
  ('History & Geography', 'map', 'Explore places, people, timelines, and how communities change.', 'all', 1),
  ('Reading & Writing', 'book-open', 'Use stories and words to understand, imagine, and communicate.', 'all', 1),
  ('Mathematics & Logic', 'shapes', 'Solve useful puzzles and notice patterns in the real world.', 'all', 2)
on conflict (name) do nothing;

insert into public.discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
select id, 'Do one quiet helpful action', 'Notice something useful that needs doing and complete it without being asked.', 30, 'weekly', 'all'
from public.discovery_domains where name = 'Community & Helping'
and not exists (select 1 from public.discovery_challenges where title = 'Do one quiet helpful action');

insert into public.discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
select id, 'Plan a small budget', 'Choose a pretend amount and decide how much to save, spend, and share.', 30, 'weekly', '10-12'
from public.discovery_domains where name = 'Money & Life Skills'
and not exists (select 1 from public.discovery_challenges where title = 'Plan a small budget');

insert into public.discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
select id, 'Design a ten-minute movement break', 'Create and complete a short movement routine that feels good.', 30, 'weekly', 'all'
from public.discovery_domains where name = 'Movement & Wellbeing'
and not exists (select 1 from public.discovery_challenges where title = 'Design a ten-minute movement break');

insert into public.discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
select id, 'Map a meaningful place', 'Draw a simple map of a place you know and mark three useful landmarks.', 30, 'weekly', 'all'
from public.discovery_domains where name = 'History & Geography'
and not exists (select 1 from public.discovery_challenges where title = 'Map a meaningful place');

insert into public.discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
select id, 'Write a tiny field guide', 'Describe something you noticed today clearly enough for another person to recognise it.', 30, 'weekly', 'all'
from public.discovery_domains where name = 'Reading & Writing'
and not exists (select 1 from public.discovery_challenges where title = 'Write a tiny field guide');

insert into public.discovery_challenges (domain_id, title, description, xp_reward, frequency, age_group)
select id, 'Find three patterns', 'Find and explain three number, shape, or sequence patterns around you.', 30, 'weekly', 'all'
from public.discovery_domains where name = 'Mathematics & Logic'
and not exists (select 1 from public.discovery_challenges where title = 'Find three patterns');
