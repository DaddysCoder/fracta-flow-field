export type EvidenceTier = 'Strong' | 'Emerging' | 'Practice-based';

export type BehaviourFunction =
  | 'Attention'
  | 'Escape/avoidance'
  | 'Sensory'
  | 'Access to tangibles'
  | 'Communication';

export interface SupersededInfo {
  previousFigure: string;
  updatedFigure: string;
}

export interface Strategy {
  id: string;
  name: string;
  shortDescription: string;
  evidenceTier: EvidenceTier;
  function: BehaviourFunction;
  /** True when this is a responsive strategy rather than a function-based one. */
  responsive: boolean;
  mechanism: string;
  citation: string;
  citationShort: string;
  howToUse: string[];
  superseded?: SupersededInfo;
}
