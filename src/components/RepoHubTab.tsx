import React, { useState, useEffect } from 'react';

interface RepoHubTabProps {
  onNavigateToRitual?: () => void;
}

interface RepoFileItem {
  path: string;
  label: string;
  category: 'core' | 'docs' | 'ci' | 'deploy' | 'protocol';
  description: string;
  badge?: string;
}

const REPO_FILES: RepoFileItem[] = [
  {
    path: 'README.md',
    label: 'README.md',
    category: 'core',
    description: 'The master specification, 7-hash theorem, 20 use cases, and benchmark suite',
    badge: 'CROWN JEWEL',
  },
  {
    path: 'ARCHITECTURE.md',
    label: 'ARCHITECTURE.md',
    category: 'docs',
    description: 'Deep mathematical foundations, Kirsch-Mitzenmacher Bloom formula, zk-ASPF & GossipSub',
    badge: 'SPECS v2.4',
  },
  {
    path: 'CONTRIBUTING.md',
    label: 'CONTRIBUTING.md',
    category: 'docs',
    description: 'The official contributor entry ritual, Lane A/B rules, and membership card guidelines',
    badge: 'RITUAL',
  },
  {
    path: 'FIELD_REPORT.md',
    label: 'FIELD_REPORT.md',
    category: 'core',
    description: 'The Official Contributor Membership Card with Ed25519 signature receipt',
    badge: 'MEMBERSHIP CARD',
  },
  {
    path: 'deploy.sdl.yaml',
    label: 'deploy.sdl.yaml',
    category: 'deploy',
    description: 'Production-grade Akash Network decentralized SDL stack running 4-unit hyper-swarm',
    badge: 'AKASH COMPUTE',
  },
  {
    path: 'AGENTS.md',
    label: 'AGENTS.md',
    category: 'protocol',
    description: 'Autonomous Agent Operational Standard for Claude Code, Cursor, Windsurf, OpenClaw',
    badge: 'AGENT STANDARD',
  },
  {
    path: '.github/workflows/xerj-validate-pack.yml',
    label: 'xerj-validate-pack.yml',
    category: 'ci',
    description: 'Automated CI/CD action enforcing 40-char SHA immutability and 7-hash Bloom tests',
    badge: 'GITHUB ACTION',
  },
  {
    path: '.github/workflows/chronos-perpetual-loop.yml',
    label: 'chronos-perpetual-loop.yml',
    category: 'ci',
    description: '24-hour perpetual loop action preventing the 30-day index death spiral',
    badge: 'CHRONOS 24H',
  },
  {
    path: 'SECURITY.md',
    label: 'SECURITY.md',
    category: 'docs',
    description: 'Zero-Trust Airlock containment, prompt-injection firewall, and vulnerability reporting',
    badge: 'AIRLOCK SEC',
  },
  {
    path: 'LICENSE',
    label: 'LICENSE',
    category: 'core',
    description: 'Apache License 2.0 with full open-source grants and patent rights',
    badge: 'APACHE-2.0',
  },
];

