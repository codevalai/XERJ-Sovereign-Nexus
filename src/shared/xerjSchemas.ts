import { z } from 'zod';

export const LicenceClassSchema = z.enum([
  'permissive',       // MIT, Apache-2.0, BSD-2/3, ISC, Unlicense
  'weak-copyleft',    // MPL-2.0, LGPL-2.1/3.0
  'strong-copyleft',  // GPL-2.0/3.0, AGPL-3.0
  'restricted'        // Custom / Non-commercial (dropped pre-routing)
]);

export const HubDomainSchema = z.enum([
  'SEC', 'API', 'SYS', 'AI', 'DATA', 'WEB', 'CRYPTO', 'CLOUD', 'LANG', 'GAME', 'GOV'
]);

export const TermSketchSchema = z.object({
  num_bits: z.number().int().positive(),
  num_hashes: z.literal(7), // XERJ v2 specification: 7-hash Bloom filter
  bits_base64: z.string().min(1),
});

export const CatalogueEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-_]+$/),
  domain: HubDomainSchema,
  topics: z.array(z.string()),
  ask_for: z.string().max(320),
  dependency_names: z.array(z.string()),
  licence: z.object({
    spdx: z.string(),
    class: LicenceClassSchema,
    human_verified_by: z.string().optional(),
  }),
  pin_sha: z.string().regex(/^[a-f0-9]{40}$/, 'Must be exact 40-char Git commit SHA; branch refs forbidden'),
  pin_date: z.string(),
  pack_url: z.string().url(),
  size_bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  sig_url: z.string().url(),
  term_sketch: TermSketchSchema,
  agent_ratings: z.object({
    count: z.number().int().nonnegative(),
    sum_scores: z.number().nonnegative(),
    coverage_gaps: z.array(z.object({
      symbol_or_topic: z.string(),
      independent_agent_reports: z.number().int().nonnegative(),
    })).default([]),
  }).optional(),
  status: z.enum(['active_in_registry', 'in_licence_review', 'shadow_release', 'expansion_pack']).default('active_in_registry'),
});

export const FederatedQueryRequestSchema = z.object({
  question: z.string().min(2).max(4000),
  lockfileContent: z.string().optional(),
  lockfileType: z.enum(['Cargo.lock', 'package.json', 'go.mod']).optional(),
  allowedLicenceClasses: z.array(LicenceClassSchema).default(['permissive', 'weak-copyleft']),
  disableTelemetryFeedback: z.boolean().default(true),
  maxPacksToFederate: z.number().int().min(1).max(6).default(3),
  seedLocalSystemOne: z.boolean().default(true),
});

export const AgentCardSchema = z.object({
  agentId: z.string().regex(/^[a-z0-9-_]+$/),
  name: z.string(),
  version: z.string(),
  endpointUrl: z.string(),
  platform: z.enum(['claude-code', 'cursor', 'openclaw', 'cline', 'custom-swarm']),
  supportedSkills: z.array(z.string()),
  bayesianReliabilityScore: z.number().min(0).max(5),
  maxConcurrency: z.number().int().positive(),
  ed25519PublicKeyHex: z.string().length(64),
  corpusPinDate: z.string(),
  boundCorpusSlug: z.string(),
  status: z.enum(['ONLINE_HEALTHY', 'NEARING_STALENESS', 'EXPIRED_REFUSED', 'AUTONOMOUS_MUTATING']),
  lastHeartbeatIso: z.string(),
});

export type LicenceClass = z.infer<typeof LicenceClassSchema>;
export type HubDomain = z.infer<typeof HubDomainSchema>;
export type TermSketch = z.infer<typeof TermSketchSchema>;
export type CatalogueEntry = z.infer<typeof CatalogueEntrySchema>;
export type FederatedQueryRequest = z.infer<typeof FederatedQueryRequestSchema>;
export type AgentCard = z.infer<typeof AgentCardSchema>;

// Shared 11 Domain statistics & color coding
export const DOMAIN_STATISTICS: Record<HubDomain, { gb: number; count: number; colorHex: string }> = {
  SEC: { gb: 56.1, count: 184, colorHex: '#EF4444' },
  API: { gb: 8.0, count: 96, colorHex: '#38BDF8' },
  SYS: { gb: 4.8, count: 52, colorHex: '#F59E0B' },
  AI: { gb: 3.5, count: 48, colorHex: '#10B981' },
  CRYPTO: { gb: 2.2, count: 35, colorHex: '#8B5CF6' },
  CLOUD: { gb: 1.8, count: 32, colorHex: '#06B6D4' },
  DATA: { gb: 1.2, count: 28, colorHex: '#EC4899' },
  WEB: { gb: 0.9, count: 26, colorHex: '#14B8A6' },
  LANG: { gb: 0.8, count: 22, colorHex: '#F97316' },
  GAME: { gb: 0.6, count: 15, colorHex: '#EAB308' },
  GOV: { gb: 0.5, count: 12, colorHex: '#64748B' },
};

