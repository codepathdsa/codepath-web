import type { Challenge } from '../types';

// ─── ENG-DSA-013 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-013',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Git Bisect Memory Leak (Binary Search)',
        companies: ['GitHub', 'GitLab'],
        timeEst: '~25 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Search'],
        nextChallengeId: 'ENG-DSA-014',
        realWorldContext: `A GitHub team discovered a memory leak in production that was introduced somewhere across 10,000 commits over the past 3 months. Running their test suite takes 10 minutes per commit. Testing every commit sequentially would take 70 days. Git bisect (which uses binary search under the hood) finds the culprit in at most 14 commits — about 2.3 hours.`,
        desc: 'A massive memory leak was introduced somewhere in the last 10,000 commits. Running the test suite takes 10 minutes per commit, so testing chronologically will take days. Given an API function `is_bad_commit(id)`, find the exact first commit that introduced the bug efficiently.',
        whyItMatters: `Binary search is the most powerful search technique for sorted/monotonic spaces. The key insight — that you can eliminate HALF the remaining search space with each comparison — reduces log₂(10,000) = 13.3, so just 14 tests instead of 10,000. This principle extends beyond arrays: database indexes, internet routing tables, and version control all use binary search variants.`,
        approach: `The commits are implicitly sorted: good commits come first, bad commits come after, and once a commit is "bad," all subsequent ones are also "bad" (monotonic). This is the key property that makes binary search applicable. Unlike regular binary search where you return when you find a match, here you must find the FIRST bad commit — so when you find a bad commit, you move right inward, not return.`,
        solution: 'Use Binary Search to minimize API calls. Find the midpoint commit. If it is bad, the bug was introduced at or before this point, so move the right pointer to mid. If it is good, the bug was introduced after, so move the left pointer to mid + 1.',
        walkthrough: [
            "n=10, bad_commit=5. left=1, right=10",
            "mid=5: is_bad(5)=True → right=5. left=1, right=5",
            "mid=3: is_bad(3)=False → left=4. left=4, right=5",
            "mid=4: is_bad(4)=False → left=5. left=5, right=5",
            "left==right==5. Return 5 ✓ (only 3 API calls instead of 10!)"
        ],
        hints: [
            'This is exactly how `git bisect` works under the hood. It turns an O(n) search into O(log n).',
            'If commit 500 is BAD, it means the bug was introduced somewhere between commit 1 and 500.',
            'Unlike standard binary search, you don\'t return early when you find a BAD commit. You must find the *first* BAD commit, meaning you keep searching the left half.'
        ],
        complexity: { time: 'O(log n)', space: 'O(1)' },
        starterCode: `def is_bad_commit(commit_id: int) -> bool:
    # This is a mock API provided by the platform.
    # Returns True if the memory leak exists in this commit.
    pass

def find_first_bad_commit(n: int) -> int:
    """
    n: Total number of commits [1, 2, ..., n]
    Returns the ID of the first bad commit.
    
    Key insight: commits are monotonic — once bad, all later are bad.
    Example:[good, good, good, BAD, BAD, BAD] → find index of first BAD.
    """
    left = 1
    right = n
    
    while left < right:
        mid = left + (right - left) // 2  # Avoids integer overflow
        if is_bad_commit(mid):
            right = mid    # Bad found, but might not be FIRST bad — search left
        else:
            left = mid + 1 # Confirmed good, bug is after mid
            
    return left  # left == right == first bad commit
`,
        testCases: [
            { id: 'tc1', description: 'Bug in middle', input: 'n=10, bad=5', expected: '5' },
            { id: 'tc2', description: 'Bug is very first commit', input: 'n=100, bad=1', expected: '1' },
            { id: 'tc3', description: 'Bug is the very last commit', input: 'n=1000, bad=1000', expected: '1000' },
            { id: 'tc4', description: 'Only one commit total', input: 'n=1, bad=1', expected: '1' },
            { id: 'tc5', description: 'Massive scale', input: 'n=2147483647, bad=1500000', expected: '1500000' },
        ],
    };

export default challenge;
