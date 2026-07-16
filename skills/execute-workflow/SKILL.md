---
name: execute-workflow
description: Autonomously run the full second-brain pipeline end-to-end — load-documents, build-knowledge, build-persona, validate-goals, and (on pass) ask-persona — handling the validation gate's pass/fail loop without manual intervention between steps. Use this skill whenever the user wants a single autonomous run, e.g. "set up my second brain and answer X," "build and validate my persona then tell me...", or "run the whole pipeline." This is the sole orchestrator; it is the only skill that manages the 3-attempt retry logic and gap-resolution routing.
---

# Execute Workflow

Orchestrates the complete second-brain pipeline: from raw documents in `.xavier/raw/` to a validated persona in `.xavier/persona/` to an answered question. Handles failures and retries autonomously.

## Directory structure

```
.xavier/
/raw              → user drops source files here
/normalized       → load-documents output
/kb               → build-knowledge output (wiki/ + index/)
/persona          → validated persona definition (final)
/results/
  ├── load/       → load-report.md
  ├── kb/         → build-report.md
  ├── .draft/
  │   └── persona/ → persona-draft.md, persona-draft-report.md (temp)
  ├── validation/ → validation-verdict.md, gap-report.md
  └── run.log     → overall pipeline log
```

## When this is triggered

- User wants an end-to-end run: "build my second brain from these files and tell me X"
- User wants to refresh and re-query after adding documents
- Any request implying the full chain (source docs → answer)

## Inputs

- Raw source files in `.xavier/raw/`
- The user's question (answered via `ask-persona` after validation)
- Optional: existing state for re-runs

## Process

1. **`load-documents`** — full or incremental based on whether `.xavier/normalized/manifest.json` exists.
2. **`build-knowledge`** — rebuild or incremental, matching the mode above.
3. **`build-persona`** — generate draft from `.xavier/kb/`. Drafts written to `.xavier/results/.draft/persona/`.
4. **`validate-goals`** — run the hard gate. Track attempt count starting at 1.
5. **Branch on verdict**:
   - **PASS** → persona written to `.xavier/persona/persona.md`, proceed to step 6.
   - **FAIL, attempt < 3** → read `.xavier/results/validation/gap-report.md`:
     - Auto-resolvable gaps → re-run `load-documents` → `build-knowledge` → `build-persona` → back to step 4.
     - User-dependent gaps → pause, ask user, incorporate answers → back to step 4.
     - Mixed gaps → resolve auto-resolvable first, then prompt user.
   - **FAIL, attempt = 3** → halt. Report gaps to user. Never run `ask-persona`.
6. **`ask-persona`** — answer the user's original question.

## Output

- Answer to user's request, or halt report with unresolved gaps
- `.xavier/results/run.log` — stage status, attempt count, timestamps

## Guardrails

- Never skip `validate-goals`
- Never exceed 3 validation attempts
- Never let `ask-persona` run against an unvalidated persona
- Always surface user-dependent gaps as explicit questions
