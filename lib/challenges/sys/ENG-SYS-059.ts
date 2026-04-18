import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-059',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Search Engine (Inverted Index)',
  companies: ['Google', 'Elastic', 'Algolia'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a full-text search engine that indexes 50 billion web pages and returns results ' +
    'for a query in under 200ms. ' +
    'Handle 100,000 queries/sec. ' +
    'Results must be ranked by relevance (TF-IDF, PageRank). ' +
    'Support near-real-time indexing of new pages within 5 minutes of crawling.',
  solution:
    'An inverted index maps each token (word) to a posting list: [docId, tf, positions...]. ' +
    'Query: tokenize query → look up each token → intersect posting lists → rank by TF-IDF + PageRank. ' +
    'Index is too large for one machine: shard by token hash range (index sharding). ' +
    'Each shard is a segment (immutable sorted file, SSTable-like). ' +
    'New documents: written to an in-memory buffer, flushed to new segments (near-real-time).',

  simulation: {
    constraints: [
      { label: 'Indexed pages', value: '50 billion' },
      { label: 'Queries/sec', value: '100,000' },
      { label: 'Query latency target', value: '< 200ms' },
      { label: 'Index freshness', value: 'New pages indexed within 5 min' },
      { label: 'Index size', value: '~100 PB' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 200,
        successMsg: 'Inverted index working — keyword queries returning relevant documents.',
        failMsg: '[FATAL] Keyword search not working. Build an inverted index.',
        failNode: 'api_server',
        failTooltip:
          'Inverted index: for every word, store which documents contain it. ' +
          'Index: {"apple": [doc1, doc3, doc7], "iphone": [doc1, doc2]}. ' +
          'Query "apple iphone": intersect([doc1, doc3, doc7], [doc1, doc2]) = [doc1]. ' +
          'Rank by TF (term frequency in doc) * IDF (inverse document frequency across all docs).',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'Distributed index sharding working — query fan-out to index shards.',
        failMsg:
          '[CAPACITY] Full inverted index (100 PB) does not fit on one machine. ' +
          'Shard the index by token hash range across index servers.',
        failNode: 'cassandra',
        failTooltip:
          'Index sharding: partition posting lists by token. ' +
          'Token "apple" always goes to shard = hash("apple") % num_shards. ' +
          'Query fan-out: query server sends each query token to the relevant shard. ' +
          'Each shard returns its posting list; query server merges and ranks. ' +
          'Top-K optimization: each shard returns only top-K results, reduces network transfer.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — 100k QPS with near-real-time indexing of new pages.',
        failMsg:
          '[FRESHNESS] New pages crawled 10 minutes ago are still not searchable. ' +
          'Add a near-real-time (NRT) index segment alongside the main index.',
        failNode: 'worker',
        failTooltip:
          'Elasticsearch\'s near-real-time (NRT) approach: ' +
          'New documents → in-memory buffer (the "translog"). ' +
          'Every 1 second: flush buffer to a small in-memory segment — now searchable. ' +
          'Query: merge results from all segments (large on-disk segments + small NRT segments). ' +
          'Periodically: merge small segments into larger ones (background merge, like LSM-tree compaction).',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is TF-IDF and how does it rank search results?',
      hint: 'Term Frequency and Inverse Document Frequency.',
      answer:
        'TF (Term Frequency) = how many times the query term appears in document d. ' +
        'IDF (Inverse Document Frequency) = log(total_docs / docs_containing_term). ' +
        'A term that appears in every document has IDF ≈ 0 (not useful for ranking, e.g., "the"). ' +
        'A rare term has high IDF (e.g., "quetzalcoatl"). ' +
        'TF-IDF score = TF * IDF. Higher score = more relevant. ' +
        'For multi-term queries: sum TF-IDF scores for each term. ' +
        'Modern search (BM25, BERT) improves on TF-IDF but the core intuition is the same.',
    },
    {
      q: 'How does PageRank work? Why does Google use it alongside TF-IDF?',
      hint: 'Links as votes of authority.',
      answer:
        'PageRank: a page is important if many important pages link to it. ' +
        'Iterative: start with equal rank for all pages. ' +
        'Each iteration: rank(A) = sum over all pages B linking to A: rank(B) / outlinks(B). ' +
        'Damping factor (0.85): models the probability that a user follows a link vs. types a URL directly. ' +
        'TF-IDF alone is vulnerable to keyword stuffing (repeating query terms). ' +
        'PageRank adds authority signal: spam pages rarely have authoritative inbound links.',
    },
    {
      q: 'How do you handle stemming and stop words in the index?',
      hint: 'Text pre-processing before indexing.',
      answer:
        'Stop words: common words with low discriminating power — "the", "is", "a". ' +
        'Remove from index to save space and speed up queries. ' +
        'Exception: "to be or not to be" — phrase queries need stop words. ' +
        'Stemming: reduce words to their root form. ' +
        '"running", "runs", "ran" → "run". ' +
        'Porter stemmer or Snowball stemmer. ' +
        'Both the indexed document and the query go through the same stemming pipeline. ' +
        'Lemmatization: more accurate — "am", "are", "is" → "be" (uses grammar context).',
    },
    {
      q: 'How would you design query suggestions (autocomplete as the user types)?',
      hint: 'Prefix index with popularity ranking.',
      answer:
        'Approach 1: Trie (prefix tree) over all indexed queries. ' +
        'Prefix "appl" → all completions under that node, ranked by query frequency. ' +
        'Approach 2: Redis sorted set per prefix: ZADD suggestions:appl {frequency} "apple". ' +
        'ZREVRANGEBYSCORE returns top-K suggestions by frequency. ' +
        'Update: every query increments frequency of its prefix entries. ' +
        'Size: billions of prefixes is too large — prune to top 1000 suggestions per prefix. ' +
        'Personalization: mix popular global suggestions with user\'s recent searches.',
    },
    {
      q: 'How do you update the index when a web page changes its content?',
      hint: 'Crawl cycle, document fingerprinting, and partial updates.',
      answer:
        'Crawler re-crawls pages on a schedule (frequency depends on page change rate). ' +
        'Change detection: compute a hash of the page content. ' +
        'If hash changed: re-index the page. ' +
        'Re-indexing: ' +
        '(1) Remove old posting list entries for this docId. ' +
        '(2) Add new posting list entries. ' +
        'In Elasticsearch: re-indexing is a full document replace (not partial field update). ' +
        'Delete + insert are handled atomically at the segment level. ' +
        'Old segments are marked for deletion; new segments are written first.',
    },
  ],
};

export default challenge;
