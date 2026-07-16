---
name: build-knowledge
description: Structure and index normalized markdown documents into a searchable knowledge base that serves as both a navigable wiki and the retrieval backend for a second-brain system. Use this skill after load-documents has produced markdown files, or whenever the user asks to "organize," "index," "structure," or "build the knowledge base/wiki" from their loaded documents. Supports full rebuild and incremental update modes. Always run before build-persona.
---

# Build Knowledge

Takes normalized markdown from `.xavier/normalized/` and turns it into the structured knowledge base in `.xavier/kb/`: cross-referenced wiki pages plus a retrieval index.

## When this is triggered

- Immediately after `load-documents` completes
- When the user asks to reorganize or re-index existing content

## Inputs

- `.xavier/normalized/` — directory of normalized markdown files
- `.xavier/normalized/manifest.json` — from `load-documents`
- Mode: `--mode=rebuild` (reprocess everything) or `--mode=incremental` (index only new/changed files)

## Process

1. **Extract entities and topics** — scan each document for people, projects, dates, themes, tags.
2. **Cluster into categories** — group documents by natural topic hierarchy (infer from content, don't impose fixed taxonomy).
3. **Cross-link** — insert links between wiki pages where the same entity/topic appears across documents.
4. **Generate wiki**:
   - `.xavier/kb/wiki/index.md` — top-level table of contents
   - One page per category, linking to source documents
   - Preserve provenance: every page cites its source document(s)
5. **Build retrieval index** — produce `.xavier/kb/index/` optimized for semantic search (what `validate-goals` and `ask-persona` query).
6. **Incremental mode** — only re-cluster/re-link categories touched by new/changed documents.

## Output

- `.xavier/kb/wiki/` — navigable markdown pages
- `.xavier/kb/index/` — searchable retrieval store
- `.xavier/results/kb/build-report.md` — categories created/updated, uncategorized document flags

## Handoff

Pass `.xavier/kb/` to `build-persona` and later `ask-persona`. If `build-report.md` shows high uncategorized proportion, flag to user before proceeding.
