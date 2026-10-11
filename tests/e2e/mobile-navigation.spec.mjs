import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_KEY = 'lifequest-v3-portrait-demo-v1';
const CAPTURE_DIR = path.resolve('docs/captures/validation-2026-10-11');

function watchRuntime(page) {
  const failures = [];

  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') failures.push(`console.error: ${message.text()}`);
  });
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText || 'échec inconnu';
    if (!/ERR_ABORTED|NS_BINDING_ABORTED/i.test(reason)) {
      failures.push(`requestfailed: ${request.method()} ${request.url()} (${reason})`);
    }
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      failures.push(`HTTP ${response.status()}: ${response.request().method()} ${response.url()}`);
    }
  });

  return failures;
}

async function openTitle(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'L’aventure commence ici' })).toBeVisible();
}

async function createProfile(page, name = 'Nova E2E') {
  await page.getByRole('button', { name: /JOUER/ }).click();
  await page.getByRole('button', { name: /Nouvel explorateur/ }).click();

  const nickname = page.getByLabel('Ton pseudo');
  await nickname.fill(name);
  await page.getByRole('button', { name: 'Avatar 3' }).click();
  await expect(nickname).toHaveValue(name);
  await expect(page.getByRole('button', { name: 'Avatar 3' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Commencer l’aventure' }).click();
  await expect(page.getByRole('heading', { name: 'Rencontre Nova' })).toBeVisible();
  await page.getByRole('button', { name: 'C’est parti !' }).click();
  await expect(page.getByRole('heading', { name: 'Quartier général' })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    app: (() => {
      const rect = document.getElementById('app').getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    })(),
  }));

  expect(metrics.documentWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.bodyWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.app.left, JSON.stringify(metrics)).toBeGreaterThanOrEqual(-1);
  expect(metrics.app.right, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function selectWorld(page, world) {
  await page.locator(`.world-card[data-value="${world}"]`).click();
}

async function goToMat09(page) {
  await selectWorld(page, 'school');
  await page.locator('[data-action="subject"][data-value="MAT"]').click();
  await page.locator('[data-action="domain"][data-value="Fractions"]').click();
  await page.locator('[data-action="notion"][data-value="MAT-09"]').click();
  await expect(page.getByText('Référence : MAT-09')).toBeVisible();
}

async function finishVideoThroughMediaPlayback(page) {
  const video = page.locator('#lesson-video');
  await expect(video).toBeVisible();
  await video.evaluate(element => new Promise((resolve, reject) => {
    if (Number.isFinite(element.duration) && element.duration > 0) return resolve();
    const timeout = setTimeout(() => reject(new Error('Métadonnées vidéo non chargées')), 10_000);
    element.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
    element.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error('Erreur de lecture vidéo'));
    }, { once: true });
    element.load();
  }));

  const duration = await video.evaluate(element => element.duration);
  expect(duration).toBeGreaterThan(60);
  expect(duration).toBeLessThan(90);

  // Une avance directe ne doit ni valider le cours ni atteindre la fin.
  await video.evaluate(element => { element.currentTime = Math.max(0, element.duration - 0.25); });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeLessThan(2);
  await expect(page.locator('#activity-btn')).toBeDisabled();
  await expect(page.locator('#video-status')).toContainText('avance directe reste verrouillée');

  await video.evaluate(async element => {
    element.muted = true;
    element.currentTime = 0;
    element.playbackRate = 16;
    const ended = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('La vidéo ne s’est pas terminée')), 15_000);
      element.addEventListener('ended', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      element.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('Erreur de lecture vidéo'));
      }, { once: true });
    });
    await element.play();
    await ended;
  });

  await expect(page.locator('#activity-btn')).toBeEnabled();
  await expect(page.locator('#video-status')).toContainText('Cours terminé');
}

async function completeQuiz(page) {
  await page.locator('[data-action="quiz-start"]').click();
  for (const [index, correct] of [0, 1, 1].entries()) {
    await expect(page.getByRole('heading', { name: `Quiz · Question ${index + 1}/3` })).toBeVisible();
    await page.locator(`[data-action="answer"][data-value="${correct}"]`).click();
    await expect(page.getByText('Bonne réponse !')).toBeVisible();
    await page.locator('[data-action="quiz-next"]').click();
  }
  await expect(page.getByText(/Score : 3\/3 bonnes réponses/)).toBeVisible();
}

