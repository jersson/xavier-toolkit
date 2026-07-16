---
name: validate-goals
description: Hard gate that reviews a draft persona (from build-persona) and verifies its stated goals and motivations are sufficiently and accurately supported by the knowledge base — blocking ask-persona until it passes. Use this skill immediately after build-persona produces a draft, or whenever the user asks to "check," "validate," or "review" whether the digital clone/persona is accurate before using it. This is the only skill that can classify and route gap-resolution.
---

# Validate Goals

Reviews the draft persona against the underlying knowledge base and determines whether it is accurate and sufficiently supported to be used for downstream interaction (`ask-persona`). This is a hard gate: no query against the persona is permitted until it passes.

## When this is triggered

- Immediately after every `build-persona` run (including retries)
- On demand, if the user wants to re-check an existing persona (e.g., after adding new documents)

## Inputs

- `persona-draft.md` and `persona-draft-report.md` from `build-persona`
- `/wiki/` and `/index/` from `build-knowledge`
- Attempt counter (tracked by `execute-workflow`; this skill must respect and report it, max 3 attempts)

## Pass/fail criteria

A persona **passes** only if:
1. Every claim in the "Goals & motivations" and "Identity" sections is traceable to at least one specific source document (no unsupported inference presented as fact)
2. No section is marked "inferred" in `persona-draft-report.md` without corroborating evidence from at least two independent sources
3. There is no direct contradiction between sections (e.g., stated goals conflicting with stated constraints)
4. Coverage is sufficient: the persona addresses goals/motivations at a level of specificity useful for answering real user questions — not just generic statements

A persona **fails** if any criterion above is not met. Every failure must be attributed to a specific section and a specific reason.

## Process

1. **Cross-check claims** — for each claim in `persona-draft.md`, verify it against the cited source in `/wiki/`. Flag any claim that overstates, misrepresents, or can't be traced to its citation.
2. **Check confidence levels** — review `persona-draft-report.md`; any "inferred" or "thinly-supported" section is a candidate gap.
3. **Classify each gap**:
   - **Auto-resolvable**: gap could plausibly be closed by more documents or web research (e.g., missing timeframe, missing project context) → route to `load-documents`
   - **User-dependent**: gap is inherently about intent/preference that only the user can clarify (e.g., "wants to grow the business" vs. "wants to sell it" — ambiguous without asking) → route to direct user prompt
4. **Produce verdict**:
   - **PASS** → hand off to `ask-persona`
   - **FAIL** → produce `gap-report.md` listing each gap, its classification, and a specific proposed next step

## Output

- `validation-verdict.md`: PASS or FAIL, with attempt number
- If FAIL: `gap-report.md` — itemized gaps, classification (auto-resolvable / user-dependent), and proposed resolution per gap

## Handoff

- On PASS: persona is marked validated; `execute-workflow` proceeds to `ask-persona`.
- On FAIL, attempt < 3: `execute-workflow` routes auto-resolvable gaps back to `load-documents`, and user-dependent gaps to a direct prompt, then re-runs `build-persona`.
- On FAIL, attempt = 3: halt. Report `gap-report.md` to the user directly. Do not allow `ask-persona` to run against this persona under any circumstance.
