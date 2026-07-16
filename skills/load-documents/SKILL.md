---
name: load-documents
description: Convert raw source files (PDFs, Word docs, notes, emails, images, exports, etc.) into normalized markdown as the entry point for a second-brain system. Use this skill whenever the user wants to add, import, or refresh source material for their knowledge base — including phrases like "add these files," "import my notes," "update with new documents," or "ingest this folder." Supports both a full initial load and incremental updates of new/changed files only. Always run before build-knowledge.
---

# Load Documents

Converts arbitrary raw source files into normalized, consistently-structured markdown so downstream skills (`build-knowledge`, `build-persona`) can process everything uniformly regardless of original format.

## When this is triggered

- Initial setup of a second brain (user provides a batch of files/folder)
- Ongoing maintenance (user adds new files, or `execute-workflow` re-triggers this skill after `validate-goals` identifies a document gap)

## Inputs

- One or more raw files, in any supported format: `.pdf`, `.docx`, `.pptx`, `.xlsx`, `.csv`, `.txt`, `.md`, `.html`, `.eml`, image files (`.png`/`.jpg` — OCR if text-bearing)
- Mode parameter: `--mode=full` (process everything) or `--mode=incremental` (process only new/changed files since last run)

## Process

1. **Inventory** — list all files in the source location. If `--mode=incremental`, diff against the manifest from the previous run (see Output below) to isolate new/changed files only.
2. **Route by type** — for each file, use the appropriate conversion path:
   - PDFs → use the `pdf`/`pdf-reading` skill's extraction approach (text-first; OCR fallback for scanned pages)
   - Word/PowerPoint/Excel → use the `docx`/`pptx`/`xlsx` skills' reading approach
   - Plain text/HTML/CSV/Markdown → direct normalization
   - Images with embedded text → OCR extraction
3. **Normalize** — every converted file becomes a `.md` file with:
   - A YAML frontmatter block: `source_file`, `original_format`, `date_loaded`, `date_modified` (from source metadata if available)
   - Clean markdown body (headers preserved, tables converted to markdown tables, images referenced by path not embedded as binary)
4. **Flag failures explicitly** — do not silently skip unsupported or corrupted files. Produce a `load-report.md` listing:
   - Files successfully converted
   - Files skipped (with reason — unsupported format, corrupted, empty, password-protected)
   - Files that need manual review (e.g., low-confidence OCR)
5. **Update the manifest** — write/update a `manifest.json` recording every source file's path, checksum, and load timestamp, used by future incremental runs to detect changes.

## Output

- Directory of normalized `.md` files (one per source document, or logically split if a source file is very large — e.g., split by chapter/section for long PDFs)
- `manifest.json` (for incremental diffing)
- `load-report.md` (successes, failures, manual-review flags)

## Handoff

Pass the output directory to `build-knowledge`. Do not proceed automatically if `load-report.md` shows failures on files the user explicitly flagged as important — surface this to the user first.