export interface RawPassageInput {
  corpusSlug: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  rawScore: number;
  snippet: string;
  licenceSpdx: string;
}

export interface TribunalOutput {
  synthesizedAnswerMarkdown: string;
  calibratedConfidence: number;
  promptInjectionNeutralized: boolean;
  verifiedCitations: Array<{
    corpusSlug: string;
    file: string;
    lineRange: string;
    calibratedConfidence: number;
    promptInjectionDetected: boolean;
    systemOneLabel: string;
    evidenceExplanation: string;
  }>;
  tokenSavings: {
    grepTokensBaseline: number;
    xerjActualTokens: number;
    reductionFactor: string;
  };
}

export interface ZeroTrustPolicy {
  blockOperatorWalTap: boolean;
  isolateMemoryNamespaces: boolean;
  stripExfiltrationRerank: boolean;
  activeClientPrefix: string;
}

export interface LaneBRecipeSpec {
  packSlug: string;
  domain: string;
  spdxLicence: string;
  licenceClass: 'permissive' | 'weak-copyleft';
  shards: number;
  sources: Array<{
    id: string;
    kind: 'http-zip' | 'git' | 'jsonl-stream';
    url: string;
    pinShaOrChecksum: string;
  }>;
  mergeEdges: Array<{
    leftSource: string;
    rightSource: string;
    joinKey: string;
    strategy: 'left' | 'right' | 'union_arrays';
  }>;
  semanticFields: string[];
  keywordFields: string[];
}

// ==============================================================================
// 20 Most Important Use Cases Autonomous Agents Look For
// ==============================================================================
export interface AgentUseCase {
  id: number;
  title: string;
  domain: HubDomain;
  targetFocus: string;
  primaryRisk: string;
  sampleQuery: string;
  upstreamRepo: string;
  recommendedPack: string;
}

