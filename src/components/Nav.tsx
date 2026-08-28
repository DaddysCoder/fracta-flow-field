import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Browser', end: true },
  { to: '/profile', label: 'Profile' },
];

export function Nav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 h-14 bg-base/90 backdrop-blur border-b border-border-soft overflow-x-auto">
      <a href="/" className="flex items-center gap-2 font-bold text-base focus-ring rounded">
        <span className="w-[7px] h-[7px] rounded-full bg-accent flex-none" />
        <span className="text-ink">Field</span>
        <span className="text-tertiary font-medium text-xs">by WhatBit</span>
      </a>
      <div className="flex items-center gap-5 flex-none">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `text-[12.5px] font-semibold focus-ring rounded ${
                isActive ? 'text-ink' : 'text-muted hover:text-ink'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