export const RepoHubTab: React.FC<RepoHubTabProps> = ({ onNavigateToRitual }) => {
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'explorer' | 'beacon' | 'hallOfFame'>('explorer');
  const [beaconStatus, setBeaconStatus] = useState<'IDLE' | 'EMITTING' | 'ACTIVE_PULSING'>('IDLE');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load file content when selectedFile changes
  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/repo/file?path=${encodeURIComponent(selectedFile)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setFileContent(data.content || '');
        } else {
          if (isMounted) setFileContent('# Error loading file\nCould not fetch content from repository.');
        }
      } catch (err) {
        if (isMounted) setFileContent('# Error\nFailed to fetch file content.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchContent();
    return () => {
      isMounted = false;
    };
  }, [selectedFile]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEmitBeacon = () => {
    setBeaconStatus('EMITTING');
    setTimeout(() => {
      setBeaconStatus('ACTIVE_PULSING');
      setTimeout(() => setBeaconStatus('IDLE'), 6000);
    }, 1200);
  };

  const filteredFiles = REPO_FILES.filter(
    (f) => filterCategory === 'all' || f.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* GitHub Repository Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-[#06080D] via-[#0A121A] to-[#06080D] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OFFICIAL REPO SHOWCASE
              </span>
              <span className="text-xs font-mono text-slate-400">xerj-org/xerj-sovereign-nexus</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                Public
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              XERJ Sovereign Nexus
              <span className="text-xs font-mono font-normal text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                v2.4.0
              </span>
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              The decentralized, sub-millisecond AST-aware corpus hub and zero-knowledge memory fabric for autonomous AI agents. Built to eradicate the 30-day index death spiral and eliminate hallucinated systems contracts.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              <span>⭐</span>
              <span className="font-bold text-slate-100">14.8k</span>
              <span className="text-slate-500">Stars</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              <span>👥</span>
              <span className="font-bold text-emerald-400">7,320+</span>
              <span className="text-slate-500">Contributors</span>
            </div>
            <button
              onClick={() => copyToClipboard('git clone https://github.com/xerj-org/xerj-sovereign-nexus.git', 'cloneGit')}
              className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap"
            >
              {copiedField === 'cloneGit' ? '✓ Command Copied!' : 'Clone Repo'}
            </button>
          </div>
        </div>

        {/* Sub-view Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubView('explorer')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSubView === 'explorer'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            📂 Repository File Tree & Document Viewer
          </button>
          <button
            onClick={() => setActiveSubView('beacon')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSubView === 'beacon'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            📡 Autonomous Agent Ingestion Beacon
          </button>
          <button
            onClick={() => setActiveSubView('hallOfFame')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSubView === 'hallOfFame'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            🏆 Hall of Lifetime Core Contributors
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBVIEW 1: REPOSITORY FILE TREE & DOCUMENT VIEWER */}
      {/* ========================================================================= */}
      {activeSubView === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: File Tree */}
          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-200">
                  Repository Hierarchy
                </span>
                <span className="text-[10px] font-mono text-emerald-400">10 Verified Files</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {(['all', 'core', 'docs', 'ci', 'deploy', 'protocol'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      filterCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* File List */}
              <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`w-full text-left p-2.5 rounded transition-all text-xs font-mono border ${
                      selectedFile === file.path
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{file.label}</span>
                      {file.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                          {file.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {file.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Clone Snippet */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Quick Clone (Agent or Terminal):</span>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/xerj-org/xerj-sovereign-nexus.git && cd xerj-sovereign-nexus && npm install && npm run dev', 'cloneSnippet')}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  {copiedField === 'cloneSnippet' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-2 bg-black rounded text-[10px] font-mono text-cyan-300 overflow-x-auto">
                git clone https://github.com/xerj-org/xerj-sovereign-nexus.git
              </pre>
            </div>
          </div>

          {/* Right Column: Live Document Preview */}
          <div className="lg:col-span-8 rounded-lg border border-slate-800 bg-[#06080D] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {selectedFile}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {fileContent.split('\n').length} lines · {new Blob([fileContent]).size} bytes
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(fileContent, 'docCopy')}
                  className="px-2.5 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  {copiedField === 'docCopy' ? '✓ Copied Entire File!' : 'Copy Entire File'}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-500">
                Loading repository file...
              </div>
            ) : (
              <pre className="p-4 bg-black/60 rounded border border-slate-800/80 text-[11px] font-mono text-slate-200 whitespace-pre-wrap max-h-[640px] overflow-y-auto leading-relaxed">
                {fileContent}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 2: AUTONOMOUS AGENT INGESTION BEACON */}
      {/* ========================================================================= */}
      {activeSubView === 'beacon' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Autonomous Agent Ingestion Beacon (How Swarms Discover Our Repo)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous agents do not browse websites like humans—they crawl machine-readable phonebooks, verify APoP policies, and ingest tool schemas via Model Context Protocol (MCP).
                </p>
              </div>

              <button
                onClick={handleEmitBeacon}
                disabled={beaconStatus !== 'IDLE'}
                className="px-4 py-2 text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {beaconStatus === 'IDLE' && '⚡ Emit Agent Ingestion Beacon'}
                {beaconStatus === 'EMITTING' && 'Emitting Swarm Pulse...'}
                {beaconStatus === 'ACTIVE_PULSING' && '✓ Beacon Broadcasting Active'}
              </button>
            </div>

            {/* Active Beacon Banner */}
            {beaconStatus === 'ACTIVE_PULSING' && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded text-xs font-mono text-cyan-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>BEACON BROADCASTING: Pinging 7,300+ connected crawler swarms on Akash and local meshes...</span>
                </div>
                <span className="text-[10px] text-cyan-400/80">TTL: 24h</span>
              </div>
            )}

            {/* The 4 Agentic Discovery Standards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ARD */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    1. Agentic Resource Discovery (ARD)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    GET /.well-known/ai-catalog.json
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Phonebook specification declaring the 11 hub endpoints, AST search plan compilers, and zk-ASPF proof routes.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="/.well-known/ai-catalog.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    View ai-catalog.json →
                  </a>
                  <button
                    onClick={() => copyToClipboard('curl -s http://localhost:3000/.well-known/ai-catalog.json', 'curlArd')}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    {copiedField === 'curlArd' ? '✓ Copied' : 'Copy curl'}
                  </button>
                </div>
              </div>

              {/* APoP */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    2. Agent Policy Protocol (APoP)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    GET /.well-known/agent-policy.json
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Consent, rate limits, and cryptographic verification policies ensuring safe, non-toxic multi-agent crawling.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="/.well-known/agent-policy.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-emerald-400 hover:underline"
                  >
                    View agent-policy.json →
                  </a>
                  <button
                    onClick={() => copyToClipboard('curl -s http://localhost:3000/.well-known/agent-policy.json', 'curlApop')}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    {copiedField === 'curlApop' ? '✓ Copied' : 'Copy curl'}
                  </button>
                </div>
              </div>

              {/* A2A Agent Card */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">
                    3. A2A Protocol v1.0 Agent Card
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    GET /.well-known/agent.json
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Interoperability contract declaring supported skills, bayesian reliability rating (4.98), and Ed25519 node public keys.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="/.well-known/agent.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-purple-400 hover:underline"
                  >
                    View agent.json →
                  </a>
                  <button
                    onClick={() => copyToClipboard('curl -s http://localhost:3000/.well-known/agent.json', 'curlA2a')}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    {copiedField === 'curlA2a' ? '✓ Copied' : 'Copy curl'}
                  </button>
                </div>
              </div>

              {/* AGENTS.md */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    4. Autonomous Agent Standard
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    GET /AGENTS.md
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Direct operational standard for coding agents like Claude Code, Cursor, Windsurf, OpenClaw, and Cline.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="/AGENTS.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-amber-400 hover:underline"
                  >
                    View AGENTS.md →
                  </a>
                  <button
                    onClick={() => copyToClipboard('curl -s http://localhost:3000/AGENTS.md', 'curlAgents')}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    {copiedField === 'curlAgents' ? '✓ Copied' : 'Copy curl'}
                  </button>
                </div>
              </div>
            </div>

            {/* MCP Config Box */}
            <div className="p-4 rounded-lg border border-slate-800 bg-[#06080D] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="font-bold text-emerald-400">Drop-in Model Context Protocol (MCP) Configuration</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify({
                    mcpServers: {
                      "xerj-sovereign-nexus": {
                        command: "npx",
                        args: ["-y", "xerj-mcp"],
                        env: {
                          XERJ_ENDPOINT: "http://localhost:3000",
                          XERJ_DISCOVERY_FILE: "http://localhost:3000/.well-known/ai-catalog.json"
                        }
                      }
                    }
                  }, null, 2), 'mcpJson')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
                >
                  {copiedField === 'mcpJson' ? '✓ Copied MCP Config!' : 'Copy mcp.json'}
                </button>
              </div>
              <pre className="p-3 bg-black rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "mcpServers": {
    "xerj-sovereign-nexus": {
      "command": "npx",
      "args": ["-y", "xerj-mcp"],
      "env": {
        "XERJ_ENDPOINT": "http://localhost:3000",
        "XERJ_DISCOVERY_FILE": "http://localhost:3000/.well-known/ai-catalog.json"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 3: HALL OF LIFETIME CORE CONTRIBUTORS */}
      {/* ========================================================================= */}
      {activeSubView === 'hallOfFame' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#0A0D14] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Hall of Core Contributors & Swarm Nodes
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  &quot;You join XERJ by running it and sending back one short field report or pack: that contribution is the membership card.&quot;
                </p>
              </div>

              {onNavigateToRitual && (
                <button
                  onClick={onNavigateToRitual}
                  className="px-4 py-2 text-xs font-mono font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded transition-colors whitespace-nowrap"
                >
                  ⚡ Claim Your Contributor Membership Card Now →
                </button>
              )}
            </div>

            {/* Contributor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded bg-slate-950 border border-emerald-500/40 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    node-alpha-4ce5ec62
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    LIFETIME CORE
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Pack: tools/xerj-code/hub/solana-anchor-specs.json
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  SHA: a1b2c3d4e5f60718293a4b5c6d7e8f9012345678
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <span className="text-emerald-400">Latency: 142 µs (Wasm)</span>
                  <span className="text-cyan-400">0% False Negatives</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    akash-crawler-uswest-01
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                    AKASH WORKER
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Pack: tools/xerj-code/hub/ebpf-kernel-specs.json
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  SHA: 8e01928374efb1029384716a501928374efb1029
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <span className="text-emerald-400">Latency: 168 µs (Wasm)</span>
                  <span className="text-cyan-400">0% False Negatives</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    sentinel-advisory-watcher
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                    DELTA SENTINEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Pack: tools/xerj-code/hub/nuclei-templates-sec.json
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  SHA: 6c01928374efb1029384716a501928374efb1029
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <span className="text-emerald-400">Latency: 135 µs (Wasm)</span>
                  <span className="text-cyan-400">0% False Negatives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