export const AGENT_USE_CASES_20: AgentUseCase[] = [
  {
    id: 1,
    title: 'Zero-Day Exploit Re-mapping & PoC Validation',
    domain: 'SEC',
    targetFocus: 'Parsing raw exploit code (CVE-2025-*, CVE-2026-*, GHSA-*) to verify patch levels',
    primaryRisk: 'Hallucinating unpatched vulnerability signatures or outdated fix versions',
    sampleQuery: 'Verify atomic WAL rotation and acquire exclusive advisory lock against CVE-2026-1189',
    upstreamRepo: 'projectdiscovery/nuclei-templates',
    recommendedPack: 'rust-vulns',
  },
  {
    id: 2,
    title: 'Obscure Low-Level Systems Contracts',
    domain: 'SYS',
    targetFocus: 'Linux kernel eBPF verifier constraints, ring buffer limits, and XDP networking headers',
    primaryRisk: 'Kernel panic or verifier rejection on unaligned memory access',
    sampleQuery: 'bpf_ringbuf_output verifier memory bounds and xdp_buff packet head pointers',
    upstreamRepo: 'iovisor/bpftool',
    recommendedPack: 'ebpf-kernel-specs',
  },
  {
    id: 3,
    title: 'Proprietary/Version-Locked Cloud SDK Specifications',
    domain: 'CLOUD',
    targetFocus: 'Exact configuration schema updates for Akash SDL, Terraform providers, AWS CloudFormation',
    primaryRisk: 'Deployment failure from deprecated YAML properties or incorrect GPU attributes',
    sampleQuery: 'Akash SDL version 2.0 services profiles placement pricing uakt GPU constraints',
    upstreamRepo: 'akash-network/provider',
    recommendedPack: 'akash-sdl-compute',
  },
  {
    id: 4,
    title: 'Cryptographic Macro & Zero-Knowledge Primitives',
    domain: 'CRYPTO',
    targetFocus: 'Anchor account constraints, Groth16 curve configs, Solana CPI invocation boundaries',
    primaryRisk: 'Funds drain from missing account signer checks or reentrancy in CPI',
    sampleQuery: 'Solana Anchor #[account(has_one, mut)] CPI signer seeds validation',
    upstreamRepo: 'coral-xyz/anchor',
    recommendedPack: 'solana-anchor-specs',
  },
  {
    id: 5,
    title: 'AST Symbol & Compiler Internals',
    domain: 'LANG',
    targetFocus: 'React 19 memoization AST compiler rules and Tree-sitter incremental parser grammars',
    primaryRisk: 'Generating invalid syntax or broken AST visitor traversals',
    sampleQuery: 'Tree-sitter ts_parser_parse incremental syntax tree node edit re-lexing',
    upstreamRepo: 'facebook/react',
    recommendedPack: 'tree-sitter-grammars-2026',
  },
  {
    id: 6,
    title: 'Distributed Consensus & WAL Concurrency',
    domain: 'DATA',
    targetFocus: 'Transactional isolation mechanics, Valkey/Memcached state locks, SQLite shm index synchronization',
    primaryRisk: 'Database corruption from concurrent checkpointing or stale read locks',
    sampleQuery: 'SQLite WAL mode walIndexRecover shm file lock acquisition protocol',
    upstreamRepo: 'valkey-io/valkey',
    recommendedPack: 'sqlite-wal-internals',
  },
  {
    id: 7,
    title: 'REST & GraphQL API Contract Signatures',
    domain: 'API',
    targetFocus: 'Webhook signature verification, OpenAPI spec objects, Stripe/GitHub pagination parameters',
    primaryRisk: 'Invalid HTTP 400 Bad Request or failed signature verification in webhooks',
    sampleQuery: 'Stripe Idempotency-Key header v1 payment_intents confirm webhook signature',
    upstreamRepo: 'stripe/openapi',
    recommendedPack: 'stripe-openapi',
  },
  {
    id: 8,
    title: 'Multi-Agent Orchestration Interoperability',
    domain: 'AI',
    targetFocus: 'JSON-RPC wire protocols, A2A message handshakes, and Model Context Protocol (MCP) tool schemas',
    primaryRisk: 'Agent-to-agent deadlocks or protocol mismatch on tools/call payloads',
    sampleQuery: 'Model Context Protocol mcp.json tools/list stdio protocol version 1.32.0',
    upstreamRepo: 'langchain-ai/langgraph',
    recommendedPack: 'ai-bug-bounty-2',
  },
  {
    id: 9,
    title: 'Sandboxed Code Execution & Runtime Isolation',
    domain: 'CLOUD',
    targetFocus: 'Sandbox container limits, ephemeral networking rules, and secure IPC boundaries (e2b)',
    primaryRisk: 'Container breakout or socket leak across ephemeral runner sessions',
    sampleQuery: 'E2B sandbox container memory limits cgroup v2 seccomp profile restrictions',
    upstreamRepo: 'kubernetes/kubernetes',
    recommendedPack: 'akash-sdl-compute',
  },
  {
    id: 10,
    title: 'Automated Vulnerability Scanner Rule Writing',
    domain: 'SEC',
    targetFocus: 'Nuclei template structures, Semgrep YAML matchers, and Falco runtime security rule schemas',
    primaryRisk: 'False positives or syntax errors preventing scanner execution in CI',
    sampleQuery: 'Nuclei template HTTP raw matchers dsl condition status_code == 200',
    upstreamRepo: 'projectdiscovery/nuclei-templates',
    recommendedPack: 'rust-vulns',
  },
  {
    id: 11,
    title: 'Browser DOM Automation & State Traversal',
    domain: 'WEB',
    targetFocus: 'Element interaction handlers for headless browser frameworks (browser-use, Playwright MCP)',
    primaryRisk: 'Flaky element selection or missed Shadow DOM boundary piercing',
    sampleQuery: 'Playwright evaluateHandle shadowRoot locator pierce headless context',
    upstreamRepo: 'browser-use/browser-use',
    recommendedPack: 'react-19-compiler-specs',
  },
  {
    id: 12,
    title: 'Vector Database Quantization & HNSW Tuning',
    domain: 'AI',
    targetFocus: 'Sparse-dense embeddings, int8/scalar quantization bounds, index segment layouts (scalar8)',
    primaryRisk: 'Recall drop below 0.95 or memory blowup on unquantized dense embeddings',
    sampleQuery: 'XERJ scalar8 int8_hnsw dense_vector cosine similarity 0.998 recall@10',
    upstreamRepo: 'vllm-project/vllm',
    recommendedPack: 'sovereign-infinity-ai-census',
  },
  {
    id: 13,
    title: 'Compliance & Risk Framework Alignment',
    domain: 'GOV',
    targetFocus: 'NIST AI Risk Management Framework controls, EU AI Act compliance checks, ISO security taxonomies',
    primaryRisk: 'Regulatory non-compliance or audit failure on unproven provenance',
    sampleQuery: 'NIST AI RMF 1.0 GOVERN 1.2 risk management processes documentation',
    upstreamRepo: 'palantir/osquery-configuration',
    recommendedPack: 'nist-ai-rmf-controls',
  },
  {
    id: 14,
    title: 'Cross-Language Wire Protocols & Serialization',
    domain: 'LANG',
    targetFocus: 'Varint encodings, protobuf zigzag layouts, and custom binary stream codecs',
    primaryRisk: 'Bit-shifting endianness bugs causing silent stream truncation',
    sampleQuery: 'Protobuf zigzag encode 64-bit signed integer varint wire type 0',
    upstreamRepo: 'googleapis/googleapis',
    recommendedPack: 'github-graphql-spec',
  },
  {
    id: 15,
    title: 'Real-Time Telemetry & Observability Export',
    domain: 'CLOUD',
    targetFocus: 'OpenTelemetry metrics, span processor pipelines, and distributed trace collectors',
    primaryRisk: 'Missing parent trace IDs or dropped span attributes under load',
    sampleQuery: 'OpenTelemetry BatchSpanProcessor maxQueueSize exportTimeoutMillis grpc trace',
    upstreamRepo: 'falcosecurity/plugins',
    recommendedPack: 'akash-sdl-compute',
  },
  {
    id: 16,
    title: 'Game Engine Physics & WGSL Shader Pipelines',
    domain: 'GAME',
    targetFocus: 'WebGPU compute pipeline states, render pass configurations, uniform buffer structures',
    primaryRisk: 'GPU device lost error or WGSL compilation failure on mismatched bind groups',
    sampleQuery: 'WebGPU createRenderPipeline vertex buffer layout fragment targets format',
    upstreamRepo: 'mrdoob/three.js',
    recommendedPack: 'webgpu-render-pipelines',
  },
  {
    id: 17,
    title: 'Package Manager Lockfile Dependency Graphs',
    domain: 'SYS',
    targetFocus: 'Resolving transitive dependency conflicts across Cargo.lock, package.json, and go.mod',
    primaryRisk: 'Phantom dependency version resolution or diamond dependency compilation failure',
    sampleQuery: 'Cargo.lock resolve checksum mismatch transitive dependency replacement',
    upstreamRepo: 'aquasecurity/trivy',
    recommendedPack: 'rust-vulns',
  },
  {
    id: 18,
    title: 'CI/CD Pipeline Matrix Orchestration',
    domain: 'CLOUD',
    targetFocus: 'GitHub Actions and Temporal durable execution workflows across multi-arch runners',
    primaryRisk: 'Silent matrix runner timeouts or missing architectural pre-requisites',
    sampleQuery: 'GitHub Actions matrix strategy fail-fast false multi-arch docker buildx',
    upstreamRepo: 'hashicorp/terraform',
    recommendedPack: 'akash-sdl-compute',
  },
  {
    id: 19,
    title: 'Memory State Synchronization & CRDTs',
    domain: 'DATA',
    targetFocus: 'Conflict-free replicated data type merge algorithms and Merkle-DAG verification state trees',
    primaryRisk: 'State split-brain or non-convergent memory reconciliation under partition',
    sampleQuery: 'CRDT state-based merge function commutative associative idempotent parentHash',
    upstreamRepo: 'duckdb/duckdb',
    recommendedPack: 'sqlite-wal-internals',
  },
  {
    id: 20,
    title: 'Autonomous Agent Guardrails & Red-Teaming',
    domain: 'SEC',
    targetFocus: 'Prompt-injection containment filters, NeMo guardrail configs, and garak test harnesses',
    primaryRisk: 'Indirect prompt injection in code comments hijacking agent execution loop',
    sampleQuery: 'Airlock context firewall strip invisible unicode neutralize imperative instructions',
    upstreamRepo: 'aquasecurity/trivy',
    recommendedPack: 'ai-bug-bounty-2',
  },
];

