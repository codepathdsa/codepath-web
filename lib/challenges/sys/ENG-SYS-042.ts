import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-042',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Content Moderation System',
  companies: ['Facebook', 'TikTok', 'YouTube'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a content moderation system for a social platform. ' +
    'Automatically detect and action harmful content (hate speech, CSAM, violence, spam) ' +
    'uploaded by 2B users. Handle 1M media uploads/hour and 10M text posts/hour. ' +
    'False positive rate must be < 0.1% (incorrectly removing legitimate content).',
  solution:
    'A tiered pipeline: hash matching (CSAM perceptual hashes — instant block), ' +
    'ML classifiers (hate speech, violence — < 1 second), ' +
    'human review queue (borderline cases — < 24 hours). ' +
    'Content flows through Kafka → ML scoring service → decision: allow/remove/queue for review. ' +
    'PhotoDNA hash matching uses precomputed hashes of known CSAM for instant detection.',

  simulation: {
    constraints: [
      { label: 'Media uploads/hour', value: '1M' },
      { label: 'Text posts/hour', value: '10M' },
      { label: 'ML scoring latency', value: '< 500ms per item' },
      { label: 'False positive rate', value: '< 0.1%' },
      { label: 'Human reviewer capacity', value: '10,000 reviewers × 100 items/hour' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 500,
        successMsg: 'Content moderation pipeline running — uploads being scored.',
        failMsg: '[FATAL] Uploads not being screened. Add ML scoring step in upload pipeline.',
        failNode: 'api_server',
        failTooltip:
          'Upload flow: receive file → enqueue to Kafka → ML scorer → ' +
          'if score > threshold: block; if borderline: queue for human review; else: publish.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 200,
        successMsg: 'Hash matching active — known CSAM blocked in < 10ms without ML overhead.',
        failMsg:
          '[LATENCY] ML classifier taking 3 seconds per image. ' +
          'Add fast hash matching tier before ML to short-circuit known bad content.',
        failNode: 'kafka',
        failTooltip:
          'PhotoDNA: hash the perceptual fingerprint of the image. ' +
          'Compare to a Redis set of known-bad hashes (SISMEMBER). O(1). ' +
          'Hash match → instant block. No ML needed. ML is only for new/unknown content.',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'worker' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — 1M uploads/hour, human review queue draining within SLA.',
        failMsg:
          '[BACKLOG] Human review queue has 500k items backlogged. ' +
          'Add ML confidence thresholds to reduce human review volume.',
        failNode: 'worker',
        failTooltip:
          'ML confidence buckets: ' +
          'score > 0.95: auto-remove (high confidence). ' +
          'score 0.6-0.95: human review (borderline). ' +
          'score < 0.6: auto-allow (low confidence). ' +
          'Tune thresholds to keep human review queue manageable.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you design the ML pipeline for detecting hate speech in text posts?',
      hint: 'Feature extraction, model serving, versioning.',
      answer:
        'Training: fine-tune a BERT/RoBERTa model on a labeled dataset of hate speech examples. ' +
        'Serving: the trained model is deployed as a gRPC service (TorchServe/TensorFlow Serving). ' +
        'Input: text (up to 512 tokens). Output: probability scores for each harm category. ' +
        'Model versioning: A/B test new model versions on 1% of traffic before full rollout. ' +
        'Monitoring: track false positive rate on appealed decisions to detect model drift.',
    },
    {
      q: 'How do you handle a coordinated inauthentic behavior (CIB) attack — a botnet uploading harmful content faster than the ML pipeline can process?',
      hint: 'Velocity limits and pre-emptive actions.',
      answer:
        'Rate limiting: accounts uploading > 100 items/hour are shadow-banned (content held for review). ' +
        'Network analysis: if 1000 new accounts all upload the same or similar content, flag the campaign. ' +
        'Hash-based clustering: group similar images/videos — if 10k copies of the same image are uploaded, ' +
        'one human review decision applies to all. ' +
        'New account restrictions: accounts < 24 hours old have lower upload limits.',
    },
    {
      q: 'A user\'s post was incorrectly removed. How do you handle the appeal process?',
      hint: 'Human review workflow with context.',
      answer:
        'Appeal flow: user submits appeal → creates an appeal record linked to the removed content. ' +
        'Human reviewer sees: the content, the ML confidence score, the removal reason, and user context (history). ' +
        'Reviewer can: restore the content (false positive) or uphold removal. ' +
        'If restored: update the ML model\'s training data (hard negative example for retraining). ' +
        'Track false positive rate per ML classifier. If > 0.5%, trigger model investigation.',
    },
    {
      q: 'How do you ensure your moderation system doesn\'t have geographic/cultural bias?',
      hint: 'Training data representation and locale-specific models.',
      answer:
        'Bias risks: ' +
        '(1) Training data from US English may not recognize hate speech in Arabic or Hindi slang. ' +
        '(2) Cultural context: an image may be offensive in one culture but benign in another. ' +
        'Mitigations: ' +
        'Train locale-specific models with native-language labeled data. ' +
        'Partner with local NGOs and cultural experts for labeling. ' +
        'Regular bias audits: compare removal rates across languages/regions — ' +
        'significant disparities indicate a biased model.',
    },
  ],
};

export default challenge;
