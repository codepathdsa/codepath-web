import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-012',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Netflix (Video Streaming)',
  companies: ['Netflix', 'YouTube', 'Disney+'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a video streaming platform that serves 200M subscribers. ' +
    'Handle 15,000 concurrent streams during peak hours, ' +
    'transcode uploaded videos into 10+ quality levels, and recommend content with < 100ms latency.',
  solution:
    'The upload pipeline: raw video → transcoding workers → multiple bitrates/resolutions stored in S3. ' +
    'Playback: CDN serves video chunks (MPEG-DASH/HLS); the player switches quality based on bandwidth. ' +
    'Recommendations are pre-computed in batch (Spark + collaborative filtering) and cached in Redis. ' +
    'The manifest service returns a JSON playlist — the CDN serves the actual video bytes.',

  simulation: {
    constraints: [
      { label: 'Subscribers', value: '200M' },
      { label: 'Peak concurrent streams', value: '15,000' },
      { label: 'Avg bitrate', value: '5 Mbps (1080p)' },
      { label: 'Peak bandwidth', value: '~75 Tbps' },
      { label: 'Content library', value: '~15,000 titles × 10 quality variants' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 100,
        successMsg: 'Manifest service running — player can fetch video playlist.',
        failMsg:
          '[FATAL] Players can\'t discover video chunks. ' +
          'Add a Manifest Service that returns the HLS/DASH playlist.',
        failNode: 'api_server',
        failTooltip:
          'Netflix Open Connect (CDN) serves chunks. But first, the player calls a manifest service ' +
          'to get the playlist URL. Add: Client → API Gateway → Manifest Service → CDN.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
        ],
      },
      {
        traffic: 5000,
        targetLatency: 200,
        successMsg: 'CDN serving video chunks — bandwidth cost dropped 95%.',
        failMsg:
          '[FATAL] Video chunks are being served directly from S3. ' +
          '75 Tbps of bandwidth at S3 prices would cost $3M/day. Add a CDN.',
        failNode: 's3',
        failTooltip:
          'Netflix deploys Open Connect Appliances (OCA) — custom CDN boxes — at ISP data centers. ' +
          'Most Netflix traffic never leaves the ISP. Connect S3 → CDN → Client.',
        checks: [
          { type: 'hasEdge', source: 's3', target: 'cdn' },
          { type: 'hasPath', source: 'cdn', target: 'client' },
        ],
      },
      {
        traffic: 15000,
        targetLatency: 300,
        successMsg: 'SYSTEM STABLE — 15k concurrent streams, adaptive bitrate switching active.',
        failMsg:
          '[OVERLOAD] No message queue for transcoding jobs. ' +
          'Uploads are blocking the API. Add a queue between the API and transcoding workers.',
        failNode: 'api_server',
        failTooltip:
          'Video transcoding is CPU-intensive and takes minutes. ' +
          'The upload API should publish a job to a queue (SQS/Kafka) and return immediately. ' +
          'Worker pools consume the queue and transcode asynchronously.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does Netflix decide which video quality to stream to each user?',
      hint: 'Adaptive Bitrate Streaming (ABR).',
      answer:
        'Netflix uses MPEG-DASH with Adaptive Bitrate Streaming. ' +
        'The video is split into 4-second chunks at multiple quality levels (240p to 4K). ' +
        'The player measures download speed and buffer level. If bandwidth drops, ' +
        'it switches to a lower bitrate chunk mid-stream. This is transparent to the user ' +
        'and prevents buffering. The algorithm is called BOLA (Buffer Occupancy-based Lyapunov Algorithm).',
    },
    {
      q: 'A movie uploads as one 2-hour raw file. How do you parallelize transcoding?',
      hint: 'Divide and conquer.',
      answer:
        'Split the video into 1-minute segments. Transcode each segment independently across many workers in parallel. ' +
        'After all segments finish, stitch them back together. ' +
        'A 2-hour movie that would take 4 hours to transcode sequentially can finish in ~30 minutes ' +
        'with 8 workers. This is how Netflix processes new releases quickly.',
    },
    {
      q: 'How does your recommendation system avoid cold-start for new users?',
      hint: 'Think about what data you have before they watch anything.',
      answer:
        'For brand-new users: use implicit signals from signup (genre preferences, age bracket) and ' +
        'popularity-based recommendations (trending globally, trending in their region). ' +
        'After 3-5 interactions (watches, ratings), switch to collaborative filtering. ' +
        'Netflix\'s "taste communities" cluster users by viewing patterns — new users are assigned ' +
        'to a community and served that community\'s recommendations.',
    },
    {
      q: 'Netflix uses multiple AWS regions. How do you handle a region failure mid-stream?',
      hint: 'The video is already on the CDN. What\'s actually region-specific?',
      answer:
        'Video data is already cached at CDN edge nodes — region failure doesn\'t affect video delivery. ' +
        'What fails is the API layer (authentication, resume position, recommendations). ' +
        'Netflix uses a global DNS (Route 53) that automatically fails over API traffic to healthy regions. ' +
        'Resume position is stored in Cassandra with multi-region replication (active-active).',
    },
    {
      q: 'How would you implement "continue watching" with exact resume position across devices?',
      hint: 'Think about write conflicts when a user is on two devices.',
      answer:
        'Store playback position as (userId, contentId) → { position: seconds, deviceId, updatedAt }. ' +
        'Use last-write-wins with timestamps. Write to a low-latency store (DynamoDB) on every seek event ' +
        '(debounced to every 10 seconds). On app launch, fetch the latest position. ' +
        'For simultaneous playback on two devices, the last device to write wins.',
    },
  ],
};

export default challenge;
