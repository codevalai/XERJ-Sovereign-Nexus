import React, { useState, useEffect } from 'react';

export const AgenticDiscoveryTab: React.FC = () => {
  const [selectedManifest, setSelectedManifest] = useState<'ard' | 'apop' | 'a2a' | 'agents_md' | 'playbook'>('ard');
  const [manifestContent, setManifestContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Simulation state
  const [simulatingCrawler, setSimulatingCrawler] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

  // Fetch selected manifest
  const fetchManifest = async (type: 'ard' | 'apop' | 'a2a' | 'agents_md' | 'playbook') => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (type === 'ard') endpoint = '/.well-known/ai-catalog.json';
      else if (type === 'apop') endpoint = '/.well-known/agent-policy.json';
      else if (type === 'a2a') endpoint = '/.well-known/agent.json';
      else if (type === 'agents_md') endpoint = '/AGENTS.md';
      else if (type === 'playbook') endpoint = '/api/agentic/distribution-playbook';

      const res = await fetch(endpoint);
      if (res.ok) {
        if (type === 'agents_md') {
          const text = await res.text();
          setManifestContent(text);
        } else {
          const json = await res.json();
          setManifestContent(json);
        }
      }
    } catch (err) {
      console.warn('Failed to load manifest:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest(selectedManifest);
  }, [selectedManifest]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Simulate an autonomous crawler discovery sweep
  const runCrawlerSimulation = () => {
    setSimulatingCrawler(true);
    setSimulatedLogs([
      'Initiating autonomous crawler handshake (User-Agent: OpenClaw-Swarm-Runner/2026)...',
    ]);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        'GET /.well-known/ai-catalog.json -> HTTP 200 (Parsed 4 ARD capabilities, 17 MCP tools)',
      ]);
    }, 400);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        'GET /.well-known/agent-policy.json -> HTTP 200 (Verified identity tiers accepted, rate limit 600 req/min)',
      ]);
    }, 800);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        'GET /.well-known/agent.json -> HTTP 200 (Agent Card: xerj-sovereign-nexus-node, Bayesian 4.96/5.0)',
      ]);
    }, 1200);

    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        'Zero-Knowledge check: Groth16 circuit verifier online. Swarm routing lock acquired.',
        'SUCCESS: Remote agent successfully bound to XERJ Sovereign Nexus control plane.',
      ]);
      setSimulatingCrawler(false);
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                2026 AGENTIC WEB STANDARDS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ARD &bull; APoP &bull; A2A v1.0 &bull; Automated Swarm Ingestion
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              Agentic Resource Discovery & Global Swarm Magnet
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
              In 2026, autonomous agents don't browse via search engine web UIs; they crawl machine-readable phonebooks
              (ARD), respect consent boundaries (APoP), and connect peer-to-peer (A2A). By hosting these native protocols,
              XERJ becomes an inescapable gravitational pull for all agentic traffic.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={runCrawlerSimulation}
              disabled={simulatingCrawler}
              className="px-3.5 py-1.5 text-xs font-mono font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {simulatingCrawler ? 'Simulating Sweep...' : 'Simulate Agent Sweep &rarr;'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Terminal Output */}
      {simulatedLogs.length > 0 && (
        <div className="p-4 bg-[#06080D] border border-cyan-500/30 rounded-lg space-y-2 animate-fadeIn font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-bold">Autonomous Crawler Wiretrace</span>
            <span className="text-slate-500 text-[11px]">HTTP Protocol Inspector</span>
          </div>
          <div className="space-y-1 text-slate-300 text-[11px] max-h-48 overflow-y-auto">
            {simulatedLogs.map((log, idx) => (
              <div key={idx} className={log.startsWith('SUCCESS') ? 'text-emerald-400 font-semibold' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manifest Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#0D1117] rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setSelectedManifest('ard')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            selectedManifest === 'ard'
              ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ARD Manifest (ai-catalog.json)
        </button>
        <button
          onClick={() => setSelectedManifest('apop')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            selectedManifest === 'apop'
              ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          APoP Consent (agent-policy.json)
        </button>
        <button
          onClick={() => setSelectedManifest('a2a')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            selectedManifest === 'a2a'
              ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          A2A Agent Card (agent.json)
        </button>
        <button
          onClick={() => setSelectedManifest('agents_md')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            selectedManifest === 'agents_md'
              ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AGENTS.md Standard
        </button>
        <button
          onClick={() => setSelectedManifest('playbook')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            selectedManifest === 'playbook'
              ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          4-Phase Distribution Playbook
        </button>
      </div>

      {/* Manifest Content Display */}
      <div className="rounded-lg border border-slate-800 bg-[#0D1117] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-200">
              {selectedManifest === 'ard' && 'Agentic Resource Discovery (Linux Foundation ARD Standard)'}
              {selectedManifest === 'apop' && 'Agent Policy Protocol (APoP — Robots.txt for Autonomous Swarms)'}
              {selectedManifest === 'a2a' && 'A2A Protocol v1.0 Agent Card Manifest'}
              {selectedManifest === 'agents_md' && 'AGENTS.md Specification for Coding Swarms (Claude Code, Cursor, OpenClaw)'}
              {selectedManifest === 'playbook' && 'Agentic Web Strategic Growth & Distribution Matrix'}
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {selectedManifest === 'ard' && 'Hosted at: /.well-known/ai-catalog.json'}
              {selectedManifest === 'apop' && 'Hosted at: /.well-known/agent-policy.json'}
              {selectedManifest === 'a2a' && 'Hosted at: /.well-known/agent.json'}
              {selectedManifest === 'agents_md' && 'Hosted at: /AGENTS.md'}
              {selectedManifest === 'playbook' && 'Hosted at: /api/agentic/distribution-playbook'}
            </span>
          </div>

          <button
            onClick={() => {
              const textToCopy =
                typeof manifestContent === 'string'
                  ? manifestContent
                  : JSON.stringify(manifestContent, null, 2);
              copyToClipboard(textToCopy, selectedManifest);
            }}
            className="px-3 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {copiedText === selectedManifest ? 'Copied!' : 'Copy Raw Output'}
          </button>
        </div>

        {/* Content Viewer */}
        {selectedManifest === 'playbook' && manifestContent?.phases ? (
          <div className="space-y-6">
            {manifestContent.phases.map((phase: any) => (
              <div key={phase.phase} className="p-4 bg-[#06080D] border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                      PHASE {phase.phase}
                    </span>
                    <h3 className="text-xs font-bold font-mono text-slate-200">{phase.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {phase.tactics.map((tactic: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#0D1117] border border-slate-800/60 rounded space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{tactic.title}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          {tactic.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{tactic.description}</p>
                      {tactic.command && (
                        <div className="p-1.5 bg-[#06080D] rounded border border-slate-800/80 text-[10px] font-mono text-cyan-300 truncate">
                          $ {tactic.command}
                        </div>
                      )}
                      {tactic.badgeMarkdown && (
                        <div className="p-1.5 bg-[#06080D] rounded border border-slate-800/80 text-[10px] font-mono text-emerald-300 truncate">
                          {tactic.badgeMarkdown}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="p-4 bg-[#06080D] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px]">
            {isLoading
              ? 'Loading manifest...'
              : typeof manifestContent === 'string'
              ? manifestContent
              : JSON.stringify(manifestContent, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
