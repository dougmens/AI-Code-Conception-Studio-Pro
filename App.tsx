import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@19.1.0';
import NavBar from './components/NavBar.tsx';
import GlassCard from './components/GlassCard.tsx';
import TerminalView from './components/TerminalView.tsx';
import { runOnboardingResearch, runPipeline, architectCopilot, synthesizeImage, generateMotionVideo, generateTTS } from './services/geminiService.ts';

const STORAGE_KEY = 'aicsp-project-history-v1';

const pricingTiers = [
  { name: 'Starter', price: '$49', perks: ['3 projects', 'Core pipeline', 'Basic copilot'] },
  { name: 'Pro', price: '$149', perks: ['Unlimited projects', 'Thinking mode', 'Creative Lab'] },
  { name: 'Enterprise', price: 'Custom', perks: ['SSO', 'Private models', 'Dedicated architect'] }
];

const faqItems = [
  ['What is Blueprint Engineering?', 'A strategic approach to define entities, architecture, and delivery artifacts before coding.'],
  ['Is this production ready?', 'Yes—this app includes robust retries, local history, and accessible responsive UI.'],
  ['Can I export to Cursor/Windsurf?', 'Yes, Stage 3 generates a master prompt and workspace file outputs for IDE copilots.']
];

function calcROI(project) {
  const tokenInput = Math.max(2000, project.problemStatement.length * 8);
  const tokenOutput = tokenInput * 1.5;
  const estimatedApiCost = Number(((tokenInput + tokenOutput) / 1_000_000 * 2.8).toFixed(2));
  const estimatedDevHoursSaved = Math.round(Math.min(140, 28 + project.problemStatement.length / 20));
  const estimatedDollarSavings = estimatedDevHoursSaved * 125 - estimatedApiCost;
  return { tokenInput, tokenOutput, estimatedApiCost, estimatedDevHoursSaved, estimatedDollarSavings };
}

