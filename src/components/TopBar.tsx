import { matchPath, useLocation } from 'react-router-dom';
import { useSearch } from '../state/search';

const TITLES: { pattern: string; title: string }[] = [
  { pattern: '/', title: 'Strategy browser' },
  { pattern: '/strategy/:id', title: 'Strategy detail' },
  { pattern: '/strategy/:id/personalise', title: 'Personalise draft' },
  { pattern: '/strategy/:id/output', title: 'Output view' },
  { pattern: '/profile', title: 'Participant profile' },
  { pattern: '/upgrade', title: 'Upgrade to Pro' },
];

function titleFor(pathname: string): string {
  for (const { pattern, title } of TITLES) {
    if (matchPath({ path: pattern, end: true }, pathname)) return title;
  }
  return 'Field';
}

export function TopBar() {
  const { pathname } = useLocation();
  const { query, setQuery } = useSearch();
  const onBrowser = pathname === '/';

  return (
    <div className="h-14 flex-shrink-0 border-b border-border-soft bg-white flex items-center justify-between px-7 gap-4">
      <div className="text-[13px] font-bold text-ink">{titleFor(pathname)}</div>
      <div className="flex items-center gap-2 bg-base rounded-lg px-3 py-2 w-[230px] flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#A3A19C" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="#A3A19C" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search strategies..."
          aria-label="Search strategies"
          disabled={!onBrowser}
          className="bg-transparent text-xs text-ink-soft placeholder:text-tertiary outline-none w-full disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
