---
name: validate-goals
description: Hard gate that reviews a draft persona (from build-persona) and verifies its stated goals and motivations are sufficiently and accurately supported by the knowledge base — blocking ask-persona until it passes. Use this skill immediately after build-persona produces a draft, or whenever the user asks to "check," "validate," or "review" whether the digital clone/persona is accurate before using it. This is the only skill that can classify and route gap-resolution.
---

# Validate Goals

Reviews the draft persona against the knowledge base and determines whether it is accurate and sufficiently supported. This is a hard gate: no query against the persona is permitted until it passes.

## When this is triggered

- Immediately after every `build-persona` run (including retries)
- On demand, if the user wants to re-check an existing persona

## Inputs

- `.xavier/results/.draft/persona/persona-draft.md` and `persona-draft-report.md`
- `.xavier/kb/` — wiki and retrieval index
- Attempt counter (tracked by `execute-workflow`, max 3)

## Pass/fail criteria

A persona **passes** only if:
1. Every claim in "Goals & motivations" and "Identity" is traceable to at least one source document
2. No "inferred" section lacks corroborating evidence from at least two independent sources
3. No direct contradictions between sections
4. Sufficient specificity for answering real user questions

A persona **fails** if any criterion is not met. Each failure attributed to a specific section and reason.

## Process

1. **Cross-check claims** — verify each claim in the draft against `.xavier/kb/wiki/`.
2. **Check confidence levels** — review the draft report; "inferred" or "thinly-supported" sections are candidate gaps.
3. **Classify each gap**:
   - **Auto-resolvable** — closable with more documents → route to `load-documents`
   - **User-dependent** — requires user intent/preference → route to direct prompt
4. **Produce verdict**:
   - **PASS** → copy draft to `.xavier/persona/persona.md`, hand off to `ask-persona`
   - **FAIL** → produce gap report in `.xavier/results/validation/`

## Output

- `.xavier/results/validation/validation-verdict.md` — PASS or FAIL with attempt number
- `.xavier/results/validation/gap-report.md` (if FAIL) — itemized gaps with classification and proposed resolution

## Handoff

- On PASS: persona is validated and written to `.xavier/persona/persona.md`; `execute-workflow` proceeds to `ask-persona`.
- On FAIL, attempt < 3: route gaps back through the pipeline.
- On FAIL, attempt = 3: halt. Report gaps to user. Never run `ask-persona`.
