import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { AuthModal } from './components/AuthModal';
import { StrategyBrowser } from './screens/StrategyBrowser';
import { StrategyDetail } from './screens/StrategyDetail';
import { PersonaliseFlow } from './screens/PersonaliseFlow';
import { OutputView } from './screens/OutputView';
import { ProfileScreen } from './screens/ProfileScreen';
import { AuthProvider, useAuth } from './state/auth';

function AccountWidget() {
  const { status, email, plan, signOut, manageBilling, devSetPlan } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {devSetPlan && (
        <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs text-muted shadow-card flex items-center gap-2">
          <span>Dev preview:</span>
          <button
            type="button"
            onClick={() => devSetPlan(plan === 'pro' ? null : 'pro')}
            className="font-semibold text-ink focus-ring rounded"
          >
            Force {plan === 'pro' ? 'Free' : 'Pro'}
          </button>
        </div>
      )}
      <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs text-muted shadow-card flex items-center gap-2">
        {status === 'signed-in' ? (
          <>
            <span className="text-ink-soft font-semibold">{email}</span>
            <span>&middot;</span>
            <span>{plan === 'pro' ? 'Pro' : 'Free'}</span>
            {plan === 'pro' && (
              <>
                <span>&middot;</span>
                <button type="button" onClick={() => void manageBilling()} className="font-semibold text-ink focus-ring rounded">
                  Manage billing
                </button>
              </>
            )}
            <span>&middot;</span>
            <button type="button" onClick={signOut} className="font-semibold text-ink focus-ring rounded">
              Sign out
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setModalOpen(true)} className="font-semibold text-ink focus-ring rounded">
            Sign in
          </button>
        )}
      </div>
      {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
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
      <AccountWidget />
    </AuthProvider>
  );
}