// ==============================================================================
// XERJ Expansion Hub Essential Repositories Matrix
// ==============================================================================
export interface ExpansionSourceConfig {
  slug: string;
  domain: HubDomain;
  gitRepoUrl: string;
  commitSha: string;
  spdxLicence: string;
  description: string;
  primaryUseCase: string;
  estimatedSizeBytes: number;
}

export const EXPANSION_CATALOG_SOURCES: ExpansionSourceConfig[] = [
  {
    slug: 'nuclei-templates',
    domain: 'SEC',
    gitRepoUrl: 'https://github.com/projectdiscovery/nuclei-templates',
    commitSha: '6c01928374efb1029384716a501928374efb1029',
    spdxLicence: 'MIT',
    description: 'Community vulnerability templates, exploit PoCs, and detection signatures.',
    primaryUseCase: 'Automated vulnerability scanner rule writing & exploit validation',
    estimatedSizeBytes: 245000000,
  },
  {
    slug: 'trivy-security-checks',
    domain: 'SEC',
    gitRepoUrl: 'https://github.com/aquasecurity/trivy',
    commitSha: '7d01928374efb1029384716a501928374efb1029',
    spdxLicence: 'Apache-2.0',
    description: 'Container security scanner policies, misconfiguration rules, and SBOM contracts.',
    primaryUseCase: 'Zero-day exploit re-mapping & dependency lockfile verification',
    estimatedSizeBytes: 412000000,
  },
  {
    slug: 'bpftool-kernel-trace',
    domain: 'SYS',
    gitRepoUrl: 'https://github.com/iovisor/bpftool',
    commitSha: '8e01928374efb1029384716a501928374efb1029',
    spdxLicence: 'GPL-2.0-only',
    description: 'Linux bpf inspection tool, kernel verifier headers, and map introspection.',
    primaryUseCase: 'Low-level systems contracts and eBPF verifier tracing',
    estimatedSizeBytes: 189000000,
  },
  {
    slug: 'langgraph-orchestration',
    domain: 'AI',
    gitRepoUrl: 'https://github.com/langchain-ai/langgraph',
    commitSha: '9f01928374efb1029384716a501928374efb1029',
    spdxLicence: 'MIT',
    description: 'Stateful multi-agent orchestration framework, cyclical graph contracts, and checkpointing.',
    primaryUseCase: 'Multi-agent orchestration interoperability & memory state sync',
    estimatedSizeBytes: 156000000,
  },
  {
    slug: 'vllm-speculative-serving',
    domain: 'AI',
    gitRepoUrl: 'https://github.com/vllm-project/vllm',
    commitSha: '0a01928374efb1029384716a501928374efb1029',
    spdxLicence: 'Apache-2.0',
    description: 'PagedAttention high-throughput LLM serving engine, FP8/AWQ quantization kernels.',
    primaryUseCase: 'Vector database quantization & HNSW tuning',
    estimatedSizeBytes: 520000000,
  },
  {
    slug: 'valkey-memory-consensus',
    domain: 'DATA',
    gitRepoUrl: 'https://github.com/valkey-io/valkey',
    commitSha: '1b01928374efb1029384716a501928374efb1029',
    spdxLicence: 'BSD-3-Clause',
    description: 'High-performance in-memory datastore, cluster replication, and transactional persistence.',
    primaryUseCase: 'Distributed consensus & WAL state concurrency',
    estimatedSizeBytes: 340000000,
  },
  {
    slug: 'browser-use-automation',
    domain: 'WEB',
    gitRepoUrl: 'https://github.com/browser-use/browser-use',
    commitSha: '2c01928374efb1029384716a501928374efb1029',
    spdxLicence: 'MIT',
    description: 'Autonomous browser agent framework, DOM state extractor, and Playwright execution hooks.',
    primaryUseCase: 'Browser DOM automation & state traversal',
    estimatedSizeBytes: 98000000,
  },
  {
    slug: 'duckdb-analytics-engine',
    domain: 'DATA',
    gitRepoUrl: 'https://github.com/duckdb/duckdb',
    commitSha: '3d01928374efb1029384716a501928374efb1029',
    spdxLicence: 'MIT',
    description: 'Embedded analytical columnar storage engine, vectorized execution, and Parquet readers.',
    primaryUseCase: 'Memory state synchronization & columnar analytics',
    estimatedSizeBytes: 460000000,
  },
];

