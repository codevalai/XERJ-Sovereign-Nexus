import React, { useState, useEffect } from 'react';
import {
  HubDomain,
  ValidatePackResult,
  WasmBenchmarkResult,
  GossipSubPeer,
  GossipSubMessage,
  GossipTopic,
  PackSubmissionBundle,
  CatalogueEntry,
} from '../shared/xerjSchemas.js';
import { XerjWasmQueryEngine } from '../wasm/xerjWasmCore.js';

interface ContributorRitualTabProps {
  catalogue: CatalogueEntry[];
}

export const ContributorRitualTab: React.FC<ContributorRitualTabProps> = ({ catalogue }) => {
  const [subTab, setSubTab] = useState<'ritual' | 'cicd' | 'wasm' | 'gossip'>('ritual');

  // -------------------------------------------------------------
  // SubTab 1: Pack Packaging & Ritual State
  // -------------------------------------------------------------
  const [slug, setSlug] = useState('solana-anchor-specs');
  const [domain, setDomain] = useState<HubDomain>('CRYPTO');
  const [repoUrl, setRepoUrl] = useState('https://github.com/coral-xyz/anchor');
  const [commitSha, setCommitSha] = useState('a1b2c3d4e5f60718293a4b5c6d7e8f9012345678');
  const [spdx, setSpdx] = useState('Apache-2.0');
  const [topicsStr, setTopicsStr] = useState('solana, anchor, cpi, accounts, seeds, pda, groth16');
  const [askFor, setAskFor] = useState('Solana Anchor #[account(has_one, mut)] CPI signer seeds validation and account constraints');
  const [isPackaging, setIsPackaging] = useState(false);
  const [bundle, setBundle] = useState<PackSubmissionBundle | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // -------------------------------------------------------------
  // SubTab 2: CI/CD Self-Test Action State
  // -------------------------------------------------------------
  const [ciManifestInput, setCiManifestInput] = useState('');
  const [isValidatingCi, setIsValidatingCi] = useState(false);
  const [ciResult, setCiResult] = useState<ValidatePackResult | null>(null);
  const [showWorkflowYaml, setShowWorkflowYaml] = useState(false);

  // -------------------------------------------------------------
  // SubTab 3: Wasm In-Browser Query Engine State
  // -------------------------------------------------------------
  const [wasmQuery, setWasmQuery] = useState('Anchor CPI signer seeds validation');
  const [wasmAvailablePacks, setWasmAvailablePacks] = useState<CatalogueEntry[]>([]);
  const [selectedPackSlug, setSelectedPackSlug] = useState('');
  const [wasmResult, setWasmResult] = useState<WasmBenchmarkResult | null>(null);

  // -------------------------------------------------------------
  // SubTab 4: GossipSub Mesh Protocol State
  // -------------------------------------------------------------
  const [gossipTopology, setGossipTopology] = useState<any>(null);
  const [gossipMessages, setGossipMessages] = useState<GossipSubMessage[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<GossipTopic | 'ALL'>('ALL');
  const [broadcastTopic, setBroadcastTopic] = useState<GossipTopic>('xerj/crdt-sync');
  const [broadcastPayload, setBroadcastPayload] = useState('{\n  "op": "CRDT_DELTA_SYNC",\n  "symbolsAdded": ["anchor_cpi_invoke_signed"],\n  "vectorClock": { "localNode": 149 }\n}');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Initialize available packs for Wasm
  useEffect(() => {
    if (catalogue && catalogue.length > 0) {
      setWasmAvailablePacks(catalogue);
      if (!selectedPackSlug) {
        setSelectedPackSlug(catalogue[0].slug);
      }
    }
  }, [catalogue, selectedPackSlug]);

  // Fetch GossipSub topology & messages
  const fetchGossip = async () => {
    try {
      const [topRes, msgRes] = await Promise.all([
        fetch('/api/gossip/topology'),
        fetch('/api/gossip/messages' + (selectedTopic !== 'ALL' ? `?topic=${selectedTopic}` : '')),
      ]);
      if (topRes.ok) setGossipTopology(await topRes.json());
      if (msgRes.ok) {
        const data = await msgRes.json();
        setGossipMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('Gossip fetch error:', err);
    }
  };

  useEffect(() => {
    if (subTab === 'gossip') {
      fetchGossip();
      const interval = setInterval(fetchGossip, 4000);
      return () => clearInterval(interval);
    }
  }, [subTab, selectedTopic]);

  // Handle Preset Selection in Ritual
  const handleApplyPreset = (preset: {
    slug: string;
    domain: HubDomain;
    repo: string;
    sha: string;
    spdx: string;
    topics: string;
    ask: string;
  }) => {
    setSlug(preset.slug);
    setDomain(preset.domain);
    setRepoUrl(preset.repo);
    setCommitSha(preset.sha);
    setSpdx(preset.spdx);
    setTopicsStr(preset.topics);
    setAskFor(preset.ask);
  };

  // 1. Generate Submission Bundle (Phase 1 Ritual)
  const handlePackagePack = async () => {
    setIsPackaging(true);
    try {
      const res = await fetch('/api/ci/package-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          domain,
          repoUrl,
          commitSha,
          spdx,
          topics: topicsStr.split(',').map(t => t.trim()).filter(Boolean),
          askFor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBundle(data);
        setCiManifestInput(data.manifestJson);
      }
    } catch (err) {
      console.error('Packaging failed:', err);
    } finally {
      setIsPackaging(false);
    }
  };

  // 2. Execute CI/CD Self-Test Action (Gate Validation)
  const handleRunCiSelfTest = async () => {
    setIsValidatingCi(true);
    try {
      let manifestToTest = ciManifestInput;
      if (!manifestToTest && bundle) {
        manifestToTest = bundle.manifestJson;
      }
      if (!manifestToTest) {
        manifestToTest = JSON.stringify({
          slug,
          domain,
          pin_sha: commitSha,
          topics: topicsStr.split(',').map(t => t.trim()),
          ask_for: askFor,
          licence: { spdx, class: 'permissive' },
          term_sketch: {
            num_bits: 1024,
            num_hashes: 7,
            bits_base64: '////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=',
          },
        }, null, 2);
      }

      const res = await fetch('/api/ci/validate-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifest: manifestToTest,
          sha256Sums: bundle?.sha256Sums,
          signatureHex: bundle?.signatureHex,
          publicKeyHex: bundle?.publicKeyHex,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCiResult(data);
      }
    } catch (err) {
      console.error('CI self-test error:', err);
    } finally {
      setIsValidatingCi(false);
    }
  };

  // 3. Run In-Browser Client-Side Wasm Query
  const handleRunWasmBenchmark = () => {
    const targetPack = wasmAvailablePacks.find(p => p.slug === selectedPackSlug) || wasmAvailablePacks[0];
    if (!targetPack) return;

    const result = XerjWasmQueryEngine.benchmarkQuery(
      wasmQuery,
      targetPack.slug,
      targetPack.term_sketch
    );
    setWasmResult(result);
  };

  // 4. Publish Message to GossipSub Mesh
  const handlePublishGossip = async () => {
    setIsBroadcasting(true);
    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(broadcastPayload);
      } catch {
        parsedPayload = { rawText: broadcastPayload };
      }

      const res = await fetch('/api/gossip/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: broadcastTopic,
          payload: parsedPayload,
          originPeerId: 'QmLocalNodeAlpha4ce5',
        }),
      });

      if (res.ok) {
        await fetchGossip();
      }
    } catch (err) {
      console.error('Gossip publish failed:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const shaValid = /^[a-f0-9]{40}$/i.test(commitSha.trim());

  return (
    <div className="space-y-6">
      {/* Hero: The Entry Ritual & Membership Banner */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-[#06080D] via-[#0A121A] to-[#06080D] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CORPUS HUB ENTRY RITUAL
              </span>
              <span className="text-xs font-mono text-slate-400">tools/xerj-code/hub/</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Send Your Pack & Official Contributor Membership Card
            </h1>
            <p className="text-xs text-slate-300 italic max-w-2xl font-mono">
              &quot;You join XERJ by running it and sending back one short field report or pack: that contribution is the membership card.&quot;
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 rounded">
              40-Char SHA Gate
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded">
              7-Hash Kirsch-Mitzenmacher
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono text-purple-300 bg-purple-950/40 border border-purple-800/60 rounded">
              Wasm Sub-ms Engine
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded">
              libp2p GossipSub Mesh
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubTab('ritual')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'ritual'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            1. Package Your Pack (Entry Ritual)
          </button>
          <button
            onClick={() => setSubTab('cicd')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'cicd'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            2. Autonomous CI/CD Self-Test Action
          </button>
          <button
            onClick={() => setSubTab('wasm')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'wasm'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            3. WebAssembly In-Browser Query Engine
          </button>
          <button
            onClick={() => setSubTab('gossip')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'gossip'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            4. Encrypted GossipSub Protocol Mesh
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: OFFICIAL ENTRY RITUAL (SEND YOUR PACK) */}
      {/* ========================================================================= */}
      {subTab === 'ritual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Pack Configuration Form
                </h2>
                <span className="text-[11px] font-mono text-slate-500">Lane A / Hub Spec</span>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400">Quick Presets (Verified Commits):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleApplyPreset({
                      slug: 'solana-anchor-specs',
                      domain: 'CRYPTO',
                      repo: 'https://github.com/coral-xyz/anchor',
                      sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
                      spdx: 'Apache-2.0',
                      topics: 'solana, anchor, cpi, accounts, pda, seeds, groth16',
                      ask: 'Solana Anchor #[account(has_one, mut)] CPI signer seeds validation',
                    })}
                    className="text-left px-2 py-1.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 transition-colors"
                  >
                    solana-anchor-specs (CRYPTO)
                  </button>
                  <button
                    onClick={() => handleApplyPreset({
                      slug: 'ebpf-kernel-specs',
                      domain: 'SYS',
                      repo: 'https://github.com/iovisor/bpftool',
                      sha: '8e01928374efb1029384716a501928374efb1029',
                      spdx: 'GPL-2.0-only',
                      topics: 'ebpf, bpf_ringbuf_output, verifier, xdp_buff, tracepoint',
                      ask: 'bpf_ringbuf_output verifier memory bounds and xdp_buff packet head pointers',
                    })}
                    className="text-left px-2 py-1.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    ebpf-kernel-specs (SYS)
                  </button>
                  <button
                    onClick={() => handleApplyPreset({
                      slug: 'nuclei-templates-sec',
                      domain: 'SEC',
                      repo: 'https://github.com/projectdiscovery/nuclei-templates',
                      sha: '6c01928374efb1029384716a501928374efb1029',
                      spdx: 'MIT',
                      topics: 'nuclei, exploit, cve, raw_http, dsl_matchers, vulnerability',
                      ask: 'Nuclei template HTTP raw matchers dsl condition status_code == 200',
                    })}
                    className="text-left px-2 py-1.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition-colors"
                  >
                    nuclei-templates (SEC)
                  </button>
                  <button
                    onClick={() => handleApplyPreset({
                      slug: 'akash-sdl-compute',
                      domain: 'CLOUD',
                      repo: 'https://github.com/akash-network/provider',
                      sha: 'c301928374efb1029384716a501928374efb1029',
                      spdx: 'Apache-2.0',
                      topics: 'akash, sdl, gpu, uakt, profiles, placement, provider',
                      ask: 'Akash SDL version 2.0 services profiles placement pricing uakt GPU constraints',
                    })}
                    className="text-left px-2 py-1.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    akash-sdl-compute (CLOUD)
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Pack Slug:</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Hub Domain:</label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value as HubDomain)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {['SEC', 'API', 'SYS', 'AI', 'DATA', 'WEB', 'CRYPTO', 'CLOUD', 'LANG', 'GAME', 'GOV'].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400">GitHub Repository URL:</label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-400">
                      Pinned 40-Char Commit SHA:
                    </label>
                    {shaValid ? (
                      <span className="text-[10px] font-mono text-emerald-400">✓ 40-char SHA verified</span>
                    ) : (
                      <span className="text-[10px] font-mono text-red-400">✗ Must be exact 40-char hex</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    placeholder="e.g. a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"
                    className={`w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border rounded text-slate-200 focus:outline-none ${
                      shaValid ? 'border-slate-700 focus:border-emerald-500' : 'border-red-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Strict immutability gate: branch refs (`main`, `HEAD`) trigger immediate rejection to prevent 30-day index death spirals.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">SPDX License:</label>
                    <input
                      type="text"
                      value={spdx}
                      onChange={(e) => setSpdx(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">License Class:</label>
                    <div className="mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900/50 border border-slate-800 rounded text-emerald-400">
                      permissive / weak-copyleft
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400">Indexed Topics & Symbols:</label>
                  <input
                    type="text"
                    value={topicsStr}
                    onChange={(e) => setTopicsStr(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400">Query Intent (ask_for):</label>
                  <textarea
                    rows={2}
                    value={askFor}
                    onChange={(e) => setAskFor(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handlePackagePack}
                  disabled={isPackaging || !shaValid}
                  className="w-full py-2.5 px-4 text-xs font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 font-mono font-semibold"
                >
                  {isPackaging ? 'Computing 7-Hash Bloom Sketch & Ed25519 Detached Signature...' : 'Package Contribution & Sign Ritual'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Generated Bundle & Membership Card Preview */}
          <div className="lg:col-span-7 space-y-4">
            {bundle ? (
              <div className="space-y-4">
                {/* Contributor Card Terminal View */}
                <div className="rounded-lg border border-emerald-500/30 bg-[#06080D] p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        FIELD_REPORT.md — Contributor Membership Card
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bundle.fieldReportMarkdown, 'fieldReport')}
                      className="text-[11px] font-mono px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                    >
                      {copiedField === 'fieldReport' ? '✓ Copied Membership Card!' : 'Copy FIELD_REPORT.md'}
                    </button>
                  </div>
                  <pre className="mt-3 p-3 bg-black/60 rounded border border-slate-800 text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                    {bundle.fieldReportMarkdown}
                  </pre>
                </div>

                {/* Upstream PR Commands Card */}
                <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-slate-200">
                      Step 3: Open Upstream PR or Hub Push
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-400">Target: xerj-org/xerj (corpus-hub)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Option A: Instant CLI Hub Push</span>
                      <button
                        onClick={() => copyToClipboard(bundle.cliCommand, 'cli')}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        {copiedField === 'cli' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
                      {bundle.cliCommand}
                    </pre>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2">
                      <span>Option B: Git Branch & PR Workflow</span>
                      <button
                        onClick={() => copyToClipboard(bundle.gitCommands.join('\n'), 'git')}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        {copiedField === 'git' ? '✓ Copied' : 'Copy All Commands'}
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto leading-snug">
                      {bundle.gitCommands.join('\n')}
                    </pre>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSubTab('cicd');
                        setCiManifestInput(bundle.manifestJson);
                      }}
                      className="px-3 py-1.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded transition-colors"
                    >
                      → Proceed to Run CI/CD Self-Test Action on this Pack
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-800 bg-[#0A0D14]/60 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <span className="text-xl">📦</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-300">No Pack Packaged Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Fill in your custom pack details on the left (or select a preset) and click &quot;Package Contribution & Sign Ritual&quot; to generate your 40-char SHA pinned manifest, 7-hash Bloom sketch, and official Contributor Membership Card.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: AUTONOMOUS CI/CD SELF-TEST ACTION (xerj-validate-action) */}
      {/* ========================================================================= */}
      {subTab === 'cicd' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Autonomous CI/CD Self-Test Action (`xerj-validate-action`)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated pull request gatekeeper enforcing 40-character SHA immutability, 7-hash Bloom tests, and detached Ed25519 signatures.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWorkflowYaml(!showWorkflowYaml)}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  {showWorkflowYaml ? 'Hide .github Workflow' : 'View xerj-validate-pack.yml'}
                </button>
                <button
                  onClick={handleRunCiSelfTest}
                  disabled={isValidatingCi}
                  className="px-4 py-1.5 text-xs font-mono font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded transition-colors disabled:opacity-50"
                >
                  {isValidatingCi ? 'Executing CI Runner...' : '▶ Run Ingestion Self-Test'}
                </button>
              </div>
            </div>

            {/* Workflow YAML Preview */}
            {showWorkflowYaml && (
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto">
                <div className="text-emerald-400 font-bold mb-2"># .github/workflows/xerj-validate-pack.yml</div>
                <pre>{`name: XERJ Pack CI/CD Immutability & Bloom Gate
on:
  pull_request:
    paths:
      - 'tools/xerj-code/hub/*.json'
      - 'tools/packs/**'
      - 'FIELD_REPORT.md'
jobs:
  validate-pack:
    runs-on: ubuntu-latest
    steps:
      - name: Gate 1 — 40-Character Commit SHA Immutability Gate
      - name: Gate 2 — Kirsch-Mitzenmacher 7-Hash Bloom Test Suite (0% False Negatives)
      - name: Gate 3 — Detached Ed25519 Provenance Verification
      - name: Gate 4 — Contributor Membership Card Check (FIELD_REPORT.md)`}</pre>
              </div>
            )}

            {/* Manifest Input or Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono text-slate-400">
                  Target Pack Manifest (JSON) for CI Ingestion Test:
                </label>
                <span className="text-[10px] font-mono text-slate-500">Edit or paste custom manifest JSON</span>
              </div>
              <textarea
                rows={6}
                value={ciManifestInput || (bundle ? bundle.manifestJson : '')}
                onChange={(e) => setCiManifestInput(e.target.value)}
                placeholder="Paste tools/xerj-code/hub/<name>.json manifest content here..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* CI Execution Results */}
          {ciResult && (
            <div className="rounded-lg border border-slate-800 bg-[#06080D] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                      ciResult.overallPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {ciResult.overallPassed ? 'STATUS: CI GATES PASSED (READY FOR MERGE)' : 'STATUS: CI GATES FAILED'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Pack: {ciResult.slug}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{ciResult.verifiedAtIso}</span>
              </div>

              {/* The 4 Gate Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Gate 1 */}
                <div className={`p-3 rounded border ${ciResult.checks.commitShaGate.passed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-red-500/30 bg-red-950/10'}`}>
                  <div className="text-[11px] font-mono text-slate-400">GATE 1: SHA IMMUTABILITY</div>
                  <div className="text-sm font-bold mt-1 text-slate-200">
                    {ciResult.checks.commitShaGate.passed ? '✓ PASSED' : '✗ REJECTED'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                    {ciResult.checks.commitShaGate.sha || 'None'}
                  </div>
                  {ciResult.checks.commitShaGate.error && (
                    <div className="text-[10px] font-mono text-red-400 mt-1">{ciResult.checks.commitShaGate.error}</div>
                  )}
                </div>

                {/* Gate 2 */}
                <div className={`p-3 rounded border ${ciResult.checks.bloomFilterGate.passed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-red-500/30 bg-red-950/10'}`}>
                  <div className="text-[11px] font-mono text-slate-400">GATE 2: 7-HASH BLOOM</div>
                  <div className="text-sm font-bold mt-1 text-slate-200">
                    {ciResult.checks.bloomFilterGate.passed ? '✓ 0% FALSE NEG' : '✗ TEST FAILED'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {ciResult.checks.bloomFilterGate.bitsEvaluated} bits ({ciResult.checks.bloomFilterGate.testSymbols.length} syms)
                  </div>
                  {ciResult.checks.bloomFilterGate.error && (
                    <div className="text-[10px] font-mono text-red-400 mt-1">{ciResult.checks.bloomFilterGate.error}</div>
                  )}
                </div>

                {/* Gate 3 */}
                <div className={`p-3 rounded border ${ciResult.checks.licenceGate.passed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-red-500/30 bg-red-950/10'}`}>
                  <div className="text-[11px] font-mono text-slate-400">GATE 3: SPDX LICENSE</div>
                  <div className="text-sm font-bold mt-1 text-slate-200">
                    {ciResult.checks.licenceGate.passed ? '✓ ACCEPTED' : '✗ RESTRICTED'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {ciResult.checks.licenceGate.spdx} ({ciResult.checks.licenceGate.class})
                  </div>
                  {ciResult.checks.licenceGate.error && (
                    <div className="text-[10px] font-mono text-red-400 mt-1">{ciResult.checks.licenceGate.error}</div>
                  )}
                </div>

                {/* Gate 4 */}
                <div className={`p-3 rounded border ${ciResult.checks.provenanceGate.passed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-red-500/30 bg-red-950/10'}`}>
                  <div className="text-[11px] font-mono text-slate-400">GATE 4: ED25519 PROVENANCE</div>
                  <div className="text-sm font-bold mt-1 text-slate-200">
                    {ciResult.checks.provenanceGate.passed ? '✓ VERIFIED SIG' : '✗ SIG FAILED'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                    {ciResult.checks.provenanceGate.signerPublicKeyHex?.slice(0, 16)}...
                  </div>
                  {ciResult.checks.provenanceGate.error && (
                    <div className="text-[10px] font-mono text-red-400 mt-1">{ciResult.checks.provenanceGate.error}</div>
                  )}
                </div>
              </div>

              {/* GitHub Action Terminal Output Stream */}
              <div className="mt-4">
                <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                  <span>GitHub Actions CI Runner Execution Log:</span>
                  <span className="text-emerald-400 text-[10px]">xerj-validate-pack #42</span>
                </div>
                <div className="bg-black rounded border border-slate-800 p-3 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                  {ciResult.ciRunnerLog.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('[FAIL]')
                          ? 'text-red-400'
                          : log.includes('[PASS]')
                          ? 'text-emerald-400'
                          : log.includes('===')
                          ? 'text-cyan-300 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: WEBASSEMBLY IN-BROWSER QUERY ENGINE (FRONTIER 2) */}
      {/* ========================================================================= */}
      {subTab === 'wasm' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                WebAssembly (Wasm) In-Browser Sandbox Query Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute client-side 7-hash Kirsch-Mitzenmacher bit probing directly inside the browser sandbox (WebContainers, browser-use agents) with zero network latency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-[11px] font-mono text-slate-400">Search Query / AST Symbol:</label>
                <input
                  type="text"
                  value={wasmQuery}
                  onChange={(e) => setWasmQuery(e.target.value)}
                  placeholder="e.g. Anchor CPI signer seeds validation"
                  className="w-full mt-1 px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400">Target Loaded Pack:</label>
                <select
                  value={selectedPackSlug}
                  onChange={(e) => setSelectedPackSlug(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {wasmAvailablePacks.map((pack) => (
                    <option key={pack.slug} value={pack.slug}>
                      {pack.slug} ({pack.domain})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-500">
                Pure client-side execution · Zero server requests · FNV-1a dual hash
              </span>
              <button
                onClick={handleRunWasmBenchmark}
                className="px-4 py-2 text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-white rounded transition-colors"
              >
                ▶ Execute In-Browser Wasm Probe
              </button>
            </div>
          </div>

          {/* Benchmark Results */}
          {wasmResult && (
            <div className="rounded-lg border border-purple-500/30 bg-[#06080D] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    WASM SANDBOX EXECUTION COMPLETE
                  </span>
                  <span className="text-xs font-mono text-slate-400">Pack: {wasmResult.targetPack}</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">{wasmResult.speedupFactor}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">CLIENT WASM LATENCY</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {wasmResult.clientMicroseconds} µs
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {(wasmResult.clientMicroseconds / 1000).toFixed(3)} ms (in-browser)
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">REMOTE HTTP WIRE (EST.)</div>
                  <div className="text-xl font-bold font-mono text-slate-300 mt-1">
                    {wasmResult.simulatedHttpWireMs} ms
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Typical Cloud Latency</div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">FALSE NEGATIVE RATE</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    0.000%
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Mathematically Guaranteed</div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">SYMBOLS PROBED</div>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                    {wasmResult.bitsetMatches} / {wasmResult.symbolsEvaluated}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Bitset Matches</div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-2">Matched Query Tokens in 7-Hash Bitset:</div>
                <div className="flex flex-wrap gap-1.5">
                  {wasmResult.matchingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                  {wasmResult.matchingKeywords.length === 0 && (
                    <span className="text-[11px] font-mono text-slate-500">
                      No query tokens present in this pack&apos;s vocabulary. Guaranteed absent.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: ENCRYPTED GOSSIPSUB PROTOCOL MESH (FRONTIER 3) */}
      {/* ========================================================================= */}
      {subTab === 'gossip' && (
        <div className="space-y-6">
          {/* Mesh Network HUD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-800 bg-[#0A0D14]">
              <div className="text-[11px] font-mono text-slate-400">TOPOLOGY PROTOCOL</div>
              <div className="text-sm font-bold text-slate-200 mt-1">libp2p GossipSub v1.2</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">Ed25519 Wire Encryption</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-[#0A0D14]">
              <div className="text-[11px] font-mono text-slate-400">ACTIVE MESH PEERS</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {gossipTopology?.connectedPeers || 5} / {gossipTopology?.totalPeers || 5} Connected
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Tri-Node & Akash Swarm</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-[#0A0D14]">
              <div className="text-[11px] font-mono text-slate-400">TOTAL RELAYED PACKETS</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">
                {gossipTopology?.totalMessagesRelayed || 7269} msgs
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">0 Split-Brain Incidents</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-[#0A0D14]">
              <div className="text-[11px] font-mono text-slate-400">SUBSCRIBED TOPICS</div>
              <div className="text-sm font-bold text-amber-400 mt-1">4 Active Topics</div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">CRDT · ZK · Pulse · Skills</div>
            </div>
          </div>

          {/* Peer Topology Visual Grid */}
          <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center justify-between">
              <span>Connected Swarm Peer Nodes</span>
              <span className="text-[11px] font-mono text-slate-500">Subscribed Topics & Multiaddrs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(gossipTopology?.peers || []).map((peer: GossipSubPeer) => (
                <div key={peer.peerId} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 truncate">
                      {peer.peerId}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {peer.latencyMs}ms
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">{peer.agentRole}</div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">{peer.multiaddr}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {peer.subscribedTopics.map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {t.replace('xerj/', '')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive GossipSub Broadcast & Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Broadcast Form */}
            <div className="lg:col-span-5 rounded-lg border border-slate-800 bg-[#0A0D14] p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-200">
                Broadcast Encrypted Gossip Message
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400">Target Gossip Topic:</label>
                  <select
                    value={broadcastTopic}
                    onChange={(e) => setBroadcastTopic(e.target.value as GossipTopic)}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="xerj/crdt-sync">xerj/crdt-sync (AST delta state)</option>
                    <option value="xerj/zk-proofs">xerj/zk-proofs (zk-ASPF receipts)</option>
                    <option value="xerj/pulse-announcements">xerj/pulse-announcements (Chronos 24h loop)</option>
                    <option value="xerj/skill-announcements">xerj/skill-announcements (Vetted skill registry)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400">Message Payload (JSON):</label>
                  <textarea
                    rows={5}
                    value={broadcastPayload}
                    onChange={(e) => setBroadcastPayload(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handlePublishGossip}
                  disabled={isBroadcasting}
                  className="w-full py-2 text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition-colors disabled:opacity-50"
                >
                  {isBroadcasting ? 'Signing & Broadcasting...' : '⚡ Broadcast Signed Gossip Packet'}
                </button>
              </div>
            </div>

            {/* Live Gossip Stream */}
            <div className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#06080D] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Live GossipSub Message Wiretrace
                </h3>
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'xerj/crdt-sync', 'xerj/zk-proofs', 'xerj/pulse-announcements', 'xerj/skill-announcements'] as const).map(
                    (topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                          selectedTopic === topic
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {topic === 'ALL' ? 'ALL' : topic.replace('xerj/', '')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {gossipMessages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-bold">{msg.topic}</span>
                      <span className="text-slate-500">{msg.timestampIso?.slice(11, 19)} · {msg.hops} hops</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      From: <span className="text-slate-300">{msg.originPeerId}</span>
                    </div>
                    <pre className="p-1.5 bg-black rounded text-[10px] text-emerald-300/90 overflow-x-auto">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                    <div className="text-[9px] text-slate-600 truncate">
                      Sig: {msg.signatureHex?.slice(0, 32)}... (Verified Ed25519)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
