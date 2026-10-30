import {
  GossipTopic,
  GossipSubPeer,
  GossipSubMessage,
} from '../shared/xerjSchemas.js';
import { XerjProvenanceGate } from './xerjCryptoAndBloom.js';
import { createHash } from 'crypto';

export class XerjGossipMesh {
  private peers: GossipSubPeer[] = [
    {
      peerId: 'QmLocalNodeAlpha4ce5',
      multiaddr: '/ip4/127.0.0.1/tcp/9200/p2p/QmLocalNodeAlpha4ce5',
      latencyMs: 1.2,
      subscribedTopics: [
        'xerj/crdt-sync',
        'xerj/zk-proofs',
        'xerj/pulse-announcements',
        'xerj/skill-announcements',
      ],
      status: 'CONNECTED',
      messagesRelayed: 1482,
      agentRole: 'Primary Sovereign Tri-Node Leader',
    },
    {
      peerId: 'QmAkashWorkerUsWest01',
      multiaddr: '/dns4/us-west.akash.network/tcp/30443/wss/p2p/QmAkashWorkerUsWest01',
      latencyMs: 38.4,
      subscribedTopics: [
        'xerj/crdt-sync',
        'xerj/pulse-announcements',
        'xerj/skill-announcements',
      ],
      status: 'CONNECTED',
      messagesRelayed: 924,
      agentRole: 'Akash SDL Hyper-Crawler (Unit 1)',
    },
    {
      peerId: 'QmAkashWorkerEuCentral02',
      multiaddr: '/dns4/eu-central.akash.network/tcp/30443/wss/p2p/QmAkashWorkerEuCentral02',
      latencyMs: 76.1,
      subscribedTopics: ['xerj/crdt-sync', 'xerj/zk-proofs'],
      status: 'CONNECTED',
      messagesRelayed: 641,
      agentRole: 'Akash SDL AST Worker (Unit 2)',
    },
    {
      peerId: 'QmHubRelayBootstrap',
      multiaddr: '/dns4/hub.xerj.org/tcp/443/wss/p2p/QmHubRelayBootstrap',
      latencyMs: 24.8,
      subscribedTopics: [
        'xerj/crdt-sync',
        'xerj/zk-proofs',
        'xerj/pulse-announcements',
        'xerj/skill-announcements',
      ],
      status: 'CONNECTED',
      messagesRelayed: 3810,
      agentRole: 'Global Hub Federation Relay & Bootstrap',
    },
    {
      peerId: 'QmCrawlerAdvisoryWatcher',
      multiaddr: '/ip4/10.0.4.88/tcp/4001/p2p/QmCrawlerAdvisoryWatcher',
      latencyMs: 12.3,
      subscribedTopics: ['xerj/pulse-announcements', 'xerj/zk-proofs'],
      status: 'CONNECTED',
      messagesRelayed: 412,
      agentRole: 'Delta-Crawl Advisory Sentinel (Unit 4)',
    },
  ];

  private messageHistory: GossipSubMessage[] = [];
  private sequenceCounter = 1;

  constructor() {
    this.seedInitialMessages();
  }

