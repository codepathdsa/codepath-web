import type { Challenge } from '../types';

// ─── ENG-DSA-023 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-023',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Distributed Tracing Latency Budget (Hash Map)',
        companies: ['Datadog', 'New Relic'],
        timeEst: '~35 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Hash Map', 'Prefix Sum', 'Arrays'],
        nextChallengeId: 'ENG-DSA-024',
        realWorldContext: `Datadog's distributed tracing system records latency for each function call in a request span. The SRE team needs to find all continuous sub-traces that cumulatively exceed the SLA budget K, to identify which combination of calls is causing slowdowns. The Prefix Sum + HashMap technique solves this in O(n) vs O(n²) brute force.`,
        desc: 'A distributed trace records the latency of consecutive function calls in an array. We need to find the total number of continuous sub-traces (subarrays) whose latencies add up EXACTLY to our SLA budget K. O(n) required.',
        whyItMatters: `The Prefix Sum + HashMap pattern is one of the most powerful techniques for subarray problems. It reduces "find all subarrays with property X" from O(n²) to O(n) by asking a smarter question: "have I seen a prefix that, if subtracted, gives me what I want?" This pattern solves subarray sum, subarray with equal 0s and 1s, and minimum length subarray problems.`,
        approach: `Running prefix sum: sum of latencies from index 0 to i. For the subarray [j+1..i] to have sum K: prefix[i] - prefix[j] = K → prefix[j] = prefix[i] - K. So for each new prefix sum, check if (current_sum - K) has appeared in the HashMap before. If yes, those past occurrences each represent a valid subarray ending at i. Store {prefix_sum: count} in the HashMap. Initialize with {0:1} (empty prefix has sum 0).`,
        solution: 'Use the Prefix Sum + Hash Map technique. Keep a running sum of latencies. At each step, check if `running_sum - K` exists in the hash map. If it does, we have found sub-traces that sum to K. Add the frequency to the total count.',
        walkthrough: [
            "latencies=[1,1,1], k=2. prefix_sums={0:1}, count=0",
            "i=0: sum=1. Check 1-2=-1 in map? No. Map: {0:1, 1:1}",
            "i=1: sum=2. Check 2-2=0 in map? YES! count+=1. Map: {0:1, 1:1, 2:1}",
            "i=2: sum=3. Check 3-2=1 in map? YES (count=1)! count+=1. Map: {0:1,1:1,2:1,3:1}",
            "Return count=2 ✓ (subarrays [1,1] at indices 0-1 and 1-2)"
        ],
        hints: [
            'A brute force nested loop will take O(n^2) and timeout on massive traces.',
            'Keep a running tally (prefix sum). If your current sum is 15, and your target K is 5, you need to know if you ever had a prefix sum of 10 earlier in the array.',
            'Initialize your Hash Map with `{0: 1}` to account for subarrays that start at index 0.'
        ],
        complexity: { time: 'O(n)', space: 'O(n)' },
        starterCode: `def count_sla_breaches(latencies: list[int], k: int) -> int:
    """
    latencies: array of milliseconds taken by sequential functions
    k: target SLA budget
    Returns the number of continuous subarrays that sum to exactly k.
    
    Example: [1,1,1], k=2 → 2 (subarrays [1,1] at pos 0-1 and 1-2)
    """
    count = 0
    current_sum = 0
    # {prefix_sum: frequency}. {0:1} = empty prefix occurs once
    prefix_sums = {0: 1}
    
    for time in latencies:
        current_sum += time
        
        # If (current_sum - k) was a prefix sum before,
        # then the subarray between that prefix and now sums to k
        difference = current_sum - k
        if difference in prefix_sums:
            count += prefix_sums[difference]
            
        # Record this prefix sum
        prefix_sums[current_sum] = prefix_sums.get(current_sum, 0) + 1
        
    return count
`,
        testCases: [
            { id: 'tc1', description: 'Basic match', input: 'latencies=[1, 1, 1], k=2', expected: '2' },
            { id: 'tc2', description: 'Negative latencies (mock adjustments)', input: 'latencies=[1, -1, 0], k=0', expected: '3' },
            { id: 'tc3', description: 'No matches', input: 'latencies=[1, 2, 3], k=7', expected: '0' },
            { id: 'tc4', description: 'Single element match', input: 'latencies=[5, 2, 3], k=5', expected: '2' },
            { id: 'tc5', description: 'All zeros', input: 'latencies=[0, 0, 0], k=0', expected: '6' },
        ],
    };

export default challenge;
