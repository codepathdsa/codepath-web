import type { Challenge } from '../types';

// ─── ENG-DSA-058 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-058',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Hashtag Tokenization (Dynamic Programming)',
        companies: ['Twitter', 'Instagram'],
        timeEst: '~45 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Dynamic Programming', 'Trie', 'Hash Set'],
        nextChallengeId: 'ENG-DSA-059',
        realWorldContext: `Social media platforms often need to extract meaningful words from hashtags (e.g., "#iloveprogramming" -> "i", "love", "programming") for trend analysis and search indexing. Because spaces are omitted, the system must determine if the continuous string can be perfectly segmented into valid dictionary words.`,
        desc: 'Given a string `s` and a dictionary of words `wordDict`, return True if `s` can be segmented into a space-separated sequence of one or more dictionary words.',
        whyItMatters: `This is the "Word Break" problem. A brute-force recursive approach trying every prefix will branch exponentially (O(2^n)). Dynamic Programming optimizes this to O(n^2) by saving the results of subproblems ("can the string starting at index i be segmented?").`,
        approach: `Create a boolean array dp of size len(s) + 1. dp[i] represents whether the substring s[0...i] can be segmented. Initialize dp[0] = True (empty string is valid). Iterate i from 1 to len(s). For each i, check all previous indices j. If dp[j] is True AND s[j...i] is in the dictionary, then dp[i] is True.`,
        solution: 'Use a bottom-up DP array where dp[i] indicates if s[:i] can be broken into valid words. For each length i, check if there is a split point j such that dp[j] is True and s[j:i] is in the word list.',
        walkthrough: [
            "s='leetcode', dict=['leet', 'code']",
            "dp =[T, F, F, F, F, F, F, F, F] (size 9)",
            "i=4 (checking 'leet'): j=0, dp[0]=T. 'leet' in dict? Yes. dp[4] = True.",
            "i=8 (checking 'leetcode'): j=4, dp[4]=T. 'code' in dict? Yes. dp[8] = True.",
            "Result: dp[8] = True ✓"
        ],
        hints: [
            'Convert the word dictionary to a Hash Set for O(1) lookups.',
            'Let dp[i] be True if the first i characters can be segmented into valid words.',
            'To calculate dp[i], find a j < i such that dp[j] is True and the substring from j to i is in the dictionary.'
        ],
        complexity: { time: 'O(n^3) string slicing makes inner loop O(n)', space: 'O(n)' },
        starterCode: `def can_segment_hashtag(s: str, wordDict: list[str]) -> bool:
    """
    s: the continuous hashtag string (e.g., "ilovecoding")
    wordDict: list of valid dictionary words
    Returns True if s can be fully segmented.
    """
    word_set = set(wordDict)
    # dp[i] will be True if s[0:i] can be segmented
    dp = [False] * (len(s) + 1)
    dp[0] = True  # Base case: empty string
    
    for i in range(1, len(s) + 1):
        for j in range(i):
            # If the first j chars can be segmented, 
            # and the remaining substring is a valid word
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break  # No need to check other splits for this i
                
    return dp[len(s)]
`,
        testCases: [
            { id: 'tc1', description: 'Clean split', input: "s='leetcode', dict=['leet', 'code']", expected: 'True' },
            { id: 'tc2', description: 'Overlapping words', input: "s='applepenapple', dict=['apple', 'pen']", expected: 'True' },
            { id: 'tc3', description: 'Unsegmentable', input: "s='catsandog', dict=['cats', 'dog', 'sand', 'and', 'cat']", expected: 'False' },
            { id: 'tc4', description: 'Single letter words', input: "s='aaaaaaa', dict=['aaaa', 'aaa']", expected: 'True' },
            { id: 'tc5', description: 'Missing one char', input: "s='cars', dict=['car', 'ca', 'rs']", expected: 'True' },
        ],
    };

export default challenge;
