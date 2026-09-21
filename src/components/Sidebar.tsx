import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { AuthModal } from './AuthModal';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'LIBRARY', items: [{ to: '/', label: 'Strategy browser', end: true }] },
  { title: 'PARTICIPANT', items: [{ to: '/profile', label: 'Profile' }] },
  { title: 'ACCOUNT', items: [{ to: '/upgrade', label: 'Upgrade to Pro' }] },
];

// Strategy detail, personalise, and output only exist for a specific strategy
// id, so — unlike the design prototype's flat nav-item list — they aren't
// top-level sidebar destinations here; reached via strategy cards and the
// in-page links between them instead.

function NavDot({ active }: { active: boolean }) {
  return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-accent' : 'bg-[#D8D5D0]'}`} />;
}

function initialsFor(email: string | null): string {
  if (!email) return '?';
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function AccountChip() {
  const { status, email, plan, signOut, manageBilling, devSetPlan } = useAuth();
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (status === 'signed-in' ? setOpen((v) => !v) : setAuthModalOpen(true))}
        className="w-full flex items-center gap-2.5 px-2.5 py-3 rounded-lg focus-ring hover:bg-surface transition-colors duration-150"
      >
        <span className="w-7 h-7 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {initialsFor(email)}
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-xs font-bold text-ink truncate">
            {status === 'signed-in' ? email : 'Sign in'}
          </span>
          <span className="block text-[10px] text-tertiary">{plan === 'pro' ? 'Pro plan' : 'Free plan'}</span>
        </span>
      </button>

      {open && status === 'signed-in' && (
        <div className="absolute bottom-full left-0 mb-1.5 w-full bg-white border border-border rounded-lg shadow-card p-1.5 text-xs">
          {devSetPlan && (
            <button
              type="button"
              onClick={() => devSetPlan(plan === 'pro' ? null : 'pro')}
              className="w-full text-left px-2.5 py-2 rounded focus-ring hover:bg-surface text-muted"
            >
              Dev: force {plan === 'pro' ? 'Free' : 'Pro'}
            </button>
          )}
          {plan === 'pro' && (
            <button
              type="button"
              onClick={() => void manageBilling()}
              className="w-full text-left px-2.5 py-2 rounded focus-ring hover:bg-surface text-ink-soft"
            >
              Manage billing
            </button>
          )}
          <button
            type="button"
            onClick={signOut}
            className="w-full text-left px-2.5 py-2 rounded focus-ring hover:bg-surface text-ink-soft"
          >
            Sign out
          </button>
        </div>
      )}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="w-[236px] flex-shrink-0 bg-white border-r border-border-soft flex flex-col py-[22px] h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 pb-5 border-b border-border-soft mb-[18px]">
        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
        <div className="font-bold text-[15px] tracking-[-0.01em] text-ink">
          Field
          <span className="text-tertiary font-medium text-[0.72em] ml-[5px]">by WhatBit</span>
        </div>
      </div>

      <div className="px-3 flex-1 overflow-y-auto">
        {GROUPS.map((group) => (
          <div key={group.title} className="mb-1">
            <div className="font-mono text-[10px] tracking-[0.08em] text-tertiary font-medium px-2.5 pt-4 pb-2">
              {group.title}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] mb-0.5 focus-ring transition-colors duration-150 ${
                    isActive ? 'bg-surface text-ink font-bold' : 'text-muted font-semibold hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <NavDot active={isActive} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="px-3 pt-3 border-t border-border-soft">
        <AccountChip />
      </div>
    </div>
  );
}
