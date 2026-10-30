## XERJ Pack / Code Contribution Pull Request

### 1. Ingestion Checklist
- [ ] **Gate 1 (SHA Immutability)**: `pin_sha` is an immutable 40-character Git commit hash (never `main`, `master`, or tags).
- [ ] **Gate 2 (Bloom Invariant)**: Embedded `term_sketch` has `num_hashes: 7` and 0% false negative rate across extracted symbols.
- [ ] **Gate 3 (License Compliance)**: SPDX license is `permissive` (MIT, Apache-2.0, BSD) or `weak-copyleft` (MPL-2.0).
- [ ] **Gate 4 (Detached Provenance)**: Signed with Ed25519; checksum matches `SHA256SUMS`.
- [ ] **Contributor Membership Card**: `FIELD_REPORT.md` is included or updated with node diagnostics.

### 2. Contributed Pack / Component Details
- **Pack Slug**: 
- **Hub Domain**: (SEC | SYS | API | AI | DATA | WEB | CRYPTO | CLOUD | LANG | GAME | GOV)
- **Pinned Git Commit SHA**: 
- **SPDX License**: 
- **Test Symbols Probed**: 

### 3. Contributor Membership Attestation
> *"You join XERJ by running it and sending back one short field report or pack: that contribution is the membership card."*
- Contributor Node ID: 
- Public Key (Ed25519): 
