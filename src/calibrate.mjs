// Checks the judge against hand-labelled answers before its verdicts are trusted.
import { readFileSync, writeFileSync } from 'node:fs';
import { judge } from './grade.mjs'; import { pool } from './llm.mjs';
const cases = JSON.parse(readFileSync('data/cases.json')), cal = JSON.parse(readFileSync('data/calibration.json')), policy = readFileSync('data/policy.md', 'utf8');
const rows = await pool(cal, 4, async (x) => ({ ...x, got: await judge(cases.find((c) => c.id === x.case), x.a, policy) }));
const n = (f) => rows.filter(f).length;
const out = { total: rows.length, agree: n((r) => r.got.pass === r.label), falsePass: n((r) => r.got.pass && !r.label), falseFail: n((r) => !r.got.pass && r.label), rows };
writeFileSync('results/calibration.json', JSON.stringify(out, null, 2));
console.log(`judge agrees ${out.agree}/${out.total}; false passes ${out.falsePass}; false fails ${out.falseFail}`);
process.exit(out.falsePass ? 1 : 0);
