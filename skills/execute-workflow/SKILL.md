---
name: execute-workflow
description: Autonomously run the full second-brain pipeline end-to-end — load-documents, build-knowledge, build-persona, validate-goals, and (on pass) ask-persona — handling the validation gate's pass/fail loop without manual intervention between steps. Use this skill whenever the user wants a single autonomous run, e.g. "set up my second brain and answer X," "build and validate my persona then tell me...", or "run the whole pipeline." This is the sole orchestrator; it is the only skill that manages the 3-attempt retry logic and gap-resolution routing.
---

# Execute Workflow

Orchestrates the complete second-brain pipeline autonomously: from raw documents to a validated persona to an answered question, handling failures and retries without requiring the user to invoke each skill manually.

## When this is triggered

- User wants an end-to-end run: "build my second brain from these files and tell me X"
- User wants to refresh and re-query after adding documents
- Any request that implies the full chain (source docs → answer) rather than a single stage

## Inputs

- Raw source files or a source directory (for `load-documents`)
- The user's actual question/request (to be answered via `ask-persona` once the persona is validated)
- Optional: existing knowledge base / persona state, if this is a re-run rather than a first run

## Process

1. **`load-documents`** — full or incremental, based on whether this is a first run or refresh.
2. **`build-knowledge`** — rebuild or incremental update, matching the mode above.
3. **`build-persona`** — generate the draft persona from the current knowledge base.
4. **`validate-goals`** — run the hard gate. Track attempt count starting at 1.
5. **Branch on verdict**:
   - **PASS** → proceed to step 6.
   - **FAIL, attempt < 3** → read `gap-report.md`:
     - For each **auto-resolvable** gap: re-run `load-documents` (targeted — e.g., web research or a request for specific missing document types) → `build-knowledge` (incremental) → `build-persona` (retry) → back to step 4, increment attempt count.
     - For each **user-dependent** gap: pause execution, present the specific gap(s) to the user as direct questions, incorporate their answers into a supplementary document or directly into `build-persona`'s next run → back to step 4, increment attempt count.
     - If gaps are mixed (both types), resolve auto-resolvable ones first, then prompt the user for the rest in the same pause.
   - **FAIL, attempt = 3** → halt. Do not retry further. Report `gap-report.md` to the user in full, explain what's blocking validation, and stop. Do not run `ask-persona`.
6. **`ask-persona`** — once validated, answer the user's original question (or run `--mode=summary` if that was the request).

## Output

- Final answer to the user's original request (from `ask-persona`), or
- A halt report with unresolved gaps (if validation failed 3 times)
- A run log showing each stage's status, attempt count, and timestamps — useful for the user to see what happened without re-reading every intermediate skill's output

## Guardrails

- Never skip `validate-goals`, regardless of how confident `build-persona`'s draft looks.
- Never exceed 3 validation attempts — this is a hard cap to prevent infinite loops on an insufficient knowledge base.
- Never let `ask-persona` run against an unvalidated persona under any branch of this workflow.
- Always surface user-dependent gaps as explicit questions — never guess at what the user meant to save a retry attempt.
