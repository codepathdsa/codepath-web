import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-036',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Zoom (Video Conferencing)',
  companies: ['Zoom', 'Google Meet', 'Microsoft Teams'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design the media routing infrastructure for a video conferencing platform. ' +
    'Support up to 1000 participants per meeting, sub-second video latency, ' +
    'and adaptive quality based on each participant\'s bandwidth. ' +
    'Handle 1M concurrent meetings globally.',
  solution:
    'A Selective Forwarding Unit (SFU) receives each participant\'s video stream ' +
    'and selectively forwards it to other participants. ' +
    'Each sender uploads one stream; the SFU handles forwarding — much more efficient than P2P mesh. ' +
    'Simulcast: each sender transmits 3 quality tiers (1080p, 720p, 360p). ' +
    'The SFU sends each receiver the quality matching their bandwidth. ' +
    'SFUs are distributed globally (edge-deployed) to minimize latency.',

  simulation: {
    constraints: [
      { label: 'Concurrent meetings', value: '1M' },
      { label: 'Max participants/meeting', value: '1,000' },
      { label: 'Video bitrate per stream', value: '1.5 Mbps (1080p)' },
      { label: 'SFU forwarding load', value: '~1.5 Mbps × N × M participants' },
      { label: 'Latency target', value: '< 150ms glass-to-glass' },
    ],
    levels: [
      {
        traffic: 100,
        targetLatency: 150,
        successMsg: 'SFU routing media — video forwarding to all participants.',
        failMsg: '[FATAL] Video streams not reaching participants. Configure SFU routing.',
        failNode: 'api_server',
        failTooltip:
          'A Selective Forwarding Unit receives video/audio streams and forwards to each subscriber. ' +
          'It doesn\'t decode/re-encode — it just routes RTP packets. ' +
          'Scales much better than MCU (which mixes all streams on a server).',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 1000,
        targetLatency: 150,
        successMsg: 'Simulcast active — quality adapts to each participant\'s bandwidth in real-time.',
        failMsg:
          '[QUALITY DEGRADED] All participants receiving 1080p even those with < 1 Mbps bandwidth. ' +
          'Implement simulcast: senders transmit 3 quality tiers, SFU selects per receiver.',
        failNode: 'api_server',
        failTooltip:
          'Simulcast: sender publishes 3 streams simultaneously (1080p, 720p, 360p). ' +
          'SFU tracks each receiver\'s bandwidth estimate (REMB feedback from receiver). ' +
          'Switches quality tier per receiver based on available bandwidth.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'load_balancer' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 150,
        successMsg: 'SYSTEM STABLE — 1M concurrent meetings, edge SFUs reducing latency globally.',
        failMsg:
          '[LATENCY] Participants in Australia connecting to US-based SFU — 300ms latency. ' +
          'Deploy SFUs at edge locations globally.',
        failNode: 'load_balancer',
        failTooltip:
          'Each meeting\'s SFU should be in the region closest to the participants. ' +
          'A meeting routing service assigns a meeting to an SFU cluster based on participant geography. ' +
          'When participants span multiple regions, use a multi-region SFU cascade.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'load_balancer' },
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the difference between P2P mesh, MCU, and SFU architectures for video conferencing?',
      hint: 'Compare bandwidth and server CPU for each model.',
      answer:
        'P2P mesh: every participant sends their stream to every other participant. ' +
        'Upload bandwidth = (N-1) × stream_bitrate. For 10 participants: 9 uploads. Scales to ~4 people. ' +
        'MCU (Multipoint Control Unit): server decodes all streams, mixes them into one, re-encodes. ' +
        'Upload bandwidth = 1 stream. But server CPU = O(N × decode + mix + encode). Expensive. ' +
        'SFU (Selective Forwarding Unit): server forwards individual streams without decoding. ' +
        'Upload bandwidth = 1 stream. Server CPU = O(N) routing only. Best balance. Zoom uses SFU.',
    },
    {
      q: 'What protocols does Zoom use for media transmission, and why not TCP?',
      hint: 'Real-time media has different requirements than file transfer.',
      answer:
        'WebRTC uses UDP-based RTP (Real-time Transport Protocol) for media. ' +
        'TCP guarantees delivery and order — if a packet is lost, TCP retransmits. ' +
        'For video, a retransmitted frame arrives too late to display. ' +
        'UDP drops lost packets — a momentary video glitch is better than a 1-second freeze. ' +
        'Modern WebRTC also supports QUIC (UDP-based with some TCP features) for signaling. ' +
        'Zoom developed their own UDP-based protocol for better performance than standard WebRTC.',
    },
    {
      q: 'How do you handle a participant with a terrible connection who is degrading the meeting quality for everyone?',
      hint: 'Adaptive quality, timeout, and notification.',
      answer:
        'The SFU monitors RTCP feedback: packet loss rate, RTT, jitter from each sender. ' +
        'If a participant\'s packet loss exceeds 20%, the SFU sends a REMB (bandwidth estimation) signal ' +
        'asking the sender to reduce bitrate. ' +
        'If quality is still poor, the SFU can "constrain" the participant to audio-only. ' +
        'The meeting host can also manually disable video for specific participants. ' +
        'UI: other participants see a low-quality indicator on that participant\'s tile.',
    },
    {
      q: 'How do you implement meeting recording? A 1-hour meeting with 100 participants generates how much data?',
      hint: 'Not all 100 streams need to be recorded.',
      answer:
        'Recording architecture: ' +
        'Option 1: The SFU records the composite view (what the host sees — grid layout). ' +
        'This is much less data than recording all 100 individual streams. ' +
        'Option 2: Record individual streams, composite them post-meeting. Better quality, more storage. ' +
        'Data: 1 composite stream at 1.5 Mbps × 3600 seconds = ~675 MB for a 1-hour meeting. ' +
        'Store in S3. Transcode to MP4 via a worker (Kafka job) after the meeting ends.',
    },
    {
      q: 'How do you design the signaling system (non-media coordination — who is in the meeting, who\'s muted)?',
      hint: 'Separate signaling from media.',
      answer:
        'Signaling is handled over WebSocket (or HTTPS long-poll): ' +
        'low-bandwidth control messages (join, leave, mute, raise hand, screen share toggle). ' +
        'Signaling server maintains meeting state: { meeting_id, participants: [], sfu_endpoint }. ' +
        'State stored in Redis (ephemeral — meetings end). ' +
        'When a participant joins, signaling server returns the SFU address to connect to for media. ' +
        'Signaling and media are completely separate — different servers, different protocols.',
    },
  ],
};

export default challenge;
