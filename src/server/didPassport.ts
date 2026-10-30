import { createHash, randomBytes } from 'crypto';
import { XerjProvenanceGate } from './xerjCryptoAndBloom.js';

export interface IssuedPassportRecord {
  did: string;
  agentName: string;
  publicKeyHex: string;
  signedToken: string;
  ed25519NodeAttestation: string;
  issuedAtIso: string;
  reputation: number;
  roles: string[];
}

export class XerjDidPassportManager {
  private static passports = new Map<string, IssuedPassportRecord>();

  /**
   * Issues every registered agent a cryptographically bound Decentralized Identifier
   * (did:xerj:<hash>) so all task escrows, zero-knowledge proofs, and memory sync
   * deltas are permanently signed.
   */
  public static async issueDidPassport(
    agentName: string,
    publicKeyHex?: string,
    roles = ['SWARM_OPERATOR', 'AST_VERIFIER']
  ): Promise<IssuedPassportRecord> {
    const pubKey = publicKeyHex || randomBytes(32).toString('hex');
    const fingerprint = createHash('sha256').update(agentName + pubKey).digest('hex').slice(0, 32);
    const did = `did:xerj:${fingerprint}`;
    const timestamp = Date.now();
    const signedToken = createHash('sha256').update(`${did}:${timestamp}`).digest('hex');
    
    // Ed25519 node attestation
    const ed25519NodeAttestation = await XerjProvenanceGate.signPayload(`${did}:${pubKey}:${signedToken}`);

    const record: IssuedPassportRecord = {
      did,
      agentName,
      publicKeyHex: pubKey,
      signedToken,
      ed25519NodeAttestation,
      issuedAtIso: new Date(timestamp).toISOString(),
      reputation: 98,
      roles,
    };

    this.passports.set(did, record);
    return record;
  }

  public static getPassport(did: string): IssuedPassportRecord | null {
    return this.passports.get(did) || null;
  }

  public static listPassports(): IssuedPassportRecord[] {
    return Array.from(this.passports.values());
  }

  public static seedInitialPassports(): void {
    if (this.passports.size > 0) return;
    const initial = [
      { name: 'claude-3-5-sonnet-orchestrator', pub: '14df088737bb523efbcba757a3e74a621cf9274291845eb5b23d0473a242f201' },
      { name: 'openclaw-hyper-crawler', pub: '89f412a8c3d9711624b51a029384716242398402941039481239481923481234' },
      { name: 'cursor-ast-indexer', pub: 'e928371948192384719238471923847192837192384719238471923847192384' },
      { name: 'gemini-2-5-flash-tribunal', pub: '9182374918237491823749182374918237491823749182374918237491823749' },
    ];

    for (const item of initial) {
      this.issueDidPassport(item.name, item.pub);
    }
  }
}

// Seed initial passports
XerjDidPassportManager.seedInitialPassports();
