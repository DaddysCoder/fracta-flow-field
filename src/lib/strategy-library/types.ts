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

export type ComfortLevel = 'low' | 'medium' | 'high';

/**
 * A pre-authored delivery-wording template for one strategy, tagged for local
 * matching against a participant profile. No model ever writes new prose here
 * — `matchPersonalisedVariant` only ever fills the slots of whichever variant
 * scores highest.
 */
export interface PersonalisedVariant {
  id: string;
  strategyId: string;
  /** e.g. "During {{routine}}, offer {{interest}}-themed choices using {{communicationMethod}}." */
  template: string;
  tags: {
    interests?: string[];
    communicationMethod?: string[];
    comfortThreshold?: ComfortLevel;
  };
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
  variants: PersonalisedVariant[];
}
