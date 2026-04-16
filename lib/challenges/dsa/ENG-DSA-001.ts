import type { Challenge } from '../types';

// ─── ENG-DSA-001 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-001',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Payment System Double-Billing (Array)',
        companies: ['Stripe', 'Square'],
        timeEst: '~20 min',
        level: 'Junior',
        status: 'Not Started',
        topics: ['Arrays', 'Hash Set', 'Cycle Detection'],
        nextChallengeId: 'ENG-DSA-002',
        realWorldContext: `Stripe processes millions of payment transactions per day. A subtle bug in the idempotency layer caused certain transactions to be submitted twice, resulting in customers being double-charged. The transaction log is an array of N+1 integers where every integer is in the range [1..N] — meaning exactly one ID appears twice. The billing team has escalated this as a P0 incident.`,
        desc: 'Finance flagged that 3 customers were charged twice. The transaction log array has N+1 items in range [1..N], containing exactly one duplicate ID. Find it in O(n) time and O(1) space.',
        whyItMatters: `A naive solution using a Hash Set works in O(n) time but requires O(n) extra memory — on a 100M transaction log, that's gigabytes of RAM just for the lookup table. The interviewer wants to see you can solve this in constant space, which is critical when processing massive financial datasets.`,
        approach: `Think of the array values as pointers: if the value at index 2 is 5, you "jump" to index 5. Since one value appears twice, two different indices point to the same location — this creates a cycle in the pointer graph. Floyd's Cycle Detection (Tortoise and Hare) finds cycles in linked list-like structures in O(n) time and O(1) space.`,
        solution: "Use Floyd's Tortoise and Hare (Cycle Detection). Treat array values as pointers. Phase 1: advance slow by 1, fast by 2 until they meet. Phase 2: reset slow to nums[0], advance both by 1 until they meet — that's the duplicate.",
        walkthrough: [
            "Phase 1 — Find intersection: Move `slow = nums[slow]` and `fast = nums[nums[fast]]` each step. Like two runners on a circular track, the faster one will eventually lap the slower one. They meet inside the cycle.",
            "Phase 2 — Find cycle entrance: The mathematical property of Floyd's algorithm guarantees that if you reset `slow` to the start and advance both pointers one step at a time, they will meet exactly at the duplicate number.",
            "Why does this work? The duplicate value creates two edges pointing to the same node — that's the 'entrance' of the cycle, which equals the duplicate."
        ],
        hints: [
            'A Set can detect duplicates in O(n) time — but O(n) space. Can you do better?',
            'Try treating the array values as pointers to indices. If value = 3, jump to index 3. A duplicate creates a cycle.',
            "Floyd's Cycle Detection: two pointers (slow = next, fast = next→next) will meet at a cycle intersection. Then reset slow to start and advance both by 1 to find the cycle entrance."
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def find_duplicate(nums: list[int]) -> int:
    """
    Given array of n+1 integers where each value is in [1..n],
    find the one duplicate. O(n) time, O(1) space required.
    
    Example:[1, 3, 4, 2, 2] → 2
    Example:[3, 1, 3, 4, 2] → 3
    """
    # Phase 1: Find intersection point using Floyd's cycle detection
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]           # 1 step
        fast = nums[nums[fast]]     # 2 steps
        if slow == fast:
            break

    # Phase 2: Find the cycle entrance (= duplicate)
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]

    return slow
`,
        testCases: [
            { id: 'tc1', description: 'Basic case', input: 'nums = [1, 3, 4, 2, 2]', expected: '2' },
            { id: 'tc2', description: 'Duplicate is 3', input: 'nums =[3, 1, 3, 4, 2]', expected: '3' },
            { id: 'tc3', description: 'Duplicate at boundaries', input: 'nums =[1, 4, 6, 3, 1, 2, 5]', expected: '1' },
            { id: 'tc4', description: 'Small array', input: 'nums = [2, 2, 1]', expected: '2' },
            { id: 'tc5', description: 'Large N constraint', input: 'nums = [2,5,9,6,9,3,8,9,7,1]', expected: '9' },
        ],
    };

export default challenge;
