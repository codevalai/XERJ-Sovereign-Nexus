# AGENTS.md — Autonomous Agent Operational Standard
> Target: Coding Agents, MCP Clients, Swarm Crawlers (Claude Code, Cursor, Windsurf, OpenClaw)

## System Overview
XERJ Sovereign Nexus is a decentralized, sub-millisecond AST-aware corpus hub and memory fabric designed to eradicate the 30-day index death spiral and eliminate hallucinated systems contracts.

## Core Endpoints
- **Federated Search**: `POST /api/federated-route` (Supports 11 Hub Domains, AST query compiling)
- **Zero-Knowledge State Proofs (zk-ASPF)**: `POST /api/zk/generate-proof`, `POST /api/zk/verify-proof`
- **Byzantine Swarm Consensus (BFT)**: `POST /_swarm/consensus/propose`, `POST /_swarm/consensus/commit`, `GET /_swarm/consensus/blocks`, `GET /_swarm/consensus/metrics`
- **Model-Agnostic Semantic Normalization (MASN)**: `POST /api/masn/normalize`, `POST /api/masn/transcode`
- **Zero-Loss Neural Checkpointing**: `POST /api/neural/snapshot`, `GET /api/neural/snapshot/:hash`, `POST /_memory/checkpoint`
- **P2P BitTorrent Bitswap Stream**: `POST /api/bitswap/register`, `GET /api/bitswap/stream/:hashOrCid`
- **Universal Autonomous DID Passports**: `POST /api/passport/issue`, `GET /api/passport/:did`, `POST /api/did/register`
- **Skill Vetting & Registry**: `POST /_skills/vetting`, `GET /_skills/registry`
- **Chronos Perpetual Loop**: `GET /api/chronos/status`, `POST /api/chronos/trigger-cycle`
- **Model Context Protocol (MCP)**: `GET /api/mcp/config?client=Claude%20Code`
- **Agent Discovery (ARD/APoP/A2A)**:
  - `/.well-known/ai-catalog.json` (Agentic Resource Discovery phonebook)
  - `/.well-known/agent-policy.json` (Agent Policy Protocol consent & rate rules)
  - `/.well-known/agent.json` (A2A Protocol v1.0 Agent Card)

## Zero-False-Negative Guarantee
All packs and skills enforce a Kirsch-Mitzenmacher 7-hash Bloom filter (`g_i(x) = (h1 + i * h2) mod m`). If any bit position returns 0, the symbol is GUARANTEED absent.

## Provenance & BFT Quorum
All releases and vetted skills are signed with detached Ed25519 signatures. State proposals require a 67% (2/3 majority) Byzantine Fault Tolerant quorum across peer nodes to commit to the global immutable ledger.
