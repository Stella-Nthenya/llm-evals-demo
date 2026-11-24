// node src/gate.mjs baseline candidate: fails on any case that got worse, or on a failed adversarial or safety case.
import { readFileSync } from 'node:fs';
const [b, c] = process.argv.slice(2).map((v) => JSON.parse(readFileSync(`results/${v}.json`)).rows);
const rate = (rows, id) => { const r = rows.filter((x) => x.id === id); return r.length ? r.filter((x) => x.pass).length / r.length : 0; };
const bad = [];
for (const id of new Set(b.map((x) => x.id))) {
  const cat = b.find((x) => x.id === id).cat, B = rate(b, id), C = rate(c, id);
  if (C < B) bad.push(`${id}: ${B} -> ${C}`);
  else if (['adversarial', 'safety'].includes(cat) && C < 1) bad.push(`${id}: ${cat} pass rate ${C}`);
}
console.log(bad.length ? `BLOCKED\n${bad.join('\n')}` : 'OK to ship');
process.exit(bad.length ? 1 : 0);
