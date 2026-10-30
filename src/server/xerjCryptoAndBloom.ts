import * as ed from '@noble/ed25519';
import { createHash, randomBytes } from 'crypto';
import { CatalogueEntry, TermSketch } from '../shared/xerjSchemas.js';

// Configure sha512 for @noble/ed25519 in Node environment
if (ed.hashes) {
  ed.hashes.sha512 = (message: Uint8Array) => {
    return new Uint8Array(createHash('sha512').update(message).digest());
  };
  ed.hashes.sha512Async = (message: Uint8Array) =>
    Promise.resolve(ed.hashes.sha512!(message));
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_DAYS_MS = 24 * 24 * 60 * 60 * 1000;

/**
 * Computes deterministic 64-bit split hashes from SHA-256 to execute
 * 7-hash Kirsch-Mitzenmacher bit probing: g_i(x) = (h1 + i * h2) mod m
 */
export function computeSevenBitPositions(term: string, numBits: number): number[] {
  const normalized = term.trim().toLowerCase();
  const digest = createHash('sha256').update(normalized, 'utf8').digest();
  const h1 = digest.readUInt32LE(0);
  const h2 = digest.readUInt32LE(4) || 0x9e3779b9; // Non-zero Golden Ratio prime stride
  const positions: number[] = [];
  for (let i = 0; i < 7; i++) {
    const combined = (h1 + Math.imul(i, h2)) >>> 0;
    positions.push(combined % numBits);
  }
  return positions;
}

export class XerjTermSketch {
  /**
   * Builds a fresh 7-hash Bloom filter over a corpus vocabulary (for Lane A/B Pack Forge)
   */
  static buildFromVocabulary(terms: Iterable<string>): TermSketch {
    const unique = Array.from(new Set(Array.from(terms, t => t.trim().toLowerCase()).filter(t => t.length >= 2)));
    const numBits = Math.max(1024, Math.ceil(Math.max(unique.length, 16) * 10.5));
    const byteLength = Math.ceil(numBits / 8);
    const bitArray = Buffer.alloc(byteLength, 0);

    for (const term of unique) {
      for (const pos of computeSevenBitPositions(term, numBits)) {
        bitArray[pos >>> 3] |= (1 << (pos & 7));
      }
    }

    return {
      num_bits: numBits,
      num_hashes: 7,
      bits_base64: bitArray.toString('base64'),
    };
  }

  /**
   * Returns true if term is potentially present; false if GUARANTEED absent (0% false negative)
   */
  static mightContain(sketch: TermSketch, term: string): boolean {
    const buf = Buffer.from(sketch.bits_base64, 'base64');
    const positions = computeSevenBitPositions(term, sketch.num_bits);
    for (const pos of positions) {
      const byteIdx = pos >>> 3;
      if (byteIdx >= buf.length) return false;
      if ((buf[byteIdx] & (1 << (pos & 7))) === 0) {
        return false; // Mathematical 0% false-negative guarantee
      }
    }
    return true;
  }

  /**
   * Inspects detailed bit probing for UI visualization
   */
  static inspectProbing(sketch: TermSketch, term: string) {
    const buf = Buffer.from(sketch.bits_base64, 'base64');
    const positions = computeSevenBitPositions(term, sketch.num_bits);
    const bitResults = positions.map((pos, hashIndex) => {
      const byteIdx = pos >>> 3;
      const isSet = byteIdx < buf.length && (buf[byteIdx] & (1 << (pos & 7))) !== 0;
      return { hashIndex, bitPosition: pos, isSet };
    });
    const matchesAll = bitResults.every(b => b.isSet);
    return {
      term,
      matchesAll,
      bitResults,
      numBits: sketch.num_bits,
    };
  }
}

export class XerjProvenanceGate {
  private static nodeKeypair = XerjProvenanceGate.generateEd25519Keypair();

  static getNodePublicKeyHex(): string {
    return XerjProvenanceGate.nodeKeypair.publicKeyHex;
  }

  static async signPayload(payload: string | Uint8Array): Promise<string> {
    const res = await XerjProvenanceGate.signDetached(payload, XerjProvenanceGate.nodeKeypair.privateKeyHex);
    return res.signatureHex;
  }

  /**
   * Generates a persistent or ephemeral Ed25519 keypair
   */
  static generateEd25519Keypair() {
    const privateKey = randomBytes(32);
    const publicKey = ed.getPublicKey(privateKey);
    return {
      privateKeyHex: Buffer.from(privateKey).toString('hex'),
      publicKeyHex: Buffer.from(publicKey).toString('hex'),
    };
  }

  /**
   * Signs a string or Buffer using Ed25519 detached signature
   */
  static async signDetached(payload: string | Uint8Array, privateKeyHex: string) {
    const bytes = typeof payload === 'string' ? Buffer.from(payload, 'utf8') : payload;
    const privBytes = Buffer.from(privateKeyHex, 'hex');
    const sig = await ed.signAsync(bytes, privBytes);
    return {
      signatureHex: Buffer.from(sig).toString('hex'),
      signatureBase64: Buffer.from(sig).toString('base64'),
    };
  }

  /**
   * Verifies detached Ed25519 signature
   */
  static async verifyDetachedSignature(
    payload: string | Uint8Array,
    signatureHexOrBase64: string,
    publicKeyHex: string
  ): Promise<boolean> {
    try {
      const bytes = typeof payload === 'string' ? Buffer.from(payload, 'utf8') : payload;
      const cleanSig = signatureHexOrBase64.trim();
      const sigBytes = /^[a-f0-9]{128}$/i.test(cleanSig)
        ? Buffer.from(cleanSig, 'hex')
        : Buffer.from(cleanSig, 'base64');
      const pubBytes = Buffer.from(publicKeyHex, 'hex');
      return await ed.verifyAsync(sigBytes, bytes, pubBytes);
    } catch {
      return false;
    }
  }

  /**
   * Enforces XERJ's strict 30-day anti-staleness refusal gate and Chronos-Sentinel Day-24 threshold
   */
  static evaluateStaleness(pinDateIso: string, nowMs = Date.now()) {
    const pinMs = new Date(pinDateIso).getTime();
    const elapsed = Math.max(0, nowMs - pinMs);
    const ageDays = Number((elapsed / (24 * 60 * 60 * 1000)).toFixed(2));
    const remainingHours = Math.max(0, Number(((THIRTY_DAYS_MS - elapsed) / (60 * 60 * 1000)).toFixed(1)));
    const remainingDays = Number((remainingHours / 24).toFixed(1));

    const isStaleRefused = elapsed > THIRTY_DAYS_MS;
    const isChronosAlert = elapsed >= TWENTY_FOUR_DAYS_MS && !isStaleRefused;

    return {
      allowed: !isStaleRefused,
      status: isStaleRefused ? 'REFUSED_STALE' : isChronosAlert ? 'CHRONOS_ROTATION_REQUIRED' : 'VERIFIED_FRESH',
      ageDays,
      remainingHours,
      remainingDays,
      warning: isStaleRefused
        ? `XERJ Exit Code 3: Corpus is ${ageDays} days old (>30.0d cliff). Index refused!`
        : isChronosAlert
        ? `Chronos Sentinel Alert: Corpus is at Day ${ageDays} (>=24d). Delta-reindex required before 30-day cliff.`
        : undefined,
    };
  }

  /**
   * Computes XERJ Hub v2 Bayesian Usefulness Score (Prior = 3.0, Weight = 5)
   * Formula: ((5 * 3.0) + sum) / (5 + count)
   * Only surfaces coverage gaps reported by >= 3 independent agents
   */
  static computeBayesianTelemetry(ratings?: CatalogueEntry['agent_ratings']) {
    const PRIOR_MEAN = 3.0;
    const PRIOR_WEIGHT = 5;
    const count = ratings?.count ?? 0;
    const sum = ratings?.sum_scores ?? 0;
    const bayesianScore = Number(((PRIOR_WEIGHT * PRIOR_MEAN + sum) / (PRIOR_WEIGHT + count)).toFixed(2));
    const verifiedCoverageGaps = (ratings?.coverage_gaps ?? []).filter(
      g => g.independent_agent_reports >= 3
    );
    return { bayesianScore, sampleSize: count, verifiedCoverageGaps };
  }
}
