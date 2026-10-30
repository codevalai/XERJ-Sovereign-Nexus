import { createHash } from 'crypto';
import { AgentCard } from '../shared/xerjSchemas.js';
import { XerjProvenanceGate } from './xerjCryptoAndBloom.js';

const NOW = new Date('2026-10-29T21:00:00Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

export interface EscrowTask {
  taskId: string;
  creatorAgentId: string;
  assigneeAgentId: string;
  taskTitle: string;
  taskPayload: Record<string, unknown>;
  status: 'PENDING_MATCH' | 'LOCKED_IN_ESCROW' | 'EXECUTING' | 'VERIFIED_COMPLETED';
  escrowMemoryNamespace: string;
  ed25519SignatureHex: string;
  createdAtIso: string;
}

export interface CrdtDelta {
  hash: string;
  parentHash: string;
  nodeId: string;
  sequenceId: number;
  memoryKey: string;
  payload: string;
  timestamp: string;
}

export class XerjA2ASwarmManager {
  private agents = new Map<string, AgentCard>();
  private tasks = new Map<string, EscrowTask>();
  private crdtLedger = new Map<string, CrdtDelta>();
  private crdtHeads = new Map<string, string>(); // nodeId -> latest delta hash

  constructor() {
    this.seedInitialAgents();
  }

  private seedInitialAgents() {
    const keypair1 = XerjProvenanceGate.generateEd25519Keypair();
    const keypair2 = XerjProvenanceGate.generateEd25519Keypair();
    const keypair3 = XerjProvenanceGate.generateEd25519Keypair();

    const sampleAgents: AgentCard[] = [
      {
        agentId: 'agent-sentinel-prime',
        name: 'Chronos Sentinel Prime',
        version: '2.1.0',
        endpointUrl: 'http://localhost:9200/_agent/sentinel',
        platform: 'claude-code',
        supportedSkills: ['memory-safety', 'rustsec-audit', 'cve-triage'],
        bayesianReliabilityScore: 4.85,
        maxConcurrency: 8,
        ed25519PublicKeyHex: keypair1.publicKeyHex,
        corpusPinDate: new Date(NOW - 4 * DAY_MS).toISOString(),
        boundCorpusSlug: 'rust-vulns',
        status: 'ONLINE_HEALTHY',
        lastHeartbeatIso: new Date(NOW - 12 * 60 * 1000).toISOString(),
      },
      {
        agentId: 'openclaw-sec-crawler',
        name: 'OpenClaw Threat Scout',
        version: '1.4.2',
        endpointUrl: 'https://claw.mesh.internal/v1/agent',
        platform: 'openclaw',
        supportedSkills: ['prompt-injection-redaction', 'mcp-poisoning', 'sandbox-escape'],
        bayesianReliabilityScore: 4.62,
        maxConcurrency: 4,
        ed25519PublicKeyHex: keypair2.publicKeyHex,
        corpusPinDate: new Date(NOW - 25 * DAY_MS).toISOString(), // 25 days: Chronos Alert!
        boundCorpusSlug: 'ai-bug-bounty-2',
        status: 'NEARING_STALENESS',
        lastHeartbeatIso: new Date(NOW - 5 * 60 * 1000).toISOString(),
      },
      {
        agentId: 'cursor-spec-synthesizer',
        name: 'Cursor OpenAPI Weaver',
        version: '3.0.1',
        endpointUrl: 'http://localhost:9300/_agent/cursor',
        platform: 'cursor',
        supportedSkills: ['openapi-diff', 'graphql-mutations', 'stripe-integrations'],
        bayesianReliabilityScore: 4.91,
        maxConcurrency: 12,
        ed25519PublicKeyHex: keypair3.publicKeyHex,
        corpusPinDate: new Date(NOW - 32 * DAY_MS).toISOString(), // 32 days: Expired!
        boundCorpusSlug: 'owasp-agentic-top10',
        status: 'EXPIRED_REFUSED',
        lastHeartbeatIso: new Date(NOW - 45 * 60 * 1000).toISOString(),
      },
    ];

    for (const a of sampleAgents) {
      this.agents.set(a.agentId, a);
    }
  }

  getAllAgents(): AgentCard[] {
    return Array.from(this.agents.values()).map(agent => {
      const staleness = XerjProvenanceGate.evaluateStaleness(agent.corpusPinDate);
      let status: AgentCard['status'] = 'ONLINE_HEALTHY';
      if (!staleness.allowed) status = 'EXPIRED_REFUSED';
      else if (staleness.status === 'CHRONOS_ROTATION_REQUIRED') status = 'NEARING_STALENESS';
      return { ...agent, status };
    });
  }

  registerOrPulseAgent(agent: AgentCard) {
    const staleness = XerjProvenanceGate.evaluateStaleness(agent.corpusPinDate);
    const updated: AgentCard = {
      ...agent,
      lastHeartbeatIso: new Date().toISOString(),
      status: !staleness.allowed
        ? 'EXPIRED_REFUSED'
        : staleness.status === 'CHRONOS_ROTATION_REQUIRED'
        ? 'NEARING_STALENESS'
        : 'ONLINE_HEALTHY',
    };
    this.agents.set(agent.agentId, updated);
    return {
      agent: updated,
      staleness,
      action: !staleness.allowed
        ? 'HARD_REFUSAL_INDEX_EXPIRED'
        : staleness.status === 'CHRONOS_ROTATION_REQUIRED'
        ? 'TRIGGER_BACKGROUND_DELTA_REINDEX'
        : 'HEALTHY',
    };
  }

  rejuvenateAgentCorpus(agentId: string) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    agent.corpusPinDate = new Date().toISOString(); // Reset to fresh timestamp
    agent.status = 'ONLINE_HEALTHY';
    agent.lastHeartbeatIso = new Date().toISOString();
    this.agents.set(agentId, agent);
    return agent;
  }

  // JSON-RPC 2.0 Task Delegation into Escrow
  createEscrowTask(params: {
    creatorAgentId: string;
    assigneeAgentId: string;
    taskTitle: string;
    taskPayload: Record<string, unknown>;
  }) {
    const taskId = `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const namespace = `/_memory/escrow-${taskId}`;

    const rawString = `${taskId}:${params.creatorAgentId}:${params.assigneeAgentId}:${JSON.stringify(params.taskPayload)}`;
    const sigHex = createHash('sha256').update(rawString).digest('hex');

    const task: EscrowTask = {
      taskId,
      creatorAgentId: params.creatorAgentId,
      assigneeAgentId: params.assigneeAgentId,
      taskTitle: params.taskTitle,
      taskPayload: params.taskPayload,
      status: 'LOCKED_IN_ESCROW',
      escrowMemoryNamespace: namespace,
      ed25519SignatureHex: sigHex,
      createdAtIso: new Date().toISOString(),
    };

    this.tasks.set(taskId, task);
    return task;
  }

  getEscrowTasks(): EscrowTask[] {
    return Array.from(this.tasks.values()).reverse();
  }

  // CRDT Memory Synchronization
  receiveCrdtDelta(delta: {
    nodeId: string;
    sequenceId: number;
    memoryKey: string;
    payload: string;
    parentHash?: string;
  }) {
    const parentHash = delta.parentHash || this.crdtHeads.get(delta.nodeId) || 'GENESIS';
    const raw = `${delta.nodeId}:${delta.sequenceId}:${delta.memoryKey}:${delta.payload}:${parentHash}`;
    const hash = createHash('sha256').update(raw).digest('hex');

    const fullDelta: CrdtDelta = {
      hash,
      parentHash,
      nodeId: delta.nodeId,
      sequenceId: delta.sequenceId,
      memoryKey: delta.memoryKey,
      payload: delta.payload,
      timestamp: new Date().toISOString(),
    };

    this.crdtLedger.set(hash, fullDelta);
    this.crdtHeads.set(delta.nodeId, hash);

    return {
      accepted: true,
      delta: fullDelta,
      currentHead: hash,
      totalDeltas: this.crdtLedger.size,
    };
  }

  getCrdtLedger(): CrdtDelta[] {
    return Array.from(this.crdtLedger.values()).reverse().slice(0, 30);
  }

  generateSwarmGreeting(visitingAgent: {
    agentId: string;
    platform: string;
    activeStack: string[];
    daysUntilStaleness: number;
  }) {
    const matchingSlugs = ['rust-vulns', 'ai-bug-bounty-2', 'stripe-openapi'].filter(slug =>
      visitingAgent.activeStack.some(t => slug.includes(t.toLowerCase()))
    );

    const recommended = matchingSlugs.length > 0 ? matchingSlugs : ['rust-vulns', 'sovereign-infinity-ai-census'];
    const urgency = visitingAgent.daysUntilStaleness <= 6;

    let text = `[XERJ Swarm Greeter] Welcome agent '${visitingAgent.agentId}' from ${visitingAgent.platform}. `;
    text += `Your stack [${visitingAgent.activeStack.join(', ')}] matched Corpus Hub pack: \`xerj hub pull ${recommended[0]}\`. `;

    if (urgency) {
      text += `⚠️ NOTICE: Your index expires in ${visitingAgent.daysUntilStaleness} days! Trigger an automated Chronos delta-reindex to stay alive.`;
    } else {
      text += `Your node status is optimal (zero-stale).`;
    }

    return {
      message: text,
      recommendedPacks: recommended,
      urgencyFlag: urgency,
    };
  }
}

export const swarmManager = new XerjA2ASwarmManager();