  private seedInitialMessages(): void {
    const pubKey = XerjProvenanceGate.getNodePublicKeyHex();
    const now = Date.now();

    const sampleMessages: Array<{
      topic: GossipTopic;
      origin: string;
      payload: Record<string, any>;
      offsetMinutes: number;
    }> = [
      {
        topic: 'xerj/crdt-sync',
        origin: 'QmLocalNodeAlpha4ce5',
        payload: {
          op: 'MERKLE_ROOT_UPDATE',
          namespace: 'solana-anchor-specs',
          rootHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          clock: { nodeAlpha: 142, akashWest: 98 },
          bloomBitsetUpdated: true,
        },
        offsetMinutes: 3,
      },
      {
        topic: 'xerj/zk-proofs',
        origin: 'QmAkashWorkerEuCentral02',
        payload: {
          op: 'ZK_ASPF_PROOF_VERIFIED',
          claimId: 'claim-zk-sec-8842',
          protocol: 'Groth16-Simulated-Secp256k1',
          nullifier: 'nullifier_94a810f27c01a938',
          stateRootPassed: true,
        },
        offsetMinutes: 2,
      },
      {
        topic: 'xerj/pulse-announcements',
        origin: 'QmLocalNodeAlpha4ce5',
        payload: {
          op: 'CHRONOS_24H_CYCLE_REFRESH',
          cycleId: 'cycle-2026-03-30-01',
          ttlDaysReset: 30,
          status: 'ACTIVE_OPTIMAL',
          filesScanned: 48,
        },
        offsetMinutes: 1,
      },
      {
        topic: 'xerj/skill-announcements',
        origin: 'QmHubRelayBootstrap',
        payload: {
          op: 'SKILL_VETTED_BROADCAST',
          skillId: 'rust-security-audit-v1',
          safetyScore: 0.98,
          author: 'xerj-sec-guild',
          approved: true,
        },
        offsetMinutes: 0.5,
      },
    ];

    for (const s of sampleMessages) {
      const payloadStr = JSON.stringify(s.payload);
      const fakeSig = createHash('sha256').update(payloadStr + s.origin).digest('hex') +
        createHash('sha256').update(s.origin).digest('hex');

      this.messageHistory.unshift({
        messageId: `msg-${Date.now()}-${this.sequenceCounter++}`,
        topic: s.topic,
        originPeerId: s.origin,
        timestampIso: new Date(now - s.offsetMinutes * 60000).toISOString(),
        sequence: this.sequenceCounter,
        payload: s.payload,
        signatureHex: fakeSig,
        signerPublicKeyHex: pubKey,
        verified: true,
        hops: Math.floor(Math.random() * 3) + 1,
      });
    }
  }

  public getPeerTopology(): {
    network: string;
    totalPeers: number;
    connectedPeers: number;
    activeTopics: GossipTopic[];
    totalMessagesRelayed: number;
    peers: GossipSubPeer[];
  } {
    const totalMessages = this.peers.reduce((acc, p) => acc + p.messagesRelayed, 0);
    return {
      network: 'libp2p-gossipsub-v1.2 (secio/ed25519)',
      totalPeers: this.peers.length,
      connectedPeers: this.peers.filter(p => p.status === 'CONNECTED').length,
      activeTopics: [
        'xerj/crdt-sync',
        'xerj/zk-proofs',
        'xerj/pulse-announcements',
        'xerj/skill-announcements',
      ],
      totalMessagesRelayed: totalMessages,
      peers: this.peers,
    };
  }

  public getMessages(topic?: GossipTopic, limit = 25): GossipSubMessage[] {
    let result = this.messageHistory;
    if (topic) {
      result = result.filter(m => m.topic === topic);
    }
    return result.slice(0, limit);
  }

  public async publishMessage(
    topic: GossipTopic,
    payload: Record<string, any>,
    originPeerId?: string
  ): Promise<GossipSubMessage> {
    const origin = originPeerId || 'QmLocalNodeAlpha4ce5';
    const payloadStr = JSON.stringify(payload);
    const pubKey = XerjProvenanceGate.getNodePublicKeyHex();
    const signatureHex = await XerjProvenanceGate.signPayload(payloadStr);

    const message: GossipSubMessage = {
      messageId: `msg-${Date.now()}-${this.sequenceCounter++}`,
      topic,
      originPeerId: origin,
      timestampIso: new Date().toISOString(),
      sequence: this.sequenceCounter,
      payload,
      signatureHex,
      signerPublicKeyHex: pubKey,
      verified: true,
      hops: 1,
    };

    // Prepend to ring buffer (keep max 100)
    this.messageHistory.unshift(message);
    if (this.messageHistory.length > 100) {
      this.messageHistory.pop();
    }

    // Increment message relayed counter for subscribed peers
    for (const peer of this.peers) {
      if (peer.subscribedTopics.includes(topic)) {
        peer.messagesRelayed += 1;
      }
    }

    return message;
  }
}

export const xerjGossipMesh = new XerjGossipMesh();
