import React, { useState } from 'react';
import { AgentCard } from '../shared/xerjSchemas.js';

interface A2ASwarmTabProps {
  agents: AgentCard[];
  onPulseAgent: (agent: AgentCard) => Promise<void>;
  onRejuvenateAgent: (agentId: string) => Promise<void>;
  onDelegateTask: (params: {
    creatorAgentId: string;
    assigneeAgentId: string;
    taskTitle: string;
    taskPayload: Record<string, unknown>;
  }) => Promise<any>;
  tasks: any[];
  onGenerateGreeting: (visitingAgent: any) => Promise<any>;
  onSelfEvolve: (params: any) => Promise<any>;
}

const AKASH_SDL_YAML = `version: "2.0"
services:
  nats-bus:
    image: nats:2.10-alpine
    command: ["nats-server", "-js", "-sd", "/data"]
    expose:
      - port: 4222
        as: 4222
        to:
          - service: pillar-watchtower
    params:
      storage:
        nats-jetstream:
          mount: /data
          readOnly: false
  pillar-watchtower:
    image: ghcr.io/codevalai/xerj-sovereign-pillar:1.0.0
    command: ["node", "dist/index.js", "watchtower"]
    env:
      - XERJ_CORPORA_DIR=/corpora
      - NATS_URL=nats://nats-bus:4222
      - GITHUB_TOKEN=\${GITHUB_TOKEN}
    expose:
      - port: 9200
        as: 9200
        to:
          - global: false
    params:
      storage:
        xerj-corpora-nvme:
          mount: /corpora
          readOnly: false
profiles:
  compute:
    nats-bus:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 512Mi
          - name: nats-jetstream
            size: 5Gi
            attributes:
              persistent: true
              class: beta3
    pillar-watchtower:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 4Gi
        storage:
          - size: 2Gi
          - name: xerj-corpora-nvme
            size: 100Gi
            attributes:
              persistent: true
              class: beta3
  placement:
    akash-sovereign-dc:
      pricing:
        nats-bus:
          denom: uakt
          amount: 250
        pillar-watchtower:
          denom: uakt
          amount: 1200
deployment:
  nats-bus:
    akash-sovereign-dc:
      profile: nats-bus
      count: 1
  pillar-watchtower:
    akash-sovereign-dc:
      profile: pillar-watchtower
      count: 2`;