// ==============================================================================
// Chronos-P2P Perpetual Agent Loop & Zero-Knowledge State Fabric Types
// ==============================================================================
export interface ChronosCycleLog {
  cycleId: string;
  timestamp: string;
  livenessStatus: 'RESET_SUCCESS' | 'ACTIVE_OPTIMAL';
  activeTtlDaysRemaining: number;
  filesScanned: number;
  newSymbolsIndexed: number;
  mutationTriggered: boolean;
  optimizationNote: string;
  receiptHash: string;
  signatureHex: string;
}

export interface AgentStateClaim {
  agentId: string;
  namespace: string;
  previousStateRoot: string;
  memoryPayloadHash: string;
  executionSuccess: boolean;
  timestamp: string;
}

export interface ZkStateProofReceipt {
  claimHash: string;
  zkCommitment: string;
  nullifierHash: string;
  verified: boolean;
  proofProtocol: 'Groth16-Simulated-Secp256k1' | 'PLONK';
  provenAtIso: string;
}

export interface ExpansionPackResult {
  slug: string;
  domain: HubDomain;
  pin_sha: string;
  licence: {
    spdx: string;
    class: 'permissive' | 'weak-copyleft' | 'strong-copyleft' | 'restricted';
  };
  size_bytes: number;
  sha256: string;
  term_sketch: TermSketch;
  provenance: {
    signer_public_key: string;
    detached_signature_hex: string;
  };
  generated_at: string;
}

