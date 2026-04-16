import type { Challenge } from '../types';

// ─── ENG-DSA-019 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-019',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Merge Distributed Logs (Min-Heap)',
        companies: ['Datadog', 'Splunk'],
        timeEst: '~45 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Heaps', 'Linked Lists', 'Divide & Conquer'],
        nextChallengeId: 'ENG-DSA-020',
        realWorldContext: `Datadog's log aggregation pipeline receives sorted log streams from K different server pods and must merge them into a single chronologically sorted master stream for querying. Loading all K streams into memory and sorting is O(N log N) and memory-prohibitive for multi-TB log archives. The K-way merge using a min-heap solves this in O(N log K) with O(K) extra space.`,
        desc: 'You have K different log files from K different servers. Each file is already sorted by timestamp. Merge all K files into a single master chronological log feed without loading everything into memory at once.',
        whyItMatters: `Merge K Sorted Lists is a classic interview problem at Google, Microsoft, and Facebook. It's also the merge phase in external merge sort (used when data doesn't fit in RAM). Understanding how to use a min-heap for k-way merging is essential for building data pipelines, databases, and distributed systems.`,
        approach: `Start by pushing the FIRST element from each of the K lists into a min-heap. The heap automatically tracks which list currently has the smallest unprocessed element. Pop the minimum → that's the next element in the merged output. Then push the NEXT element from the same list that was just popped. Repeat until heap is empty. This gives O(N log K) — log K per heap operation × N total elements.`,
        solution: 'This is the "Merge K Sorted Lists" problem. Use a Min-Heap. Push the first log entry from every server into the heap (along with the server ID). Pop the smallest log, append it to the result, and push the NEXT log entry from that same server into the heap.',
        walkthrough: [
            "logs=[[1,4,5],[1,3,4],[2,6]]",
            "Init heap:[(1,0,0),(1,1,0),(2,2,0)] — (value, list_idx, elem_idx)",
            "Pop (1,0,0). Result=[1]. Push next from list 0: (4,0,1). Heap:[(1,1,0),(4,0,1),(2,2,0)]",
            "Pop (1,1,0). Result=[1,1]. Push (3,1,1). Heap:[(2,2,0),(4,0,1),(3,1,1)]",
            "Pop (2,2,0). Result=[1,1,2]. Push (6,2,1).",
            "Continue: pop 3,4,4,5,6... Result=[1,1,2,3,4,4,5,6] ✓"
        ],
        hints: [
            'Appending all arrays and calling `.sort()` is O(N log N) and uses too much memory. We need O(N log K).',
            'Keep a Min-Heap of size K. It will constantly hold the "current smallest" log from each of the K servers.',
            'In Python, `heapq` compares tuples element by element. Store `(timestamp, log_message, server_index, list_index)` in the heap.'
        ],
        complexity: { time: 'O(N log K)', space: 'O(K)' },
        starterCode: `import heapq

def merge_k_logs(log_lists: list[list[int]]) -> list[int]:
    """
    For simplicity in this challenge, logs are just integer timestamps.
    log_lists: [[1, 4, 5], [1, 3, 4], [2, 6]]
    Returns:[1, 1, 2, 3, 4, 4, 5, 6]
    
    Each tuple in heap: (value, list_index, element_index)
    Heap always holds the current minimum across all lists.
    """
    min_heap =[]
    result =[]
    
    # Push the first element of each list into the heap
    for list_idx, lst in enumerate(log_lists):
        if lst:
            heapq.heappush(min_heap, (lst[0], list_idx, 0))
            
    while min_heap:
        val, list_idx, elem_idx = heapq.heappop(min_heap)
        result.append(val)
        
        # If the list has more elements, push the next one
        if elem_idx + 1 < len(log_lists[list_idx]):
            next_val = log_lists[list_idx][elem_idx + 1]
            heapq.heappush(min_heap, (next_val, list_idx, elem_idx + 1))
            
    return result
`,
        testCases: [
            { id: 'tc1', description: 'Standard merge', input: 'lists=[[1,4,5], [1,3,4], [2,6]]', expected: '[1, 1, 2, 3, 4, 4, 5, 6]' },
            { id: 'tc2', description: 'Empty lists mixed in', input: 'lists=[[], [1,2], []]', expected: '[1, 2]' },
            { id: 'tc3', description: 'All empty', input: 'lists=[[], [], []]', expected: '[]' },
            { id: 'tc4', description: 'Already merged', input: 'lists=[[1,2,3], [4,5,6]]', expected: '[1, 2, 3, 4, 5, 6]' },
            { id: 'tc5', description: 'Lots of duplicates', input: 'lists=[[1,1], [1,1]]', expected: '[1, 1, 1, 1]' },
        ],
    };

export default challenge;
