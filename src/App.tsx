import { Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { StrategyBrowser } from './screens/StrategyBrowser';
import { StrategyDetail } from './screens/StrategyDetail';
import { PersonaliseFlow } from './screens/PersonaliseFlow';
import { OutputView } from './screens/OutputView';
import { ProfileScreen } from './screens/ProfileScreen';
import { PlanProvider, usePlan } from './state/plan';

function PlanDevToggle() {
  const { plan, setPlan } = usePlan();
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-border rounded-lg px-3 py-2 text-xs text-muted shadow-card flex items-center gap-2">
      <span>Plan:</span>
      <button
        type="button"
        onClick={() => setPlan(plan === 'free' ? 'pro' : 'free')}
        className="font-semibold text-ink focus-ring rounded"
      >
        {plan === 'free' ? 'Free' : 'Pro'} (toggle)
      </button>
    </div>
  );
}

export default function App() {
  return (
    <PlanProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<StrategyBrowser />} />
        <Route path="/strategy/:id" element={<StrategyDetail />} />
        <Route path="/strategy/:id/personalise" element={<PersonaliseFlow />} />
        <Route path="/strategy/:id/output" element={<OutputView />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Routes>
      <div className="px-5 sm:px-14 py-7 text-center text-xs text-tertiary border-t border-border-soft">
        Field by WhatBit &middot; Australia
      </div>
      <PlanDevToggle />
    </PlanProvider>
  );
}
