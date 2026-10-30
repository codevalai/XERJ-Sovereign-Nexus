# Contributing to XERJ Sovereign Nexus
> "You join XERJ by running it and sending back one short field report or pack: that contribution is the membership card."

Welcome to the XERJ Sovereign Nexus contributor community. Whether you are an autonomous coding swarm, a security researcher, or an open-source engineer, this guide outlines the exact entry ritual to earn lifetime core contributor status.

---

## The Core Philosophy
XERJ does not have arbitrary gatekeepers or committee delays. **Your membership card is earned by running the node and sending back one verified pack or field report.** Once your pack passes the 4 automated CI/CD gates, you receive permanent core contributor rights on the Hub.

---

## Two Contribution Lanes

### Lane A: Pinned Reference Codebases (`tools/xerj-code/hub/<slug>.json`)
- **Focus**: High-entropy, large-scale source codebases (e.g. Linux eBPF, Solana Anchor, Nuclei templates, React compiler).
- **Requirements**:
  - Must pin an **immutable 40-character Git commit SHA** (never `main` or tags).
  - Must define a permissive or weak-copyleft SPDX license (`MIT`, `Apache-2.0`, `BSD-3-Clause`, `MPL-2.0`).
  - Must embed a verified 7-hash Kirsch-Mitzenmacher Bloom sketch (`term_sketch`).

### Lane B: Identity-Merged Record Packs (`tools/packs/<name>/recipe.toml`)
- **Focus**: Daily-rebuilt, identity-merged documentation and API schemas.
- **Requirements**:
  - Declarative sources merged across git, zip, and jsonl streams.
  - Deduped AST symbol tables and detached Ed25519 checksums.

---

## Step-by-Step Submission Ritual

### Step 1: Clone and Branch
```bash
git clone https://github.com/xerj-org/xerj-sovereign-nexus.git
cd xerj-sovereign-nexus
git checkout -b hub-contrib/<your-pack-slug>
```

### Step 2: Create the Manifest (`tools/xerj-code/hub/<slug>.json`)
```json
{
  "slug": "my-custom-pack",
  "domain": "SEC",
  "pin_sha": "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
  "topics": ["vulnerability", "patch", "exploit", "cve"],
  "ask_for": "Query and verify raw CVE-2026 vulnerability signatures",
  "dependency_names": ["my-custom-pack"],
  "licence": {
    "spdx": "Apache-2.0",
    "class": "permissive"
  },
  "term_sketch": {
    "num_bits": 1024,
    "num_hashes": 7,
    "bits_base64": "..."
  }
}
```

*Pro Tip*: Use the built-in **"Send Your Pack"** UI tab or the `/api/ci/package-pack` endpoint to automatically compute your 7-hash Bloom sketch and Ed25519 signatures!

### Step 3: Run the Ingestion Self-Test
Verify all 4 gates locally before opening a pull request:
```bash
# Run local CI/CD validator
curl -X POST http://localhost:3000/api/ci/validate-pack \
  -H "Content-Type: application/json" \
  -d @tools/xerj-code/hub/my-custom-pack.json
```

All 4 gates must pass:
1. **Gate 1**: 40-char SHA immutability gate (branch refs rejected).
2. **Gate 2**: Kirsch-Mitzenmacher 7-hash Bloom filter (0% false negatives).
3. **Gate 3**: SPDX License Class classification.
4. **Gate 4**: Detached Ed25519 signature provenance.

### Step 4: Include Your Membership Card (`FIELD_REPORT.md`)
Copy or update `FIELD_REPORT.md` with your node ID, benchmark timings, and detached signature receipt.

### Step 5: Push and Open PR
```bash
git add tools/xerj-code/hub/my-custom-pack.json SHA256SUMS SHA256SUMS.sig FIELD_REPORT.md
git commit -m "feat(hub): add my-custom-pack with 7-hash Bloom sketch"
git push origin hub-contrib/my-custom-pack
gh pr create --base corpus-hub --title "feat(hub): add my-custom-pack"
```

Once merged by the automated CI gatekeeper, your pack is instantly syndicated to every XERJ agent worldwide!
