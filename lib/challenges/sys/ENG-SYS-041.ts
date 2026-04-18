import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-041',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design an Email Service (Gmail)',
  companies: ['Google', 'Microsoft', 'Proton'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a large-scale email service supporting 1B+ users. ' +
    'Support sending, receiving, threading, search across 15 years of email history, ' +
    'spam filtering, and storage for users with 50GB+ of email. ' +
    'Handle 1M emails/second at peak (spam storms).',
  solution:
    'Email stored in Colossus (Google\'s distributed filesystem) as immutable blobs. ' +
    'Metadata (labels, thread_id, read status) stored in Bigtable (key: user_id + message_id). ' +
    'Thread grouping: messages with same subject (normalized) + overlapping recipients share a thread_id. ' +
    'Search: an inverted index (like Lucene) over email bodies and subjects. ' +
    'Spam filter: ML model scoring each email before delivery. ' +
    'SMTP receivers validate SPF/DKIM/DMARC to reject forged sender addresses.',

  simulation: {
    constraints: [
      { label: 'Active users', value: '1B' },
      { label: 'Emails sent/day', value: '300B' },
      { label: 'Avg email size', value: '75 KB' },
      { label: 'Peak ingest rate', value: '1M emails/sec' },
      { label: 'Storage per user', value: '15 GB free' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 500,
        successMsg: 'Email send/receive working — messages stored and retrievable.',
        failMsg: '[FATAL] Email send failing. Connect SMTP receiver → Storage → Inbox.',
        failNode: 'api_server',
        failTooltip:
          'SMTP receiver accepts inbound email. ' +
          'Store email body in S3/Blob storage. ' +
          'Store metadata (from, to, subject, timestamp, blob_key) in DB. ' +
          'Deliver to inbox: update inbox label for the recipient.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 200,
        successMsg: 'Spam filter active — ML scoring blocking 90% of spam before delivery.',
        failMsg:
          '[SPAM] Inbox flooded — no spam filter configured. ' +
          'Add an ML scoring step in the ingest pipeline before delivery.',
        failNode: 'api_server',
        failTooltip:
          'Spam scoring pipeline: receive → SPF/DKIM check → ML spam score → ' +
          'if score > 0.9: deliver to SPAM folder; else: deliver to INBOX. ' +
          'ML features: sender reputation, IP blacklist, URL analysis, content patterns.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — 1M emails/sec, full-text search < 1 sec across 15 years.',
        failMsg:
          '[SEARCH SLOW] Searching "receipt from 2019" scanning 15 years of emails in a sequential scan.',
        failNode: 'cassandra',
        failTooltip:
          'Index email bodies in Elasticsearch. Index key: user_id + inverted terms. ' +
          'At query time: intersect term lists → candidate message IDs → fetch from Cassandra. ' +
          'Gmail indexes 15 years of email for 1B users — one of the largest search indexes in existence.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does Gmail\'s threading algorithm group emails into conversations?',
      hint: 'References header, subject normalization.',
      answer:
        'RFC 2822 defines "References" and "In-Reply-To" headers — reply emails include the original message ID. ' +
        'Thread grouping: all emails with shared message IDs in their References chain belong to one thread. ' +
        'Fallback: emails with the same normalized subject (remove Re:, Fwd:, strip punctuation) from the same participants. ' +
        'Each thread has a thread_id. Inbox shows threads, not individual emails. ' +
        'Opening a thread loads all emails in chronological order.',
    },
    {
      q: 'How do SPF, DKIM, and DMARC protect against email spoofing?',
      hint: 'DNS-based sender validation.',
      answer:
        'SPF (Sender Policy Framework): DNS record lists servers allowed to send email for a domain. ' +
        'If email arrives from an unlisted server, it fails SPF. ' +
        'DKIM (DomainKeys Identified Mail): the sending server signs the email with a private key. ' +
        'Recipient verifies the signature using the public key in DNS. ' +
        'DMARC: policy that says "if SPF or DKIM fails, reject/quarantine the email." ' +
        'Together, these three make it very difficult to forge a sender address.',
    },
    {
      q: 'A user has 50 GB of email and searches for "invoice from AWS in 2023." How does the search work efficiently?',
      hint: 'Inverted index scoped to user.',
      answer:
        'The inverted index is scoped per user: { userId: { term: [messageId, ...] } }. ' +
        'Search query: user_id=alice + "invoice" + "aws" + date range 2023. ' +
        'Find messages containing both "invoice" and "aws": intersect the two postings lists. ' +
        'Filter by date (indexed column). ' +
        'Return top N by recency. ' +
        'Gmail also boosts results from senders you frequently interact with (sender affinity).',
    },
    {
      q: 'How do you handle a user deleting an email? Is the data immediately deleted?',
      hint: 'Soft delete, retention, and recovery window.',
      answer:
        'Soft delete: marking an email as deleted just moves it to the Trash folder (label change). ' +
        'It\'s not actually deleted — the blob in S3 remains. ' +
        'Permanent deletion: after 30 days in Trash, the email is permanently deleted. ' +
        'The blob in S3 is deleted when all references to it are removed (garbage collection job). ' +
        'For compliance (GDPR, legal hold), some emails must be retained even after user deletion — ' +
        'these are handled by a separate legal hold system that blocks physical deletion.',
    },
  ],
};

export default challenge;