async function completeTwoPhaseGame(page) {
  await page.getByRole('button', { name: 'Choisir une autre activité' }).click();
  await page.locator('[data-action="game-start"]').click();

  await expect(page.getByText('PHASE 1/2')).toBeVisible();
  for (const index of [0, 1, 2, 3]) {
    await page.locator(`[data-action="cell"][data-value="${index}"]`).click();
  }
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.getByText('Essai guidé réussi !')).toBeVisible();
  await page.getByRole('button', { name: 'Passer au transfert' }).click();

  await expect(page.getByText('PHASE 2/2')).toBeVisible();
  for (const index of [0, 1, 2, 3, 4]) {
    await page.locator(`[data-action="cell"][data-value="${index}"]`).click();
  }
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.getByText('Transfert réussi !')).toBeVisible();
  await page.getByRole('button', { name: 'Terminer le mini-jeu' }).click();
  await expect(page.getByText('NOTION TERMINÉE · +20 POINTS (UNE FOIS)')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  page.__runtimeFailures = watchRuntime(page);
});

test.afterEach(async ({ page }, testInfo) => {
  const failures = page.__runtimeFailures || [];
  await testInfo.attach('runtime-audit', {
    body: Buffer.from(failures.length ? failures.join('\n') : 'Aucune erreur console, page, HTTP >= 400 ou requête réseau inattendue.'),
    contentType: 'text/plain',
  });
  expect(failures, failures.join('\n')).toEqual([]);
});

test('portrait : profil, pseudo, cinq espaces et largeur sûre', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('portrait-'));

  await openTitle(page);
  await page.getByRole('button', { name: /JOUER/ }).click();
  await page.getByRole('button', { name: /Nouvel explorateur/ }).click();
  await page.getByLabel('Ton pseudo').fill('Pseudo conservé');
  await page.getByRole('button', { name: 'Avatar 4' }).click();
  await expect(page.getByLabel('Ton pseudo')).toHaveValue('Pseudo conservé');
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'Commencer l’aventure' }).click();
  await page.getByRole('button', { name: 'C’est parti !' }).click();
  await expect(page.locator('.world-card')).toHaveCount(5);
  await expect(page.locator('.world-card b')).toHaveText([
    'École', 'Cadeaux', 'Concentration', 'Découverte', 'Parents',
  ]);
  await expect(page.locator('#rotate')).toBeHidden();
  await expectNoHorizontalOverflow(page);
});

test('paysage : l’overlay de rotation masque le jeu', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('landscape-'));

  await page.goto('/');
  const rotate = page.locator('#rotate');
  await expect(rotate).toBeVisible();
  await expect(rotate).toContainText('Tourne ton appareil');
  await expect(rotate).toContainText('LifeQuest se joue à la verticale.');
  await expect(page.locator('#app')).toHaveCSS('visibility', 'hidden');

  if (testInfo.project.name === 'landscape-1024x768') {
    await mkdir(CAPTURE_DIR, { recursive: true });
    await page.screenshot({ path: path.join(CAPTURE_DIR, '06-rotation-1024x768.png') });
  }
});

