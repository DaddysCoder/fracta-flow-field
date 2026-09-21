import { getStrategyById } from '../lib/strategy-library/strategies';
import { MechanismCitationUnit } from '../components/MechanismCitationUnit';
import { UpgradeMoment } from '../components/UpgradeMoment';

/** Standalone "Upgrade to Pro" destination (sidebar → ACCOUNT). The same UpgradeMoment also appears inline on Personalise Draft when a Free user clicks Generate — this is the always-reachable version of that moment. */
export function UpgradeScreen() {
  const strategy = getStrategyById('ncr')!;

  return (
    <div className="px-10 pt-9 pb-16 max-w-[1000px] mx-auto">
      <h1 className="font-bold text-2xl tracking-tight mb-2">Evidence stays open. Drafting is Pro.</h1>
      <p className="text-[14.5px] text-secondary mb-9 max-w-[600px] leading-relaxed">
        The full strategy library, mechanism and citation are free for everyone. Personalised drafting is a Pro
        feature.
      </p>
      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(240px,280px)' }}>
        <UpgradeMoment strategyName={strategy.name} />
        <MechanismCitationUnit mechanism={strategy.mechanism} citation={strategy.citationShort} unlocked />
      </div>
    </div>
  );
}
