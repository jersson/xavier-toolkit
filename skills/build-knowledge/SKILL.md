---
name: build-knowledge
description: Structure and index normalized markdown documents into a searchable knowledge base that serves as both a navigable wiki and the retrieval backend for a second-brain system. Use this skill after load-documents has produced markdown files, or whenever the user asks to "organize," "index," "structure," or "build the knowledge base/wiki" from their loaded documents. Supports full rebuild and incremental update modes. Always run before build-persona.
---

# Build Knowledge

Takes the normalized markdown from `load-documents` and turns it into the structured "second brain" store: a set of cross-referenced, browsable wiki pages plus an index usable for retrieval by `validate-goals`, `build-persona`, and `ask-persona`.

## When this is triggered

- Immediately after `load-documents` completes (full or incremental)
- When the user asks to reorganize or re-index existing content without new source files

## Inputs

- Directory of normalized markdown files (output of `load-documents`)
- `manifest.json` from `load-documents`
- Mode parameter: `--mode=rebuild` (reprocess everything) or `--mode=incremental` (index only new/changed files, patch existing structure)

## Process

1. **Extract entities and topics** — scan each document for people, projects, dates, recurring themes, and explicit topics/tags.
2. **Cluster into categories** — group documents into a topic hierarchy (e.g., by project, by life area, by time period — infer the most natural grouping from the content itself rather than imposing a fixed taxonomy).
3. **Cross-link** — where the same entity/topic appears across multiple documents, insert links between the relevant wiki pages.
4. **Generate wiki structure**:
   - `index.md` — top-level table of contents by category
   - One page per category/cluster, linking to underlying source documents
   - Preserve provenance: every wiki page cites which source document(s) it's built from
5. **Build the retrieval index** — in parallel with the wiki, produce a machine-usable index (e.g., a structured JSON/embeddings store, depending on implementation) optimized for semantic search. This index is what `validate-goals` and `ask-persona` query — the wiki is the human-readable counterpart, not a replacement for it.
6. **Incremental mode** — if `--mode=incremental`, only re-cluster and re-link affected categories (those touched by new/changed documents), not the entire wiki.

## Output

- `/wiki/` directory: navigable markdown pages (index + category pages), each citing source documents
- `/index/` retrieval store: the searchable backend used by downstream skills
- `build-report.md`: summary of categories created/updated, document counts per category, any documents that couldn't be confidently categorized (flag these — they may indicate the taxonomy needs adjustment or the document is out of scope)

## Handoff

Pass both `/wiki/` and `/index/` to `build-persona` and, later, `ask-persona`. If `build-report.md` shows a high proportion of uncategorized documents, flag to the user before proceeding — this is a signal the knowledge base may be too sparse or scattered for `validate-goals` to pass later.