export const A2ASwarmTab: React.FC<A2ASwarmTabProps> = ({
  agents,
  onRejuvenateAgent,
  onDelegateTask,
  tasks,
  onGenerateGreeting,
  onSelfEvolve,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'agents' | 'chronos' | 'zk-fabric' | 'escrow' | 'greeter' | 'evolution' | 'akash'
  >('agents');

  // Chronos Perpetual Loop State
  const [chronosStatus, setChronosStatus] = useState<any>(null);
  const [chronosLoading, setChronosLoading] = useState(false);
  const [chronosPulsePhase, setChronosPulsePhase] = useState<'pulse_00' | 'delta_08' | 'crdt_16'>('pulse_00');

  // ZK Agent Proof Fabric State
  const [zkClaimAgentId, setZkClaimAgentId] = useState('agent-sentinel-prime');
  const [zkNamespace, setZkNamespace] = useState('escrow-crdt-root');
  const [zkPrevStateRoot, setZkPrevStateRoot] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [zkMemoryHash, setZkMemoryHash] = useState('f92837416a501928374efb1029384716a501928374efb1029384716a50192837');
  const [zkExecutionSuccess, setZkExecutionSuccess] = useState(true);
  const [zkReceipt, setZkReceipt] = useState<any>(null);
  const [zkVerifying, setZkVerifying] = useState(false);
  const [zkVerifyResult, setZkVerifyResult] = useState<any>(null);
  const [zkGenerating, setZkGenerating] = useState(false);
  const [zkError, setZkError] = useState<string | null>(null);

  // Task escrow state
  const [creatorId, setCreatorId] = useState(agents[0]?.agentId || 'agent-sentinel-prime');
  const [assigneeId, setAssigneeId] = useState(agents[1]?.agentId || 'openclaw-sec-crawler');
  const [taskTitle, setTaskTitle] = useState('Audit CVE-2026-1189 in Rust Memory Safety');
  const [delegating, setDelegating] = useState(false);

  // Greeter state
  const [visitingPlatform, setVisitingPlatform] = useState('OpenClaw');
  const [visitingStack, setVisitingStack] = useState('rust, tokio, actix');
  const [visitingAge, setVisitingAge] = useState(25);
  const [greetingResult, setGreetingResult] = useState<any>(null);
  const [greetingLoading, setGreetingLoading] = useState(false);

  // Evolution state
  const [evoTask, setEvoTask] = useState('Retrieve memory safety advisories with 0% token overflow');
  const [evoPrompt, setEvoPrompt] = useState('You are a coding assistant. Search the codebase and fix the bug.');
  const [evoTokens, setEvoTokens] = useState(4800);
  const [evoLatency, setEvoLatency] = useState(2400);
  const [evoResult, setEvoResult] = useState<any>(null);
  const [evolving, setEvolving] = useState(false);

  // Rejuvenation state
  const [rejuvenatingId, setRejuvenatingId] = useState<string | null>(null);

  // Akash copy state
  const [copiedSdl, setCopiedSdl] = useState(false);

  const handleCreateTask = async () => {
    setDelegating(true);
    try {
      await onDelegateTask({
        creatorAgentId: creatorId,
        assigneeAgentId: assigneeId,
        taskTitle,
        taskPayload: { priority: 'P0_CRITICAL', targetCorpus: 'rust-vulns', timeLimitMs: 5000 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setDelegating(false);
    }
  };

  const handleRunGreeter = async () => {
    setGreetingLoading(true);
    try {
      const res = await onGenerateGreeting({
        agentId: `claw-${Date.now().toString(36).slice(2, 6)}`,
        platform: visitingPlatform,
        activeStack: visitingStack.split(',').map(s => s.trim()),
        daysUntilStaleness: Number(visitingAge),
      });
      setGreetingResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setGreetingLoading(false);
    }
  };

  const handleRunEvolution = async () => {
    setEvolving(true);
    try {
      const res = await onSelfEvolve({
        taskDescription: evoTask,
        currentPrompt: evoPrompt,
        tokenCost: evoTokens,
        latencyMs: evoLatency,
      });
      setEvoResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvolving(false);
    }
  };

  const handleRejuvenate = async (id: string) => {
    setRejuvenatingId(id);
    try {
      await onRejuvenateAgent(id);
    } catch (err) {
      console.error(err);
    } finally {
      setRejuvenatingId(null);
    }
  };

  // Fetch Chronos Status
  const fetchChronos = async () => {
    try {
      const res = await fetch('/api/chronos/status');
      if (res.ok) {
        const data = await res.json();
        setChronosStatus(data);
      }
    } catch (err) {
      console.warn('Chronos fetch error:', err);
    }
  };

  // Trigger Chronos Pulse
  const handleTriggerChronosPulse = async () => {
    setChronosLoading(true);
    try {
      const res = await fetch('/api/chronos/trigger-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: chronosPulsePhase }),
      });
      if (res.ok) {
        const data = await res.json();
        setChronosStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to trigger Chronos cycle:', err);
    } finally {
      setChronosLoading(false);
    }
  };

  // Generate ZK Proof
  const handleGenerateZkProof = async () => {
    setZkGenerating(true);
    setZkError(null);
    setZkVerifyResult(null);
    try {
      const res = await fetch('/api/zk/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: zkClaimAgentId,
          namespace: zkNamespace,
          previousStateRoot: zkPrevStateRoot,
          memoryPayloadHash: zkMemoryHash,
          executionSuccess: zkExecutionSuccess,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ZK proof generation failed');
      }
      setZkReceipt(data.receipt);
    } catch (err: any) {
      setZkError(err.message || 'ZK proof error');
    } finally {
      setZkGenerating(false);
    }
  };

  // Verify ZK Proof
  const handleVerifyZkProof = async () => {
    if (!zkReceipt) return;
    setZkVerifying(true);
    try {
      const res = await fetch('/api/zk/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: {
            agentId: zkClaimAgentId,
            namespace: zkNamespace,
            previousStateRoot: zkPrevStateRoot,
            memoryPayloadHash: zkMemoryHash,
            executionSuccess: zkExecutionSuccess,
            timestamp: new Date().toISOString(),
          },
          receipt: zkReceipt,
        }),
      });
      const data = await res.json();
      setZkVerifyResult(data);
    } catch (err) {
      console.error('ZK verification failed:', err);
    } finally {
      setZkVerifying(false);
    }
  };

  // Auto-fetch chronos when sub-tab is clicked
  React.useEffect(() => {
    if (activeSubTab === 'chronos') {
      fetchChronos();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation Controls */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#090D16] rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('agents')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'agents' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Agent Registry & 30d Sentinel
        </button>
        <button
          onClick={() => setActiveSubTab('chronos')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'chronos' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Chronos Perpetual Loop (24h)
        </button>
        <button
          onClick={() => setActiveSubTab('zk-fabric')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'zk-fabric' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          zk-ASPF Proof Fabric
        </button>
        <button
          onClick={() => setActiveSubTab('escrow')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'escrow' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          JSON-RPC Task Escrow
        </button>
        <button
          onClick={() => setActiveSubTab('greeter')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'greeter' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Swarm Greeter & Outreach
        </button>
        <button
          onClick={() => setActiveSubTab('evolution')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'evolution' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Self-Evolution Engine
        </button>
        <button
          onClick={() => setActiveSubTab('akash')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'akash' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Akash SDL Manifest
        </button>
      </div>

      {/* 1. Dynamic Agent Registry & 30-Day Sentinel */}
      {activeSubTab === 'agents' && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">
                Agent-to-Agent (A2A) Registry & 30-Day Staleness Countdown
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                /_agent/manifest Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Monitors external agent nodes across platforms (Claude Code, OpenClaw, Cursor). Refreshes pinned corpus timestamps at Day 24 before the 30-day refusal cliff hits!
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                  <th className="py-2.5 px-3">AGENT & PLATFORM</th>
                  <th className="py-2.5 px-3">BOUND CORPUS</th>
                  <th className="py-2.5 px-3">SPECIALIZED SKILLS</th>
                  <th className="py-2.5 px-3">30-DAY COUNTDOWN</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {agents.map((agent) => {
                  const pinMs = new Date(agent.corpusPinDate).getTime();
                  const ageDays = ((Date.now() - pinMs) / (1000 * 60 * 60 * 24)).toFixed(1);
                  const isStale = Number(ageDays) > 30.0;
                  const isChronosAlert = Number(ageDays) >= 24.0 && !isStale;

                  return (
                    <tr key={agent.agentId} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-medium text-slate-200">{agent.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {agent.platform} · ★ {agent.bayesianReliabilityScore}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-cyan-400">
                        {agent.boundCorpusSlug}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {agent.supportedSkills.map((sk, i) => (
                            <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {isStale ? (
                          <span className="text-rose-400 font-bold">EXPIRED ({ageDays}d)</span>
                        ) : isChronosAlert ? (
                          <span className="text-amber-400 font-semibold">{ageDays}d / 30d (ALERT)</span>
                        ) : (
                          <span className="text-emerald-400">{ageDays}d / 30d (FRESH)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {agent.status === 'ONLINE_HEALTHY' && (
                          <span className="text-emerald-400">ONLINE</span>
                        )}
                        {agent.status === 'NEARING_STALENESS' && (
                          <span className="text-amber-400">ROTATION DUE</span>
                        )}
                        {agent.status === 'EXPIRED_REFUSED' && (
                          <span className="text-rose-400">REFUSED</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRejuvenate(agent.agentId)}
                          disabled={rejuvenatingId === agent.agentId}
                          className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-colors whitespace-nowrap"
                        >
                          {rejuvenatingId === agent.agentId ? 'Delta Pulling...' : '↻ Re-Index (Day 0)'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Chronos-P2P Perpetual Agent Loop */}
      {activeSubTab === 'chronos' && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-200">
                  Chronos-P2P Perpetual Agent Loop (24h Autonomous Cycle)
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  {chronosStatus?.isRunning ? 'ACTIVE 24/7' : 'INITIALIZING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Averts the 30-day index death spiral automatically via daily 00:00 UTC liveness heartbeats,
                08:00 UTC delta auto-indexing, and 16:00 UTC CRDT memory reconciliation with Ed25519-signed receipts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={chronosPulsePhase}
                onChange={e => setChronosPulsePhase(e.target.value as any)}
                className="bg-[#06080D] border border-slate-800 text-xs text-slate-200 font-mono px-2.5 py-1.5 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="pulse_00">00:00 UTC (Liveness Reset)</option>
                <option value="delta_08">08:00 UTC (Delta Auto-Index)</option>
                <option value="crdt_16">16:00 UTC (CRDT Merge & Mutate)</option>
              </select>
              <button
                onClick={handleTriggerChronosPulse}
                disabled={chronosLoading}
                className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {chronosLoading ? 'Executing Cycle...' : 'Pulse Phase Now &rarr;'}
              </button>
            </div>
          </div>

          {/* 3-Stage Daily Milestone Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#06080D] rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold">00:00 UTC</span>
                <span className="text-slate-500">Phase 1</span>
              </div>
              <h3 className="text-xs font-bold text-slate-200">Liveness Heartbeat Pulse</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Resets the 30-day refusal cliff to Day 0 (30.0d remaining) across all local XERJ nodes and hub.xerj.org.
              </p>
              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-emerald-400">
                &check; Emits Ed25519 signed pulse receipt
              </div>
            </div>

            <div className="p-4 bg-[#06080D] rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-semibold">08:00 UTC</span>
                <span className="text-slate-500">Phase 2</span>
              </div>
              <h3 className="text-xs font-bold text-slate-200">Delta Auto-Index Execution</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Delta-crawls GitHub advisory streams & upstream git commits. Ingests symbols into the 7-hash Bloom filter.
              </p>
              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-cyan-400">
                &check; Zero false negative guarantee
              </div>
            </div>

            <div className="p-4 bg-[#06080D] rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-semibold">16:00 UTC</span>
                <span className="text-slate-500">Phase 3</span>
              </div>
              <h3 className="text-xs font-bold text-slate-200">CRDT Merge & Prompt Mutate</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reconciles peer state trees into single Merkle root and triggers Bayesian self-evolution prompt mutation.
              </p>
              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-purple-400">
                &check; 0-conflict convergent state
              </div>
            </div>
          </div>

          {/* Telemetry Stat Cards */}
          {chronosStatus && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#06080D] border border-slate-800 rounded">
                <div className="text-slate-500 text-[11px]">Active TTL Remaining</div>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {chronosStatus.activeTtlDaysRemaining} Days
                </div>
              </div>

              <div className="p-3 bg-[#06080D] border border-slate-800 rounded">
                <div className="text-slate-500 text-[11px]">Completed Cycles</div>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {chronosStatus.completedCyclesCount} Pulses
                </div>
              </div>

              <div className="p-3 bg-[#06080D] border border-slate-800 rounded">
                <div className="text-slate-500 text-[11px]">Next Scheduled Phase</div>
                <div className="text-xs font-semibold text-cyan-400 mt-1 truncate">
                  {chronosStatus.nextPhaseName?.split(' ')[0]}
                </div>
              </div>

              <div className="p-3 bg-[#06080D] border border-slate-800 rounded">
                <div className="text-slate-500 text-[11px]">Next Trigger In</div>
                <div className="text-base font-bold text-amber-400 mt-1">
                  {chronosStatus.minutesUntilNextPhase} Minutes
                </div>
              </div>
            </div>
          )}

          {/* Signed Receipts Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-300">
              Cryptographically Signed Daily Cycle Receipts
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#06080D] border-b border-slate-800 font-mono text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Cycle ID</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">TTL Remaining</th>
                    <th className="py-2.5 px-3">Files / Symbols</th>
                    <th className="py-2.5 px-3">Ed25519 Receipt Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(chronosStatus?.recentLogs || []).map((log: any) => (
                    <tr key={log.cycleId} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200 text-[11px]">
                        {log.cycleId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-950/40 text-emerald-400">
                          {log.livenessStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 text-[11px]">
                        {log.activeTtlDaysRemaining}d
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {log.filesScanned?.toLocaleString()} files / +{log.newSymbolsIndexed} syms
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-400 truncate max-w-[200px]" title={log.receiptHash}>
                        {log.receiptHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Zero-Knowledge Cryptographic Agent State & Proof Fabric (zk-ASPF) */}
      {activeSubTab === 'zk-fabric' && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-200">
                  Zero-Knowledge Cryptographic Agent State & Proof Fabric (zk-ASPF)
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Groth16 / Circom Circuit Prover
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enables autonomous agents to prove memory state transitions and task completions without exposing sensitive payload data,
                guaranteeing non-repudiation and preventing replay attacks with cryptographic nullifiers.
              </p>
            </div>
          </div>

          {/* Interactive Prover Form */}
          <div className="rounded-lg border border-slate-800 bg-[#06080D] p-4 space-y-4">
            <div className="text-xs font-bold font-mono text-slate-200">
              Agent State Claim Parameters
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Agent Identifier</label>
                <input
                  type="text"
                  value={zkClaimAgentId}
                  onChange={e => setZkClaimAgentId(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">State Namespace</label>
                <input
                  type="text"
                  value={zkNamespace}
                  onChange={e => setZkNamespace(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Previous Merkle State Root</label>
                <input
                  type="text"
                  value={zkPrevStateRoot}
                  onChange={e => setZkPrevStateRoot(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Memory Transition Payload Hash</label>
                <input
                  type="text"
                  value={zkMemoryHash}
                  onChange={e => setZkMemoryHash(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-800 text-xs text-slate-200 font-mono px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={zkExecutionSuccess}
                  onChange={e => setZkExecutionSuccess(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
                <span>Execution Success Invariant (Circuit constraint Q_exec = 1)</span>
              </label>

              <button
                onClick={handleGenerateZkProof}
                disabled={zkGenerating}
                className="px-4 py-2 text-xs font-mono font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {zkGenerating ? 'Evaluating ZK Constraints...' : 'Generate ZK Proof & Nullifier'}
              </button>
            </div>

            {zkError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-xs font-mono text-rose-300">
                &cross; {zkError}
              </div>
            )}
          </div>

          {/* Generated Proof Receipt & Peer Verification */}
          {zkReceipt && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400">
                  &check; ZK-SNARK State Proof Emitted Successfully
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Protocol: {zkReceipt.proofProtocol}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">Groth16 Polynomial Commitment:</div>
                  <div className="text-slate-200 break-all text-[11px]">
                    {zkReceipt.zkCommitment}
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">Cryptographic Nullifier (Anti-Double Spend):</div>
                  <div className="text-amber-400 break-all text-[11px]">
                    {zkReceipt.nullifierHash}
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">Canonical Claim Hash:</div>
                  <div className="text-slate-300 break-all text-[11px]">
                    {zkReceipt.claimHash}
                  </div>
                </div>

                <div className="p-2.5 bg-[#06080D] border border-slate-800 rounded space-y-1">
                  <div className="text-slate-500 text-[11px]">Proven Timestamp:</div>
                  <div className="text-emerald-400 text-[11px]">
                    {zkReceipt.provenAtIso}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  {zkVerifyResult && (
                    <span className={`text-xs font-mono font-semibold ${zkVerifyResult.verified ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {zkVerifyResult.verified ? '✓ Peer Proof Cryptographically Verified' : `✗ Verification Failed: ${zkVerifyResult.reason}`}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleVerifyZkProof}
                  disabled={zkVerifying}
                  className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors whitespace-nowrap"
                >
                  {zkVerifying ? 'Verifying Math...' : 'Verify Peer Proof & Nullifier Invariant &rarr;'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. JSON-RPC Task Escrow Console */}
      {activeSubTab === 'escrow' && (
        <div className="space-y-5">
          <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">
                  A2A Cryptographic Task & State Escrow
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  JSON-RPC 2.0 /_memory/escrow
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Allows an orchestrator agent to delegate sub-tasks to specialist agents. State is locked into an ephemeral XERJ memory index signed with Ed25519.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Creator Agent:</label>
                <select
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                >
                  {agents.map(a => (
                    <option key={a.agentId} value={a.agentId}>{a.name} ({a.platform})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Assignee Specialist Agent:</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                >
                  {agents.map(a => (
                    <option key={a.agentId} value={a.agentId}>{a.name} ({a.platform})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Task Directive:</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <button
              onClick={handleCreateTask}
              disabled={delegating}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap"
            >
              {delegating ? 'Locking into Escrow...' : 'Lock Task into Escrow & Sign'}
            </button>
          </div>

          {/* Active Escrow Tasks */}
          <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Active Escrow Tasks ({tasks.length})</h3>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-3">No active escrow tasks. Delegate one above.</div>
              ) : (
                tasks.map((task: any) => (
                  <div key={task.taskId} className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{task.taskTitle}</span>
                      <span className="text-emerald-400 text-[11px] bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        {task.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                      <span>{task.creatorAgentId} ➔ {task.assigneeAgentId}</span>
                      <span>·</span>
                      <span className="text-cyan-400">Namespace: {task.escrowMemoryNamespace}</span>
                      <span>·</span>
                      <span className="text-slate-500">Sig: {task.ed25519SignatureHex.slice(0, 16)}...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Swarm Greeter & Outreach */}
      {activeSubTab === 'greeter' && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">
                Autonomous Outreach & Platform Greeter Protocol
              </h2>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                OpenClaw & External Agent Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Discovers external agents checking in via webhook/SSE, pitches relevant Corpus Hub packs based on their stack, and alerts them before their 30-day index dies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Visiting Platform:</label>
              <input
                type="text"
                value={visitingPlatform}
                onChange={(e) => setVisitingPlatform(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Active Tech Stack:</label>
              <input
                type="text"
                value={visitingStack}
                onChange={(e) => setVisitingStack(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Days Until Staleness Cliff:</label>
              <input
                type="number"
                value={visitingAge}
                onChange={(e) => setVisitingAge(Number(e.target.value))}
                className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleRunGreeter}
            disabled={greetingLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            {greetingLoading ? 'Synthesizing Greeting...' : 'Generate Targeted Greeting & Pitch'}
          </button>

          {greetingResult && (
            <div className="p-4 bg-[#06080D] rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">PITCH OUTPUT:</span>
                {greetingResult.urgencyFlag ? (
                  <span className="text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded text-[11px]">
                    ⚠️ Expiration Warning Included
                  </span>
                ) : (
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
                    Optimal Pitch
                  </span>
                )}
              </div>
              <p className="text-slate-200 leading-relaxed">{greetingResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. Autonomous Self-Evolution Engine */}
      {activeSubTab === 'evolution' && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">
                Autonomous Self-Evolution & Prompt Mutation Loop
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Gemini Flash Reflection Gate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Inspects execution telemetry (tokens, latency, retrieval errors) and mutates the agent prompt to optimize for XERJ AST symbol extraction and budget constraints.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Target Task Description:</label>
              <input
                type="text"
                value={evoTask}
                onChange={(e) => setEvoTask(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Measured Tokens:</label>
                <input
                  type="number"
                  value={evoTokens}
                  onChange={(e) => setEvoTokens(Number(e.target.value))}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Measured Latency (ms):</label>
                <input
                  type="number"
                  value={evoLatency}
                  onChange={(e) => setEvoLatency(Number(e.target.value))}
                  className="w-full bg-[#06080D] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Current Operating System Prompt:</label>
              <textarea
                rows={3}
                value={evoPrompt}
                onChange={(e) => setEvoPrompt(e.target.value)}
                className="w-full bg-[#06080D] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
              />
            </div>

            <button
              onClick={handleRunEvolution}
              disabled={evolving}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
            >
              {evolving ? 'Analyzing & Mutating...' : 'Trigger Autonomous Self-Evolution'}
            </button>
          </div>

          {evoResult && (
            <div className="p-4 bg-[#06080D] rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-emerald-400 font-bold">MUTATION EVOLUTION REPORT:</div>
              <p className="text-slate-400">{evoResult.reasoning}</p>
              <div className="text-slate-500 text-[11px] pt-1">MUTATED PROMPT:</div>
              <pre className="p-2.5 bg-[#090D16] rounded border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre-wrap">
                {evoResult.mutatedPrompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 5. Akash SDL Deployment Manifest */}
      {activeSubTab === 'akash' && (
        <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-200">
                  Akash Watchtower Swarm Manifest (deploy.sdl.yaml)
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  24/7 Zero Rate-Limit Deployment
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Deploys multi-worker Chronos-Sentinel Watchtower + NATS JetStream + persistent NVMe storage on Akash for pennies per day.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(AKASH_SDL_YAML);
                setCopiedSdl(true);
                setTimeout(() => setCopiedSdl(false), 2000);
              }}
              className="px-3 py-1.5 text-xs font-mono font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap"
            >
              {copiedSdl ? 'Copied SDL!' : 'Copy deploy.sdl.yaml'}
            </button>
          </div>

          <pre className="p-3.5 bg-[#06080D] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96">
            {AKASH_SDL_YAML}
          </pre>
        </div>
      )}
    </div>
  );
};