test('390x844 : les activités MAT-12 et MAT-18 sont terminables', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'portrait-390x844');

  await openTitle(page);
  await createProfile(page, 'Trois notions');
  await page.evaluate(key => {
    const database = JSON.parse(localStorage.getItem(key));
    const active = database.profiles.find(item => item.id === database.activeId);
    active.watched['MAT-12'] = true;
    active.watched['MAT-18'] = true;
    localStorage.setItem(key, JSON.stringify(database));
  }, STORAGE_KEY);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'L’aventure commence ici' })).toBeVisible();
  await page.getByRole('button', { name: /JOUER/ }).click();
  await page.getByRole('button', { name: /Trois notions/ }).click();

  await selectWorld(page, 'school');
  await page.locator('[data-action="subject"][data-value="MAT"]').click();
  await page.locator('[data-action="domain"][data-value="Fractions"]').click();
  await page.locator('[data-action="notion"][data-value="MAT-12"]').click();
  await expect(page.getByRole('button', { name: '2. Quiz et mini-jeu' })).toBeEnabled();
  await page.getByRole('button', { name: '2. Quiz et mini-jeu' }).click();
  await page.locator('[data-action="quiz-start"]').click();
  for (const answer of [1, 0, 1]) {
    await page.locator(`[data-action="answer"][data-value="${answer}"]`).click();
    await page.locator('[data-action="quiz-next"]').click();
  }
  await expect(page.getByText(/Score : 3\/3 bonnes réponses/)).toBeVisible();
  await page.getByRole('button', { name: 'Choisir une autre activité' }).click();
  await page.locator('[data-action="game-start"]').click();
  await page.locator('[data-action="compare-answer"][data-value="1"]').click();
  await expect(page.getByText('Essai guidé réussi !')).toBeVisible();
  await page.getByRole('button', { name: 'Passer au transfert' }).click();
  await page.locator('[data-action="compare-answer"][data-value="0"]').click();
  await expect(page.getByText('Transfert réussi !')).toBeVisible();
  await page.getByRole('button', { name: 'Terminer le mini-jeu' }).click();
  await expect(page.getByText('NOTION TERMINÉE · +20 POINTS (UNE FOIS)')).toBeVisible();

  await page.locator('[data-action="lobby"]').click();
  await selectWorld(page, 'school');
  await page.locator('[data-action="subject"][data-value="MAT"]').click();
  await page.locator('[data-action="domain"][data-value="Grandeurs"]').click();
  await page.locator('[data-action="notion"][data-value="MAT-18"]').click();
  await page.getByRole('button', { name: '2. Quiz et mini-jeu' }).click();
  await page.locator('[data-action="quiz-start"]').click();
  for (const answer of [2, 0, 1]) {
    await page.locator(`[data-action="answer"][data-value="${answer}"]`).click();
    await page.locator('[data-action="quiz-next"]').click();
  }
  await page.getByRole('button', { name: 'Choisir une autre activité' }).click();
  await page.locator('[data-action="game-start"]').click();
  await page.locator('[data-action="perimeter-answer"][data-value="10"]').click();
  await page.getByRole('button', { name: 'Passer au transfert' }).click();
  await page.locator('[data-action="perimeter-answer"][data-value="12"]').click();
  await page.getByRole('button', { name: 'Terminer le mini-jeu' }).click();
  await expect(page.getByText('NOTION TERMINÉE · +20 POINTS (UNE FOIS)')).toBeVisible();

  const persisted = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  const profile = persisted.profiles.find(item => item.id === persisted.activeId);
  expect(profile.progress['MAT-12'].done).toBe(true);
  expect(profile.progress['MAT-18'].done).toBe(true);
  expect(profile.points).toBe(40);
});

