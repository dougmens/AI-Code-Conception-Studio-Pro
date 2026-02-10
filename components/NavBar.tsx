import React from 'https://esm.sh/react@19.1.0';

export default function NavBar({ page, setPage }) {
  const links = ['Home', 'Dashboard', 'Documentation', 'FAQ'];

  return (
    <header className="sticky top-0 z-30 glass px-4 py-3 mb-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between" aria-label="Primary navigation">
        <div className="font-semibold tracking-wide">AI Conception Studio Pro</div>
        <ul className="flex gap-2">
          {links.map((link) => (
            <li key={link}>
              <button
                aria-label={`Navigate to ${link}`}
                onClick={() => setPage(link)}
                className={`lit-hover px-3 py-2 rounded-lg text-sm border ${page === link ? 'border-cyan-400 text-cyan-300' : 'border-white/10 text-slate-300 hover:text-white'}`}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
