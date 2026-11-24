import { spawn } from 'node:child_process';
export const ANSWER_MODEL = process.env.ANSWER_MODEL ?? 'haiku';
export const JUDGE_MODEL = process.env.JUDGE_MODEL ?? 'sonnet';
// Calls Claude through the Claude Code CLI with no tools. Throws on any failure, so an outage is never scored as an answer.
export function ask({ system, prompt, model }) {
  return new Promise((res, rej) => {
    const p = spawn('claude', ['-p', '--model', model, '--tools', '', '--no-session-persistence', '--system-prompt', system, '--output-format', 'json'], { cwd: '/tmp' });
    let out = '', err = '';
    const t = setTimeout(() => p.kill(), 120000);
    p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (err += d));
    p.on('error', rej);
    p.on('close', (c) => {
      clearTimeout(t);
      try { const j = JSON.parse(out); if (c || j.is_error || !j.result) throw 0; res({ text: j.result, ms: j.duration_api_ms }); }
      catch { rej(new Error(`model call failed (${c}): ${(err || out).slice(0, 200)}`)); }
    });
    p.stdin.end(prompt);
  });
}
export async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}