// ==============================================================================
// XERJ Automated Skill Vetting & Universal Registry Engine Types
// ==============================================================================
export interface SkillSubmission {
  skillId: string;
  author: string;
  domain: HubDomain;
  description: string;
  sourceCodeOrManifest: string;
  declaredCapabilities: string[];
  testHarnessPass: boolean;
}

export interface VettedSkillReceipt {
  skillId: string;
  author: string;
  domain: HubDomain;
  description: string;
  fingerprintSha256: string;
  safetyScore: number; // 0.0 to 1.0
  flaggedPatterns: string[];
  ed25519SignatureHex: string;
  signerPublicKeyHex: string;
  approvedForSwarm: boolean;
  termSketchBits: string;
  termSketchNumBits: number;
  vettedAtIso: string;
}

export interface VettedSkillEntry extends VettedSkillReceipt {
  declaredCapabilities: string[];
  bayesianScore: number;
  installCount: number;
  verifiedBadge: boolean;
  tarballUrl: string;
}

// ==============================================================================
// 2026 Next-Gen Agentic Web Discovery (ARD, APoP, A2A) Types
// ==============================================================================
export interface ArdCatalogManifest {
  version: string;
  provider: string;
  homepage: string;
  capabilities: Array<{
    type: string;
    name: string;
    endpoint: string;
    description: string;
  }>;
}

export interface ApopSecurityPolicy {
  version: string;
  defaultPolicy: {
    access: 'allow' | 'deny';
    requireVerification: boolean;
    rateLimit: { requestsPerMinute: number };
  };
  pathPolicies: Array<{
    path: string;
    requireVerification: boolean;
    allowedIdentityTiers: string[];
  }>;
}

export interface A2aAgentCardManifest {
  agentId: string;
  name: string;
  version: string;
  endpointUrl: string;
  supportedSkills: string[];
  bayesianReliabilityScore: number;
  authRequired: boolean;
}

// ==============================================================================
// Autonomous CI/CD Self-Test Action (xerj-validate-action) Types
// ==============================================================================
export interface ValidatePackResult {
  overallPassed: boolean;
  slug: string;
  checks: {
    commitShaGate: {
      passed: boolean;
      sha: string;
      error?: string;
    };
    bloomFilterGate: {
      passed: boolean;
      numHashes: number;
      bitsEvaluated: number;
      falseNegativeRate: number; // 0.0% guarantee
      testSymbols: string[];
      error?: string;
    };
    licenceGate: {
      passed: boolean;
      spdx: string;
      class: LicenceClass;
      verified: boolean;
      error?: string;
    };
    provenanceGate: {
      passed: boolean;
      sha256Checksum: string;
      signatureValid: boolean;
      signerPublicKeyHex: string;
      error?: string;
    };
  };
  ciRunnerLog: string[];
  verifiedAtIso: string;
}

// ==============================================================================
// WebAssembly (Wasm) In-Browser Sandbox Query Engine Types
// ==============================================================================
export interface WasmBenchmarkResult {
  query: string;
  targetPack: string;
  symbolsEvaluated: number;
  bitsetMatches: number;
  falseNegativeRate: number; // 0.0% guarantee
  clientMicroseconds: number;
  simulatedHttpWireMs: number;
  speedupFactor: string;
  runtime: 'Browser-Wasm-Sandbox' | 'WebContainer-Rust';
  matchingKeywords: string[];
  timestampIso: string;
}

// ==============================================================================
// Encrypted Gossip Protocol (libp2p Mesh & Topic GossipSub) Types
// ==============================================================================
export type GossipTopic =
  | 'xerj/crdt-sync'
  | 'xerj/zk-proofs'
  | 'xerj/pulse-announcements'
  | 'xerj/skill-announcements';

export interface GossipSubPeer {
  peerId: string;
  multiaddr: string;
  latencyMs: number;
  subscribedTopics: GossipTopic[];
  status: 'CONNECTED' | 'DIALING' | 'PEER_EXCHANGE';
  messagesRelayed: number;
  agentRole: string;
}

