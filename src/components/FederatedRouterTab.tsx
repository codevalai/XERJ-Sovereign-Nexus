import React, { useState } from 'react';
import { LicenceClass } from '../shared/xerjSchemas.js';

interface FederatedRouterTabProps {
  onExecuteRoute: (params: {
    question: string;
    lockfileContent: string;
    lockfileType: 'Cargo.lock' | 'package.json' | 'go.mod';
    allowedLicenceClasses: LicenceClass[];
    maxPacksToFederate: number;
  }) => Promise<void>;
  routingData: any;
  loading: boolean;
  onForwardToTribunal: (question: string) => void;
}

const SAMPLE_QUESTIONS = [
  'How do we verify atomic WAL rotation and acquire exclusive advisory lock?',
  'Audit CVE-2026 prompt injection payloads and tool poisoning in MCP SDK',
  'Stripe payment intent idempotency key header schema and refund parameters',
  'Linux eBPF ring buffer verification and XDP socket packet filtering',
];

const SAMPLE_PACKAGE_JSON = `{
  "name": "enterprise-agent-core",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.32.0",
    "stripe": "^17.5.0",
    "@google/genai": "^2.32.0",
    "express": "^4.21.2",
    "better-sqlite3": "^11.8.0"
  }
}`;

const SAMPLE_CARGO_LOCK = `[[package]]
name = "tokio"
version = "1.43.0"

[[package]]
name = "rustsec"
version = "0.30.1"

[[package]]
name = "cargo-audit"
version = "0.20.0"`;

