import { useEffect, useState } from 'react';
import { ApiError, disconnectSuite, fetchSuiteConnectStatus, startSuiteConnect, type SuiteConnection, type SuiteProvider } from '../lib/api';
import { useAuth } from '../state/auth';

const LABELS: Record<SuiteProvider, string> = { frame: 'Frame', vector: 'Vector' };

/**
 * "Connect Frame" / "Connect Vector" — cross-product OAuth, scaffolded but
 * not live: see `worker/lib/suite-connect.ts`. Until each product's real
 * OAuth app is configured, clicking either button surfaces the 501 the
 * Worker returns rather than pretending to connect.
 */
export function SuiteConnectRow() {
  const { status } = useAuth();
  const [connections, setConnections] = useState<Record<SuiteProvider, SuiteConnection | null>>({
    frame: null,
    vector: null,
  });
  const [busy, setBusy] = useState<SuiteProvider | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'signed-in') return;
    fetchSuiteConnectStatus()
      .then((res) => setConnections({ frame: res.frame, vector: res.vector }))
      .catch(() => {
        /* Non-critical — buttons just show as not-yet-connected. */
      });
  }, [status]);

  async function handleClick(provider: SuiteProvider) {
    setNotice(null);
    const existing = connections[provider];
    if (existing) {
      setBusy(provider);
      try {
        await disconnectSuite(provider);
        setConnections((prev) => ({ ...prev, [provider]: null }));
      } catch (err) {
        setNotice(err instanceof ApiError ? err.message : `Could not disconnect ${LABELS[provider]}.`);
      } finally {
        setBusy(null);
      }
      return;
    }

    if (status !== 'signed-in') {
      setNotice('Sign in first to connect a Pro suite product.');
      return;
    }
    setBusy(provider);
    try {
      const { url } = await startSuiteConnect(provider);
      window.location.href = url;
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : `Could not start the ${LABELS[provider]} connection.`);
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2.5 items-center flex-wrap pt-4 border-t border-border-soft">
      <span className="font-mono text-[10.5px] font-medium tracking-wide text-tertiary mr-0.5">PRO SUITE</span>
      {(['frame', 'vector'] as const).map((provider) => {
        const connected = Boolean(connections[provider]);
        return (
          <button
            key={provider}
            type="button"
            onClick={() => void handleClick(provider)}
            disabled={busy === provider}
            className="px-3.5 py-2 rounded-lg bg-white border border-border text-ink text-[12.5px] font-semibold focus-ring hover:border-accent transition-colors duration-100 disabled:opacity-60"
          >
            {busy === provider ? 'Working…' : connected ? `Connected to ${LABELS[provider]}` : `Connect ${LABELS[provider]}`}
          </button>
        );
      })}
      {notice && <p className="text-[12px] text-tertiary w-full">{notice}</p>}
    </div>
  );
}