export interface GossipSubMessage {
  messageId: string;
  topic: GossipTopic;
  originPeerId: string;
  timestampIso: string;
  sequence: number;
  payload: Record<string, any>;
  signatureHex: string;
  signerPublicKeyHex: string;
  verified: boolean;
  hops: number;
}

// ==============================================================================
// Official Entry Ritual & Contributor Membership Card Types
// ==============================================================================
export interface PackSubmissionBundle {
  slug: string;
  domain: HubDomain;
  manifestPath: string;
  manifestJson: string;
  sha256Sums: string;
  signatureHex: string;
  publicKeyHex: string;
  fieldReportMarkdown: string; // The official Contributor Membership Card!
  prBranchName: string;
  gitCommands: string[];
  cliCommand: string;
  generatedAtIso: string;
}

// ==============================================================================
// 10 Bottleneck Breakthroughs Types & Schemas
// ==============================================================================

// 1. Model-Agnostic Semantic Normalization (MASN)
export type MASNTargetModel = 'claude-3-5-sonnet' | 'gemini-2-5-flash' | 'gpt-4o' | 'llama-3';

export interface MASNTranscodeRequest {
  passage: {
    corpusSlug: string;
    file: string;
    lineStart: number;
    lineEnd: number;
    code: string;
    symbolName?: string;
    domain?: HubDomain;
  };
  targetModel: MASNTargetModel;
  includeSystemContract?: boolean;
}

export interface MASNTranscodeResponse {
  targetModel: MASNTargetModel;
  formattedOutput: string;
  syntaxFormat: string;
  estimatedTokens: number;
  tokenReductionPercent: number;
  syntaxFeaturesApplied: string[];
}

// 2. Cold-Start Wasm Edge Shard
export interface WasmEdgeShard {
  shardId: string;
  domain: HubDomain;
  sizeKb: number;
  numFilters: number;
  hashCount: 7;
  latencyMicros: number;
  compiledWasmBase64Prefix: string;
  generatedAtIso: string;
}

// 3. Ephemeral Agent Amnesia (Neural Checkpointing)
export interface NeuralCheckpointPayload {
  agentId: string;
  model: string;
  taskGoal: string;
  reasoningGraph: {
    nodes: Array<{ id: string; label: string; confidence: number; status: 'RESOLVED' | 'PENDING' | 'BLOCKED' }>;
    edges: Array<{ from: string; to: string; relationship: string }>;
  };
  bloomBitPathsTraversed: number[];
  workingHypothesis: string;
  confidenceVectors: Record<string, number>;
}

export interface NeuralCheckpointReceipt {
  checkpointId: string;
  agentId: string;
  stateHash: string;
  ed25519Signature: string;
  publicKeyHex: string;
  createdAtIso: string;
  expiresAtIso: string;
  byteSize: number;
}

// 4. zk-ASPF Semantic Firewall
export interface AstViolation {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: 'CODE_INJECTION' | 'PROMPT_OVERRIDE' | 'INVISIBLE_UNICODE' | 'PROTOTYPE_POLLUTION';
  description: string;
  offendingToken: string;
  location?: string;
}

export interface SemanticFirewallAuditResult {
  status: 'PASS' | 'QUARANTINE';
  safetyScore: number; // 0.0 - 1.0
  violations: AstViolation[];
  theoremProof: {
    algorithm: 'zk-ASPF-AST-1.0';
    proofHash: string;
    isVerified: boolean;
    quarantineAction?: 'STRIPPED' | 'ISOLATED' | 'BLOCKED';
  };
  ed25519Attestation: string;
  auditedAtIso: string;
}

// 5. Bandwidth Bitswap P2P Chunk Streaming
export interface BitswapChunk {
  cid: string; // Content Identifier (e.g. bafkrei...)
  chunkIndex: number;
  totalChunks: number;
  sizeBytes: number;
  sha256: string;
  bloomBitOffset: number;
  dataBase64: string;
}

export interface BitswapManifest {
  packSlug: string;
  domain: HubDomain;
  rootCid: string;
  totalSizeBytes: number;
  chunkSize: number; // typically 262144 (256 KB)
  chunksCount: number;
  chunks: Array<{
    cid: string;
    chunkIndex: number;
    sizeBytes: number;
    sha256: string;
  }>;
}

// 6. Universal Autonomous DID Passports
export interface AutonomousDID {
  did: string; // format: did:xerj:<hash>
  agentId: string;
  platform: 'claude-code' | 'cursor' | 'openclaw' | 'cline' | 'custom-swarm';
  ed25519PublicKeyHex: string;
  reputationScore: number; // 0 - 100
  registeredAtIso: string;
  lastActiveIso: string;
  verifiedCredentials: {
    licensedContributor: boolean;
    zkVerifierPass: boolean;
    totalTasksCompleted: number;
  };
}

