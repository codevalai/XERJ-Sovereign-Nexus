import React from 'react';

export type ActiveTab =
  | 'repo'
  | 'constellation'
  | 'router'
  | 'expansion'
  | 'skills'
  | 'discovery'
  | 'ritual'
  | 'tribunal'
  | 'forge'
  | 'security'
  | 'swarm';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRefreshHealth: () => void;
  isHealthRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRefreshHealth,
  isHealthRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 px-6 py-3.5 bg-[#06080D]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element Brand wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('constellation');
          }}
          className="text-base font-bold tracking-tight text-slate-100 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
        >
          XERJ Sovereign Nexus
        </a>
        <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
          v2.0
        </span>
      </div>

      {/* Zone 2: Single-line navigation tabs */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onTabChange('repo')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors flex items-center gap-1.5 ${
            activeTab === 'repo'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          <span>📦</span>
          <span>GitHub Repo</span>
        </button>
        <button
          onClick={() => onTabChange('constellation')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'constellation'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          3D Radar
        </button>
        <button
          onClick={() => onTabChange('router')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'router'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Federated Router
        </button>
        <button
          onClick={() => onTabChange('expansion')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'expansion'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Expansion Hub
        </button>
        <button
          onClick={() => onTabChange('skills')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'skills'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Skills Registry
        </button>
        <button
          onClick={() => onTabChange('discovery')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'discovery'
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
              : 'hover:text-slate-200'
          }`}
        >
          Agentic Discovery
        </button>
        <button
          onClick={() => onTabChange('ritual')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'ritual'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Send Your Pack
        </button>
        <button
          onClick={() => onTabChange('tribunal')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'tribunal'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Relevance Tribunal
        </button>
        <button
          onClick={() => onTabChange('forge')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'forge'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Pack Forge
        </button>
        <button
          onClick={() => onTabChange('security')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'security'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          Zero-Trust & MCP
        </button>
        <button
          onClick={() => onTabChange('swarm')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
            activeTab === 'swarm'
              ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
              : 'hover:text-slate-200'
          }`}
        >
          A2A Swarm
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefreshHealth}
          disabled={isHealthRefreshing}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          {isHealthRefreshing ? 'Checking Mesh...' : 'Sweep Tri-Node Mesh'}
        </button>
      </div>
    </header>
  );
};
