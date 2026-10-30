import React, { useState, useEffect } from 'react';
import {
  VettedSkillEntry,
  VettedSkillReceipt,
  HubDomain,
  DOMAIN_STATISTICS,
} from '../shared/xerjSchemas.js';

interface SkillVettingTabProps {
  onRouteSkillQuery: (query: string, domain?: HubDomain) => void;
}

export const SkillVettingTab: React.FC<SkillVettingTabProps> = ({
  onRouteSkillQuery,
}) => {
  // Navigation inside skills tab
  const [subView, setSubView] = useState<'registry' | 'vetting'>('registry');

  // Registry state
  const [skills, setSkills] = useState<VettedSkillEntry[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<HubDomain | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(false);

  // Vetting form state
  const [customSkillId, setCustomSkillId] = useState('ebpf-tracepoint-profiler');
  const [customAuthor, setCustomAuthor] = useState('agent-sec-swarm-42');
  const [customDomain, setCustomDomain] = useState<HubDomain>('SYS');
  const [customDescription, setCustomDescription] = useState(
    'Real-time Linux eBPF tracepoint monitor and ring buffer memory inspector.'
  );
  const [customCapabilities, setCustomCapabilities] = useState('ebpf, tracepoints, kernel, ringbuf, xdp');
  const [customSource, setCustomSource] = useState(`// Verified XERJ eBPF Tracepoint Profiler
import { BpfRingBuf } from '@sys/ebpf-runtime';

export function inspectKernelTracepoint(event: string) {
  const buf = new BpfRingBuf(1024 * 1024);
  buf.setFilter({ tracepoint: event });
  return buf.pollAtomic(500);
}`);
  const [testHarnessPass, setTestHarnessPass] = useState(true);

  // Vetting submission state
  const [isVetting, setIsVetting] = useState(false);
  const [vettingResult, setVettingResult] = useState<VettedSkillReceipt | null>(null);
  const [vettingError, setVettingError] = useState<string | null>(null);

  // Fetch verified skills
  const fetchSkills = async () => {
    setIsLoadingRegistry(true);
    try {
      const url = new URL('/_skills/registry', window.location.origin);
      if (selectedDomain !== 'ALL') url.searchParams.set('domain', selectedDomain);
      if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch (err) {
      console.warn('Failed to fetch skills:', err);
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [selectedDomain, searchQuery]);

  // Handle vetting submission
  const handleVetSkill = async () => {
    setIsVetting(true);
    setVettingError(null);
    setVettingResult(null);

    try {
      const res = await fetch('/_skills/vetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: customSkillId.trim(),
          author: customAuthor.trim(),
          domain: customDomain,
          description: customDescription.trim(),
          sourceCodeOrManifest: customSource,
          declaredCapabilities: customCapabilities.split(',').map(c => c.trim()).filter(Boolean),
          testHarnessPass,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Skill vetting failed');
      }

      setVettingResult(data.receipt);
      // Refresh registry if approved
      if (data.receipt.approvedForSwarm) {
        fetchSkills();
      }
    } catch (err: any) {
      setVettingError(err.message || 'Vetting failed');
    } finally {
      setIsVetting(false);
    }
  };

  const domainsList: (HubDomain | 'ALL')[] = [
    'ALL',
    'SEC',
    'SYS',
    'CLOUD',
    'CRYPTO',
    'LANG',
    'DATA',
    'API',
    'AI',
    'WEB',
    'GAME',
    'GOV',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                SKILL VETTING & REGISTRY FABRIC
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Static AST Analysis &bull; 7-Hash Bloom Sketch &bull; Ed25519 Signing
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              XERJ Universal Agent Skill Registry (/_skills/registry)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
              When autonomous swarms seek capabilities—like memory fuzzers, Solana Anchor CPI verifiers, or AST compiler guards—they
              require strict safety guarantees. Every submitted skill undergoes static prompt-injection inspection, sandbox verification,
              and Ed25519 signing.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSubView('registry')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                subView === 'registry'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'bg-[#0D1117] text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              Verified Registry ({skills.length})
            </button>
            <button
              onClick={() => setSubView('vetting')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                subView === 'vetting'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'bg-[#0D1117] text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              + Vet New Skill
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Universal Verified Skill Registry */}
      {subView === 'registry' && (
        <div className="space-y-4">
          {/* Controls: Search & Domain Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {domainsList.map(domain => {
                const isSelected = selectedDomain === domain;
                const domainColor = domain === 'ALL' ? '#10b981' : DOMAIN_STATISTICS[domain]?.colorHex || '#94a3b8';
                return (
                  <button
                    key={domain}
                    onClick={() => setSelectedDomain(domain)}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-slate-100 border-slate-600 font-semibold'
                        : 'bg-[#0D1117] text-slate-400 border-slate-800/80 hover:text-slate-200'
                    }`}
                    style={{
                      borderLeftColor: isSelected ? domainColor : undefined,
                      borderLeftWidth: isSelected ? '3px' : undefined,
                    }}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search skills, capabilities, authors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#0D1117] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500 w-64 font-mono"
              />
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map(skill => {
              const domainStat = DOMAIN_STATISTICS[skill.domain];
              return (
                <div
                  key={skill.skillId}
                  className="rounded-lg border border-slate-800 bg-[#0D1117] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                        &check; Ed25519 Verified
                      </span>
                      <span
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                        style={{
                          color: domainStat?.colorHex || '#10b981',
                          borderColor: `${domainStat?.colorHex || '#10b981'}40`,
                          backgroundColor: `${domainStat?.colorHex || '#10b981'}15`,
                        }}
                      >
                        {skill.domain}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors font-mono">
                      {skill.skillId}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {skill.declaredCapabilities.slice(0, 4).map(cap => (
                        <span
                          key={cap}
                          className="text-[10px] font-mono text-slate-400 bg-[#06080D] border border-slate-800 px-1.5 py-0.5 rounded"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500">Safety Score: </span>
                        <span className="text-emerald-400 font-bold">{(skill.safetyScore * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Bayesian: </span>
                        <span className="text-slate-200 font-bold">{skill.bayesianScore.toFixed(2)}/5.0</span>
                      </div>
                      <div className="col-span-2 text-slate-500 truncate text-[10px]">
                        Author: <span className="text-slate-300">{skill.author}</span> &bull; {skill.installCount.toLocaleString()} installs
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]" title={skill.fingerprintSha256}>
                      SHA: {skill.fingerprintSha256.substring(0, 12)}...
                    </span>
                    <button
                      onClick={() =>
                        onRouteSkillQuery(
                          `Find and execute skill "${skill.skillId}" for ${skill.declaredCapabilities.join(' ')}`,
                          skill.domain
                        )
                      }
                      className="px-2.5 py-1 text-xs font-mono font-medium text-slate-200 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded border border-slate-700 hover:border-emerald-400 transition-colors whitespace-nowrap"
                    >
                      Route Skill &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Automated Skill Vetting & Security Scanner */}
      {subView === 'vetting' && (
        <div className="rounded-lg border border-slate-800 bg-[#0D1117] p-5 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200">
                Automated Static Security & AST Analysis Harness (/_skills/vetting)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Submits third-party tools through static AST inspection, prompt-injection traps, and cryptographic signing.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
              7-HASH KIRSCH-MITZENMACHER ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Skill Identifier (slug)</label>
              <input
                type="text"
                value={customSkillId}
                onChange={e => setCustomSkillId(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="e.g. solana-cpi-verifier"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Author / Agent ID</label>
              <input
                type="text"
                value={customAuthor}
                onChange={e => setCustomAuthor(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="e.g. agent-sec-prime"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Hub Domain</label>
              <select
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value as HubDomain)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
              >
                {domainsList.filter(d => d !== 'ALL').map(d => (
                  <option key={d} value={d}>
                    {d} &bull; {DOMAIN_STATISTICS[d]?.gb} GB
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">Skill Description</label>
              <input
                type="text"
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="What this skill provides to autonomous agents..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Declared Capabilities (comma separated)</label>
              <input
                type="text"
                value={customCapabilities}
                onChange={e => setCustomCapabilities(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="rust, ebpf, fuzzing, sec"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Source Code / Manifest Body (Inspected for malicious AST patterns & prompt-injection primitives)
              </label>
              <textarea
                rows={6}
                value={customSource}
                onChange={e => setCustomSource(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono p-3 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
              <input
                type="checkbox"
                checked={testHarnessPass}
                onChange={e => setTestHarnessPass(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span>Functional Sandbox Test Harness Passed (Required for Swarm Approval)</span>
            </label>

            <button
              onClick={handleVetSkill}
              disabled={isVetting || !customSkillId.trim() || !customSource.trim()}
              className="px-5 py-2 text-xs font-semibold font-mono text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:pointer-events-none rounded transition-colors whitespace-nowrap shadow-sm"
            >
              {isVetting ? 'Running AST Security Scan...' : 'Vet & Cryptographically Sign Skill'}
            </button>
          </div>

          {/* Vetting Error */}
          {vettingError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-xs font-mono text-rose-300">
              &cross; Vetting Error: {vettingError}
            </div>
          )}

          {/* Vetting Result Card */}
          {vettingResult && (
            <div
              className={`p-4 rounded-lg border space-y-3 animate-fadeIn ${
                vettingResult.approvedForSwarm
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold font-mono ${
                    vettingResult.approvedForSwarm ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {vettingResult.approvedForSwarm
                    ? '✓ Skill Approved & Ingested into Universal Registry'
                    : '✗ Skill Rejected: Safety Score Below 75% or Test Harness Failed'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Safety Score: <strong className="text-slate-200">{(vettingResult.safetyScore * 100).toFixed(0)}%</strong>
                </span>
              </div>

              {vettingResult.flaggedPatterns.length > 0 && (
                <div className="p-2.5 bg-[#06080D] border border-rose-900/50 rounded text-xs font-mono space-y-1">
                  <div className="text-rose-400 font-semibold">Flagged AST / Security Patterns:</div>
                  <ul className="list-disc list-inside text-rose-300/80 space-y-0.5 text-[11px]">
                    {vettingResult.flaggedPatterns.map((pat, idx) => (
                      <li key={idx}>{pat}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">SHA-256 Source Fingerprint:</div>
                  <div className="text-slate-200 break-all text-[11px]">{vettingResult.fingerprintSha256}</div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">Ed25519 Detached Signature:</div>
                  <div className="text-emerald-400 break-all text-[11px]">
                    {vettingResult.ed25519SignatureHex.substring(0, 48)}...
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">7-Hash Kirsch-Mitzenmacher Bloom Filter:</div>
                  <div className="text-slate-200 text-[11px]">
                    {vettingResult.termSketchNumBits} bits &bull; 7 hash strides &bull; 0% false negative guarantee
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">Signer Public Key (Ed25519):</div>
                  <div className="text-slate-200 break-all text-[11px]">{vettingResult.signerPublicKeyHex}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
