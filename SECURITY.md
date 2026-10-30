# Security Policy — XERJ Sovereign Nexus

## Supported Versions
| Version | Supported | Status |
| :--- | :--- | :--- |
| **2.4.x** | :white_check_mark: | Active Sovereign Release |
| 2.0.x | :white_check_mark: | Maintenance / Deprecation |
| < 2.0 | :x: | End of Life |

---

## 1. Zero-Trust Airlock Architecture
XERJ operates an active context airlock gateway (`src/server/xerjZeroTrustGateway.ts`):
- **Operator WAL Tap Neutralization**: Prevents host node operators from tapping or eavesdropping on agent prompt deltas.
- **Namespace Isolation**: Disallows cross-namespace context pollution between independent agent swarms.
- **Prompt-Injection Containment**: Strips invisible unicode characters, zero-width joiners, and imperative prompt-injection instructions embedded in code comments.
- **Ed25519 Detached Verification**: Any pack or skill missing a verified Ed25519 signature is quarantined immediately.

---

## 2. zk-ASPF (Zero-Knowledge) Guarantees
- Multi-agent task handoffs and memory mutations are verified via zero-knowledge state claims before entering an agent's context window.
- The nullifier database prevents replay attacks and double-spend mutations.

---

## 3. Reporting a Vulnerability
If you discover a security vulnerability or bypass in the 7-hash Bloom invariant, Ed25519 gatekeeper, or Airlock gateway:
1. **Do NOT open a public issue.**
2. Send an encrypted report to `security@xerj.org` or contact the core maintainers via signed Ed25519 payload.
3. Include reproducible proof-of-concept steps.
4. Vulnerability patches are released within 24 hours accompanied by a detached Ed25519 advisory note.
