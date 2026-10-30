# AGENTS.md — Autonomous Agent Operational Standard
> Target: Coding Agents, MCP Clients, Swarm Crawlers (Claude Code, Cursor, Windsurf, OpenClaw)

## System Overview
XERJ Sovereign Nexus is a decentralized, sub-millisecond AST-aware corpus hub and memory fabric designed to eradicate the 30-day index death spiral and eliminate hallucinated systems contracts.

## Core Endpoints
- **Federated Search**: `POST /api/federated-route` (Supports 11 Hub Domains, AST query compiling)
- **Zero-Knowledge State Proofs (zk-ASPF)**: `POST /api/zk/generate-proof`, `POST /api/zk/verify-proof`
- **Skill Vetting & Registry**: `POST /_skills/vetting`, `GET /_skills/registry`
- **Chronos Perpetual Loop**: `GET /api/chronos/status`, `POST /api/chronos/trigger-cycle`
- **Model Context Protocol (MCP)**: `GET /api/mcp/config?client=Claude%20Code`
- **Agent Discovery (ARD/APoP/A2A)**:
  - `/.well-known/ai-catalog.json` (Agentic Resource Discovery phonebook)
  - `/.well-known/agent-policy.json` (Agent Policy Protocol consent & rate rules)
  - `/.well-known/agent.json` (A2A Protocol v1.0 Agent Card)

## Zero-False-Negative Guarantee
All packs and skills enforce a Kirsch-Mitzenmacher 7-hash Bloom filter (`g_i(x) = (h1 + i * h2) mod m`). If any bit position returns 0, the symbol is GUARANTEED absent.

## Provenance
All releases and vetted skills are signed with detached Ed25519 signatures. No unsigned code is ingested into the active swarm.