export default function App() {
  const [page, setPage] = useState('Home');
  const [project, setProject] = useState({
    id: crypto.randomUUID(),
    name: 'Untitled Blueprint',
    problemStatement: '',
    industry: '',
    audience: '',
    onboarding: [
      { id: '1', question: 'What problem are you solving?', answer: '' },
      { id: '2', question: 'Who is your primary buyer and end-user?', answer: '' },
      { id: '3', question: 'What is your monetization strategy?', answer: '' }
    ],
    roi: { tokenInput: 0, tokenOutput: 0, estimatedApiCost: 0, estimatedDevHoursSaved: 0, estimatedDollarSavings: 0 },
    pipeline: null,
    creativeAssets: [],
    copilotTranscript: [],
    documentationSections: ['# Documentation\n\nRun pipeline to generate full docs.'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [onboardingInsight, setOnboardingInsight] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setHistory(JSON.parse(raw));
  }, []);

  const persistHistory = (nextProject) => {
    const merged = [nextProject, ...history.filter((h) => h.id !== nextProject.id)].slice(0, 15);
    setHistory(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  const updateProject = (patch) => {
    const next = { ...project, ...patch, updatedAt: Date.now() };
    next.roi = calcROI(next);
    setProject(next);
  };

  const runFullPipeline = async () => {
    setBusy(true);
    try {
      const compositeInput = `${project.problemStatement}\nIndustry:${project.industry}\nAudience:${project.audience}\nOnboarding:${project.onboarding.map((o) => `${o.question} ${o.answer}`).join(' | ')}`;
      const pipeline = await runPipeline(compositeInput);
      const next = { ...project, pipeline, documentationSections: [pipeline.stage3.workspaceFiles.readme] };
      setProject(next);
      persistHistory(next);
      setPage('Dashboard');
    } catch (error) {
      alert(`Pipeline failed: ${error.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const doResearch = async () => {
    setBusy(true);
    try {
      const insight = await runOnboardingResearch(`Research market viability and trends for: ${project.problemStatement}`);
      setOnboardingInsight(JSON.stringify(insight, null, 2));
    } catch (error) {
      setOnboardingInsight(`Research error: ${error.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const askCopilot = async () => {
    if (!copilotInput.trim()) return;
    setBusy(true);
    const userTurn = { role: 'user', content: copilotInput, timestamp: Date.now() };
    try {
      const reply = await architectCopilot(copilotInput, true);
      const assistantTurn = { role: 'assistant', content: reply, timestamp: Date.now() };
      updateProject({ copilotTranscript: [...project.copilotTranscript, userTurn, assistantTurn] });
      setCopilotInput('');
    } catch (error) {
      alert(`Copilot failed: ${error.message || error}`);
    } finally {
      setBusy(false);
    }
  };

  const createImage = async () => {
    setBusy(true);
    const response = await synthesizeImage(project.problemStatement || 'Futuristic SaaS dashboard concept', '2048', '16:9');
    updateProject({
      creativeAssets: [...project.creativeAssets, { type: 'image', prompt: project.problemStatement, format: '2048@16:9', url: response.url || '', createdAt: Date.now() }]
    });
    setBusy(false);
  };

  const createVideo = async () => {
    setBusy(true);
    await generateMotionVideo(`Animate this mockup concept: ${project.problemStatement || 'AI blueprint dashboard'}`, '16:9');
    updateProject({
      creativeAssets: [...project.creativeAssets, { type: 'video', prompt: project.problemStatement, format: '16:9', url: '', createdAt: Date.now() }]
    });
    setBusy(false);
  };

  const speakDocs = async () => {
    setBusy(true);
    try {
      await generateTTS(`${project.pipeline?.stage3?.masterPrompt || ''}\n${project.documentationSections.join('\n')}`);
      alert('TTS generated (inspect provider output in network logs / service wiring).');
    } finally {
      setBusy(false);
    }
  };

  const terminalLines = useMemo(() => [
    'aicsp init',
    'aicsp stage1 --model gemini-3-flash-preview',
    'aicsp stage2 --model gemini-3-flash-preview',
    'aicsp stage3 --model gemini-3-pro-preview --thinking 32768',
    'aicsp export --target cursor,windsurf'
  ], []);

  return (
    <main className="min-h-screen pb-12">
      <NavBar page={page} setPage={setPage} />

      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {page === 'Home' && (
          <>
            <section className="glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4 animate-fadeUp">
                <p className="text-cyan-300 text-sm uppercase tracking-[0.2em]">Blueprint Engineering Suite</p>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight">Design AI-native products with architectural certainty.</h1>
                <p className="text-slate-300">A premium strategic workspace for end-to-end logic extraction, architecture synthesis, and IDE-ready prompt generation.</p>
                <button onClick={() => setPage('Dashboard')} className="lit-hover px-5 py-3 rounded-xl bg-cyan-500/20 border border-cyan-300/40">Open Dashboard</button>
              </div>
              <div className="flex-1 animate-float">
                <TerminalView lines={terminalLines} />
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-4">
              {['3-stage AI pipeline', 'Onboarding with ROI intelligence', 'Creative lab: image + motion'].map((f) => (
                <GlassCard key={f} title={f}><p className="text-slate-300 text-sm">Built for strategic teams shipping high-value software faster with less risk.</p></GlassCard>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {pricingTiers.map((tier) => (
                  <GlassCard key={tier.name} title={`${tier.name} · ${tier.price}`}>
                    <ul className="space-y-1 text-sm text-slate-300">{tier.perks.map((perk) => <li key={perk}>• {perk}</li>)}</ul>
                  </GlassCard>
                ))}
              </div>
            </section>
          </>
        )}

        {page === 'Dashboard' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <GlassCard title="Project Workspace" className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-3">
                <input aria-label="project name" value={project.name} onChange={(e) => updateProject({ name: e.target.value })} className="bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2" placeholder="Project name" />
                <input aria-label="industry" value={project.industry} onChange={(e) => updateProject({ industry: e.target.value })} className="bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2" placeholder="Industry" />
                <input aria-label="audience" value={project.audience} onChange={(e) => updateProject({ audience: e.target.value })} className="bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2 md:col-span-2" placeholder="Audience" />
                <textarea aria-label="problem statement" value={project.problemStatement} onChange={(e) => updateProject({ problemStatement: e.target.value })} className="bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2 md:col-span-2 h-24" placeholder="Describe your product idea, target outcomes, and constraints." />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={runFullPipeline} className="lit-hover px-4 py-2 rounded-lg border border-cyan-300/40" disabled={busy}>Run 3-Stage Pipeline</button>
                <button onClick={doResearch} className="lit-hover px-4 py-2 rounded-lg border border-white/20" disabled={busy}>Research + ROI context</button>
                <button onClick={createImage} className="lit-hover px-4 py-2 rounded-lg border border-white/20" disabled={busy}>Generate 2K mockup</button>
                <button onClick={createVideo} className="lit-hover px-4 py-2 rounded-lg border border-white/20" disabled={busy}>Animate mockup</button>
                <button onClick={speakDocs} className="lit-hover px-4 py-2 rounded-lg border border-white/20" disabled={busy}>TTS Documentation</button>
              </div>
            </GlassCard>

            <GlassCard title="Commercial ROI">
              <p className="text-sm text-slate-300">Input tokens: {project.roi.tokenInput}</p>
              <p className="text-sm text-slate-300">Output tokens: {project.roi.tokenOutput}</p>
              <p className="text-sm text-slate-300">API cost est.: ${project.roi.estimatedApiCost}</p>
              <p className="text-sm text-slate-300">Hours saved: {project.roi.estimatedDevHoursSaved}</p>
              <p className="text-sm text-emerald-300 font-semibold">Estimated savings: ${project.roi.estimatedDollarSavings}</p>
            </GlassCard>

            <GlassCard title="Interactive Onboarding" className="lg:col-span-2">
              <div className="space-y-3">
                {project.onboarding.map((step, idx) => (
                  <label key={step.id} className="block">
                    <span className="text-sm text-slate-300">Step {idx + 1}: {step.question}</span>
                    <input
                      className="mt-1 w-full bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2"
                      value={step.answer}
                      onChange={(e) => {
                        const next = [...project.onboarding];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        updateProject({ onboarding: next });
                      }}
                    />
                  </label>
                ))}
              </div>
              {onboardingInsight && <pre className="mt-3 text-xs whitespace-pre-wrap bg-black/30 p-3 rounded-lg">{onboardingInsight}</pre>}
            </GlassCard>

            <GlassCard title="AI Architect Copilot">
              <div className="space-y-2 h-44 overflow-auto border border-white/10 rounded-lg p-2 bg-black/20">
                {project.copilotTranscript.map((turn, i) => <p key={i} className="text-xs"><strong className="text-cyan-300">{turn.role}:</strong> {turn.content}</p>)}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={copilotInput} onChange={(e) => setCopilotInput(e.target.value)} className="flex-1 bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Ask about architecture trade-offs..." />
                <button onClick={askCopilot} className="lit-hover px-3 py-2 rounded-lg border border-cyan-300/40" disabled={busy}>Ask</button>
              </div>
            </GlassCard>

            <GlassCard title="Project History">
              <ul className="space-y-2 text-sm">
                {history.map((item) => (
                  <li key={item.id} className="border border-white/10 rounded-lg p-2 hover:border-cyan-300/40 cursor-pointer" onClick={() => setProject(item)}>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-slate-400 text-xs">{new Date(item.updatedAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        )}

        {page === 'Documentation' && (
          <GlassCard title="Documentation (Markdown-ready)">
            <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-black/30 rounded-xl p-4">{project.documentationSections.join('\n\n')}</pre>
            <p className="text-xs text-slate-400 mt-2">Includes Stage 3 generated README and can be exported to your workspace.</p>
          </GlassCard>
        )}

        {page === 'FAQ' && (
          <section className="space-y-3">
            {faqItems.map(([q, a]) => (
              <GlassCard key={q} title={q}><p className="text-slate-300 text-sm">{a}</p></GlassCard>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
