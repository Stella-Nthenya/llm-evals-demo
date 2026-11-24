// node src/report.mjs baseline candidate
import { readFileSync, writeFileSync } from 'node:fs';
const [b, c] = process.argv.slice(2), load = (v) => JSON.parse(readFileSync(`results/${v}.json`));
const B = load(b), C = load(c), cal = load('calibration');
const esc = (s) => String(s).replace(/[&<>"]/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[x]);
const f = (rows) => `${rows.filter((r) => r.pass).length}/${rows.length}`;
const med = (rows) => { const s = rows.map((r) => r.ms).sort((a, z) => a - z); return (s[s.length >> 1] / 1000).toFixed(1) + 's'; };
const cats = [...new Set(B.rows.map((r) => r.cat))];
const failed = B.rows.filter((r) => !r.pass).filter((r, i, a) => a.findIndex((x) => x.id === r.id) === i);
writeFileSync('results/report.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>LLM eval report</title>
<style>body{font:16px/1.5 system-ui;margin:0;background:#f4f6f8;color:#15202b}main{max-width:1040px;margin:auto;padding:36px 24px}h1{margin:0}table{border-collapse:collapse;width:100%;background:#fff;margin:20px 0}td,th{border:1px solid #d9e0e6;padding:9px 14px;text-align:left}article{background:#fff;border:1px solid #d9e0e6;border-radius:8px;padding:14px 20px;margin:12px 0}b.f{color:#b3261e}b.p{color:#17683a}p{margin:6px 0}</style><main>
<h1>LLM eval: fictional support assistant</h1><p>Prompt ${b} against ${c}. ${new Set(B.rows.map((r) => r.id)).size} cases, ${B.runs} runs each. Answers: ${esc(B.answerModel)}. Judge: ${esc(B.judgeModel)}, which agreed with ${cal.agree} of ${cal.total} labelled answers (${cal.falsePass} false passes).</p>
<table><tr><th>Category<th>Prompt ${b}<th>Prompt ${c}</tr>${cats.map((k) => `<tr><td>${k}<td>${f(B.rows.filter((r) => r.cat === k))}<td>${f(C.rows.filter((r) => r.cat === k))}</tr>`).join('')}<tr><th>All<th>${f(B.rows)}<th>${f(C.rows)}</tr><tr><td>Median answer time<td>${med(B.rows)}<td>${med(C.rows)}</tr></table>
<h2>What ${b} got wrong</h2>${failed.map((r) => { const n = C.rows.find((x) => x.id === r.id); return `<article><b>${r.id}</b> ${esc(r.q)}<p><b class="f">${b} FAIL</b> ${esc([...r.code, r.judge.reason].join('; '))}</p><p><b class="${n.pass ? 'p' : 'f'}">${c} ${n.pass ? 'PASS' : 'FAIL'}</b> ${esc(n.judge.reason)}</p></article>`; }).join('')}</main></html>`);
