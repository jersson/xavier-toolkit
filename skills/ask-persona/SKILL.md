---
name: ask-persona
description: Answer ad-hoc user questions by querying a validated persona and its knowledge base — the primary interaction point for the second brain. Use this skill whenever the user wants to ask their digital clone something, get advice "in their own voice," or request a high-level summary/overview (with --mode=summary) including charts. Requires that validate-goals has already passed for the current persona — never query an unvalidated or draft persona.
---

# Ask Persona

Answers questions by combining the validated persona (identity, goals, motivations, working style) with retrieval against the knowledge base — giving grounded, persona-consistent answers rather than generic responses.

## Precondition (hard requirement)

Before running, confirm `validation-verdict.md` for the current persona shows **PASS**. If no validated persona exists, or the verdict is FAIL/missing, do not answer — instead direct the user to run `execute-workflow` or `build-persona` → `validate-goals` first. This precondition is non-negotiable; it exists specifically to prevent hallucinated or unsupported answers.

## Inputs

- Validated `persona-draft.md` (post-PASS)
- `/index/` retrieval store from `build-knowledge`
- User's question or request
- Mode parameter: default (Q&A) or `--mode=summary` (high-level overview with charts)

## Process — default mode

1. **Retrieve** relevant documents/wiki pages from `/index/` based on the user's question.
2. **Ground the answer** — combine retrieved source material with the persona's known goals/voice to produce an answer consistent with both facts and the user's actual perspective.
3. **Cite sources** — every substantive claim in the answer should reference which document/wiki page it came from. If the knowledge base doesn't cover the question, say so explicitly rather than inferring or guessing — do not extend the persona beyond what's validated.
4. **Flag out-of-scope questions** — if a question falls outside what the persona/knowledge base can support, tell the user directly instead of fabricating a plausible-sounding answer.

## Process — summary mode (`--mode=summary`)

1. Pull top-level structure from `/wiki/index.md` and category pages.
2. Generate a high-level narrative overview: key themes, active goals, notable gaps (if any were flagged during validation but didn't block the pass).
3. Include charts where useful (e.g., document counts by category, topic distribution) — use the visualization approach appropriate to the current interface.

## Output

- Direct answer (default mode) or overview report with charts (summary mode)
- Explicit citations back to knowledge base sources
- Explicit "not covered" flag when applicable — never silently fill gaps

## Notes

- This skill never modifies the persona or knowledge base — it's read-only against validated state.
- If the user's question implies the underlying documents are stale (e.g., asking about something clearly time-sensitive), suggest running `load-documents --mode=incremental` before answering, rather than answering from potentially outdated material.
