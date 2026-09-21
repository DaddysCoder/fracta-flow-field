import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StrategyBrowser } from './screens/StrategyBrowser';
import { StrategyDetail } from './screens/StrategyDetail';
import { PersonaliseFlow } from './screens/PersonaliseFlow';
import { OutputView } from './screens/OutputView';
import { ProfileScreen } from './screens/ProfileScreen';
import { UpgradeScreen } from './screens/UpgradeScreen';
import { AuthProvider } from './state/auth';
import { SearchProvider } from './state/search';

export default function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <div className="min-h-screen flex bg-base">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<StrategyBrowser />} />
                <Route path="/strategy/:id" element={<StrategyDetail />} />
                <Route path="/strategy/:id/personalise" element={<PersonaliseFlow />} />
                <Route path="/strategy/:id/output" element={<OutputView />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/upgrade" element={<UpgradeScreen />} />
              </Routes>
              <div className="px-10 py-7 text-center text-xs text-tertiary border-t border-border-soft">
                Field by WhatBit &middot; Australia
              </div>
            </div>
          </div>
        </div>
      </SearchProvider>
    </AuthProvider>
  );
}
