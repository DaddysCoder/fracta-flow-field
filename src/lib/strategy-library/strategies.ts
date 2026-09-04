import type { StrategyTemplate } from './types';

// NOTE: every `personalisationRecords` array below is PLACEHOLDER CONTENT —
// two starter records per strategy so the local matching logic in
// `src/ai/personalise.ts` has something real to score and fill. The actual
// wording is a content-authoring task, not a coding one; replace these
// before launch.
//
// `evidenceAuthorityTier` is uniformly 3 (org_procedure_current) across all
// templates below. This is NOT a measure of research strength — that's
// `evidenceTier` (Strong/Emerging/Practice-based), which is unrelated and
// correct as-is. `evidenceAuthorityTier` instead grades *who this evidence
// is authoritative for right now* (see evidence-layer's EvidenceAuthorityTier):
// tier 1 is reserved for a specific participant's current, active plan —
// none of these generic, org-wide templates qualify. They're all approved,
// current, org-wide procedure templates, so tier 3 is correct for all of
// them regardless of how strong the underlying research is. Only once
// fracta-flow-field creates real per-participant current plans should any
// record legitimately earn tier 1.
// `version`/`approvalStatus`/`effectiveDate`/`current` are seeded as a
// single approved v1 for every template — none of these have a real
// supersession chain yet; `resolveCurrentTemplate` in `./types` is ready
// for when one does.
//
// `strategyCategories` replaces a prior `function` field (BehaviourFunction:
// Attention/Escape-avoidance/Sensory/Access to tangibles/Communication).
// That field was a design error carried over from an earlier draft:
// function belongs to the behaviour, determined by the FBA tool's screener
// + episode-triangulation logic, never to the strategy — see
// `StrategyCategory` in `./types` for the full rationale. `redirect` and
// `debrief` are responsive strategies (`responsive: true`) and carry no
// categories; they're gated behind an explicit acknowledgement in
// `PersonaliseFlow` rather than browsed/filtered like the other six.

