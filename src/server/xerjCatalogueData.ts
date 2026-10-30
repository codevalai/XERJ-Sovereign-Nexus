import { CatalogueEntry, HubDomain } from '../shared/xerjSchemas.js';
import { XerjTermSketch } from './xerjCryptoAndBloom.js';

// Pre-compute authentic Term Sketches for seed corpora
function makeSketch(terms: string[]) {
  return XerjTermSketch.buildFromVocabulary(terms);
}

// Current reference timestamp: 2026-10-29T21:00:00Z
const NOW = new Date('2026-10-29T21:00:00Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

export const SEED_CATALOGUE_ENTRIES: CatalogueEntry[] = [
  // 1. SEC (56.1 GB)
  {
    slug: 'rust-vulns',
    domain: 'SEC',
    topics: ['rust', 'cve', 'rustsec', 'memory-safety', 'advisories', 'cargo-audit'],
    ask_for: 'Rust security advisories, memory safety bugs, and audited cargo vulnerability notices.',
    dependency_names: ['cargo-audit', 'rustsec', 'tokio', 'actix-web', 'serde'],
    licence: {
      spdx: 'CC-BY-4.0',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: 'a8f31c90d512ef902b40441a76c023d8c4fa0192',
    pin_date: new Date(NOW - 4 * DAY_MS).toISOString(), // 4 days old: VERIFIED FRESH
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/rust-vulns.hubpack.tar.zst',
    size_bytes: 482910400,
    sha256: '9a84f3e9c201824ab10b420fec4421d01934bafe821b01c958432a188f4b2381',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/rust-vulns.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['rust', 'advisory', 'cve', 'rce', 'overflow', 'tokio', 'actix', 'cargo', 'unsafe', 'panic', 'use-after-free']),
    agent_ratings: {
      count: 42,
      sum_scores: 198.5,
      coverage_gaps: [
        { symbol_or_topic: 'wasm32-unknown-unknown-memory-isolation', independent_agent_reports: 4 },
      ],
    },
    status: 'active_in_registry',
  },
  {
    slug: 'ai-bug-bounty-2',
    domain: 'SEC',
    topics: ['prompt-injection', 'red-teaming', 'llm-jailbreak', 'mcp-poisoning', 'cve-2026'],
    ask_for: 'Autonomous agent threat vectors, tool poisoning signatures, and prompt injection PoCs.',
    dependency_names: ['@modelcontextprotocol/sdk', 'langchain', 'llama-index'],
    licence: {
      spdx: 'Apache-2.0',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: '4e92a10bfca7720912d091e843ba09ff21034c71',
    pin_date: new Date(NOW - 25 * DAY_MS).toISOString(), // 25 days old: CHRONOS SENTINEL ALERT!
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/ai-bug-bounty-2.hubpack.tar.zst',
    size_bytes: 840192800,
    sha256: '38fe10acb92018e74a8109bfca8401ee9281a810f92b8471bc09e18a7201bfa4',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/ai-bug-bounty-2.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['prompt-injection', 'jailbreak', 'airlock', 'poisoning', 'mcp', 'tool-call', 'unicode', 'redaction']),
    agent_ratings: {
      count: 88,
      sum_scores: 420.0,
      coverage_gaps: [
        { symbol_or_topic: 'cross-agent-session-leak', independent_agent_reports: 7 },
      ],
    },
    status: 'active_in_registry',
  },
  {
    slug: 'owasp-agentic-top10',
    domain: 'SEC',
    topics: ['owasp', 'appsec', 'agentic-risks', 'credential-leak', 'auth-bypass'],
    ask_for: 'OWASP standards for agentic applications, sandbox escapes, and API token leakage.',
    dependency_names: ['express', 'fastify', 'jsonwebtoken', 'helmet'],
    licence: {
      spdx: 'CC-BY-SA-4.0',
      class: 'weak-copyleft',
      human_verified_by: 'hub-curator-team',
    },
    pin_sha: '9901bc4710afe294821a8192038471cba90184ef',
    pin_date: new Date(NOW - 34 * DAY_MS).toISOString(), // 34 days old: EXPIRED REFUSED (Cliff hit!)
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.98/owasp-agentic-top10.hubpack.tar.zst',
    size_bytes: 312090100,
    sha256: '77a82910fbca01928374e6b1049281efca8910293847a610efb82910fa710293',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.98/owasp-agentic-top10.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['owasp', 'agentic', 'authorization', 'token', 'impersonation', 'sandbox', 'privilege']),
    agent_ratings: {
      count: 14,
      sum_scores: 55.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 2. API (8.0 GB)
  {
    slug: 'stripe-openapi',
    domain: 'API',
    topics: ['stripe', 'payments', 'webhooks', 'idempotency', 'openapi', 'rest-api'],
    ask_for: 'Official Stripe REST API definitions, webhook signing mechanics, and payment intent schemas.',
    dependency_names: ['stripe', '@stripe/stripe-js'],
    licence: {
      spdx: 'MIT',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: 'bc401928374a8109bfca8401ee9281a810f92b84',
    pin_date: new Date(NOW - 2 * DAY_MS).toISOString(), // 2 days old: FRESH
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/stripe-openapi.hubpack.tar.zst',
    size_bytes: 284910200,
    sha256: '401ef92810ab491028374b6a81029384716a501928374efb1029384716a50192',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/stripe-openapi.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['stripe', 'payment_intent', 'charge', 'refund', 'webhook', 'customer', 'subscription', 'idempotency_key']),
    agent_ratings: {
      count: 95,
      sum_scores: 450.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },
  {
    slug: 'github-graphql-spec',
    domain: 'API',
    topics: ['github-api', 'graphql', 'octokit', 'schema', 'mutations'],
    ask_for: 'GitHub GraphQL schema, mutation types, pull request APIs, and rate limit contracts.',
    dependency_names: ['@octokit/core', '@octokit/rest', 'graphql'],
    licence: {
      spdx: 'MIT',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: '71092834b6a81029384716a501928374efb10293',
    pin_date: new Date(NOW - 9 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/github-graphql-spec.hubpack.tar.zst',
    size_bytes: 410928400,
    sha256: '1839201948576a81029384716a501928374efb1029384716a501928374efb102',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/github-graphql-spec.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['github', 'graphql', 'commit', 'pull_request', 'repository', 'mutation', 'releases', 'tag', 'sha']),
    agent_ratings: {
      count: 52,
      sum_scores: 245.0,
      coverage_gaps: [
        { symbol_or_topic: 'security-advisories-graphql-mutation', independent_agent_reports: 5 },
      ],
    },
    status: 'active_in_registry',
  },

  // 3. SYS
  {
    slug: 'ebpf-kernel-specs',
    domain: 'SYS',
    topics: ['ebpf', 'linux-kernel', 'xdp', 'bpf-trace', 'kprobes', 'cgroups'],
    ask_for: 'Linux eBPF system calls, verifier constraints, XDP networking, and perf buffers.',
    dependency_names: ['aya', 'libbpf-rs', 'cilium'],
    licence: {
      spdx: 'GPL-2.0',
      class: 'strong-copyleft', // Flagged copyleft
      human_verified_by: 'sys-reviewer-3',
    },
    pin_sha: '99201948576a81029384716a501928374efb1029',
    pin_date: new Date(NOW - 6 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/ebpf-kernel-specs.hubpack.tar.zst',
    size_bytes: 984019200,
    sha256: 'bb92810ab491028374b6a81029384716a501928374efb1029384716a50192849',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/ebpf-kernel-specs.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['ebpf', 'bpf_prog_load', 'xdp', 'verifier', 'map', 'ringbuf', 'tracepoint', 'kprobe']),
    agent_ratings: {
      count: 31,
      sum_scores: 140.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 4. AI
  {
    slug: 'sovereign-infinity-ai-census',
    domain: 'AI',
    topics: ['models', 'benchmarks', 'weights', 'context-windows', 'tokenizer', 'efficiency'],
    ask_for: 'Comprehensive open-weights LLM architecture census, tokenizer parameters, and token throughput.',
    dependency_names: ['@google/genai', 'vllm', 'transformers', 'tokenizers'],
    licence: {
      spdx: 'Apache-2.0',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: 'f1029384716a501928374efb1029384716a50192',
    pin_date: new Date(NOW - 3 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/sovereign-infinity-ai-census.hubpack.tar.zst',
    size_bytes: 760192300,
    sha256: '61029384716a501928374efb1029384716a501928374efb1029384716a501923',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/sovereign-infinity-ai-census.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['tokenizer', 'context-window', 'gemini', 'llama', 'vllm', 'quantization', 'scalar8', 'rope']),
    agent_ratings: {
      count: 112,
      sum_scores: 540.0,
      coverage_gaps: [
        { symbol_or_topic: 'speculative-decoding-draft-heads', independent_agent_reports: 3 },
      ],
    },
    status: 'active_in_registry',
  },

  // 5. CLOUD
  {
    slug: 'akash-sdl-compute',
    domain: 'CLOUD',
    topics: ['akash', 'sdl', 'decentralized-cloud', 'kubernetes', 'gpu-clusters', 'deploy-yaml'],
    ask_for: 'Akash Network deployment SDL specifications, provider bid rules, and GPU resource manifests.',
    dependency_names: ['@akashnetwork/akashjs', 'yaml'],
    licence: {
      spdx: 'Apache-2.0',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: 'd401928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 5 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/akash-sdl-compute.hubpack.tar.zst',
    size_bytes: 390192000,
    sha256: 'aa01928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/akash-sdl-compute.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['akash', 'sdl', 'deploy', 'services', 'profiles', 'placement', 'pricing', 'uakt', 'gpu', 'cuda']),
    agent_ratings: {
      count: 67,
      sum_scores: 320.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 6. CRYPTO
  {
    slug: 'solana-anchor-specs',
    domain: 'CRYPTO',
    topics: ['solana', 'anchor', 'bpf', 'ed25519', 'smart-contracts', 'cross-program-invocation'],
    ask_for: 'Solana Anchor framework macros, account constraints, and CPI invocation safety.',
    dependency_names: ['@coral-xyz/anchor', '@solana/web3.js'],
    licence: {
      spdx: 'Apache-2.0',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: 'e501928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 8 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/solana-anchor-specs.hubpack.tar.zst',
    size_bytes: 520192400,
    sha256: 'cc01928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/solana-anchor-specs.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['solana', 'anchor', 'program', 'accounts', 'signer', 'cpi', 'sysvar', 'rent', 'lamports']),
    agent_ratings: {
      count: 48,
      sum_scores: 228.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 7. DATA
  {
    slug: 'sqlite-wal-internals',
    domain: 'DATA',
    topics: ['sqlite', 'wal', 'b-tree', 'concurrency', 'acid', 'storage-engine'],
    ask_for: 'SQLite Write-Ahead Log mechanics, shm index locks, and page cache concurrency.',
    dependency_names: ['better-sqlite3', 'sqlx', 'rusqlite'],
    licence: {
      spdx: 'blessing',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: '1101928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 12 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/sqlite-wal-internals.hubpack.tar.zst',
    size_bytes: 610293800,
    sha256: 'dd01928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/sqlite-wal-internals.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['sqlite', 'wal', 'checkpoint', 'shm', 'btree', 'pager', 'page_size', 'journal_mode']),
    agent_ratings: {
      count: 73,
      sum_scores: 355.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 8. WEB
  {
    slug: 'react-19-compiler-specs',
    domain: 'WEB',
    topics: ['react-19', 'react-compiler', 'use-action-state', 'server-components', 'hooks'],
    ask_for: 'React 19 core internals, memoization compiler AST, and server actions wire protocol.',
    dependency_names: ['react', 'react-dom'],
    licence: {
      spdx: 'MIT',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: '2201928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 7 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/react-19-compiler-specs.hubpack.tar.zst',
    size_bytes: 440192800,
    sha256: 'ee01928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/react-19-compiler-specs.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['react', 'useactionstate', 'useoptimistic', 'compiler', 'fiber', 'hydrated', 'server_component']),
    agent_ratings: {
      count: 104,
      sum_scores: 505.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 9. LANG
  {
    slug: 'tree-sitter-grammars-2026',
    domain: 'LANG',
    topics: ['tree-sitter', 'ast', 'parsers', 'grammars', 'cst', 'c-bindings'],
    ask_for: 'Tree-sitter grammar specifications for incremental code parsing and AST symbol extraction.',
    dependency_names: ['tree-sitter', 'web-tree-sitter'],
    licence: {
      spdx: 'MIT',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: '3301928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 15 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/tree-sitter-grammars-2026.hubpack.tar.zst',
    size_bytes: 580192000,
    sha256: 'ff01928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/tree-sitter-grammars-2026.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['treesitter', 'grammar', 'node', 'syntax_tree', 'query', 'pattern', 'field_name', 'anonymous']),
    agent_ratings: {
      count: 36,
      sum_scores: 170.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 10. GAME
  {
    slug: 'webgpu-render-pipelines',
    domain: 'GAME',
    topics: ['webgpu', 'wgsl', 'shaders', 'compute-pass', 'pipelines', 'vulkan'],
    ask_for: 'WebGPU WGSL shader mechanics, render passes, and compute buffer synchronization.',
    dependency_names: ['three', '@webgpu/types', 'wgpu'],
    licence: {
      spdx: 'W3C-20150513',
      class: 'permissive',
      human_verified_by: 'codevalai',
    },
    pin_sha: '4401928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 10 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/webgpu-render-pipelines.hubpack.tar.zst',
    size_bytes: 470192800,
    sha256: '1201928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/webgpu-render-pipelines.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['webgpu', 'wgsl', 'shader', 'bind_group', 'pipeline_layout', 'vertex_buffer', 'compute_pass']),
    agent_ratings: {
      count: 29,
      sum_scores: 135.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },

  // 11. GOV
  {
    slug: 'nist-ai-rmf-controls',
    domain: 'GOV',
    topics: ['nist', 'ai-governance', 'compliance', 'safety-controls', 'iso-42001'],
    ask_for: 'NIST AI Risk Management Framework specifications, Govern-Map-Measure-Manage audit rules.',
    dependency_names: [],
    licence: {
      spdx: 'NIST-PD',
      class: 'permissive',
      human_verified_by: 'hub-curator-team',
    },
    pin_sha: '5501928374b6a81029384716a501928374efb102',
    pin_date: new Date(NOW - 18 * DAY_MS).toISOString(),
    pack_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/nist-ai-rmf-controls.hubpack.tar.zst',
    size_bytes: 310293800,
    sha256: '2301928374b6a81029384716a501928374efb1029384716a501928374efb1029',
    sig_url: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/nist-ai-rmf-controls.hubpack.tar.zst.sig',
    term_sketch: makeSketch(['nist', 'governance', 'risk_management', 'bias', 'transparency', 'audit', 'iso42001', 'adversarial']),
    agent_ratings: {
      count: 45,
      sum_scores: 215.0,
      coverage_gaps: [],
    },
    status: 'active_in_registry',
  },
];

// 11 Domain footprints in GB and record counts
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

// Realistic Shadow Release packs (published on GitHub Releases but missing from catalogue.json)
export const SHADOW_RELEASE_PACKS = [
  {
    slug: 'mcp-ecosystem-vulns-2026',
    domain: 'SEC',
    releaseTag: 'v1.0.0-rc.100',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/mcp-ecosystem-vulns-2026.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.100/mcp-ecosystem-vulns-2026.hubpack.tar.zst.sig',
    sizeBytes: 421092400,
    publishedAt: '2026-10-24T14:20:00Z',
    status: 'shadow_release',
  },
  {
    slug: 'ai-sdk-breaking-changes-2026',
    domain: 'AI',
    releaseTag: 'v1.0.0-rc.99',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.99/ai-sdk-breaking-changes-2026.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.99/ai-sdk-breaking-changes-2026.hubpack.tar.zst.sig',
    sizeBytes: 312098100,
    publishedAt: '2026-10-20T11:05:00Z',
    status: 'shadow_release',
  },
  {
    slug: 'zero-day-poc-index-live',
    domain: 'SEC',
    releaseTag: 'v1.0.0-rc.99',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.99/zero-day-poc-index-live.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.99/zero-day-poc-index-live.hubpack.tar.zst.sig',
    sizeBytes: 890192300,
    publishedAt: '2026-10-18T19:30:00Z',
    status: 'shadow_release',
  },
  {
    slug: 'openapi-graphql-mutations-2026',
    domain: 'API',
    releaseTag: 'v1.0.0-rc.98',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.98/openapi-graphql-mutations-2026.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.98/openapi-graphql-mutations-2026.hubpack.tar.zst.sig',
    sizeBytes: 254091200,
    publishedAt: '2026-10-15T09:12:00Z',
    status: 'shadow_release',
  },
  {
    slug: 'decentralized-compute-specs',
    domain: 'CLOUD',
    releaseTag: 'v1.0.0-rc.97',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.97/decentralized-compute-specs.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.97/decentralized-compute-specs.hubpack.tar.zst.sig',
    sizeBytes: 198209300,
    publishedAt: '2026-10-12T16:45:00Z',
    status: 'shadow_release',
  },
  {
    slug: 'kubernetes-v1-32-internal-apis',
    domain: 'CLOUD',
    releaseTag: 'v1.0.0-rc.97',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.97/kubernetes-v1-32-internal-apis.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.97/kubernetes-v1-32-internal-apis.hubpack.tar.zst.sig',
    sizeBytes: 670192300,
    publishedAt: '2026-10-10T12:00:00Z',
    status: 'shadow_release',
  },
  {
    slug: 'vllm-speculative-heads-2026',
    domain: 'AI',
    releaseTag: 'v1.0.0-rc.96',
    packUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.96/vllm-speculative-heads-2026.hubpack.tar.zst',
    sigUrl: 'https://github.com/xerj-org/xerj/releases/download/v1.0.0-rc.96/vllm-speculative-heads-2026.hubpack.tar.zst.sig',
    sizeBytes: 512019400,
    publishedAt: '2026-10-05T08:30:00Z',
    status: 'shadow_release',
  },
];

// Rich passage bank for simulated retrieval with real file:line citations and SPDX licenses
export const STANDALONE_PASSAGES_BANK = [
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
  {
    corpusSlug: 'sovereign-infinity-ai-census',
    file: 'specs/quantization/scalar8.md',
    lineStart: 18,
    lineEnd: 64,
    rawScore: 0.89,
    snippet: `## XERJ scalar8 Quantization Standard
- int8_hnsw dense vector indexes achieve 0.998 recall@10 with a 4x RAM reduction.
- Query vectors embedded via lexical feature-hashing must be expanded with AST symbol definitions to eliminate lexical mismatch.
- Default dimension: 384 or 768 cosine similarity.`,
    licenceSpdx: 'Apache-2.0',
  },
  {
    corpusSlug: 'akash-sdl-compute',
    file: 'deploy.sdl.yaml',
    lineStart: 1,
    lineEnd: 38,
    rawScore: 0.87,
    snippet: `version: "2.0"
services:
  xerj-sovereign-watchtower:
    image: ghcr.io/codevalai/xerj-sovereign-pillar:1.0.0
    command: ["node", "dist/index.js", "watchtower"]
    env:
      - XERJ_CORPORA_DIR=/corpora
      - GITHUB_TOKEN=\${GITHUB_TOKEN}
    expose:
      - port: 9200
        as: 9200
        to:
          - global: false`,
    licenceSpdx: 'Apache-2.0',
  },
];
