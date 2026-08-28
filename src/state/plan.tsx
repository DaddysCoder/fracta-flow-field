import { createContext, useContext, useState, type ReactNode } from 'react';

export type PlanTier = 'free' | 'pro';

const STORAGE_KEY = 'field.plan.v1';

interface PlanContextValue {
  plan: PlanTier;
  setPlan: (plan: PlanTier) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<PlanTier>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'pro' ? 'pro' : 'free';
  });

  function setPlan(next: PlanTier) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setPlanState(next);
  }

  return <PlanContext.Provider value={{ plan, setPlan }}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