export const STRATEGIES: StrategyTemplate[] = [
  {
    id: 'fct',
    templateId: 'fct',
    name: 'Functional communication training (FCT)',
    shortDescription:
      'Teaches a replacement communication response that accesses the same reinforcer as the behaviour of concern.',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 3,
    strategyCategories: ['communication'],
    responsive: false,
    mechanism:
      'Identifies the reinforcer maintaining the behaviour, then teaches and reinforces a communication response (word, sign, AAC) that accesses that same reinforcer more efficiently than the behaviour of concern.',
    citation:
      'Carr, E. G., & Durand, V. M. (1985). Reducing behavior problems through functional communication training. Journal of Applied Behavior Analysis, 18(2), 111–126.',
    citationShort: 'Carr & Durand (1985). JABA, 18(2), 111–126.',
    howToUse: [
      'Identify the maintaining reinforcer from FBA data.',
      'Select a communication response the participant can already produce, or can quickly learn.',
      'Reinforce every instance of the new response; place the old behaviour on extinction where safe to do so.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'fct-aac',
        templateId: 'fct',
        template:
          'Teach a request for attention using {{communicationMethod}}, modelled immediately before the natural opportunity within {{routine}}.',
        tags: { communicationMethod: ['aac', 'device', 'pecs'] },
      },
      {
        id: 'fct-verbal',
        templateId: 'fct',
        template:
          'Teach a simple verbal or gestural request for attention, practised during {{routine}} where attention-seeking is most likely.',
        tags: { communicationMethod: ['verbal', 'speech'] },
      },
    ],
  },
  {
    id: 'ncr',
    templateId: 'ncr',
    name: 'Non-contingent reinforcement (NCR)',
    shortDescription:
      'Delivers the reinforcer on a fixed schedule, independent of behaviour, to reduce its motivating value.',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 3,
    strategyCategories: ['environmental'],
    responsive: false,
    mechanism:
      'Delivers the identified reinforcer on a time-based schedule, unrelated to the target behaviour. As motivation for the reinforcer decreases through satiation, the behaviour that used to earn it loses value — without needing to withhold the reinforcer contingently.',
    citation:
      'Tucker, M., Sigafoos, J., & Bushell, H. (1998). Comprehensive review of self-injurious behavior treated with noncontingent reinforcement. Behavior Modification, 22(4), 529–547.',
    citationShort: 'Tucker et al. (1998). Behavior Modification, 22(4), 529–547.',
    howToUse: [
      'Identify the reinforcer maintaining the behaviour from FBA data.',
      'Set an initial schedule denser than the natural rate of the behaviour.',
      'Deliver on schedule regardless of behaviour; thin the schedule as responding stabilises.',
    ],
    supersededInfo: {
      previousFigure: 'Previous 61%',
      updatedFigure: 'Updated 34%',
    },
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'ncr-timer-slow',
        templateId: 'ncr',
        template:
          'Deliver a preferred {{interest}} item on a fixed timer during {{routine}}, starting with a longer interval given their current pace.',
        tags: { interests: ['fidget', 'sensory'], comfortThreshold: 'low' },
      },
      {
        id: 'ncr-timer-standard',
        templateId: 'ncr',
        template:
          'Deliver a preferred {{interest}} item on a fixed 10-minute schedule throughout {{routine}}, independent of behaviour.',
        tags: { comfortThreshold: 'medium' },
      },
    ],
  },
  {
    id: 'high-prob',
    templateId: 'high-prob',
    name: 'High-probability request sequences',
    shortDescription:
      'Builds behavioural momentum with easy requests before presenting a lower-probability demand.',
    evidenceTier: 'Emerging',
    evidenceAuthorityTier: 3,
    strategyCategories: ['environmental'],
    responsive: false,
    mechanism:
      'Presents a short series of requests the participant reliably complies with, building behavioural momentum, immediately before the lower-probability demand — increasing the odds of compliance with the target request.',
    citation:
      'Mace, F. C., Hock, M. L., Lalli, J. S., et al. (1988). Behavioral momentum in the treatment of noncompliance. Journal of Applied Behavior Analysis, 21(2), 123–141.',
    citationShort: 'Mace et al. (1988). JABA, 21(2), 123–141.',
    howToUse: [
      'Build a set of 2–3 high-probability requests specific to the participant.',
      'Deliver them in quick succession, reinforcing each compliance.',
      'Present the target (low-probability) request immediately after.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'high-prob-gentle',
        templateId: 'high-prob',
        template:
          'Open with two or three easy, preferred requests tied to {{interest}} before the harder ask during {{routine}} — keep pacing slow.',
        tags: { comfortThreshold: 'low' },
      },
      {
        id: 'high-prob-standard',
        templateId: 'high-prob',
        template:
          'Deliver 2–3 high-probability requests in quick succession, reinforcing each, immediately before the target request within {{routine}}.',
        tags: { comfortThreshold: 'medium' },
      },
    ],
  },
  {
    id: 'sensory-diet',
    templateId: 'sensory-diet',
    name: 'Scheduled sensory input',
    shortDescription:
      'Provides regular access to a preferred sensory activity to meet sensory needs proactively.',
    evidenceTier: 'Practice-based',
    evidenceAuthorityTier: 3,
    strategyCategories: ['environmental', 'health_wellbeing'],
    responsive: false,
    mechanism:
      'Offers regulated access to a preferred sensory activity at set points in the routine, addressing the sensory need directly rather than after escalation.',
    citation:
      'Watling, R., & Hauer, S. (2015). Effectiveness of Ayres Sensory Integration and sensory-based interventions for people with autism spectrum disorder. American Journal of Occupational Therapy, 69(5).',
    citationShort: 'Watling & Hauer (2015). AJOT, 69(5).',
    howToUse: [
      'Identify the preferred sensory activity from observation or the participant profile.',
      'Schedule brief access at fixed points across the day.',
      'Fade prompting as the participant begins to request access independently.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'sensory-water',
        templateId: 'sensory-diet',
        template: 'Schedule brief {{interest}} access at set points within {{routine}}.',
        tags: { interests: ['water', 'sensory'] },
      },
      {
        id: 'sensory-general',
        templateId: 'sensory-diet',
        template:
          'Offer a short, preferred sensory activity at fixed points during {{routine}}, fading prompts as independence grows.',
        tags: {},
      },
    ],
  },
  {
    id: 'choice-tangibles',
    templateId: 'choice-tangibles',
    name: 'Structured choice of tangibles',
    shortDescription:
      'Offers a limited, structured choice between preferred items to reduce conflict over access.',
    evidenceTier: 'Emerging',
    evidenceAuthorityTier: 3,
    strategyCategories: ['environmental'],
    responsive: false,
    mechanism:
      'Presents a small, pre-agreed set of preferred items as a choice at transition points, giving the participant control over which reinforcer they access without an open-ended negotiation.',
    citation:
      'Kern, L., Vorndran, C. M., Hilt, A., et al. (1998). Choice as an intervention to improve behavior. Journal of Behavioral Education, 8(2), 151–169.',
    citationShort: 'Kern et al. (1998). J. Behavioral Education, 8(2), 151–169.',
    howToUse: [
      'Identify 2–3 comparably preferred items ahead of time.',
      'Present the choice at the same transition point each time.',
      'Honour the choice immediately and consistently.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'choice-interest-led',
        templateId: 'choice-tangibles',
        template:
          'Offer a choice between two {{interest}}-related items at each transition within {{routine}}.',
        tags: { interests: ['toy', 'game', 'trains'] },
      },
      {
        id: 'choice-general',
        templateId: 'choice-tangibles',
        template:
          'Present a structured choice of 2–3 pre-agreed items at the same transition point during {{routine}}.',
        tags: {},
      },
    ],
  },
  {
    id: 'aac-request',
    templateId: 'aac-request',
    name: 'AAC-based requesting',
    shortDescription:
      'Teaches requesting via an augmentative and alternative communication system as the primary access route.',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 3,
    strategyCategories: ['communication'],
    responsive: false,
    mechanism:
      'Establishes an AAC exchange (device, PECS, key word sign) as the fastest, most reliable route to the reinforcer, so it out-competes the behaviour of concern as a communication strategy.',
    citation:
      'Ganz, J. B., Davis, J. L., Lund, E. M., et al. (2012). Meta-analysis of PECS with individuals with ASD. Research in Developmental Disabilities, 33(2), 406–418.',
    citationShort: 'Ganz et al. (2012). RiDD, 33(2), 406–418.',
    howToUse: [
      'Confirm the participant\'s current AAC access method from the profile.',
      'Model the request exchange immediately before the natural opportunity.',
      'Reinforce every independent exchange; prompt only when needed.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'aac-device',
        templateId: 'aac-request',
        template:
          'Model a request exchange on their {{communicationMethod}} for {{interest}}, immediately before the natural opportunity.',
        tags: { communicationMethod: ['device', 'aac'] },
      },
      {
        id: 'aac-signing',
        templateId: 'aac-request',
        template:
          'Model the sign or gesture for {{interest}} using {{communicationMethod}}, prompting only as needed.',
        tags: { communicationMethod: ['sign', 'signing'] },
      },
    ],
  },
  {
    id: 'redirect',
    templateId: 'redirect',
    name: 'Planned redirection',
    shortDescription:
      'Responds to early precursor behaviour by redirecting to an alternative activity, before escalation.',
    evidenceTier: 'Practice-based',
    evidenceAuthorityTier: 3,
    strategyCategories: [],
    responsive: true,
    mechanism:
      'Interrupts the behaviour chain at the earliest observable precursor by redirecting attention to a lower-demand or preferred activity, preventing escalation to the target behaviour.',
    citation:
      'Fahmie, T. A., & Iwata, B. A. (2011). Antecedent assessment and intervention: Supporting children and adults with developmental disabilities in community settings. Research in Autism Spectrum Disorders.',
    citationShort: 'Fahmie & Iwata (2011). RASD.',
    howToUse: [
      'Identify the earliest reliable precursor from observation data.',
      'Have the redirection activity ready and accessible in the setting.',
      'Redirect calmly and briefly; do not narrate the behaviour being avoided.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'redirect-low',
        templateId: 'redirect',
        template:
          'At the earliest precursor, redirect calmly to {{interest}} — keep the offer low-demand given their current pace.',
        tags: { comfortThreshold: 'low' },
      },
      {
        id: 'redirect-standard',
        templateId: 'redirect',
        template:
          'At the earliest precursor, redirect briefly to a preferred {{interest}} activity without narrating the behaviour being avoided.',
        tags: { comfortThreshold: 'medium' },
      },
    ],
  },
  {
    id: 'debrief',
    templateId: 'debrief',
    name: 'Post-incident debrief',
    shortDescription:
      'A brief, low-demand check-in after an incident has fully de-escalated, to support recovery.',
    evidenceTier: 'Practice-based',
    evidenceAuthorityTier: 3,
    strategyCategories: [],
    responsive: true,
    mechanism:
      'Provides brief, calm attention after the participant has returned to baseline, supporting recovery and relationship repair without reinforcing the behaviour itself (attention is withheld during and immediately after the episode).',
    citation:
      'Colvin, G. (2004). Managing the cycle of acting-out behavior in the classroom. Behavior Associates.',
    citationShort: 'Colvin (2004). Behavior Associates.',
    howToUse: [
      'Wait until physiological and behavioural signs indicate full de-escalation.',
      'Keep the check-in brief and low-demand.',
      'Avoid discussing the incident itself during this step.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'debrief-aac',
        templateId: 'debrief',
        template:
          'Once fully settled, offer a brief, calm check-in using {{communicationMethod}} — no discussion of the incident.',
        tags: { communicationMethod: ['aac', 'device', 'sign'] },
      },
      {
        id: 'debrief-general',
        templateId: 'debrief',
        template:
          'Once fully settled, offer a brief, low-demand check-in — keep it short and avoid discussing the incident.',
        tags: {},
      },
    ],
  },
];

export function getStrategyById(id: string): StrategyTemplate | undefined {
  return STRATEGIES.find((s) => s.id === id);
}
