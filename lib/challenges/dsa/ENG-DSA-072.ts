import type { Challenge } from '../types';

// ─── ENG-DSA-072 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-072',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Feature Toggle Scenarios (Subsets)',
                    companies: ['LaunchDarkly', 'GitLab'],
                        timeEst: '~30 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Backtracking', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-073',
                                            realWorldContext: `Quality Assurance (QA) teams run integration tests across matrices of feature flags. If an application has 3 beta features (A, B, C), the test suite must generate all 2^3 = 8 possible environments (subsets) to verify that features don't crash when interacting with each other.`,
                                                desc: 'Given an integer array of unique elements representing feature flags, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return them in any order.',
                                                    whyItMatters: `Subsets is the purest, most stripped-down Backtracking problem. It teaches the binary decision tree model: for every element, you make a choice to either INCLUDE it in your subset or EXCLUDE it. This 2^N logic is the foundation for combinations, permutations, and DP knapsack optimization.`,
                                                        approach: `Start a recursive function \`dfs(i, subset)\`. At index \`i\`, we have two choices. Choice 1: Include \`nums[i]\` in the subset and recurse to \`i + 1\`. Choice 2: Exclude \`nums[i]\` (pop it from the subset) and recurse to \`i + 1\`. When \`i == len(nums)\`, we've made a decision for every element; append a copy of the subset to the results.`,
                                                            solution: 'DFS Backtracking. For each element, branch twice: once adding the element to the current path, once omitting it. Record the path when the index reaches the array length.',
                                                                walkthrough: [
                                                                    "nums = [1, 2, 3]",
                                                                    "dfs(0,[]) -> Branch 1 (Include 1): dfs(1, [1]) -> Branch 1 (Include 2): dfs(2, [1,2])",
                                                                    "-> Branch 1 (Include 3): dfs(3,[1,2,3]) -> Add to results.",
                                                                    "-> Branch 2 (Exclude 3): dfs(3, [1,2]) -> Add to results.",
                                                                    "Backtrack to dfs(1, [1]) -> Branch 2 (Exclude 2): dfs(2, [1])",
                                                                    "-> Branch 1 (Include 3): dfs(3, [1,3]) -> Add to results.",
                                                                    "-> Branch 2 (Exclude 3): dfs(3, [1]) -> Add to results...",
                                                                    "Outputs 8 subsets: [], [1],[2], [1,2], [3], [1,3], [2,3], [1,2,3]"
                                                                ],
                                                                    hints: [
                                                                        'At every element, you make a binary decision: Is it in the subset, or is it out?',
                                                                        'When the index reaches the end of the array, add a COPY of your subset array to the results list.',
                                                                        'Backtracking means pushing to the array, recursing, then popping from the array before making the next recursive call.'
                                                                    ],
                                                                        complexity: { time: 'O(N * 2^N)', space: 'O(N) stack space' },
    starterCode: `def generate_feature_scenarios(features: list[int]) -> list[list[int]]:
    """
    Returns all possible combinations of feature flags (the power set).
    """
    results =[]
    
    def dfs(i: int, current_subset: list[int]):
        # Base case: We've made a decision for every feature
        if i == len(features):
            results.append(list(current_subset))
            return
            
        # Decision 1: INCLUDE the current feature
        current_subset.append(features[i])
        dfs(i + 1, current_subset)
        
        # Decision 2: EXCLUDE the current feature
        current_subset.pop()
        dfs(i + 1, current_subset)
        
    dfs(0, [])
    return results
`,
        testCases: [
            { id: 'tc1', description: 'Standard 3 elements', input: 'features=[1,2,3]', expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
            { id: 'tc2', description: 'Single element', input: 'features=[0]', expected: '[[], [0]]' },
            { id: 'tc3', description: 'Empty features', input: 'features=[]', expected: '[[]]' },
            { id: 'tc4', description: 'Two elements', input: 'features=[1,2]', expected: '[[], [1], [2],[1,2]]' },
            { id: 'tc5', description: 'Four elements', input: 'features=[1,2,3,4]', expected: '16 unique subsets' },
        ],
    };

export default challenge;
