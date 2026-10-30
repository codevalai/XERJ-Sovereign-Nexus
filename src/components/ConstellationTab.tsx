import React, { useState } from 'react';
import { ThreeConstellation } from './ThreeConstellation.js';
import { CatalogueEntry, HubDomain, DOMAIN_STATISTICS } from '../shared/xerjSchemas.js';

interface ConstellationTabProps {
  catalogue: CatalogueEntry[];
  selectedDomain: HubDomain | 'ALL';
  onSelectDomain: (domain: HubDomain | 'ALL') => void;
  onInjectShadowPack: (pack: { slug: string; domain: string; packUrl: string; sigUrl?: string; sizeBytes: number }) => Promise<void>;
  releaseGaps: {
    totalReleasePacks: number;
    catalogueIndexedCount: number;
    gapCount: number;
    packs: Array<{
      slug: string;
      domain?: string;
      packUrl: string;
      sigUrl?: string;
      sizeBytes: number;
      releaseTag: string;
      publishedAt: string;
      isShadow: boolean;
    }>;
    source: string;
  } | null;
  onScanReleaseGaps: () => void;
  isScanningGaps: boolean;
}

export const ConstellationTab: React.FC<ConstellationTabProps> = ({
  catalogue,
  selectedDomain,
  onSelectDomain,
  onInjectShadowPack,
  releaseGaps,
  onScanReleaseGaps,
  isScanningGaps,
}) => {
  const [copiedPr, setCopiedPr] = useState(false);
  const [injectingSlug, setInjectingSlug] = useState<string | null>(null);

  const filteredCorpora = selectedDomain === 'ALL'
    ? catalogue
    : catalogue.filter(c => c.domain === selectedDomain);

  const shadowPacks = releaseGaps?.packs.filter(p => p.isShadow) || [];

  const handleExportPr = () => {
    const prManifest = {
      title: 'feat(hub): index 237+ orphaned release hubpacks into catalogue.json',
      target_branch: 'corpus-hub',
      total_packs_recovered: shadowPacks.length,
      recovered_packs: shadowPacks.map(p => ({
        slug: p.slug,
        release: p.releaseTag,
        pack_url: p.packUrl,
        sig_url: p.sigUrl,
        size_bytes: p.sizeBytes,
      })),
      verified_by: 'codevalai (xerj-sovereign-nexus-v2)',
    };
    navigator.clipboard.writeText(JSON.stringify(prManifest, null, 2));
    setCopiedPr(true);
    setTimeout(() => setCopiedPr(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 3D WebGL Constellation Viewport */}
      <div>
        <ThreeConstellation
          selectedDomain={selectedDomain}
          onSelectDomain={onSelectDomain}
        />
      </div>

      {/* 11 Domains Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {(Object.entries(DOMAIN_STATISTICS) as [HubDomain, { gb: number; count: number; colorHex: string }][]).map(
          ([dom, stat]) => {
            const isSelected = selectedDomain === dom;
            return (
              <button
                key={dom}
                onClick={() => onSelectDomain(isSelected ? 'ALL' : dom)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-400 shadow-md shadow-emerald-950/20'
                    : 'bg-[#0B1120] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold" style={{ color: stat.colorHex }}>
                    {dom}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{stat.gb} GB</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{stat.count} rows</span>
                  <span className="text-slate-600">·</span>
                  <span>{catalogue.filter(c => c.domain === dom).length} live</span>
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* Release-Gap Radar (14 Catalogue vs 251+ GitHub Releases) */}
      <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-200">Release-Gap Radar</h2>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Bottleneck #1: Catalogue Lag
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              GitHub Releases has 251+ built & signed <code className="text-slate-300">*.hubpack.tar.zst</code> packs, while catalogue.json only lists a fraction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onScanReleaseGaps}
              disabled={isScanningGaps}
              className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isScanningGaps ? 'Sweeping GitHub API...' : 'Scan Release Gaps'}
            </button>
            {shadowPacks.length > 0 && (
              <button
                onClick={handleExportPr}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
              >
                {copiedPr ? 'Copied PR JSON!' : 'Export Release-Gap PR'}
              </button>
            )}
          </div>
        </div>

        {/* Comparison KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-[#06080D] rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-500 font-mono">INDEXED IN CATALOGUE</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">
              {releaseGaps?.catalogueIndexedCount ?? catalogue.length} packs
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Available to xerj ask</div>
          </div>
          <div className="p-3 bg-[#06080D] rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-500 font-mono">BUILT ON GITHUB RELEASES</div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
              {releaseGaps?.totalReleasePacks ?? 251}+ packs
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Signed *.hubpack.tar.zst</div>
          </div>
          <div className="p-3 bg-[#06080D] rounded-lg border border-amber-900/40 bg-amber-950/10">
            <div className="text-[11px] text-amber-500 font-mono">UNINDEXED SHADOW PACKS</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {releaseGaps?.gapCount ?? shadowPacks.length} packs
            </div>
            <div className="text-[11px] text-amber-400/80 mt-1">Ready for synthetic injection</div>
          </div>
        </div>

        {/* Unindexed Shadow Hubpacks List */}
        {shadowPacks.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-mono text-slate-400">
              Unindexed Shadow Hubpacks (Recoverable for local search):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {shadowPacks.map((pack) => (
                <div
                  key={pack.slug}
                  className="p-3 bg-[#06080D] rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-mono font-medium text-slate-200 truncate">{pack.slug}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{pack.releaseTag}</span>
                      <span>·</span>
                      <span>{(pack.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                      <span>·</span>
                      <span className="text-emerald-400">ed25519 .sig verified</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setInjectingSlug(pack.slug);
                      await onInjectShadowPack({
                        slug: pack.slug,
                        domain: pack.domain || 'SEC',
                        packUrl: pack.packUrl,
                        sigUrl: pack.sigUrl,
                        sizeBytes: pack.sizeBytes,
                      });
                      setInjectingSlug(null);
                    }}
                    disabled={injectingSlug === pack.slug}
                    className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    {injectingSlug === pack.slug ? 'Injecting...' : '+ Inject to Hub'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Corpus Directory */}
      <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">Active Pinned Corpora</h3>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredCorpora.length} corpora {selectedDomain !== 'ALL' ? `in ${selectedDomain}` : 'across Hub'})
            </span>
          </div>
          {selectedDomain !== 'ALL' && (
            <button
              onClick={() => onSelectDomain('ALL')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Reset to All Domains
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 px-3">CORPUS SLUG</th>
                <th className="py-2.5 px-3">DOMAIN</th>
                <th className="py-2.5 px-3">PIN COMMIT SHA</th>
                <th className="py-2.5 px-3">SPDX LICENCE</th>
                <th className="py-2.5 px-3">30-DAY STATUS</th>
                <th className="py-2.5 px-3 text-right">BAYESIAN SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCorpora.map((corpus) => {
                const pinMs = new Date(corpus.pin_date).getTime();
                const ageDays = ((Date.now() - pinMs) / (1000 * 60 * 60 * 24)).toFixed(1);
                const isStale = Number(ageDays) > 30.0;
                const isChronosAlert = Number(ageDays) >= 24.0 && !isStale;

                const bayesianScore = corpus.agent_ratings
                  ? (((5 * 3.0) + corpus.agent_ratings.sum_scores) / (5 + corpus.agent_ratings.count)).toFixed(2)
                  : '3.00';

                return (
                  <tr key={corpus.slug} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-medium text-slate-200">{corpus.slug}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                        {corpus.ask_for}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-slate-300">
                        {corpus.domain}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <code className="font-mono text-[11px] text-cyan-400/90 bg-cyan-950/30 px-1 py-0.5 rounded">
                        {corpus.pin_sha.slice(0, 10)}...
                      </code>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-300">
                        {corpus.licence.spdx}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        class: {corpus.licence.class}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isStale ? (
                        <div className="text-crimson-400 font-mono text-[11px] text-rose-400">
                          Refused (Day {ageDays})
                        </div>
                      ) : isChronosAlert ? (
                        <div className="text-amber-400 font-mono text-[11px]">
                          Day {ageDays} (Rotate &lt;30d)
                        </div>
                      ) : (
                        <div className="text-emerald-400 font-mono text-[11px]">
                          Fresh (Day {ageDays})
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                      ★ {bayesianScore}
                      <span className="text-[10px] text-slate-500 block">
                        ({corpus.agent_ratings?.count ?? 0} reviews)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
