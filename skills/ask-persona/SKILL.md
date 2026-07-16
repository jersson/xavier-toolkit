---
name: ask-persona
description: Answer ad-hoc user questions by querying a validated persona and its knowledge base — the primary interaction point for the second brain. Use this skill whenever the user wants to ask their digital clone something, get advice "in their own voice," or request a high-level summary/overview (with --mode=summary) including charts. Requires that validate-goals has already passed for the current persona — never query an unvalidated or draft persona.
---

# Ask Persona

Answers questions by combining the validated persona from `.xavier/persona/` with retrieval against `.xavier/kb/index/` — giving grounded, persona-consistent answers.

## Precondition (hard requirement)

Before running, confirm `.xavier/results/validation/validation-verdict.md` shows **PASS**. If no validated persona exists or verdict is FAIL/missing, direct the user to run `execute-workflow` first. This prevents hallucinated or unsupported answers.

## Inputs

- `.xavier/persona/persona.md` — validated persona definition
- `.xavier/kb/index/` — retrieval store
- User's question or request
- Mode: default (Q&A) or `--mode=summary` (overview with charts)

## Process — default mode

1. **Retrieve** relevant documents from `.xavier/kb/index/` based on the question.
2. **Ground the answer** — combine retrieved material with persona's goals/voice.
3. **Cite sources** — reference which document/wiki page each claim comes from.
4. **Flag out-of-scope** — if the knowledge base doesn't cover the question, say so.

## Process — summary mode (`--mode=summary`)

1. Pull structure from `.xavier/kb/wiki/index.md` and category pages.
2. Generate narrative overview: key themes, goals, notable gaps.
3. Include charts where useful (document counts, topic distribution).

## Output

- Direct answer (default) or overview with charts (summary mode)
- Explicit citations to knowledge base sources
- Explicit "not covered" flag when applicable

## Notes

- Read-only against validated state — never modifies persona or knowledge base.
- If documents seem stale, suggest running `load-documents --mode=incremental` first.