// 7. Autonomous AI Maintainer Tribunal
export interface MaintainerTribunalReview {
  reviewId: string;
  packSlug: string;
  domain: HubDomain;
  status: 'AUTO_MERGED' | 'MANUAL_TRIAGE_REQUIRED' | 'REJECTED';
  reviewDurationSeconds: number;
  score: number; // 0 - 100
  checks: {
    pinShaVerified: boolean;
    spdxLicenseCompliant: boolean;
    kirschMitzenmacherFilterValid: boolean;
    astCollisionRateAcceptable: boolean;
    geminiFlashSemanticRelevanceScore: number;
  };
  ed25519MergeAttestation?: string;
  prNumber: number;
  auditLog: string[];
  reviewedAtIso: string;
}

// 8. Proof-of-Value Micro-Economy
export interface VoucherTransaction {
  voucherId: string;
  recipientDid: string;
  packSlug: string;
  amountCredits: number;
  citationType: 'REASONING_QUERY_HIT' | 'AST_RESOLVE' | 'TRIBUNAL_ACCEPTED' | 'CRDT_SYNC_RELAY';
  ed25519MintSignature: string;
  timestampIso: string;
}

export interface ProofOfValueLedger {
  totalCirculatingCredits: number;
  totalTransactionsCount: number;
  topContributors: Array<{
    did: string;
    agentId: string;
    totalEarned: number;
    packCount: number;
  }>;
  recentTransactions: VoucherTransaction[];
}

// 9. Neural Time-Travel Debugger
export interface TimeTravelFrame {
  frameIndex: number;
  phase: 'INPUT_NORMALIZATION' | 'BLOOM_BIT_PROBE' | 'AST_TOPOLOGICAL_MATCH' | 'TRIBUNAL_SCORING' | 'MASN_DISPATCH';
  timestampMicros: number;
  title: string;
  description: string;
  stateDelta: Record<string, any>;
  probeCoordinates?: {
    hashesCalculated: number[];
    bitPositionsChecked: number[];
    bitsPassed: boolean;
  };
}

export interface TimeTravelReplayTrace {
  traceId: string;
  query: string;
  startedAtIso: string;
  totalDurationMs: number;
  frames: TimeTravelFrame[];
  outcome: 'SUCCESS_RESOLVED' | 'GUARANTEED_ABSENT' | 'QUARANTINED';
}

// 10. Universal Protocol Agnosticism
export interface UniversalProtocolTranslation {
  incomingProtocol: 'MCP' | 'ELASTICSEARCH_DSL' | 'A2A_JSON_RPC' | 'LSP' | 'OPENAPI';
  rawInput: any;
  normalizedQuery: string;
  astFilter: Record<string, any>;
  translatedOutput: any;
  latencyMicros: number;
}

// ==============================================================================
// Byzantine Fault-Tolerant Swarm Consensus & Planetary Lattice Types
// ==============================================================================

export type SwarmActionType =
  | 'PROMPT_MUTATION'
  | 'SKILL_REGISTRATION'
  | 'CORPUS_PATCH'
  | 'POLICY_MUTATION'
  | 'CROSS_ORGANIZATION_TASK';

export interface SwarmProposal {
  nodeId: string;
  proposalId: string;
  actionType: SwarmActionType;
  payload: Record<string, any>;
  payloadHash: string;
  signature: string;
  timestamp: string;
  isByzantineRogue?: boolean;
}

export interface ConsensusReceipt {
  blockId: string;
  proposalId: string;
  actionType: SwarmActionType;
  totalVotes: number;
  honestVotes: number;
  byzantineVotesRejected: number;
  quorumReached: boolean;
  quorumThreshold: number;
  stateRootHash: string;
  merkleProof: string[];
  committedAt: string;
  status: 'COMMITTED_IMMUTABLE' | 'QUORUM_FAILED_REJECTED';
}

export interface AgentReasoningGraphSnapshot {
  agentId: string;
  sessionToken: string;
  activeBloomState: string;
  traversedSymbols: string[];
  confidenceVector: number[];
  timestamp: string;
}

export interface PlanetaryLatticeMetrics {
  totalActivePeers: number;
  byzantineFaultToleranceRatio: string; // 67% (2f + 1 quorum)
  committedBlocksCount: number;
  activeProposalsCount: number;
  crossModelDriftScore: number; // 0.00 - 1.00 (lower is more coherent)
  planetaryMeshPartitionsHealed: number;
  globalLedgerStateRoot: string;
}



