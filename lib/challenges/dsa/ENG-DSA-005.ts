import type { Challenge } from '../types';

// ─── ENG-DSA-005 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-005',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Live Stock Ticker — Top K Volatile (Heaps)',
        companies: ['Robinhood', 'Citadel'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Heaps', 'Priority Queue', 'Streaming'],
        nextChallengeId: 'ENG-DSA-006',
        realWorldContext: `Robinhood's trading dashboard receives 10,000 stock price updates per second. The "Most Volatile Stocks" widget must show the top 5 most volatile tickers in real-time. Sorting the entire feed on every update would take O(N log N) time — too slow. The team needs an O(N log K) streaming solution.`,
        desc: 'The trading dashboard gets sluggish updating the Top-K Most Volatile Stocks from 10,000 updates/sec. Return the top k entries from the stream in O(N log K) time.',
        whyItMatters: `The Top-K pattern appears everywhere: trending topics (Twitter), recommended videos (YouTube), search result ranking, leaderboard systems, and resource-heavy process monitoring. Mastering the min-heap approach lets you handle any "find K best from N" problem efficiently in streaming contexts.`,
        approach: `Counterintuitively, to find the K LARGEST elements, we use a MIN-heap of size K. The root of this min-heap is always the smallest of our "top K candidates." When a new element arrives: if it beats the worst element in our top-K (the root), we evict the root and insert the newcomer. Otherwise, we ignore it. The heap never exceeds size K.`,
        solution: 'Maintain a min-heap of size K. For each new item: if heap size < K, push it. Else if item score > heap root, pop the min and push the new one. Final heap contains top-K.',
        walkthrough: [
            "stream=[('AAPL',2.1),('TSLA',9.4),('GME',15.2),('AMD',3.3),('NVDA',7.8)], k=2",
            "AAPL=2.1: heap size 0 < 2. Push. heap=[(2.1,'AAPL')]",
            "TSLA=9.4: heap size 1 < 2. Push. heap=[(2.1,'AAPL'),(9.4,'TSLA')]",
            "GME=15.2: heap full. 15.2 > root 2.1? YES. Replace. heap=[(9.4,'TSLA'),(15.2,'GME')]",
            "AMD=3.3: 3.3 > root 9.4? NO. Skip.",
            "NVDA=7.8: 7.8 > root 9.4? NO. Skip.",
            "Result:[('TSLA',9.4),('GME',15.2)] ✓"
        ],
        hints: [
            'Sorting the entire stream is O(N log N). You only need the top K — there is a faster way.',
            'A min-heap of size K lets you keep track of the K largest items seen so far. The root is always the smallest of your top-K candidates.',
            'If a new stock score > heap root: the root is no longer in top-K. Pop it and push the newcomer. Otherwise ignore. At the end, your heap IS the top-K.'
        ],
        complexity: { time: 'O(N log K)', space: 'O(K)' },
        starterCode: `import heapq

def top_k_volatile(stream: list[tuple[str, float]], k: int) -> list[tuple[str, float]]:
    """
    stream: list of (ticker, volatility_score)
    Returns the k highest-volatility stocks.
    O(N log K) time, O(K) space.
    """
    # Min-heap of (score, ticker) so root = lowest score in top-K
    min_heap: list[tuple[float, str]] =[]

    for ticker, score in stream:
        if len(min_heap) < k:
            heapq.heappush(min_heap, (score, ticker))
        elif score > min_heap[0][0]:
            heapq.heapreplace(min_heap, (score, ticker))

    return [(ticker, score) for score, ticker in min_heap]
`,
        testCases: [
            { id: 'tc1', description: 'Top 2 from 5 stocks', input: "stream=[('AAPL',2.1),('TSLA',9.4),('GME',15.2),('AMD',3.3),('NVDA',7.8)], k=2", expected: "[('GME',15.2),('NVDA',7.8)] (any order)" },
            { id: 'tc2', description: 'K equals stream length', input: "stream=[('A',1.0),('B',2.0)], k=2", expected: "[('A',1.0),('B',2.0)]" },
            { id: 'tc3', description: 'Top 1 only', input: "stream=[('X',5.0),('Y',3.0),('Z',8.0)], k=1", expected: "[('Z',8.0)]" },
            { id: 'tc4', description: 'Duplicate scores', input: "stream=[('A',5.0),('B',5.0),('C',5.0)], k=2", expected: 'Any 2 of A, B, C (scores equal)' },
            { id: 'tc5', description: 'Already sorted input', input: "stream=[('A',1),('B',2),('C',3),('D',4),('E',5)], k=3", expected: "C, D, E (scores 3,4,5)" },
        ],
    };

export default challenge;
