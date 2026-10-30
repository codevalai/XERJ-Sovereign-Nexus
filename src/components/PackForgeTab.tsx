import React, { useState } from 'react';
import { LaneBRecipeSpec } from '../shared/xerjSchemas.js';

interface PackForgeTabProps {
  onStageLaneA: (ownerRepo: string) => Promise<any>;
  onCompileLaneB: (spec: LaneBRecipeSpec, privKeyHex?: string) => Promise<any>;
}

export const PackForgeTab: React.FC<PackForgeTabProps> = ({ onStageLaneA, onCompileLaneB }) => {
  const [activeLane, setActiveLane] = useState<'laneA' | 'laneB'>('laneA');

  // Lane A state
  const [laneARepo, setLaneARepo] = useState('codevalai/sovereign-infinity-ai-census');
  const [laneAResult, setLaneAResult] = useState<any>(null);
  const [laneALoading, setLaneALoading] = useState(false);
  const [copiedLaneA, setCopiedLaneA] = useState(false);

  // Lane B state
  const [packSlug, setPackSlug] = useState('mcp-vulns-2026');
  const [domain, setDomain] = useState('SEC');
  const [spdx, setSpdx] = useState('Apache-2.0');
  const [laneBResult, setLaneBResult] = useState<any>(null);
  const [laneBLoading, setLaneBLoading] = useState(false);
  const [copiedLaneB, setCopiedLaneB] = useState(false);

  const handleRunLaneA = async () => {
    setLaneALoading(true);
    try {
      const res = await onStageLaneA(laneARepo);
      setLaneAResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLaneALoading(false);
    }
  };

  const handleRunLaneB = async () => {
    setLaneBLoading(true);
    const spec: LaneBRecipeSpec = {
      packSlug,
      domain,
      spdxLicence: spdx,
      licenceClass: 'permissive',
      shards: 1,
      sources: [
        {
          id: 'osv-advisories',
          kind: 'jsonl-stream',
          url: 'https://api.osv.dev/v1/query',
          pinShaOrChecksum: '4e92a10bfca7720912d091e843ba09ff21034c71',
        },
        {
          id: 'ghsa-agent-security',
          kind: 'http-zip',
          url: 'https://github.com/advisories',
          pinShaOrChecksum: 'a8f31c90d512ef902b40441a76c023d8c4fa0192',
        },
      ],
      mergeEdges: [
        {
          leftSource: 'osv-advisories',
          rightSource: 'ghsa-agent-security',
          joinKey: 'cve_id',
          strategy: 'union_arrays',
        },
      ],
      semanticFields: ['summary', 'details', 'exploit_poc'],
      keywordFields: ['ecosystem', 'package_name', 'severity', 'cve_id'],
    };

    try {
      const res = await onCompileLaneB(spec);
      setLaneBResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLaneBLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Segmented Control */}
      <div className="flex items-center gap-2 p-1 bg-[#090D16] rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setActiveLane('laneA')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeLane === 'laneA'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Lane A: Auto-Pinner & License Auditor
        </button>
        <button
          onClick={() => setActiveLane('laneB')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeLane === 'laneB'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Lane B: Signed Record Pack & Ed25519 Forge
        </button>
      </div>

      {/* LANE A: GitHub Auto-Pinner & License Pre-Clearance */}
      {activeLane === 'laneA' && (
        <div className="space-y-5">
          <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">
                  Lane A Manifest Auditor & License Pre-Clearance
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  tools/xerj-code/hub/&lt;slug&gt;.json
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audits candidate repos in seconds: locks immutable 40-char commit SHA (blocking branch refs), checks file counts/bytes, verifies permissive SPDX license, and compiles a 7-hash Bloom term sketch.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={laneARepo}
                onChange={(e) => setLaneARepo(e.target.value)}
                placeholder="GitHub owner/repo (e.g. xerj-org/xerj)"
                className="flex-1 bg-[#06080D] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleRunLaneA}
                disabled={laneALoading}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {laneALoading ? 'Auditing Repo...' : 'Pin & Audit License'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>Quick Repos:</span>
              <button
                onClick={() => setLaneARepo('codevalai/sovereign-infinity-ai-census')}
                className="text-slate-400 hover:text-emerald-400 underline"
              >
                codevalai/sovereign-infinity-ai-census
              </button>
              <span>·</span>
              <button
                onClick={() => setLaneARepo('xerj-org/xerj')}
                className="text-slate-400 hover:text-emerald-400 underline"
              >
                xerj-org/xerj
              </button>
            </div>
          </div>

          {/* Lane A Result Dossier */}
          {laneAResult && (
            <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Pre-Clearance License & Provenance Dossier
                  </h3>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      laneAResult.dossier.clearanceVerdict === 'PRE_CLEARED_PERMISSIVE'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {laneAResult.dossier.clearanceVerdict}
                  </span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(laneAResult.dossier.generatedJson);
                    setCopiedLaneA(true);
                    setTimeout(() => setCopiedLaneA(false), 2000);
                  }}
                  className="px-3 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 transition-colors"
                >
                  {copiedLaneA ? 'Copied Manifest JSON!' : 'Copy Manifest JSON'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">IMMUTABLE COMMIT SHA</span>
                  <span className="text-cyan-400 font-bold truncate block">
                    {laneAResult.manifest.sha.slice(0, 12)}...
                  </span>
                </div>
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SPDX IDENTIFIER</span>
                  <span className="text-emerald-400 font-bold block">{laneAResult.manifest.license}</span>
                </div>
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">AUDITED FILES</span>
                  <span className="text-slate-200 font-bold block">{laneAResult.manifest.files.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">EXACT BYTE FOOTPRINT</span>
                  <span className="text-slate-200 font-bold block">
                    {(laneAResult.manifest.bytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">
                  Generated Lane A Manifest (<code className="text-emerald-400">tools/xerj-code/hub/{laneAResult.manifest.name}.json</code>):
                </label>
                <pre className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">
                  {laneAResult.dossier.generatedJson}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LANE B: Signed Record Pack & Ed25519 Forge */}
      {activeLane === 'laneB' && (
        <div className="space-y-5">
          <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">
                  Lane B Record-Pack Recipe & Ed25519 Signer
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  tools/packs/&lt;slug&gt;/recipe.toml
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Compiles multi-source ETL recipes with identity-merge edges, auto-generates scalar8 quantized mapping schemas (0.998 recall@10), and signs SHA256SUMS with Ed25519.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Pack Slug:</label>
                <input
                  type="text"
                  value={packSlug}
                  onChange={(e) => setPackSlug(e.target.value)}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Domain:</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                >
                  {['SEC', 'API', 'SYS', 'AI', 'DATA', 'CLOUD', 'CRYPTO', 'WEB', 'LANG', 'GAME', 'GOV'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">SPDX License:</label>
                <input
                  type="text"
                  value={spdx}
                  onChange={(e) => setSpdx(e.target.value)}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunLaneB}
                disabled={laneBLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {laneBLoading ? 'Compiling & Signing...' : 'Compile Lane B Recipe & Sign Ed25519'}
              </button>
            </div>
          </div>

          {/* Lane B Artifacts & Signatures */}
          {laneBResult && (
            <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Cryptographic Pack Bundle & Ed25519 Signatures
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    {laneBResult.signatureVerified ? '✓ Ed25519 Verified' : 'Sig Fail'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(laneBResult.recipeToml);
                    setCopiedLaneB(true);
                    setTimeout(() => setCopiedLaneB(false), 2000);
                  }}
                  className="px-3 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 transition-colors"
                >
                  {copiedLaneB ? 'Copied TOML!' : 'Copy recipe.toml'}
                </button>
              </div>

              {/* Cryptographic Keypair & Signatures strip */}
              <div className="space-y-2 p-3.5 bg-[#06080D] rounded-lg border border-slate-800 font-mono text-[11px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-500">PUBLIC KEY HEX:</span>
                  <code className="text-cyan-400 truncate max-w-md">{laneBResult.publicKeyHex}</code>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-500">DETACHED SIG (SHA256SUMS.sig):</span>
                  <code className="text-emerald-400 truncate max-w-md">{laneBResult.signatureHex}</code>
                </div>
              </div>

              {/* TOML Recipe & Scalar8 Mapping Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-400">
                    Compiled <code className="text-slate-300">recipe.toml</code>:
                  </div>
                  <pre className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64">
                    {laneBResult.recipeToml}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-400">
                    Scalar8 Quantized <code className="text-slate-300">mapping.suggested.json</code>:
                  </div>
                  <pre className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64">
                    {laneBResult.mappingSuggestedJson}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
