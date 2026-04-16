import type { Challenge } from '../types';

// ─── ENG-DSA-068 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-068',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Compute Fleet Upgrades (Binary Search on Answer)',
        companies: ['AWS', 'Airbnb'],
        timeEst: '~40 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays', 'Math'],
        nextChallengeId: 'ENG-DSA-069',
        realWorldContext: `AWS needs to patch a fleet of servers distributed across different clusters. An automated script patches servers at a rate of K servers per hour. The patch window closes in H hours. If the script finishes a cluster early, it idles for the rest of the hour. We need to find the absolute minimum speed K that guarantees all servers are patched before the deadline.`,
        desc: 'Given an array of clusters representing the number of servers in each, and a deadline `H` hours. You can patch `K` servers per hour. If a cluster has fewer than `K` servers, you patch them and idle for the rest of the hour. Return the minimum integer `K` such that all servers are patched within `H` hours.',
        whyItMatters: `This is "Koko Eating Bananas". It introduces the "Binary Search on the Answer Space" pattern. Instead of binary searching indices of an array, you binary search the *range of possible answers* (from 1 to Max Value). This pattern appears in Capacity to Ship Packages, Allocate Books, and Split Array Largest Sum.`,
        approach: `The minimum possible speed is 1. The maximum possible speed is the largest cluster size (since going faster doesn't save time due to idling). Binary search this range [1, max(clusters)]. For a given mid-point speed \`K\`, calculate the total hours needed using \`math.ceil(cluster / K)\`. If total_hours <= H, this speed is valid, but we might be able to go slower (search left). If total_hours > H, we are too slow (search right).`,
    solution: 'Binary search between 1 and max(clusters). For each speed `mid`, calculate total hours. If valid, try a slower speed (right = mid). Else try a faster speed (left = mid + 1).',
    walkthrough: [
        "clusters=[3, 6, 7, 11], H=8",
        "Left=1, Right=11. Mid=6.",
        "Test K=6: ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6 hours.",
        "6 hours <= 8 hours. K=6 works! Can we go slower? Right=6.",
        "Left=1, Right=6. Mid=3.",
        "Test K=3: ceil(3/3)+ceil(6/3)+ceil(7/3)+ceil(11/3) = 1+2+3+4 = 10 hours.",
        "10 hours > 8 hours. Too slow! Left=4.",
        "Eventually converges to K=4. Total hours = 1+2+2+3 = 8. ✓"
    ],
    hints: [
        'What is the absolute maximum speed you would ever need? (Hint: the largest cluster).',
        'Binary search between 1 and the maximum cluster size.',
        'To calculate hours for a specific cluster at speed K, use `math.ceil(cluster_size / K)`.'
    ],
    complexity: { time: 'O(N log M) where M is max cluster size', space: 'O(1)' },
    starterCode: `import math

def min_patching_speed(clusters: list[int], H: int) -> int:
    """
    Returns the minimum speed K to patch all clusters within H hours.
    """
    left = 1
    right = max(clusters)
    
    def can_finish(speed: int) -> bool:
        hours = 0
        for cluster in clusters:
            hours += math.ceil(cluster / speed)
        return hours <= H
        
    while left < right:
        mid = left + (right - left) // 2
        
        if can_finish(mid):
            # Speed is valid, try to find a slower one
            right = mid
        else:
            # Speed is too slow, must go faster
            left = mid + 1
            
    return left
`,
    testCases: [
        { id: 'tc1', description: 'Classic case', input: 'clusters=[3,6,7,11], H=8', expected: '4' },
        { id: 'tc2', description: 'Exact hours match', input: 'clusters=[30,11,23,4,20], H=5', expected: '30' },
        { id: 'tc3', description: 'Plenty of time', input: 'clusters=[30,11,23,4,20], H=6', expected: '23' },
        { id: 'tc4', description: 'Single cluster', input: 'clusters=[100], H=10', expected: '10' },
        { id: 'tc5', description: '1 hour per cluster', input: 'clusters=[5,5,5], H=3', expected: '5' },
    ],
    };

export default challenge;
