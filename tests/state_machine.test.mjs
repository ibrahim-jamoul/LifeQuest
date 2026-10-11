// Test unitaire de la navigation et du stockage avec un DOM minimal simulé.
// NE REMPLACE PAS un test Playwright en navigateur réel.
import assert from 'node:assert/strict';
const memory=new Map();
const handlers={},videoHandlers={};
const app={innerHTML:'',addEventListener:(event,cb)=>{handlers[event]=cb}};
const video={addEventListener:(evt,cb)=>{videoHandlers[evt]=cb}};
const status={textContent:''},unlock={disabled:true},nickname={value:'Nova Test'},clock={textContent:''};
const elements={app,'lesson-video':video,'video-status':status,'activity-btn':unlock,'nickname':nickname,'focus-clock':clock};
globalThis.document={getElementById:(id)=>elements[id]||null,querySelector:()=>null,addEventListener:()=>{},createElement:()=>({style:{},click:()=>{},remove:()=>{},setAttribute:()=>{}}),body:{append:()=>{}}};
globalThis.window={scrollTo:()=>{},addEventListener:()=>{}};
globalThis.location={protocol:'file:'};
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
await import('../app.js');
const click=(action,value='')=>handlers.click({target:{closest:()=>({dataset:{action,value}})}});
click('profiles');assert.match(app.innerHTML,/Nouvel explorateur/);
click('create');click('save-profile');assert.match(app.innerHTML,/Rencontre Nova/);
click('finish-intro');assert.match(app.innerHTML,/Quartier général/);
for(const name of ['École','Cadeaux','Concentration','Découverte','Parents'])assert.ok(app.innerHTML.includes(name));
click('world','school');assert.match(app.innerHTML,/Mathématiques/);
click('subject','MAT');click('domain','Fractions');click('notion','MAT-09');
assert.match(app.innerHTML,/disabled/);
click('course');assert.equal(typeof videoHandlers.ended,'function');
videoHandlers.ended();assert.equal(unlock.disabled,false);
click('activity-menu');click('quiz-start');
for(const correct of ['0','1','1']){click('answer',correct);click('quiz-next')}
assert.match(app.innerHTML,/Score : 3\/3/);
click('activity-menu');click('game-start');
for(const selected of ['0','1','2','3'])click('cell',selected);
click('game-check');click('game-next-phase');
for(const selected of ['0','1','2','3','4'])click('cell',selected);
click('game-check');click('game-complete');
assert.match(app.innerHTML,/NOTION TERMINÉE/);
const key='lifequest-v3-portrait-demo-v1',db=JSON.parse(memory.get(key));
assert.equal(db.profiles[0].points,20);
assert.equal(db.profiles[0].progress['MAT-09'].done,true);

// Rejouer quiz + mini-jeu ne doit jamais attribuer 20 points supplémentaires.
click('activity-menu');click('quiz-start');
for(const correct of ['0','1','1']){click('answer',correct);click('quiz-next')}
click('activity-menu');click('game-start');
for(const selected of ['0','1','2','3'])click('cell',selected);
click('game-check');click('game-next-phase');
for(const selected of ['0','1','2','3','4'])click('cell',selected);
click('game-check');click('game-complete');
const replayed=JSON.parse(memory.get(key));
assert.equal(replayed.profiles[0].points,20);

click('lobby');click('world','gifts');assert.match(app.innerHTML,/20 ✦/);
assert.match(app.innerHTML,/Aucune demande réelle/);
console.log('OK : navigation, profil, déverrouillage vidéo, quiz, mini-jeu, sauvegarde locale, récompense attribuée une fois');
