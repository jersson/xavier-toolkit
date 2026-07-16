---
name: load-documents
description: Convert raw source files (PDFs, Word docs, notes, emails, images, exports, etc.) into normalized markdown as the entry point for a second-brain system. Use this skill whenever the user wants to add, import, or refresh source material for their knowledge base — including phrases like "add these files," "import my notes," "update with new documents," or "ingest this folder." Supports both a full initial load and incremental updates of new/changed files only. Always run before build-knowledge.
---

# Load Documents

Converts raw source files from `.xavier/raw/` into normalized markdown stored in `.xavier/normalized/`, so downstream skills can process everything uniformly.

## When this is triggered

- Initial setup of a second brain (user provides a batch of files/folder)
- Ongoing maintenance (user adds new files, or `execute-workflow` re-triggers after `validate-goals` identifies a document gap)

## Inputs

- Source files in `.xavier/raw/`
- Mode parameter: `--mode=full` (process everything) or `--mode=incremental` (process only new/changed files since last run)

## Supported formats

| Format | Tool | Notes |
|--------|------|-------|
| `.pdf` | markitdown → pymupdf4llm fallback | Text-first; pymupdf for complex layouts |
| `.doc` / `.docx` | markitdown | |
| `.xls` / `.xlsx` | pandas | Converts to markdown tables |
| `.txt` | direct read | Flagged as low-structure in report |

## Process

1. **Inventory** — list all files in `.xavier/raw/`. If `--mode=incremental`, diff against `manifest.json` in `.xavier/normalized/` to isolate new/changed files only.
2. **Route by type** — for each file, run the appropriate tool via bash:
   - `markitdown <file> -o <output.md>` for PDF/DOC/DOCX
   - `pymupdf4llm <file> -o <output.md>` as PDF fallback
   - pandas for XLS/XLSX → markdown table output
   - Direct read for TXT
3. **Normalize** — every output becomes a `.md` file in `.xavier/normalized/` with:
   - YAML frontmatter: `source_file`, `original_format`, `date_loaded`, `date_modified`
   - Clean markdown body
4. **Flag failures** — produce `.xavier/results/load/load-report.md` listing:
   - Files successfully converted
   - Files skipped (with reason)
   - Files needing manual review
5. **Update manifest** — write/update `.xavier/normalized/manifest.json` with path, checksum, and load timestamp per file.

## Output

- `.xavier/normalized/` — directory of converted `.md` files
- `.xavier/normalized/manifest.json` — for incremental diffing
- `.xavier/results/load/load-report.md` — successes, failures, flags

## Handoff

Pass `.xavier/normalized/` to `build-knowledge`. Do not proceed automatically if `load-report.md` shows failures on important files — surface to the user first.
