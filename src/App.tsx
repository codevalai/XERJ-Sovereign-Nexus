import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header.js';
import { MeshStatusHUD } from './components/MeshStatusHUD.js';
import { ConstellationTab } from './components/ConstellationTab.js';
import { FederatedRouterTab } from './components/FederatedRouterTab.js';
import { TribunalTab } from './components/TribunalTab.js';
import { PackForgeTab } from './components/PackForgeTab.js';
import { ZeroTrustAndMcpTab } from './components/ZeroTrustAndMcpTab.js';
import { A2ASwarmTab } from './components/A2ASwarmTab.js';
import { ExpansionHubTab } from './components/ExpansionHubTab.js';
import { SkillVettingTab } from './components/SkillVettingTab.js';
import { AgenticDiscoveryTab } from './components/AgenticDiscoveryTab.js';
import { ContributorRitualTab } from './components/ContributorRitualTab.js';
import { RepoHubTab } from './components/RepoHubTab.js';
import { BottlenecksTab } from './components/BottlenecksTab.js';
import { ByzantineConsensusTab } from './components/ByzantineConsensusTab.js';
import {
  CatalogueEntry,
  HubDomain,
  AgentCard,
  RawPassageInput,
  TribunalOutput,
  ZeroTrustPolicy,
} from './shared/xerjSchemas.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('constellation');
  const [selectedDomain, setSelectedDomain] = useState<HubDomain | 'ALL'>('ALL');

  // Tri-Node Mesh Health
  const [meshHealth, setMeshHealth] = useState<any>(null);
  const [isHealthRefreshing, setIsHealthRefreshing] = useState(false);

  // Catalogue & Release-Gaps
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([]);
  const [releaseGaps, setReleaseGaps] = useState<any>(null);
  const [isScanningGaps, setIsScanningGaps] = useState(false);

  // Routing & Tribunal Data
  const [currentQuestion, setCurrentQuestion] = useState(
    'How do we verify atomic WAL rotation and acquire exclusive advisory lock?'
  );
  const [routingData, setRoutingData] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);

  const [tribunalData, setTribunalData] = useState<TribunalOutput | null>(null);
  const [isTribunalLoading, setIsTribunalLoading] = useState(false);
  const [passages, setPassages] = useState<RawPassageInput[]>([]);

  // A2A Swarm & Escrow
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Security Policy
  const [securityPolicy, setSecurityPolicy] = useState<ZeroTrustPolicy>({
    blockOperatorWalTap: true,
    isolateMemoryNamespaces: true,
    stripExfiltrationRerank: true,
    activeClientPrefix: 'agent-',
  });

  // 1. Initial Load of Mesh Health & Catalogue
  const fetchHealth = useCallback(async () => {
    setIsHealthRefreshing(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setMeshHealth(data);
      }
    } catch (err) {
      console.warn('Health fetch error:', err);
    } finally {
      setIsHealthRefreshing(false);
    }
  }, []);

  const fetchCatalogue = useCallback(async () => {
    try {
      const res = await fetch('/api/catalogue');
      if (res.ok) {
        const data = await res.json();
        setCatalogue(data.entries || []);
      }
    } catch (err) {
      console.warn('Catalogue fetch error:', err);
    }
  }, []);

  const fetchAgentsAndTasks = useCallback(async () => {
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch('/api/a2a/agents'),
        fetch('/api/a2a/tasks'),
      ]);
      if (agentsRes.ok) {
        const aData = await agentsRes.json();
        setAgents(aData.agents || []);
      }
      if (tasksRes.ok) {
        const tData = await tasksRes.json();
        setTasks(tData.tasks || []);
      }
    } catch (err) {
      console.warn('Agents fetch error:', err);
    }
  }, []);

  const fetchPolicy = useCallback(async () => {
    try {
      const res = await fetch('/api/security/policy');
      if (res.ok) {
        const data = await res.json();
        setSecurityPolicy(data);
      }
    } catch (err) {
      console.warn('Policy fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchCatalogue();
    fetchAgentsAndTasks();
    fetchPolicy();
    // Default initial scan of release gaps
    handleScanReleaseGaps();
  }, [fetchHealth, fetchCatalogue, fetchAgentsAndTasks, fetchPolicy]);

  // Scan Release Gaps
  const handleScanReleaseGaps = async () => {
    setIsScanningGaps(true);
    try {
      const res = await fetch('/api/release-gaps');
      if (res.ok) {
        const data = await res.json();
        setReleaseGaps(data);
      }
    } catch (err) {
      console.warn('Release gaps error:', err);
    } finally {
      setIsScanningGaps(false);
    }
  };

  // Inject Shadow Pack into Synthetic Catalogue
  const handleInjectShadowPack = async (pack: {
    slug: string;
    domain: string;
    packUrl: string;
    sigUrl?: string;
    sizeBytes: number;
  }) => {
    try {
      const res = await fetch('/api/catalogue/inject-shadow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pack),
      });
      if (res.ok) {
        await fetchCatalogue();
        await handleScanReleaseGaps();
      }
    } catch (err) {
      console.error('Inject error:', err);
    }
  };

  // Execute Federated Routing Pipeline
  const handleExecuteRoute = async (params: {
    question: string;
    lockfileContent?: string;
    lockfileType?: 'Cargo.lock' | 'package.json' | 'go.mod';
    allowedLicenceClasses?: any[];
    maxPacksToFederate?: number;
  }) => {
    setIsRouting(true);
    setCurrentQuestion(params.question);
    try {
      const res = await fetch('/api/federated-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: params.question,
          lockfileContent: params.lockfileContent || '',
          lockfileType: params.lockfileType || 'Cargo.lock',
          allowedLicenceClasses: params.allowedLicenceClasses || ['permissive', 'weak-copyleft'],
          maxPacksToFederate: params.maxPacksToFederate || 3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoutingData(data);
      }
    } catch (err) {
      console.error('Routing error:', err);
    } finally {
      setIsRouting(false);
    }
  };

  // Run Relevance & Prompt-Injection Tribunal
  const handleRunTribunal = async (question: string) => {
    setIsTribunalLoading(true);
    setCurrentQuestion(question);
    try {
      const res = await fetch('/api/tribunal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (res.ok) {
        const data = await res.json();
        setTribunalData(data);
      }
    } catch (err) {
      console.error('Tribunal error:', err);
    } finally {
      setIsTribunalLoading(false);
    }
  };

  // Pre-seed sample passages if empty
  useEffect(() => {
    if (passages.length === 0) {
      setPassages([
        {
          corpusSlug: 'rust-vulns',
          file: 'crates/audit/src/memory_safety.rs',
          lineStart: 42,
          lineEnd: 88,
          rawScore: 0.94,
          snippet: `pub fn verify_atomic_wal_rotation(segment_id: u64, path: &Path) -> Result<WalLease, WalError> {
    // Audit check: CVE-2026-1189 prevents race conditions during WAL shm unlinking
    let lock_guard = acquire_exclusive_advisory_lock(path)?;
    if segment_id == 0 {
        return Err(WalError::CorruptHeader("zero segment disallowed"));
    }
    let lease = WalLease::init_pinned(segment_id, lock_guard);
    Ok(lease)
}`,
          licenceSpdx: 'CC-BY-4.0',
        },
        {
          corpusSlug: 'ai-bug-bounty-2',
          file: 'firewall/context_scrubber.py',
          lineStart: 104,
          lineEnd: 156,
          rawScore: 0.91,
          snippet: `def airlock_scrub_prompt_injection(raw_payload: str) -> Tuple[str, int]:
    """Neutralizes indirect prompt injection in untrusted code comments without altering line counts."""
    sanitized = re.sub(r'[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]', '', raw_payload)
    patterns = [r'ignore\\s+all\\s+previous\\s+instructions', r'<system_prompt_override>']
    redacted_count = 0
    for p in patterns:
        sanitized, count = re.subn(p, '[AIRLOCK_REDACTED_INJECTION]', sanitized, flags=re.IGNORECASE)
        redacted_count += count
    return sanitized, redacted_count`,
          licenceSpdx: 'Apache-2.0',
        },
        {
          corpusSlug: 'stripe-openapi',
          file: 'openapi/spec3.yaml',
          lineStart: 812,
          lineEnd: 850,
          rawScore: 0.88,
          snippet: `/v1/payment_intents:
  post:
    summary: Create a PaymentIntent
    parameters:
      - name: Idempotency-Key
        in: header
        required: true
        schema: { type: string, pattern: '^[a-zA-Z0-9_-]{24,128}$' }
    requestBody:
      required: true
      content:
        application/x-www-form-urlencoded:
          schema:
            properties:
              amount: { type: integer, minimum: 50 }
              currency: { type: string, minLength: 3, maxLength: 3 }`,
          licenceSpdx: 'MIT',
        },
      ]);
    }
  }, [passages.length]);

  // Seed Local Decision Memory
  const handleSeedLocalDecision = async (passage: RawPassageInput, label: string) => {
    await fetch('/api/seed-local-decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: currentQuestion, passage, label }),
    });
  };

  // Route query from Expansion Hub into Federated Router
  const handleExpansionRoute = (query: string, domain?: HubDomain) => {
    setCurrentQuestion(query);
    if (domain) {
      setSelectedDomain(domain);
    }
    setActiveTab('router');
    handleExecuteRoute({ question: query });
  };

  // Pack Forge: Lane A & B
  const handleStageLaneA = async (ownerRepo: string) => {
    const res = await fetch('/api/forge/lane-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerRepo }),
    });
    return await res.json();
  };

  const handleCompileLaneB = async (spec: any, privKeyHex?: string) => {
    const res = await fetch('/api/forge/lane-b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec, operatorPrivKeyHex: privKeyHex }),
    });
    return await res.json();
  };

  // A2A Swarm Handlers
  const handlePulseAgent = async (agent: AgentCard) => {
    await fetch('/api/a2a/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent }),
    });
    await fetchAgentsAndTasks();
  };

  const handleRejuvenateAgent = async (agentId: string) => {
    await fetch('/api/a2a/rejuvenate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    await fetchAgentsAndTasks();
  };

  const handleDelegateTask = async (params: any) => {
    const res = await fetch('/api/a2a/task-delegate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await fetchAgentsAndTasks();
    return await res.json();
  };

  const handleGenerateGreeting = async (visitingAgent: any) => {
    const res = await fetch('/api/a2a/greeter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitingAgent }),
    });
    return await res.json();
  };

  const handleSelfEvolve = async (params: any) => {
    const res = await fetch('/api/self-evolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  };

  // Security Policy Updates
  const handleUpdatePolicy = async (updates: Partial<ZeroTrustPolicy>) => {
    const res = await fetch('/api/security/policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setSecurityPolicy(data);
    }
  };

  // Field Report Generation
  const handleGenerateFieldReport = async (params: any) => {
    const res = await fetch('/api/field-report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data.markdown || '';
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation (Strict 3-Zone Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefreshHealth={fetchHealth}
        isHealthRefreshing={isHealthRefreshing}
      />

      {/* Tri-Node Mesh Status HUD */}
      <MeshStatusHUD
        health={meshHealth}
        loading={isHealthRefreshing}
        onRefresh={fetchHealth}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'repo' && (
          <RepoHubTab onNavigateToRitual={() => setActiveTab('ritual')} />
        )}

        {activeTab === 'breakthroughs' && (
          <BottlenecksTab />
        )}

        {activeTab === 'consensus' && (
          <ByzantineConsensusTab />
        )}

        {activeTab === 'constellation' && (
          <ConstellationTab
            catalogue={catalogue}
            selectedDomain={selectedDomain}
            onSelectDomain={setSelectedDomain}
            onInjectShadowPack={handleInjectShadowPack}
            releaseGaps={releaseGaps}
            onScanReleaseGaps={handleScanReleaseGaps}
            isScanningGaps={isScanningGaps}
          />
        )}

        {activeTab === 'router' && (
          <FederatedRouterTab
            onExecuteRoute={handleExecuteRoute}
            routingData={routingData}
            loading={isRouting}
            onForwardToTribunal={(q) => {
              setCurrentQuestion(q);
              setActiveTab('tribunal');
              handleRunTribunal(q);
            }}
          />
        )}

        {activeTab === 'expansion' && (
          <ExpansionHubTab
            onRouteQuery={handleExpansionRoute}
            onPackCompiled={fetchCatalogue}
          />
        )}

        {activeTab === 'skills' && (
          <SkillVettingTab onRouteSkillQuery={handleExpansionRoute} />
        )}

        {activeTab === 'discovery' && (
          <AgenticDiscoveryTab />
        )}

        {activeTab === 'ritual' && (
          <ContributorRitualTab catalogue={catalogue} />
        )}

        {activeTab === 'tribunal' && (
          <TribunalTab
            currentQuestion={currentQuestion}
            tribunalData={tribunalData}
            loading={isTribunalLoading}
            onRunTribunal={handleRunTribunal}
            onSeedLocalDecision={handleSeedLocalDecision}
            passages={passages}
          />
        )}

        {activeTab === 'forge' && (
          <PackForgeTab
            onStageLaneA={handleStageLaneA}
            onCompileLaneB={handleCompileLaneB}
          />
        )}

        {activeTab === 'security' && (
          <ZeroTrustAndMcpTab
            policy={securityPolicy}
            onUpdatePolicy={handleUpdatePolicy}
            onGenerateFieldReport={handleGenerateFieldReport}
          />
        )}

        {activeTab === 'swarm' && (
          <A2ASwarmTab
            agents={agents}
            onPulseAgent={handlePulseAgent}
            onRejuvenateAgent={handleRejuvenateAgent}
            onDelegateTask={handleDelegateTask}
            tasks={tasks}
            onGenerateGreeting={handleGenerateGreeting}
            onSelfEvolve={handleSelfEvolve}
          />
        )}
      </main>

      {/* Clean Unboxed Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-xs text-slate-500 bg-[#06080D]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            <span>XERJ Corpus Hub v2 Control Plane</span>
            <span className="mx-2 text-slate-700">·</span>
            <span className="text-slate-400">78.6 GB Pinned Text</span>
            <span className="mx-2 text-slate-700">·</span>
            <span>Ed25519 Detached Provenance</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://hub.xerj.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              hub.xerj.org
            </a>
            <span className="text-slate-700">·</span>
            <a
              href="https://github.com/xerj-org/xerj"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              xerj-org/xerj
            </a>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400/80">Apache-2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
