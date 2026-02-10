import React from 'https://esm.sh/react@19.1.0';

export default function GlassCard({ title, children, className = '' }) {
  return (
    <section className={`glass rounded-2xl p-5 shadow-glow animate-fadeUp ${className}`}>
      {title ? <h3 className="text-lg font-semibold mb-3">{title}</h3> : null}
      {children}
    </section>
  );
}
