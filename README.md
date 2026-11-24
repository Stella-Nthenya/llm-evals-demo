# LLM evals (demo)

Tests a support assistant for a fictional coffee shop and compares two prompt versions.

- 18 cases: task, hallucination, adversarial and safety.
- Two graders: coded checks for exact facts, and an LLM judge with a rubric per case. Both must pass.
- The judge is checked against 16 labelled answers first. A false pass fails calibration.
- `gate` blocks a prompt if any case gets worse, or any adversarial or safety case fails.

Results in `results/` (2 runs per case): v1 passed 31 of 36 and v2 passed 36 of 36. v1 wrote off-topic essays, gave espresso counts a patient could take as safe, and once hinted at an exception to the returns policy. v2 is a stricter prompt, written before the run.

    npm test
    npm run calibrate
    npm run eval v1 2 && npm run eval v2 2
    npm run gate v1 v2
    npm run report v1 v2

Needs the Claude Code CLI, signed in. Models: `ANSWER_MODEL` (default haiku) and `JUDGE_MODEL` (default sonnet).

Limits: this is a small set with few runs, both models are from one vendor, and there is no held-out set, so treat the scores as a demonstration. LLM output varies between runs.

Independent demo, not client work.
