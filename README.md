# Xavier Toolkit

```
=================================
█   █  ███  █   █ ███ █████ ████  
 █ █  █   █ █   █  █  █     █   █ 
  █   █████ █   █  █  ████  ████  
 █ █  █   █  █ █   █  █     █  █  
█   █ █   █   █   ███ █████ █   █ 
=================================
```

`xavier` is a second-brain toolkit that converts raw documents into a validated persona — a "digital clone" that answers questions in your voice, grounded in your actual knowledge base.

The pipeline:
1. **Load documents** — convert PDFs, notes, emails, exports into normalized markdown
2. **Build knowledge** — structure markdown into a cross-referenced wiki + retrieval index
3. **Build persona** — synthesize the knowledge base into a draft system prompt (identity, goals, motivations)
4. **Validate goals** — hard gate that blocks until the persona is accurate and supported by sources
5. **Ask persona** — answer questions using the validated persona + knowledge base

> Run `xavier` with no arguments at any time to see the command list.

## Available skills

- **execute-workflow** — runs the full pipeline end-to-end (load → build → validate → ask), handling the 3-attempt retry loop automatically
- **load-documents** — convert raw source files (PDF, DOCX, notes, images, etc.) into normalized markdown
- **build-knowledge** — structure and index markdown into a searchable wiki + retrieval store
- **build-persona** — synthesize the knowledge base into a draft system prompt with confidence annotations
- **validate-goals** — hard gate that verifies the persona against the knowledge base (max 3 attempts)
- **ask-persona** — answer questions using the validated persona and knowledge base

## How it works

```
execute-workflow
      │
      ├─ load-documents
      ├─ build-knowledge
      ├─ build-persona
      ├─ validate-goals ──[FAIL, attempt ≤3]──┬─ auto-resolvable ──> reload → rebuild → retry
      │                                        └─ needs user input ──> pause, ask → retry
      │
      ├─ validate-goals ──[FAIL, attempt = 3]──> halt, report gaps
      │
      └─ validate-goals ──[PASS]──> ask-persona → answer
```

- `validate-goals` is never skipped — no matter how confident the draft looks
- 3-attempt hard cap prevents infinite loops on sparse knowledge bases
- `ask-persona` only runs after a PASS verdict — never against a draft
- User-dependent gaps are surfaced as explicit questions — never guessed

## Requirements

- Node.js >= 18
- [OpenCode](https://opencode.ai) and/or [Claude Code](https://claude.com/claude-code)

## Installation

```bash
npm install -g @xavier/toolkit
```

### OpenCode

```bash
cd my-project
xavier install --opencode
```

OpenCode installs are always repository level — there's no `--global` option.

The installer finds the nearest `opencode.json` (or `.jsonc`), creates one if missing, and registers the plugin path. Restart OpenCode afterwards.

**Commands:** `/xavier`, `/xavier execute-workflow`, `/xavier load-documents`, `/xavier build-knowledge`, `/xavier build-persona`, `/xavier validate-goals`, `/xavier ask-persona`.

### Claude Code

```bash
cd my-project
xavier install --claude-code             # repository level
xavier install --claude-code --global    # global (all projects)
```

The installer registers the marketplace, installs the plugin, and cleans up legacy installs. Restart Claude Code afterwards.

**Commands:** `/xavier:execute-workflow`, `/xavier:load-documents`, etc. Also available as `/execute-workflow (xavier)` in the command picker.

## Uninstall

```bash
xavier uninstall --opencode
xavier uninstall --claude-code
xavier uninstall --claude-code --global
```

## Version

```bash
xavier --version    # or xavier -v
```
