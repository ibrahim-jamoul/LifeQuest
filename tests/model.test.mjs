import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleRewards } from '../data/activities.js';
import {
  STORAGE_VERSION,
  completedNotions,
  focusRemainingSeconds,
  focusStats,
  normalizeDatabase,
  rewardStatus,
} from '../core/model.js';

test('migre une sauvegarde v1 sans perdre la progression', () => {
  const migrated = normalizeDatabase({
    version: 1,
    activeId: 'nova',
    profiles: [{
      id: 'nova',
      name: ' Nova ',
      avatar: 2,
      watched: { 'MAT-09': true },
      progress: { 'MAT-09': { quizDone: true, gameDone: true, done: true } },
      points: 20,
      focusSessions: [{ duration: 60, finishedAt: '2026-10-11T10:00:00.000Z' }],
    }],
  });
  assert.equal(migrated.version, STORAGE_VERSION);
  assert.equal(migrated.activeId, 'nova');
  assert.equal(migrated.profiles[0].name, 'Nova');
  assert.equal(completedNotions(migrated.profiles[0]), 1);
  assert.equal(migrated.profiles[0].points, 20);
});

test('calcule les badges virtuels sans rendre un cadeau réel disponible', () => {
  const profile = {
    watched: { 'MAT-09': true },
    progress: { 'MAT-09': { done: true } },
    focusSessions: [{ duration: 60, finishedAt: '2026-10-11T10:00:00.000Z' }],
  };
  assert.equal(rewardStatus(sampleRewards.find(item => item.id === 'badge-premier-cours'), profile).earned, true);
  assert.equal(rewardStatus(sampleRewards.find(item => item.id === 'badge-pionnier'), profile).earned, true);
  assert.equal(rewardStatus(sampleRewards.find(item => item.id === 'badge-cap'), profile).earned, true);
  assert.equal(rewardStatus(sampleRewards.find(item => item.id === 'real-future'), profile).earned, false);
});

test('reprend un brouillon de concentration à partir de son horodatage', () => {
  const now = Date.now();
  const draft = { running: true, left: 60, total: 60, endAt: now + 31_200 };
  assert.equal(focusRemainingSeconds(draft, now), 32);
  assert.equal(focusRemainingSeconds({ ...draft, running: false, left: 42 }, now), 42);
  assert.deepEqual(focusStats({ focusSessions: [{ duration: 60 }, { duration: 180 }] }), { sessions: 2, seconds: 240 });
});

test('met en pause un ancien brouillon actif sans horodatage exploitable', () => {
  const migrated = normalizeDatabase({
    version: 1,
    activeId: 'ancienne-session',
    profiles: [{
      id: 'ancienne-session',
      name: 'Test',
      focusDraft: { task: 'Lire', total: 60, left: 40, running: true, endAt: null },
    }],
  });
  assert.equal(migrated.profiles[0].focusDraft.running, false);
  assert.equal(migrated.profiles[0].focusDraft.left, 40);
});