export const FederatedRouterTab: React.FC<FederatedRouterTabProps> = ({
  onExecuteRoute,
  routingData,
  loading,
  onForwardToTribunal,
}) => {
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]!);
  const [lockfileType, setLockfileType] = useState<'package.json' | 'Cargo.lock' | 'go.mod'>('package.json');
  const [lockfileContent, setLockfileContent] = useState(SAMPLE_PACKAGE_JSON);
  const [allowedLicences, setAllowedLicences] = useState<LicenceClass[]>(['permissive', 'weak-copyleft']);
  const [maxPacks, setMaxPacks] = useState(3);
  const [activeTabSubView, setActiveTabSubView] = useState<'pipeline' | 'bloom' | 'dsl'>('pipeline');

  const handleToggleLicence = (cls: LicenceClass) => {
    if (allowedLicences.includes(cls)) {
      if (allowedLicences.length > 1) {
        setAllowedLicences(allowedLicences.filter(c => c !== cls));
      }
    } else {
      setAllowedLicences([...allowedLicences, cls]);
    }
  };

  const handleRun = async () => {
    await onExecuteRoute({
      question,
      lockfileContent,
      lockfileType,
      allowedLicenceClasses: allowedLicences,
      maxPacksToFederate: maxPacks,
    });
  };

  const routingResult = routingData?.routingResult;
  const compiledPlan = routingData?.compiledPlan;

  return (
    <div className="space-y-6">
      {/* Query & Lockfile Input Card */}
      <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Federated Multi-Corpus Router & Lockfile Inspector
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              5-Stage Hub v2 Wire Protocol
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replaces single-pack winner-take-all routing with dependency-grounded federation, 7-hash Bloom term sketch pruning, and Gemini AST query expansion.
          </p>
        </div>

        {/* Question Input & Quick Samples */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Natural Language Engineering / Security Query:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter technical query or prompt..."
              className="flex-1 bg-[#06080D] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={handleRun}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Routing Pipeline...' : 'Run Federated Route'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
            <span className="font-mono">Quick Queries:</span>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuestion(q)}
                className="text-slate-400 hover:text-emerald-400 underline decoration-slate-700 hover:decoration-emerald-400 text-left transition-colors truncate max-w-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Lockfile Inspector & Policy Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Left: Lockfile Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400">
                Workspace Lockfile Evidence:
              </label>
              <div className="flex items-center gap-1">
                {(['package.json', 'Cargo.lock', 'go.mod'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setLockfileType(type);
                      setLockfileContent(type === 'package.json' ? SAMPLE_PACKAGE_JSON : SAMPLE_CARGO_LOCK);
                    }}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      lockfileType === type
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={5}
              value={lockfileContent}
              onChange={(e) => setLockfileContent(e.target.value)}
              className="w-full bg-[#06080D] border border-slate-700 rounded-lg p-2.5 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Right: SPDX Policy & Max Packs */}
          <div className="space-y-4 bg-[#06080D] p-3.5 rounded-lg border border-slate-800/80">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">
                Allowed SPDX Licence Classes (Pre-Filter):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['permissive', 'weak-copyleft', 'strong-copyleft', 'restricted'] as LicenceClass[]).map(cls => (
                  <label key={cls} className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={allowedLicences.includes(cls)}
                      onChange={() => handleToggleLicence(cls)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                    />
                    <span className="font-mono text-[11px] capitalize">{cls}</span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Non-compliant licenses are stripped pre-routing: never picked, offered, or named.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Max Federated Packs:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setMaxPacks(num)}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      maxPacks === num
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routing Pipeline Execution Trace Output */}
      {routingResult && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-200">
                Federation Results & 5-Stage Execution Trace
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                {routingResult.selectedCandidates.length} Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#06080D] p-1 rounded-md border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTabSubView('pipeline')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTabSubView === 'pipeline'
                      ? 'bg-slate-800 text-slate-200'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Candidate Traces
                </button>
                <button
                  onClick={() => setActiveTabSubView('bloom')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTabSubView === 'bloom'
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  7-Hash Bloom Matrix
                </button>
                <button
                  onClick={() => setActiveTabSubView('dsl')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTabSubView === 'dsl'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ES 8.x Hybrid DSL
                </button>
              </div>

              <button
                onClick={() => onForwardToTribunal(question)}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
              >
                Send to Relevance Tribunal →
              </button>
            </div>
          </div>

          {/* SubView 1: Pipeline Candidate Evaluation Traces */}
          {activeTabSubView === 'pipeline' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TOTAL EVALUATED</span>
                  <span className="text-slate-200 font-bold text-base">{routingResult.summary.totalEvaluated}</span>
                </div>
                <div className="p-2.5 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">DROPPED (LICENCE)</span>
                  <span className="text-rose-400 font-bold text-base">{routingResult.summary.droppedByLicence}</span>
                </div>
                <div className="p-2.5 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">DROPPED (30-DAY STALE)</span>
                  <span className="text-amber-400 font-bold text-base">{routingResult.summary.droppedByStaleness}</span>
                </div>
                <div className="p-2.5 bg-[#06080D] rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">PRUNED (0% BLOOM)</span>
                  <span className="text-slate-400 font-bold text-base">{routingResult.summary.prunedByBloom}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                      <th className="py-2 px-3">CORPUS</th>
                      <th className="py-2 px-3">STAGE 1: LICENCE</th>
                      <th className="py-2 px-3">STAGE 2: 30D CLIFF</th>
                      <th className="py-2 px-3">STAGE 3: LOCKFILE DEPS</th>
                      <th className="py-2 px-3">STAGE 4: 7-HASH BLOOM</th>
                      <th className="py-2 px-3 text-right">COMPOSITE SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {routingResult.allTraces.map((trace: any) => (
                      <tr
                        key={trace.slug}
                        className={
                          trace.finalDecision === 'SELECTED'
                            ? 'bg-emerald-950/20'
                            : 'hover:bg-slate-900/40 opacity-75'
                        }
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-medium text-slate-200">{trace.slug}</div>
                          <span className="text-[10px] text-slate-500">[{trace.domain}]</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {trace.passedLicence ? (
                            <span className="text-emerald-400">{trace.spdx} ({trace.licenceClass})</span>
                          ) : (
                            <span className="text-rose-400">{trace.spdx} (REJECTED)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {trace.passedStaleness ? (
                            <span className="text-emerald-400">Day {trace.ageDays} (OK)</span>
                          ) : (
                            <span className="text-rose-400 font-bold">Day {trace.ageDays} (CLIFF HIT)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {trace.matchedDependencies.length > 0 ? (
                            <span className="text-cyan-400 font-semibold">
                              +{trace.dependencyBoost} pts ({trace.matchedDependencies.join(', ')})
                            </span>
                          ) : (
                            <span className="text-slate-600">0 matches</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {trace.bloomMatchedTerms.length > 0 ? (
                            <span className="text-emerald-400">
                              {trace.bloomMatchedTerms.length} hit ({trace.bloomMatchedTerms.join(', ')})
                            </span>
                          ) : (
                            <span className="text-slate-500">Pruned</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {trace.finalDecision === 'SELECTED' ? (
                            <span className="text-emerald-400 font-bold text-sm">
                              {trace.totalCompositeScore} pts ★
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">
                              {trace.finalDecision}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubView 2: 7-Hash Bloom Matrix */}
          {activeTabSubView === 'bloom' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#06080D] rounded border border-slate-800 text-slate-400">
                <span className="text-cyan-400 font-bold">7-Hash Kirsch-Mitzenmacher Bit Probing: </span>
                Formula <code className="text-slate-300">g_i(x) = (h1 + i * h2) mod m</code> for i = 0..6.
                If any bit position is zero, corpus is mathematically eliminated with 0% false negative rate!
              </div>

              {routingResult.selectedCandidates.map((cand: any) => (
                <div key={cand.slug} className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{cand.slug}</span>
                    <span className="text-slate-500">Bloom Coverage: {Math.round(cand.bloomCoverageRatio * 100)}%</span>
                  </div>
                  <div className="space-y-1.5">
                    {cand.bloomProbing.map((probe: any, idx: number) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="text-slate-300 w-24 truncate">{probe.term}:</span>
                        <div className="flex items-center gap-1">
                          {probe.hitBits.map((bit: number, bIdx: number) => (
                            <span
                              key={bIdx}
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                probe.matchesAll7Hashes
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              h{bIdx}:{bit}
                            </span>
                          ))}
                        </div>
                        <span className={probe.matchesAll7Hashes ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                          {probe.matchesAll7Hashes ? '✓ ALL 7 HIT' : '✗ PRUNED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SubView 3: Elasticsearch 8.x Conformal DSL */}
          {activeTabSubView === 'dsl' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#06080D] rounded border border-slate-800 text-slate-400">
                <span className="text-emerald-400 font-bold">Gemini Flash AST Query Decomposition: </span>
                Extracts Tree-sitter struct/function symbols for <code className="text-slate-300">/api/v1/def</code>, BM25 phrases, and semantic paraphrase expansions to eliminate lexical feature-hashing blindspots.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">AST SYMBOLS (/api/v1/def)</div>
                  {compiledPlan?.astSymbolDefinitions.map((sym: string, i: number) => (
                    <div key={i} className="text-cyan-400 text-xs truncate">`{sym}`</div>
                  ))}
                </div>
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">LEXICAL BM25 TARGETS</div>
                  {compiledPlan?.lexicalBm25Queries.map((q: string, i: number) => (
                    <div key={i} className="text-slate-200 text-xs truncate">{q}</div>
                  ))}
                </div>
                <div className="p-3 bg-[#06080D] rounded border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">PARAPHRASE EXPANSIONS</div>
                  {compiledPlan?.paraphraseExpansions.map((p: string, i: number) => (
                    <div key={i} className="text-amber-400 text-xs truncate">{p}</div>
                  ))}
                </div>
              </div>

              <pre className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-72">
                {JSON.stringify(compiledPlan?.esHybridDsl, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
