import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(dir, 'skills');

export default async () => {
  return {
    config: (cfg) => {
      try {
        cfg.skills = cfg.skills || {};
        cfg.skills.paths = cfg.skills.paths || [];
        if (!cfg.skills.paths.includes(skillsDir)) {
          cfg.skills.paths.push(skillsDir);
        }

        cfg.command = cfg.command || {};
        cfg.command.xavier = {
          template: 'Load the execute-workflow skill and follow its workflow step by step.',
          description: 'Entry point (defaults to execute-workflow) — runs the full second-brain pipeline end-to-end'
        };
        cfg.command['xavier execute-workflow'] = {
          template: 'Load the execute-workflow skill and follow its workflow step by step.',
          description: 'Run the full pipeline — load-documents, build-knowledge, build-persona, validate-goals, ask-persona'
        };
        cfg.command['xavier load-documents'] = {
          template: 'Load the load-documents skill and follow its workflow step by step.',
          description: 'Convert raw source files into normalized markdown'
        };
        cfg.command['xavier build-knowledge'] = {
          template: 'Load the build-knowledge skill and follow its workflow step by step.',
          description: 'Structure and index markdown into a searchable knowledge base'
        };
        cfg.command['xavier build-persona'] = {
          template: 'Load the build-persona skill and follow its workflow step by step.',
          description: 'Synthesize knowledge base into a draft system prompt (digital clone)'
        };
        cfg.command['xavier validate-goals'] = {
          template: 'Load the validate-goals skill and follow its workflow step by step.',
          description: 'Hard gate — verify draft persona against knowledge base'
        };
        cfg.command['xavier ask-persona'] = {
          template: 'Load the ask-persona skill and follow its workflow step by step.',
          description: 'Answer questions using the validated persona and knowledge base'
        };
      } catch (err) {
        console.error('[xavier/toolkit] Plugin config error:', err.message);
      }
    }
  };
};