test('390x844 : parcours complet, focus, cadeaux, espaces différés et persistance', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'portrait-390x844');
  await mkdir(CAPTURE_DIR, { recursive: true });

  await openTitle(page);
  await createProfile(page);
  await expect(page.locator('.world-card')).toHaveCount(5);
  await page.screenshot({ path: path.join(CAPTURE_DIR, '01-lobby-390x844.png'), fullPage: true });

  await goToMat09(page);
  const lockedActivities = page.getByRole('button', { name: '2. Quiz et mini-jeu' });
  await expect(lockedActivities).toBeDisabled();
  await page.getByRole('button', { name: '1. Regarder le cours vidéo' }).click();
  await expect(page.locator('#activity-btn')).toBeDisabled();
  await finishVideoThroughMediaPlayback(page);
  await page.screenshot({ path: path.join(CAPTURE_DIR, '02-video-deverrouillee-390x844.png'), fullPage: true });
  await page.locator('#activity-btn').click();

  await completeQuiz(page);
  await completeTwoPhaseGame(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: path.join(CAPTURE_DIR, '03-notion-terminee-390x844.png'), fullPage: true });

  let persisted = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  let profile = persisted.profiles.find(item => item.id === persisted.activeId);
  expect(profile.watched['MAT-09']).toBe(true);
  expect(profile.progress['MAT-09']).toEqual({ quizDone: true, gameDone: true, done: true });
  expect(profile.points).toBe(20);

  await page.locator('[data-action="lobby"]').click();
  await selectWorld(page, 'gifts');
  await expect(page.getByText('20 ✦')).toBeVisible();
  await expect(page.getByText('Éclaireur du savoir')).toBeVisible();
  await expect(page.getByText('Pionnier des notions')).toBeVisible();
  await expect(page.locator('.disabled-reward')).toHaveCount(1);
  await expect(page.locator('.disabled-reward')).toContainText('NON DISPONIBLE');
  await expect(page.getByText(/Aucune demande réelle/)).toBeVisible();
  await page.screenshot({ path: path.join(CAPTURE_DIR, '04-cadeaux-390x844.png') });
  await page.locator('.disabled-reward').evaluate(element => element.scrollIntoView({ block: 'center' }));
  const [rewardBox, navBox] = await Promise.all([
    page.locator('.disabled-reward').boundingBox(),
    page.locator('.bottom-nav').boundingBox(),
  ]);
  expect(rewardBox.y + rewardBox.height).toBeLessThanOrEqual(navBox.y);
  await page.screenshot({ path: path.join(CAPTURE_DIR, '04b-cadeau-reel-desactive-390x844.png') });

  await page.locator('[data-action="lobby"]').click();
  await selectWorld(page, 'focus');
  await page.getByRole('button', { name: 'Lire au calme' }).click();
  await page.getByRole('button', { name: '1 min' }).click();
  await page.getByRole('button', { name: 'Démarrer la session' }).click();
  await expect(page.getByRole('heading', { name: 'Garde ton cap' })).toBeVisible();
  await page.getByRole('button', { name: 'Mettre en pause' }).click();
  const pausedAt = await page.locator('#focus-clock').textContent();
  await page.waitForTimeout(1_100);
  await expect(page.locator('#focus-clock')).toHaveText(pausedAt);
  await page.getByRole('button', { name: 'Revenir en arrière' }).click();
  await expect(page.getByText('SESSION EN ATTENTE', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre' }).click();
  await expect(page.getByText('Session en pause')).toBeVisible();

  await page.evaluate(({ key }) => {
    const database = JSON.parse(localStorage.getItem(key));
    const active = database.profiles.find(item => item.id === database.activeId);
    active.focusDraft = {
      task: 'Lire au calme', total: 60, left: 1, running: true, endAt: Date.now() + 700,
    };
    localStorage.setItem(key, JSON.stringify(database));
  }, { key: STORAGE_KEY });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'L’aventure commence ici' })).toBeVisible();
  await page.getByRole('button', { name: /JOUER/ }).click();
  await page.getByRole('button', { name: /Nova E2E/ }).click();
  await expect(page.getByRole('heading', { name: 'Quartier général' })).toBeVisible();
  await selectWorld(page, 'focus');
  await expect(page.getByText('SESSION EN ATTENTE', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre' }).click();
  await expect(page.getByRole('heading', { name: 'Concentration terminée' })).toBeVisible({ timeout: 7_000 });
  await page.getByRole('button', { name: 'Nouvelle session' }).click();
  await expect(page.locator('.focus-stats > div').first().locator('strong')).toHaveText('1');
  await expect(page.locator('.focus-stats > div').first().locator('span')).toHaveText('sessions terminées');
  await expect(page.getByText('TERMINÉE', { exact: true })).toBeVisible();
  await page.screenshot({ path: path.join(CAPTURE_DIR, '05-concentration-historique-390x844.png'), fullPage: true });

  await page.locator('[data-action="lobby"]').click();
  await selectWorld(page, 'discovery');
  await expect(page.getByText('EN PRÉPARATION')).toBeVisible();
  await expect(page.getByText(/phase ultérieure/)).toBeVisible();
  await page.getByRole('button', { name: 'Retour au lobby' }).click();
  await selectWorld(page, 'parents');
  await expect(page.getByText('EN PRÉPARATION')).toBeVisible();
  await expect(page.getByText(/après Découverte/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'L’aventure commence ici' })).toBeVisible();
  await page.getByRole('button', { name: /JOUER/ }).click();
  await page.getByRole('button', { name: /Nova E2E/ }).click();
  await page.locator('[data-action="progress"]').click();
  await expect(page.getByText('20 points virtuels')).toBeVisible();
  await expect(page.locator('.progress-number')).toContainText('1');
  await expect(page.locator('.progress-number')).toContainText('/ 115');

  persisted = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  profile = persisted.profiles.find(item => item.id === persisted.activeId);
  expect(profile.points).toBe(20);
  expect(profile.progress['MAT-09'].done).toBe(true);
  expect(profile.focusSessions).toHaveLength(1);
  expect(profile.focusDraft).toBeNull();
});
