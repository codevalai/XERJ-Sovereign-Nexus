import React from 'react';

interface MeshHealthData {
  timestamp: string;
  nodes: {
    primaryLocal: { url: string; status: string; mode: string };
    ephemeralHubDaemon: { url: string; status: string; role: string };
    hostedHub: { url: string; status: string; feedbackHeaderDisabled: boolean };
  };
  activeCorporaCount: number;
  domainsActive: number;
}

interface MeshStatusHUDProps {
  health: MeshHealthData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const MeshStatusHUD: React.FC<MeshStatusHUDProps> = ({ health, loading, onRefresh }) => {
  return (
    <div className="bg-[#090D16] border-b border-slate-800/60 px-6 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Node Status Strips */}
        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">MESH NODES:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-300">Local Primary :9200</span>
              <span className="text-emerald-400 font-semibold">
                {health?.nodes.primaryLocal.status === 'ONLINE' ? 'ONLINE' : 'STANDALONE MODE'}
              </span>
            </div>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-300">Ephemeral Daemon :9300</span>
            <span className="text-amber-400">
              {health?.nodes.ephemeralHubDaemon.status === 'ONLINE' ? 'ACTIVE' : 'IDLE (ON-DEMAND)'}
            </span>
          </div>

          <span className="text-slate-700 hidden md:inline">|</span>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-300">hub.xerj.org</span>
            <span className="text-cyan-400">HOSTED API</span>
            <span className="text-[10px] text-slate-500">
              [X-Xerj-Disable-Feedback: 1]
            </span>
          </div>
        </div>

        {/* Global Corpus Stats & 30-Day Cliff Guard */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">CATALOGUE:</span>
            <span className="text-slate-200 font-semibold">{health?.activeCorporaCount ?? 11} packs</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">11 domains</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">CHRONOS GATE:</span>
            <span className="text-emerald-400 font-semibold">24d Sentinel Active</span>
            <span className="text-slate-500">(30d refusal cliff protected)</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
            title="Poll Tri-Node Mesh"
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>
    </div>
  );
};
