import type { StrategyTemplate } from './types';

export type ExportFormat = 'plan' | 'session-log';

/** Assembles the practitioner-facing export text, mechanism + citation always attached. */
export function assembleExportText(
  strategy: StrategyTemplate,
  draftText: string,
  format: ExportFormat,
): string {
  const header = format === 'plan' ? 'BEHAVIOUR SUPPORT PLAN — STRATEGY' : 'SESSION LOG ENTRY';
  return [
    header,
    '',
    strategy.name,
    '',
    draftText.trim(),
    '',
    `Mechanism: ${strategy.mechanism}`,
    `Citation: ${strategy.citation}`,
  ].join('\n');
}
