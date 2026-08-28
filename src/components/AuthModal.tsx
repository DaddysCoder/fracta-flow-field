import { useState, type FormEvent } from 'react';
import { useAuth } from '../state/auth';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { requestCode, verifyCode } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestCode(email);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyCode(email, code);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not work. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-5" onClick={onClose}>
      <div
        className="bg-white rounded-card-lg p-7 shadow-card w-full max-w-[380px]"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'email' ? (
          <form onSubmit={handleRequestCode}>
            <div className="font-bold text-lg tracking-tight mb-1.5">Sign in to Field</div>
            <p className="text-[13.5px] text-secondary leading-relaxed mb-5">
              No password. We&apos;ll email a 6-digit code to sign you in.
            </p>
            <label className="block text-[12px] font-semibold text-muted mb-1.5" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-[14px] bg-surface rounded-lg px-3.5 py-2.5 border-none focus-ring mb-4"
            />
            {error && <p className="text-[12.5px] text-red-600 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-2.5 rounded-btn bg-accent text-white text-[13.5px] font-semibold focus-ring hover:bg-accent-hover transition-colors duration-100 disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="font-bold text-lg tracking-tight mb-1.5">Check your email</div>
            <p className="text-[13.5px] text-secondary leading-relaxed mb-5">
              We sent a 6-digit code to <span className="font-semibold text-ink-soft">{email}</span>.
            </p>
            <label className="block text-[12px] font-semibold text-muted mb-1.5" htmlFor="auth-code">
              Code
            </label>
            <input
              id="auth-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-[14px] tracking-[0.3em] bg-surface rounded-lg px-3.5 py-2.5 border-none focus-ring mb-4"
            />
            {error && <p className="text-[12.5px] text-red-600 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-2.5 rounded-btn bg-accent text-white text-[13.5px] font-semibold focus-ring hover:bg-accent-hover transition-colors duration-100 disabled:opacity-60 mb-2.5"
            >
              {busy ? 'Verifying…' : 'Verify and sign in'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              className="w-full text-[12.5px] text-secondary focus-ring rounded"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
