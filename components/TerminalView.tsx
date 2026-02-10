import React from 'https://esm.sh/react@19.1.0';

export default function TerminalView({ lines }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs h-52 overflow-auto" aria-label="CLI preview">
      {lines.map((line, i) => (
        <p key={`${line}-${i}`} className="text-emerald-300">
          <span className="text-cyan-300">$</span> {line}
        </p>
      ))}
    </div>
  );
}
