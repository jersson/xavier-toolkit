---
name: build-persona
description: Synthesize a knowledge base into a draft system prompt representing the user's profile, goals, and motivations — the first-pass "digital clone." Use this skill after build-knowledge has produced a wiki/index, or when the user asks to "create my persona," "build my digital clone," "define my profile," or "generate a system prompt from my notes." This produces a DRAFT only — it must pass validate-goals before it can be used by ask-persona.
---

# Build Persona

Synthesizes the structured knowledge base into a draft system prompt: a persona that captures the user's identity, working style, goals, motivations, and relevant context, intended to power `ask-persona` once validated.

## When this is triggered

- After `build-knowledge` completes and produces a usable wiki/index
- When re-running persona generation after a gap-resolution cycle triggered by `validate-goals` (see below)

## Inputs

- `/wiki/` and `/index/` from `build-knowledge`
- (On retry only) prior `validate-goals` failure report, listing specific gaps to address in this draft

## Process

1. **Extract profile signals** — scan the wiki for:
   - Stated goals, priorities, or objectives (explicit statements like "my goal is..." or inferred from repeated themes/projects)
   - Values, working style, tone/voice patterns (how the user writes, decisions they've made, preferences expressed)
   - Domain expertise and areas of responsibility
   - Relationships and context (roles, teams, projects) relevant to interpreting requests correctly
2. **Draft the system prompt** — produce a structured persona document with explicit sections:
   - **Identity**: who this person is, professionally/personally as relevant to scope
   - **Goals & motivations**: what they're trying to achieve, in their own terms where possible
   - **Working style & voice**: how they communicate, make decisions, prioritize
   - **Known constraints**: anything explicitly stated as a boundary, preference, or non-goal
   - **Source citations**: every claim in the persona should be traceable to specific wiki pages/documents — no unsupported inferences
3. **Mark confidence levels** — for each section, flag whether it's well-supported (multiple corroborating sources), thinly-supported (one source), or inferred (pattern-matched, not explicitly stated). This is required input for `validate-goals`.
4. **On retry** — if given a prior failure report, prioritize addressing the specific flagged gaps; don't regenerate from scratch.

## Output

- `persona-draft.md`: the structured system prompt with confidence annotations and source citations
- `persona-draft-report.md`: summary of which sections are well-supported vs. thin/inferred, for `validate-goals` to review

## Handoff

Pass `persona-draft.md` and `persona-draft-report.md` to `validate-goals`. Never pass directly to `ask-persona` — this output is explicitly unvalidated and must go through the gate first.
