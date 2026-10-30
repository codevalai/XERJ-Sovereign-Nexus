import React, { useState, useEffect } from 'react';
import {
  AGENT_USE_CASES_20,
  EXPANSION_CATALOG_SOURCES,
  AgentUseCase,
  ExpansionSourceConfig,
  HubDomain,
  DOMAIN_STATISTICS,
} from '../shared/xerjSchemas.js';

interface ExpansionHubTabProps {
  onRouteQuery: (query: string, domain?: HubDomain) => void;
  onPackCompiled?: () => void;
}

export const ExpansionHubTab: React.FC<ExpansionHubTabProps> = ({
  onRouteQuery,
  onPackCompiled,
}) => {
  // Domain & Search filter state
  const [selectedDomain, setSelectedDomain] = useState<HubDomain | 'ALL'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Compiler state
  const [selectedSource, setSelectedSource] = useState<ExpansionSourceConfig>(
    EXPANSION_CATALOG_SOURCES[0]
  );
  const [customSlug, setCustomSlug] = useState(EXPANSION_CATALOG_SOURCES[0].slug);
  const [customDomain, setCustomDomain] = useState<HubDomain>(EXPANSION_CATALOG_SOURCES[0].domain);
  const [customRepoUrl, setCustomRepoUrl] = useState(EXPANSION_CATALOG_SOURCES[0].gitRepoUrl);
  const [customCommitSha, setCustomCommitSha] = useState(EXPANSION_CATALOG_SOURCES[0].commitSha);
  const [customLicence, setCustomLicence] = useState(EXPANSION_CATALOG_SOURCES[0].spdxLicence);
  const [autoInject, setAutoInject] = useState(true);

  // Compile output & execution state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [compiledResult, setCompiledResult] = useState<any>(null);

  // Sync selected source to form inputs
  const handleSelectPreset = (source: ExpansionSourceConfig) => {
    setSelectedSource(source);
    setCustomSlug(source.slug);
    setCustomDomain(source.domain);
    setCustomRepoUrl(source.gitRepoUrl);
    setCustomCommitSha(source.commitSha);
    setCustomLicence(source.spdxLicence);
    setCompileError(null);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileError(null);
    setCompiledResult(null);

    try {
      const res = await fetch('/api/expansion/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: customSlug.trim(),
          domain: customDomain,
          gitRepoUrl: customRepoUrl.trim(),
          commitSha: customCommitSha.trim(),
          spdxLicence: customLicence.trim(),
          autoInject,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compile pack');
      }

      setCompiledResult(data);
      if (onPackCompiled) {
        onPackCompiled();
      }
    } catch (err: any) {
      setCompileError(err.message || 'Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };

  // Filter use cases
  const filteredUseCases = AGENT_USE_CASES_20.filter(item => {
    const matchesDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
    const matchesSearch =
      searchFilter === '' ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.targetFocus.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.sampleQuery.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.upstreamRepo.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesDomain && matchesSearch;
  });

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
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner with Operational Context */}
      <div className="relative rounded-lg border border-slate-800 bg-[#0A0D14] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                OPERATIONAL FRONTIER V2
              </span>
              <span className="text-xs text-slate-400 font-mono">
                20 Essential Agent Needs &bull; Cryptographic Expansion Hub
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              XERJ Expansion Hub & High-Entropy Memory Matrix
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
              When autonomous coding, security, and orchestration swarms operate in live production environments,
              they require zero-hallucination systems contracts, exact API signatures, and verified exploit PoCs.
              Compile pre-indexed, cryptographically signed memory packs with strict 40-character SHA immutability.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">Essential Catalogs</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                {EXPANSION_CATALOG_SOURCES.length} Upstream Repos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: The 20 Most Important Use Cases */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-200">
              The 20 Most Important Use Cases Autonomous Agents Look For
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-entropy knowledge targets where agents fail when relying on stale pre-training weights.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search use cases, repos, queries..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="bg-[#0D1117] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500 w-56 font-mono"
            />
          </div>
        </div>

        {/* Domain Filters */}
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
                    ? 'bg-slate-800 text-slate-100 border-slate-600 font-semibold shadow-sm'
                    : 'bg-[#0D1117] text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
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

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUseCases.map(item => {
            const domainStat = DOMAIN_STATISTICS[item.domain];
            return (
              <div
                key={item.id}
                className="rounded-lg border border-slate-800/90 bg-[#0D1117] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      CASE #{String(item.id).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                      style={{
                        color: domainStat?.colorHex || '#10b981',
                        borderColor: `${domainStat?.colorHex || '#10b981'}40`,
                        backgroundColor: `${domainStat?.colorHex || '#10b981'}15`,
                      }}
                    >
                      {item.domain}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.targetFocus}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5">
                    <div className="text-[11px]">
                      <span className="text-rose-400/90 font-medium">Risk: </span>
                      <span className="text-slate-400">{item.primaryRisk}</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-500">Repo:</span>
                      <span className="text-slate-300 truncate">{item.upstreamRepo}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                    {item.recommendedPack}
                  </span>
                  <button
                    onClick={() => onRouteQuery(item.sampleQuery, item.domain)}
                    className="px-2.5 py-1 text-xs font-mono font-medium text-slate-200 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded border border-slate-700 hover:border-emerald-400 transition-colors whitespace-nowrap"
                  >
                    Test in Router &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Expansion Catalog & 1-Click Pack Compiler */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-200">
              Expansion Catalog & Cryptographic Pack Compiler
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an upstream repository or specify custom Git endpoints. Enforces strict 40-char commit SHA gate,
              computes a 7-hash Kirsch-Mitzenmacher Bloom filter, and signs with Ed25519.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded">
            STRICT 40-CHAR SHA GATE ACTIVE
          </span>
        </div>

        {/* Upstream Catalog Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPANSION_CATALOG_SOURCES.map(source => {
            const isSelected = selectedSource.slug === source.slug;
            return (
              <button
                key={source.slug}
                onClick={() => handleSelectPreset(source)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-800/80 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-[#0D1117] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate">{source.slug}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    {source.domain}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {source.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>{source.spdxLicence}</span>
                  <span>{(source.estimatedSizeBytes / (1024 * 1024)).toFixed(0)} MB</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Compiler Form */}
        <div className="rounded-lg border border-slate-800 bg-[#0D1117] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-200">Pack Manifest Configuration</h3>
            <span className="text-xs font-mono text-slate-400">Deterministic Kirsch-Mitzenmacher 7-hash Prover</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Corpus Slug</label>
              <input
                type="text"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="e.g. nuclei-templates"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Hub Domain (11 Domains)</label>
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

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">SPDX Licence</label>
              <input
                type="text"
                value={customLicence}
                onChange={e => setCustomLicence(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="e.g. MIT, Apache-2.0, BSD-3-Clause"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">Git Repository URL</label>
              <input
                type="text"
                value={customRepoUrl}
                onChange={e => setCustomRepoUrl(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Strict Immutable 40-Char Commit SHA
              </label>
              <input
                type="text"
                value={customCommitSha}
                onChange={e => setCustomCommitSha(e.target.value)}
                className={`w-full bg-[#06080D] border text-xs font-mono px-3 py-2 rounded focus:outline-none ${
                  /^[a-f0-9]{40}$/i.test(customCommitSha)
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'border-rose-500/50 text-rose-300'
                }`}
                placeholder="40-hex commit SHA (never branch heads)"
              />
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                {/^[a-f0-9]{40}$/i.test(customCommitSha) ? (
                  <span className="text-emerald-400">&check; Exact 40-char SHA verified</span>
                ) : (
                  <span className="text-rose-400">&cross; Requires exact 40-char commit SHA</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
              <input
                type="checkbox"
                checked={autoInject}
                onChange={e => setAutoInject(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span>Instantly inject compiled pack into active 11-Domain router catalogue</span>
            </label>

            <button
              onClick={handleCompile}
              disabled={isCompiling || !/^[a-f0-9]{40}$/i.test(customCommitSha)}
              className="px-5 py-2 text-xs font-semibold font-mono text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:pointer-events-none rounded transition-colors whitespace-nowrap shadow-sm"
            >
              {isCompiling ? 'Compiling 7-Hash Bloom & Signing...' : 'Compile & Sign Memory Pack'}
            </button>
          </div>

          {/* Compilation Error Feedback */}
          {compileError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-xs font-mono text-rose-300 animate-fadeIn">
              &cross; Compilation Rejected: {compileError}
            </div>
          )}

          {/* Compilation Success Card */}
          {compiledResult && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400">
                  &check; Pack Compiled & Cryptographically Signed
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {compiledResult.injected ? 'Active in Live Catalogue' : 'Staged in Cache'} &bull; Total Active: {compiledResult.activeCatalogueCount}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-400">SHA-256 Merkle Root:</div>
                  <div className="text-slate-200 break-all text-[11px]">
                    {compiledResult.compiled.sha256}
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-400">Ed25519 Detached Signature:</div>
                  <div className="text-emerald-400 break-all text-[11px]">
                    {compiledResult.compiled.provenance.detached_signature_hex.substring(0, 48)}...
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-400">7-Hash Kirsch-Mitzenmacher Bloom Filter:</div>
                  <div className="text-slate-200 text-[11px]">
                    {compiledResult.compiled.term_sketch.num_bits} bits &bull; 7 hash strides &bull; 0% false negative guarantee
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-400">Signer Public Key (Ed25519):</div>
                  <div className="text-slate-200 break-all text-[11px]">
                    {compiledResult.compiled.provenance.signer_public_key}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => onRouteQuery(`Query verified memory pack for ${compiledResult.compiled.slug}`, compiledResult.compiled.domain)}
                  className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
                >
                  Test Query on {compiledResult.compiled.slug} &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
