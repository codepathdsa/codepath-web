import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-032',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design GitHub (Code Hosting)',
  companies: ['GitHub', 'GitLab', 'Bitbucket'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a code hosting platform. Support 100M repositories, ' +
    'git push/pull, pull request reviews, branch comparisons, ' +
    'and repository search. Code must be stored durably, ' +
    'and large repositories (up to 5GB) must clone in < 60 seconds.',
  solution:
    'Git repositories are stored as files on distributed file servers (DFS). ' +
    'Each repo is a directory of git objects (blobs, trees, commits) — immutable, content-addressed. ' +
    'A routing layer maps repo_id to a storage server. ' +
    'Hot repositories are cached on local disk of multiple edge servers. ' +
    'Pull request metadata (comments, reviews, CI status) lives in Postgres.',

  simulation: {
    constraints: [
      { label: 'Repositories', value: '100M' },
      { label: 'Avg repo size', value: '50 MB' },
      { label: 'Total storage', value: '5 PB' },
      { label: 'git clone throughput', value: '100 MB/sec per server' },
      { label: 'Pull request events/day', value: '10M' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 500,
        successMsg: 'Git push/pull working — repositories stored and retrievable.',
        failMsg: '[FATAL] git push failing. Connect Git Server → DFS Storage.',
        failNode: 'api_server',
        failTooltip:
          'Git repositories are directories of objects on a filesystem. ' +
          'A git server (Gitaly in GitLab) handles the git protocol, ' +
          'translating HTTP/SSH requests into file operations on the storage backend.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 's3' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 2000,
        successMsg: 'Repository routing active — repos distributed across 100 storage nodes.',
        failMsg:
          '[OVERLOAD] All git traffic hitting a single storage server. ' +
          'Add consistent hashing to distribute repositories across storage nodes.',
        failNode: 's3',
        failTooltip:
          'Hash repo_id to a storage node. Each node serves a subset of repos. ' +
          'Add a routing service that maintains the repo → node mapping. ' +
          'Consistent hashing minimizes re-routing when nodes are added/removed.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 1000,
        successMsg: 'SYSTEM STABLE — 100M repos, PR events streaming, code search indexed.',
        failMsg:
          '[SLOW CLONE] linux/kernel repo (1.2 GB) taking 3 minutes to clone. ' +
          'Add a CDN edge cache for popular large repositories.',
        failNode: 's3',
        failTooltip:
          'The top 1% of repos get 90% of the clone traffic. ' +
          'Cache pack files (pre-compressed git objects) at CDN edge nodes. ' +
          'A CDN-served clone of linux/kernel at 1 Gbps = 10 seconds.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'cdn' },
          { type: 'hasEdge', source: 'cdn', target: 's3' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does GitHub store billions of git objects (commits, blobs, trees) efficiently?',
      hint: 'Content-addressed, deduplication.',
      answer:
        'Git objects are content-addressed: the filename IS the SHA-1 hash of the content. ' +
        'If two repos have the same file content, they share the same blob object (deduplication). ' +
        'GitHub stores objects in a custom object storage (ObjStore) based on this property. ' +
        'Packfiles: git packs many loose objects into a single binary file for efficiency. ' +
        'GitHub periodically runs "gc" to repack repos and reduce object count.',
    },
    {
      q: 'How does GitHub compute a pull request diff between two branches in < 500ms?',
      hint: 'Diff is a git operation, not a SQL query.',
      answer:
        'git diff base_branch..pr_branch is computed by the git server directly. ' +
        'Both branches\' commits exist on the same storage node (same repo). ' +
        'For large PRs, the diff is computed and cached: ' +
        'diff_cache: SHA(base_commit + pr_commit) → diff_output. ' +
        'If the PR changes, the diff cache is invalidated. ' +
        'GitHub uses Gitaly (Go service) to run git operations efficiently.',
    },
    {
      q: 'How do you implement code search across all 100M repositories?',
      hint: 'Index the code, not the git objects.',
      answer:
        'GitHub uses a custom code search engine called Blackbird. ' +
        'When code is pushed, extract file contents and index them in a trigram index ' +
        '(every 3-character sequence → list of file locations). ' +
        'Trigram search: for query "getUserById", find all trigrams and intersect the file lists. ' +
        'The intersected file list is small — then do an exact regex match on those files only. ' +
        'ElasticSearch is used for the metadata layer (repo name, description).',
    },
    {
      q: 'How does GitHub handle CI/CD integration — running tests on every pull request?',
      hint: 'Webhook + job queue.',
        answer:
        'When a PR is opened or updated, GitHub emits a webhook to CI providers (GitHub Actions, CircleCI). ' +
        'The CI provider receives the webhook, queues a build job, checks out the code, and runs tests. ' +
        'Test results are reported back via the GitHub Checks API (PR status: passing/failing). ' +
        'GitHub Actions runs jobs in isolated containers (Docker) on a pool of worker machines. ' +
        'Actions workflow files (.github/workflows/) define the CI pipeline as code.',
    },
    {
      q: 'How do you prevent a user from force-pushing and rewriting history on a shared branch (like "main")?',
      hint: 'Branch protection rules.',
      answer:
        'Branch protection rules stored in Postgres per repo per branch. ' +
        'When a push arrives, the git server checks: ' +
        '(1) Is this branch protected? (2) Is this a force push (non-fast-forward)? ' +
        '(3) Does the pusher have bypass permission? ' +
        'If protected and force push: reject with an error message. ' +
        'Additional rules: require PR reviews, require CI to pass, require signed commits.',
    },
  ],
};

export default challenge;
