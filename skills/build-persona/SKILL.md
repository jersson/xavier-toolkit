---
name: build-persona
description: Synthesize a knowledge base into a draft system prompt representing the user's profile, goals, and motivations — the first-pass "digital clone." Use this skill after build-knowledge has produced a knowledge base, or when the user asks to "create my persona," "build my digital clone," "define my profile," or "generate a system prompt from my notes." This produces a DRAFT only — it must pass validate-goals before it can be used by ask-persona.
---

# Build Persona

Synthesizes `.xavier/kb/` into a draft system prompt: a persona capturing identity, working style, goals, and motivations. Draft is written to `.xavier/results/.draft/persona/` — it must pass validation before becoming the final persona.

## When this is triggered

- After `build-knowledge` completes
- On retry after a gap-resolution cycle triggered by `validate-goals`

## Inputs

- `.xavier/kb/` — wiki and retrieval index from `build-knowledge`
- (On retry only) prior gap-report from `.xavier/results/validation/`

## Process

1. **Extract profile signals** — scan `.xavier/kb/wiki/` for:
   - Stated goals, priorities, objectives
   - Values, working style, tone/voice patterns
   - Domain expertise and areas of responsibility
   - Relationships and context (roles, teams, projects)
2. **Draft system prompt** — produce a structured document with sections:
   - **Identity** — who this person is
   - **Goals & motivations** — what they're trying to achieve
   - **Working style & voice** — how they communicate and decide
   - **Known constraints** — boundaries and non-goals
   - **Source citations** — every claim traceable to specific wiki pages
3. **Mark confidence levels** — flag each section: well-supported, thinly-supported, or inferred.
4. **On retry** — prioritize addressing flagged gaps from prior failure report.

## Output

- `.xavier/results/.draft/persona/persona-draft.md` — structured system prompt with confidence annotations
- `.xavier/results/.draft/persona/persona-draft-report.md` — confidence summary for `validate-goals`

## Handoff

Pass drafts to `validate-goals`. Never pass directly to `ask-persona` — output is explicitly unvalidated.
