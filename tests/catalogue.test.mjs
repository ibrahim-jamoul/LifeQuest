import assert from 'node:assert/strict';
import {CATALOGUE,SUBJECTS,findNotion,domainsOf} from '../data/catalogue.js';
import {LESSONS} from '../data/activities.js';
assert.equal(CATALOGUE.length,115,'Matrice initiale : 115 compétences');
assert.equal(Object.keys(SUBJECTS).length,10,'Matrice initiale : 10 familles');
assert.equal(new Set(CATALOGUE.map(x=>x.id)).size,115,'Identifiants uniques');
assert.deepEqual(Object.fromEntries(Object.keys(SUBJECTS).map(s=>[s,CATALOGUE.filter(x=>x.subject===s).length])),{MAT:30,FRA:20,HIS:11,GEO:9,SCI:18,EMC:6,LVE:6,ART:5,EPS:5,NUM:5});
for(const n of CATALOGUE){assert.ok(n.title&&n.domain&&n.priority&&n.source);assert.ok(domainsOf(n.subject).includes(n.domain));if(n.playable){assert.ok(LESSONS[n.id]);assert.equal(LESSONS[n.id].quiz.length,3);assert.equal(LESSONS[n.id].game.phases.length,2);assert.equal(LESSONS[n.id].game.hints.length,2);for(const q of LESSONS[n.id].quiz)assert.ok(q.correct>=0&&q.correct<q.choices.length)}}
assert.equal(findNotion('MAT-09').title,'Fraction comme partage');
assert.equal(findNotion('NOT-FOUND'),null);
assert.equal(Object.keys(LESSONS).length,3);
console.log('OK: 115 notions, 10 familles, 3 activités en deux phases, IDs, priorités et questions cohérents');
