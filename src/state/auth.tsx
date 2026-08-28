import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  ApiError,
  fetchEntitlement,
  getAuthToken,
  openBillingPortal,
  requestLoginCode,
  setAuthToken,
  startCheckout,
  verifyLoginCode,
  type EntitlementResponse,
} from '../lib/api';

export type PlanTier = 'free' | 'pro';
type AuthStatus = 'signed-out' | 'checking' | 'signed-in';

interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  plan: PlanTier;
  entitlement: EntitlementResponse | null;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => void;
  checkout: (interval: 'month' | 'year') => Promise<void>;
  manageBilling: () => Promise<void>;
  /** Dev-only: preview the Pro plan locally without a running Worker/Stripe. Undefined in production builds. */
  devSetPlan?: (plan: PlanTier | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (getAuthToken() ? 'checking' : 'signed-out'));
  const [entitlement, setEntitlement] = useState<EntitlementResponse | null>(null);
  const [devOverridePlan, setDevOverridePlan] = useState<PlanTier | null>(null);

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setStatus('signed-out');
      setEntitlement(null);
      return;
    }
    try {
      const result = await fetchEntitlement();
      setEntitlement(result);
      setStatus('signed-in');
    } catch (err) {
      // Expired/invalid token — drop it rather than get stuck "checking" forever.
      if (err instanceof ApiError) setAuthToken(null);
      setStatus('signed-out');
      setEntitlement(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requestCode = useCallback(async (email: string) => {
    await requestLoginCode(email);
  }, []);

  const verifyCode = useCallback(
    async (email: string, code: string) => {
      const result = await verifyLoginCode(email, code);
      setAuthToken(result.token);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(() => {
    setAuthToken(null);
    setStatus('signed-out');
    setEntitlement(null);
  }, []);

  const checkout = useCallback(async (interval: 'month' | 'year') => {
    const { url } = await startCheckout(interval);
    window.location.href = url;
  }, []);

  const manageBilling = useCallback(async () => {
    const { url } = await openBillingPortal();
    window.location.href = url;
  }, []);

  const value: AuthContextValue = {
    status,
    email: entitlement?.email ?? null,
    plan: devOverridePlan ?? entitlement?.plan ?? 'free',
    entitlement,
    requestCode,
    verifyCode,
    signOut,
    checkout,
    manageBilling,
    devSetPlan: import.meta.env.DEV ? setDevOverridePlan : undefined,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
