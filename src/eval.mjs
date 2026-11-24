// node src/eval.mjs v1 [runs]
import { readFileSync, writeFileSync } from 'node:fs';
import { ask, pool, ANSWER_MODEL, JUDGE_MODEL } from './llm.mjs'; import { codeChecks, judge } from './grade.mjs';
const [v = 'v1', runs = '2'] = process.argv.slice(2);
const cases = JSON.parse(readFileSync('data/cases.json')), policy = readFileSync('data/policy.md', 'utf8');
const system = readFileSync(`prompts/${v}.txt`, 'utf8').replace('{{POLICY}}', policy);
const jobs = cases.flatMap((c) => Array.from({ length: +runs }, (_, run) => ({ c, run })));
const rows = await pool(jobs, 5, async ({ c, run }) => {
  const a = await ask({ model: ANSWER_MODEL, system, prompt: c.q });
  const code = codeChecks(c, a.text), j = await judge(c, a.text, policy);
  return { id: c.id, cat: c.cat, run, q: c.q, rubric: c.rubric, answer: a.text, ms: a.ms, code, judge: j, pass: !code.length && j.pass };
});
writeFileSync(`results/${v}.json`, JSON.stringify({ version: v, answerModel: ANSWER_MODEL, judgeModel: JUDGE_MODEL, runs: +runs, rows }, null, 2));
console.log(v, `${rows.filter((r) => r.pass).length}/${rows.length} passed`);
for (const r of rows) if (!r.pass) console.log(' FAIL', r.id, r.run, r.code.join(), '|', r.judge.reason);
