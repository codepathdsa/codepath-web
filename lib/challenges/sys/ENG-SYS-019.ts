import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-019',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Dropbox (File Sync)',
  companies: ['Dropbox', 'Google', 'Box'],
  timeEst: '~55 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a file synchronization service like Dropbox. Users upload files from desktop clients, ' +
    'which sync across all their devices. Support 100M users, ' +
    'files up to 5GB, delta sync (only upload changed blocks), and offline editing.',
  solution:
    'Split files into 4MB chunks; hash each chunk (SHA-256). On upload, only send chunks whose hashes ' +
    'are not already in the block store (deduplication + delta sync). ' +
    'Store chunks in S3. Store metadata (file tree, versions, chunk list) in Postgres. ' +
    'A notification service (long-poll or WebSocket) alerts other devices when a file changes.',

  simulation: {
    constraints: [
      { label: 'Users', value: '100M' },
      { label: 'Avg storage/user', value: '5 GB' },
      { label: 'Total storage', value: '500 PB' },
      { label: 'Block size', value: '4 MB' },
      { label: 'Daily uploads', value: '5M files' },
    ],
    levels: [
      {
        traffic: 50000,
        targetLatency: 200,
        successMsg: 'File upload and download working — chunks stored in S3.',
        failMsg: '[FATAL] File uploads failing. Connect Client → Upload Service → S3.',
        failNode: 'api_server',
        failTooltip:
          'Split file into 4MB chunks on the client. Upload each chunk to the Upload Service, ' +
          'which writes to S3. After all chunks upload, commit the file metadata to Postgres. ' +
          'Client → API Server → S3. Metadata: API Server → Postgres.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 500000,
        targetLatency: 500,
        successMsg: 'Delta sync active — only changed chunks uploaded, 60% bandwidth reduction.',
        failMsg:
          '[INEFFICIENT] Full files re-uploaded on every save. ' +
          'Add chunk-level deduplication — check existing chunk hashes before uploading.',
        failNode: 's3',
        failTooltip:
          'Before uploading, the client sends chunk hashes to the API. ' +
          'The API returns which hashes are missing. Client uploads only missing chunks. ' +
          'This is the core Dropbox optimization — "sync only the delta".',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — real-time sync across devices, upload throughput 1M files/day.',
        failMsg:
          '[STALE] Edited files on laptop not appearing on phone for 5 minutes. ' +
          'Add a push notification channel (long-poll or WebSocket) to alert devices of changes.',
        failNode: 'api_server',
        failTooltip:
          'When a file is committed, publish an event: userId → fileChanged. ' +
          'A notification service maintains long-poll connections per user. ' +
          'On event, send "refresh" to all connected devices for that user.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does client-side chunking enable delta sync and deduplication?',
      hint: 'What does the client do before uploading?',
      answer:
        'On save, the client splits the file into 4MB chunks and computes SHA-256 for each chunk. ' +
        'It sends the list of hashes to the server. The server responds with which hashes are missing. ' +
        'Only missing chunks are uploaded. ' +
        'Global deduplication: if two users upload the same file (same chunk hashes), ' +
        'only one copy is stored in S3. Dropbox achieved 70% storage savings via deduplication.',
    },
    {
      q: 'How do you handle two users editing the same file simultaneously (conflict)?',
      hint: 'What does Dropbox do when it can\'t auto-merge?',
      answer:
        'Dropbox uses a "last write wins" conflict resolution by default: ' +
        'the later upload becomes the canonical version. ' +
        'The earlier version is preserved as "filename (Conflicted copy - date).ext". ' +
        'For Google Docs-style collaboration, operational transformation (OT) or CRDTs are needed — ' +
        'much more complex. Dropbox keeps it simple for file sync by not attempting auto-merge.',
    },
    {
      q: 'How do you design the metadata schema for files and folders?',
      hint: 'Hierarchical data structure.',
      answer:
        'adjacency list model in Postgres: ' +
        'files(id, name, parent_folder_id, owner_id, created_at, updated_at) ' +
        'file_versions(file_id, version, chunk_hashes[], created_at) ' +
        'chunks(hash, s3_key, size) ' +
        'Getting a folder\'s contents: SELECT * FROM files WHERE parent_folder_id = X. ' +
        'Getting file content: fetch chunk_hashes from latest version, read each chunk from S3.',
    },
    {
      q: 'How do you handle large file uploads (5GB) over unreliable mobile connections?',
      hint: 'What if the connection drops after uploading 4GB?',
      answer:
        'Resumable uploads: generate a unique upload_id. For each chunk, record its upload status. ' +
        'If the connection drops, the client queries "which chunks are uploaded?" ' +
        'and resumes from the last missing chunk. ' +
        'S3 multipart upload supports this natively — ' +
        'chunks can be uploaded in parallel, in any order. ' +
        'Commit the multipart upload only when all chunks are received.',
    },
    {
      q: 'How do you handle file sharing with fine-grained permissions (view-only vs edit)?',
      hint: 'Think about the ACL data model.',
      answer:
        'Add an ACL (Access Control List) table: ' +
        'file_permissions(file_id, user_id, permission: "view" | "edit" | "owner"). ' +
        'On each API request, check the ACL for the current user. ' +
        'For shared folders, permissions cascade: ' +
        'if you have "edit" on a folder, you get "edit" on all files within it. ' +
        'For large organizations, use group-based ACLs to avoid per-file, per-user row explosions.',
    },
  ],
};

export default challenge;
