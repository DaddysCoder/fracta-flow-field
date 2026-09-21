import { isApprovedCurrent, type StrategyTemplate } from './types';

// NOTE: every `personalisationRecords` array below is still mostly
// PLACEHOLDER CONTENT — starter records so the local matching logic in
// `src/ai/personalise.ts` has something real to score and fill. Most of
// the wording is still a content-authoring task, not a coding one.
//
// `evidenceAuthorityTier` defaults are a mechanical mapping from the
// existing `evidenceTier` label (Strong→1, Emerging→3, Practice-based→5)
// pending real evidence-layer authority classification of each source.
// `version`/`approvalStatus`/`effectiveDate`/`current` are seeded as a
// single approved v1 for every template — none of these have a real
// supersession chain yet; `resolveCurrentTemplate` in `./types` is ready
// for when one does.
//
// Evidence-integration pass (see EVIDENCE.md for the full report): added
// `competing-stimulus-access`, `choice-task-adaptation` and `demand-fading`;
// gave `fct` cross-function `applicableFunctions` + function-tagged
// variants (see `PersonalisationRecord.tags.function`) instead of
// duplicating it per function; added `evidenceSources` where a strategy is
// backed by more than one source. `approvalStatus`/`excludedSupportTypes`
// are still not read by any gating logic anywhere in this app (see
// EVIDENCE.md's "schema changes required" — flagged, not fixed here).

