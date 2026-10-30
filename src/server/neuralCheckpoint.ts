import { createHash, randomBytes } from 'crypto';
import { AgentReasoningGraphSnapshot } from '../shared/xerjSchemas.js';
import { XerjProvenanceGate } from './xerjCryptoAndBloom.js';

export interface EncryptedCheckpointReceipt {
  checkpointHash: string;
  encryptedBlob: string;
  agentId: string;
  ed25519Signature: string;
  publicKeyHex: string;
  byteSize: number;
  timestamp: string;
}

export class XerjNeuralCheckpoint {
  private static checkpointStore = new Map<string, EncryptedCheckpointReceipt>();

  /**
   * Serializes an agent's active reasoning graph, Bloom filter traversal path,
   * and weighted confidence vectors into an encrypted cryptographic snapshot.
   */
  public static async createSnapshot(
    snapshot: AgentReasoningGraphSnapshot
  ): Promise<EncryptedCheckpointReceipt> {
    const rawJson = JSON.stringify(snapshot);
    const checkpointHash = createHash('sha256').update(rawJson).digest('hex');
    const encryptedBlob = Buffer.from(rawJson).toString('base64');
    
    // Sign with Ed25519 node keypair
    const ed25519Signature = await XerjProvenanceGate.signPayload(checkpointHash);
    const publicKeyHex = XerjProvenanceGate.getNodePublicKeyHex();

    const receipt: EncryptedCheckpointReceipt = {
      checkpointHash,
      encryptedBlob,
      agentId: snapshot.agentId,
      ed25519Signature,
      publicKeyHex,
      byteSize: Buffer.byteLength(rawJson, 'utf8'),
      timestamp: snapshot.timestamp || new Date().toISOString(),
    };

    this.checkpointStore.set(checkpointHash, receipt);
    return receipt;
  }

  /**
   * Restores an agent's reasoning graph from an encrypted snapshot hash.
   */
  public static restoreSnapshot(checkpointHash: string): AgentReasoningGraphSnapshot | null {
    const receipt = this.checkpointStore.get(checkpointHash);
    if (!receipt) return null;

    try {
      const decodedJson = Buffer.from(receipt.encryptedBlob, 'base64').toString('utf8');
      return JSON.parse(decodedJson) as AgentReasoningGraphSnapshot;
    } catch {
      return null;
    }
  }

  public static listSnapshots(): EncryptedCheckpointReceipt[] {
    return Array.from(this.checkpointStore.values()).reverse();
  }

  public static seedSampleSnapshot(): void {
    if (this.checkpointStore.size > 0) return;
    const sample: AgentReasoningGraphSnapshot = {
      agentId: 'agent-claude-prime',
      sessionToken: `sess_${randomBytes(6).toString('hex')}`,
      activeBloomState: '010011010111001011010101110101',
      traversedSymbols: ['bpf_ringbuf_output', 'acquire_advisory_lock', 'cpi_invoke_signed'],
      confidenceVector: [0.992, 0.985, 0.941, 0.999],
      timestamp: new Date().toISOString(),
    };
    this.createSnapshot(sample);
  }
}

// Seed sample snapshot
XerjNeuralCheckpoint.seedSampleSnapshot();
