import { createHash } from 'crypto';

export interface BitswapChunkDescriptor {
  chunkHash: string;
  cid: string;
  sizeBytes: number;
  bloomBitOffset: number;
  dataBase64: string;
  registeredAt: string;
}

export class XerjP2PBitswapStream {
  private static chunkStore = new Map<string, Buffer>();
  private static chunkMetadata = new Map<string, BitswapChunkDescriptor>();

  public static registerChunk(chunkHash: string, data: Buffer, bloomBitOffset = 0): BitswapChunkDescriptor {
    this.chunkStore.set(chunkHash, data);
    const cid = `bafkrei${chunkHash.slice(0, 32)}`;
    
    const descriptor: BitswapChunkDescriptor = {
      chunkHash,
      cid,
      sizeBytes: data.length,
      bloomBitOffset,
      dataBase64: data.toString('base64'),
      registeredAt: new Date().toISOString(),
    };

    this.chunkMetadata.set(chunkHash, descriptor);
    this.chunkMetadata.set(cid, descriptor);
    return descriptor;
  }

  public static streamChunk(chunkHashOrCid: string): Buffer | null {
    if (this.chunkStore.has(chunkHashOrCid)) {
      return this.chunkStore.get(chunkHashOrCid) || null;
    }
    const meta = this.chunkMetadata.get(chunkHashOrCid);
    if (meta && this.chunkStore.has(meta.chunkHash)) {
      return this.chunkStore.get(meta.chunkHash) || null;
    }
    return null;
  }

  public static getChunkMetadata(chunkHashOrCid: string): BitswapChunkDescriptor | null {
    return this.chunkMetadata.get(chunkHashOrCid) || null;
  }

  public static listAvailableChunks(): BitswapChunkDescriptor[] {
    const unique = new Map<string, BitswapChunkDescriptor>();
    for (const desc of this.chunkMetadata.values()) {
      unique.set(desc.chunkHash, desc);
    }
    return Array.from(unique.values());
  }

  public static seedSampleChunks(): void {
    if (this.chunkStore.size > 0) return;

    const sampleChunks = [
      { name: 'ebpf-core-filter-c-headers', payload: 'AST_BPF_RINGBUF_OUTPUT_SYMBOL_PIN_2026_CHUNK_A' },
      { name: 'solana-anchor-cpi-guards', payload: 'AST_SOLANA_CPI_INVOKE_SIGNED_ACCOUNT_SEED_CHUNK_B' },
      { name: 'postgres-wal-advisory-lock', payload: 'AST_PG_TRY_ADVISORY_LOCK_EXCLUSIVE_GUARD_CHUNK_C' },
    ];

    for (let i = 0; i < sampleChunks.length; i++) {
      const data = Buffer.from(`${sampleChunks[i].payload} [PAD_${'0'.repeat(256)}]`);
      const hash = createHash('sha256').update(data).digest('hex');
      this.registerChunk(hash, data, i * 16384);
    }
  }
}

// Seed initial chunks
XerjP2PBitswapStream.seedSampleChunks();