export const STRATEGIES: StrategyTemplate[] = [
  {
    id: 'fct',
    templateId: 'fct',
    name: 'Functional communication training (FCT)',
    shortDescription:
      'Teaches a replacement communication response that accesses the same reinforcer as the behaviour of concern.',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 1,
    function: 'Attention',
    // One canonical strategy, applicable across the functions it's actually
    // been used for — not duplicated as "FCT — Escape", "FCT — Tangible",
    // etc. Function-specific delivery lives in the tagged variants below.
    applicableFunctions: ['Attention', 'Escape/avoidance', 'Access to tangibles'],
    responsive: false,
    mechanism:
      'Identifies the reinforcer maintaining the behaviour, then teaches and reinforces a communication response (word, sign, AAC) that accesses that same reinforcer more efficiently than the behaviour of concern. The mand taught is specific to the function being addressed — a request for attention, for a break, or for an item/activity — not a single generic phrase.',
    citation:
      'Carr, E. G., & Durand, V. M. (1985). Reducing behavior problems through functional communication training. Journal of Applied Behavior Analysis, 18(2), 111–126.',
    citationShort: 'Carr & Durand (1985). JABA, 18(2), 111–126.',
    evidenceSources: [
      {
        citation:
          'Carr, E. G., & Durand, V. M. (1985). Reducing behavior problems through functional communication training. Journal of Applied Behavior Analysis, 18(2), 111–126.',
        citationShort: 'Carr & Durand (1985). JABA, 18(2), 111–126.',
        evidenceType: 'single-case',
      },
      {
        citation:
          'Tiger, J. H., Hanley, G. P., & Bruzek, J. (2008). Functional communication training: A review and practical guide. Behavior Analysis in Practice, 1(1), 16–23.',
        citationShort: 'Tiger, Hanley & Bruzek (2008). Behav Anal Pract, 1(1), 16–23.',
        evidenceType: 'narrative-review',
      },
      {
        citation:
          'Chezan, L. C., Wolfe, K., & Drasgow, E. (2018). A meta-analysis of functional communication training effects on problem behavior and alternative communicative responses. Focus on Autism and Other Developmental Disabilities, 33(4), 195–205.',
        citationShort: 'Chezan, Wolfe & Drasgow (2018). FAODD, 33(4), 195–205.',
        evidenceType: 'meta-analysis',
        doi: '10.1177/1088357617741294',
      },
      {
        citation:
          'Ghaemmaghami, M., Hanley, G. P., & Jessel, J. (2021). Functional communication training: From efficacy to effectiveness. Journal of Applied Behavior Analysis, 54(1), 122–143.',
        citationShort: 'Ghaemmaghami, Hanley & Jessel (2021). JABA, 54(1), 122–143.',
        evidenceType: 'narrative-review',
        doi: '10.1002/jaba.762',
      },
    ],
    howToUse: [
      'Identify the maintaining reinforcer AND the function it serves from FBA data — attention, escape/avoidance, or access to a tangible/activity.',
      "Select a mand topography for that function (e.g. request attention, request a break, request an item) that the participant can already produce, or can quickly learn, in their established communication modality.",
      'Reinforce every instance of the new response; place the old behaviour on extinction where safe to do so.',
      "Efficacy is well established; generalisation to home/school/community and long-term maintenance are less consistently demonstrated (Ghaemmaghami et al., 2021) — plan for that explicitly, don't assume it.",
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'fct-attention-aac',
        templateId: 'fct',
        template:
          'Teach a request for attention/interaction using {{communicationMethod}}, modelled immediately before the natural opportunity within {{routine}}.',
        tags: { communicationMethod: ['aac', 'device', 'pecs'], function: 'Attention' },
      },
      {
        id: 'fct-attention-verbal',
        templateId: 'fct',
        template:
          'Teach a simple verbal or gestural request for attention/interaction, practised during {{routine}} where attention-seeking is most likely.',
        tags: { communicationMethod: ['verbal', 'speech', 'gesture', 'sign'], function: 'Attention' },
      },
      {
        id: 'fct-escape-aac',
        templateId: 'fct',
        template:
          'Teach a request for a break/help/finish using {{communicationMethod}}, modelled immediately before the demand within {{routine}} that reliably precedes the behaviour.',
        tags: { communicationMethod: ['aac', 'device', 'pecs'], function: 'Escape/avoidance' },
      },
      {
        id: 'fct-escape-verbal',
        templateId: 'fct',
        template:
          'Teach a simple verbal, signed or gestural request for a break/help/finish, practised during {{routine}} at the point demands are typically presented.',
        tags: { communicationMethod: ['verbal', 'speech', 'gesture', 'sign'], function: 'Escape/avoidance' },
      },
      {
        id: 'fct-tangible-aac',
        templateId: 'fct',
        template:
          'Teach a request for {{interest}} (item, activity, or its continuation) using {{communicationMethod}}, modelled immediately before the natural opportunity within {{routine}}.',
        tags: { communicationMethod: ['aac', 'device', 'pecs'], function: 'Access to tangibles' },
      },
      {
        id: 'fct-tangible-verbal',
        templateId: 'fct',
        template:
          'Teach a simple verbal, signed or gestural request for {{interest}} (item, activity, or its continuation), practised during {{routine}}.',
        tags: { communicationMethod: ['verbal', 'speech', 'gesture', 'sign'], function: 'Access to tangibles' },
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
    evidenceAuthorityTier: 1,
    function: 'Attention',
    applicableFunctions: ['Attention', 'Access to tangibles'],
    responsive: false,
    mechanism:
      'Delivers the identified reinforcer on a time-based schedule, unrelated to the target behaviour. As motivation for the reinforcer decreases through satiation, the behaviour that used to earn it loses value — without needing to withhold the reinforcer contingently.',
    citation:
      'Tucker, M., Sigafoos, J., & Bushell, H. (1998). Comprehensive review of self-injurious behavior treated with noncontingent reinforcement. Behavior Modification, 22(4), 529–547.',
    citationShort: 'Tucker et al. (1998). Behavior Modification, 22(4), 529–547.',
    evidenceSources: [
      {
        citation:
          'Tucker, M., Sigafoos, J., & Bushell, H. (1998). Comprehensive review of self-injurious behavior treated with noncontingent reinforcement. Behavior Modification, 22(4), 529–547.',
        citationShort: 'Tucker et al. (1998). Behavior Modification, 22(4), 529–547.',
        evidenceType: 'systematic-review',
      },
      {
        citation:
          'Carr, J. E., Severtson, J. M., & Lepper, T. L. (2009). Noncontingent reinforcement is an empirically supported treatment for problem behavior exhibited by individuals with developmental disabilities. Research in Developmental Disabilities, 30(1), 44–57.',
        citationShort: 'Carr, Severtson & Lepper (2009). RiDD, 30(1), 44–57.',
        evidenceType: 'narrative-review',
        doi: '10.1016/j.ridd.2008.03.002',
      },
      {
        citation:
          'Rooker, G. W., Bonner, A. C., Dillon, C. M., & Zarcone, J. R. (2018). Behavioral treatment of automatically reinforced SIB: 1982–2015. Journal of Applied Behavior Analysis, 51(4), 974–997.',
        citationShort: 'Rooker et al. (2018). JABA, 51(4), 974–997.',
        evidenceType: 'systematic-review',
        doi: '10.1002/jaba.492',
      },
    ],
    howToUse: [
      'Identify the reinforcer actually maintaining the behaviour from FBA data — do not substitute a generically preferred item for the identified maintaining reinforcer.',
      'Confirm the access schedule is genuinely feasible in this setting before committing to it (staffing, materials, timing).',
      'Set an initial schedule denser than the natural rate of the behaviour; deliver on schedule regardless of behaviour.',
      "Monitor the actual effect on the target behaviour, not just that the schedule is running; thin the schedule based on that data as responding stabilises, not on a fixed timeline. Rooker et al. (2018) found NCR was more effective when the reinforcer was identified via a competing stimulus assessment than a preference assessment alone — see 'Assessment-informed competing stimulus access' below where that applies.",
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
    function: 'Escape/avoidance',
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
    evidenceAuthorityTier: 5,
    function: 'Sensory',
    responsive: false,
    mechanism:
      'Offers regulated access to a preferred sensory activity at set points in the routine, addressing the sensory need directly rather than after escalation. General sensory support, not a treatment claim for automatically reinforced challenging behaviour — for that, see the individually assessed \'Assessment-informed competing stimulus access\' strategy below.',
    citation:
      'Watling, R., & Hauer, S. (2015). Effectiveness of Ayres Sensory Integration and sensory-based interventions for people with autism spectrum disorder. American Journal of Occupational Therapy, 69(5).',
    citationShort: 'Watling & Hauer (2015). AJOT, 69(5).',
    evidenceSources: [
      {
        citation:
          'Watling, R., & Hauer, S. (2015). Effectiveness of Ayres Sensory Integration and sensory-based interventions for people with autism spectrum disorder. American Journal of Occupational Therapy, 69(5).',
        citationShort: 'Watling & Hauer (2015). AJOT, 69(5).',
        evidenceType: 'systematic-review',
      },
    ],
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
    function: 'Access to tangibles',
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
    evidenceAuthorityTier: 1,
    function: 'Communication',
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
    evidenceAuthorityTier: 5,
    function: 'Escape/avoidance',
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
    evidenceAuthorityTier: 5,
    function: 'Attention',
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
  {
    id: 'competing-stimulus-access',
    templateId: 'competing-stimulus-access',
    name: 'Assessment-informed competing stimulus access',
    shortDescription:
      "Identifies, via individual assessment, the specific stimuli that genuinely compete with automatically reinforced behaviour — not generic sensory input.",
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 1,
    function: 'Automatic',
    responsive: false,
    mechanism:
      "Systematically tests candidate stimuli (each presented singly and noncontingently, against a no-stimulus control) to identify which ones actually reduce the automatically reinforced behaviour through reinforcer competition or substitution — rather than assuming a generic sensory activity will help. Only stimuli validated this way, not an assumed 'matched' sensory activity, are then made available. Distinct from `sensory-diet`: that strategy offers a generally preferred sensory activity on a schedule; this one is built entirely from an individual competing stimulus assessment (CSA) of this behaviour.",
    citation:
      'Haddock, J. N., & Hagopian, L. P. (2020). Competing stimulus assessments: A systematic review. Journal of Applied Behavior Analysis, 53(4), 1982–2001.',
    citationShort: 'Haddock & Hagopian (2020). JABA, 53(4), 1982–2001.',
    evidenceSources: [
      {
        citation:
          'Haddock, J. N., & Hagopian, L. P. (2020). Competing stimulus assessments: A systematic review. Journal of Applied Behavior Analysis, 53(4), 1982–2001.',
        citationShort: 'Haddock & Hagopian (2020). JABA, 53(4), 1982–2001.',
        evidenceType: 'systematic-review',
        doi: '10.1002/jaba.754',
      },
      {
        citation:
          'Rooker, G. W., Bonner, A. C., Dillon, C. M., & Zarcone, J. R. (2018). Behavioral treatment of automatically reinforced SIB: 1982–2015. Journal of Applied Behavior Analysis, 51(4), 974–997.',
        citationShort: 'Rooker et al. (2018). JABA, 51(4), 974–997.',
        evidenceType: 'systematic-review',
        doi: '10.1002/jaba.492',
      },
    ],
    howToUse: [
      'Run a competing stimulus assessment: present each candidate stimulus singly and noncontingently, alongside a no-stimulus control trial, and measure both the target behaviour and engagement/contact with the stimulus.',
      'Identify which stimulus/stimuli actually reduced the behaviour during the assessment — topography or presumed function of the behaviour does not reliably predict which stimulus will work (Haddock & Hagopian, 2020), so this has to be tested, not guessed.',
      'Validate the finding with an extended analysis before relying on it day-to-day.',
      'Make the validated stimulus available — often combined with a fixed-time access schedule (see Non-contingent reinforcement); Rooker et al. (2018) found this combination more effective than a schedule built from a preference assessment alone.',
      'Re-test periodically rather than assuming the same stimulus stays effective indefinitely.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'competing-stimulus-low',
        templateId: 'competing-stimulus-access',
        template:
          'Make the CSA-validated {{interest}} item continuously available during {{routine}}, starting with unrestricted access given their current pace.',
        tags: { comfortThreshold: 'low' },
      },
      {
        id: 'competing-stimulus-standard',
        templateId: 'competing-stimulus-access',
        template:
          'Schedule fixed-time access to the CSA-validated {{interest}} item throughout {{routine}}, re-testing periodically to confirm it still competes with the behaviour.',
        tags: { comfortThreshold: 'medium' },
      },
    ],
  },
  {
    id: 'choice-task-adaptation',
    templateId: 'choice-task-adaptation',
    name: 'Choice and task adaptation',
    shortDescription:
      'Gives the participant choice and control over how a demand is presented, reducing escape-motivated problem behaviour.',
    evidenceTier: 'Emerging',
    evidenceAuthorityTier: 3,
    function: 'Escape/avoidance',
    responsive: false,
    mechanism:
      "Offering choice over task order, materials, location, support person, or presentation format increases the participant's actual and perceived control over an otherwise fixed demand, reducing the motivation to escape via problem behaviour. Romaniuk et al. (2002) found this effect specific to escape-maintained behaviour — the same choice intervention produced no reduction in attention-maintained problem behaviour, so this strategy is scoped to escape/avoidance only, not offered as a general-purpose choice intervention.",
    citation:
      'Romaniuk, C., Miltenberger, R., Conyers, C., Jenner, N., Jurgens, M., & Ringenberg, C. (2002). The influence of activity choice on problem behaviors maintained by escape versus attention. Journal of Applied Behavior Analysis, 35(4), 349–362.',
    citationShort: 'Romaniuk et al. (2002). JABA, 35(4), 349–362.',
    evidenceSources: [
      {
        citation:
          'Romaniuk, C., Miltenberger, R., Conyers, C., Jenner, N., Jurgens, M., & Ringenberg, C. (2002). The influence of activity choice on problem behaviors maintained by escape versus attention. Journal of Applied Behavior Analysis, 35(4), 349–362.',
        citationShort: 'Romaniuk et al. (2002). JABA, 35(4), 349–362.',
        evidenceType: 'single-case',
      },
    ],
    howToUse: [
      'Identify 2+ dimensions the participant can meaningfully choose between for this task: order, materials, location, support person, or communication/presentation format.',
      'Reduce task size or difficulty and intersperse easier/mastered tasks alongside the target demand.',
      'Offer the choice before the demand is presented, and honour it immediately and consistently.',
      'Progressively rebuild task size/difficulty as responding stabilises, rather than leaving it permanently reduced.',
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'choice-task-low',
        templateId: 'choice-task-adaptation',
        template:
          'Offer a choice between two very similar, low-demand options for {{routine}} — keep both options easy given their current pace.',
        tags: { comfortThreshold: 'low' },
      },
      {
        id: 'choice-task-standard',
        templateId: 'choice-task-adaptation',
        template:
          'Offer a choice of task order, materials, or support person at the start of {{routine}}, honouring the choice immediately.',
        tags: { comfortThreshold: 'medium' },
      },
    ],
  },
  {
    id: 'demand-fading',
    templateId: 'demand-fading',
    name: 'Demand fading',
    shortDescription:
      'Removes demands and reintroduces them gradually, targeting the establishing operation behind escape-maintained behaviour.',
    evidenceTier: 'Emerging',
    evidenceAuthorityTier: 3,
    function: 'Escape/avoidance',
    responsive: false,
    mechanism:
      "Removes or substantially reduces demands, then gradually reintroduces them, targeting the establishing operation for escape-maintained behaviour directly rather than only responding to it after the fact. Ward et al. (2025)'s scoping review found demand fading procedures effective across the studies reviewed, but also substantial procedural variability and near-universal use within a treatment package alongside other components (e.g. reinforcement, extinction) — evidence for demand fading as an isolated component, rather than as part of a package, is limited.",
    citation:
      'Ward, R. S., Jones, S. H., Pullar, T., & Celona, C. (2025). A scoping literature review of demand fading. Education and Treatment of Children, 48, 93–106.',
    citationShort: 'Ward et al. (2025). Educ Treat Child, 48, 93–106.',
    evidenceSources: [
      {
        citation:
          'Ward, R. S., Jones, S. H., Pullar, T., & Celona, C. (2025). A scoping literature review of demand fading. Education and Treatment of Children, 48, 93–106.',
        citationShort: 'Ward et al. (2025). Educ Treat Child, 48, 93–106.',
        evidenceType: 'scoping-review',
        doi: '10.1007/s43494-024-00143-y',
      },
    ],
    howToUse: [
      'Confirm the escape function with a functional analysis first — every study in the reviewed literature did this before starting demand fading, and it materially affects whether fading will work.',
      'Reduce demands substantially at the outset; some protocols remove them entirely before reintroducing.',
      'Reintroduce demands gradually, in small steps, as tolerance/compliance is established at each step.',
      "Expect this to run alongside other components (reinforcement for compliance, extinction of the escape behaviour) — most of the evidence base is for demand fading as part of that combination, not as a standalone procedure.",
    ],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    personalisationRecords: [
      {
        id: 'demand-fading-low',
        templateId: 'demand-fading',
        template:
          'Remove demands during {{routine}} entirely at first, reintroducing one small step at a time — go slower than standard given their current pace.',
        tags: { comfortThreshold: 'low' },
      },
      {
        id: 'demand-fading-standard',
        templateId: 'demand-fading',
        template:
          'Substantially reduce demands during {{routine}}, reintroducing them in small increments as compliance is established at each step.',
        tags: { comfortThreshold: 'medium' },
      },
    ],
  },
];

/**
 * The FIELD gating model's approval gate, enforced: a `draft`,
 * `pending-review` or `retired` strategy, or a superseded (`current:
 * false`) version, is never returned here — direct navigation to its URL
 * hits the same "Strategy not found" state as an unknown id, rather than
 * leaking unapproved content.
 */
export function getStrategyById(id: string): StrategyTemplate | undefined {
  const strategy = STRATEGIES.find((s) => s.id === id);
  return strategy && isApprovedCurrent(strategy) ? strategy : undefined;
}

/** Every strategy the approval gate lets a practitioner see — what `StrategyBrowser` lists. */
export function listVisibleStrategies(): StrategyTemplate[] {
  return STRATEGIES.filter(isApprovedCurrent);
}
