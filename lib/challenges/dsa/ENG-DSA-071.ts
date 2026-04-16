import type { Challenge } from '../types';

// ─── ENG-DSA-071 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-071',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Promotion Bundling (Combination Sum)',
                    companies: ['Amazon', 'Walmart'],
                        timeEst: '~45 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Backtracking', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-072',
                                            realWorldContext: `E-commerce checkout systems generate targeted "bundle" discounts. To trigger a "$50 off your cart" coupon, the system must calculate if combinations of items from a promotional catalog sum exactly to the target threshold. Customers can buy the same promotional item multiple times.`,
                                                desc: 'Given an array of distinct integers `prices` and a target integer `target`, return a list of all unique combinations of prices where the chosen numbers sum to `target`. You may choose the same price an unlimited number of times.',
                                                    whyItMatters: `Combination Sum introduces generating combinations via Backtracking. It differs from permutations because order doesn't matter (e.g., [2,3] is the same as [3,2]). To prevent duplicate sets, the recursion must only pick from the *current* index onwards.`,
                                                        approach: `Use a recursive backtracking function: \`backtrack(start_index, current_combo, current_sum)\`. If \`current_sum == target\`, copy the combo to results. If \`current_sum > target\`, terminate that branch (pruning). Otherwise, loop from \`start_index\` to the end of the array. Push the number, recurse (passing the SAME index since we can reuse numbers), and then pop (backtrack).`,
                                                            solution: 'Backtracking. Maintain a running sum. When branching, loop from `current_index` to `N` to allow reuse of elements while avoiding backward permutations. Append valid branches to results.',
                                                                walkthrough: [
                                                                    "prices=[2,3,6,7], target=7",
                                                                    "backtrack(0, [], 0) -> try 2",
                                                                    "  backtrack(0, [2], 2) -> try 2",
                                                                    "    backtrack(0, [2,2], 4) -> try 2",
                                                                    "      backtrack(0, [2,2,2], 6) -> try 2 -> sum=8 > 7. Backtrack.",
                                                                    "      backtrack(0, [2,2,2], 6) -> try 3 -> sum=9 > 7. Backtrack.",
                                                                    "    backtrack(1,[2,2], 4) -> try 3 -> sum=7 == 7! Add [2,2,3] to results.",
                                                                    "Eventually branches find [7]. Result: [[2,2,3], [7]]"
                                                                ],
                                                                    hints: [
                                                                        'Use recursion to explore the decision tree: at each step, you can pick a price or move on to the next price.',
                                                                        'To avoid duplicate combinations like [2,3] and [3,2], always start your inner loop at the `current_index` passed into the recursive function.',
                                                                        'Remember to append a COPY of your path array `list(path)` to the results, otherwise Python will mutate it later.'
                                                                    ],
                                                                        complexity: { time: 'O(N^(T/M)) (T=target, M=min_val)', space: 'O(T/M) stack space' },
    starterCode: `def find_bundles(prices: list[int], target: int) -> list[list[int]]:
    """
    Returns all unique combinations of prices that sum up exactly to target.
    Prices can be used multiple times.
    """
    results =[]
    
    def backtrack(start_index: int, current_combo: list[int], current_sum: int):
        # Base case: Found a valid combination
        if current_sum == target:
            results.append(list(current_combo))
            return
            
        # Base case: Exceeded target, stop exploring this branch
        if current_sum > target:
            return
            
        # Explore choices starting from 'start_index' to avoid permutations
        for i in range(start_index, len(prices)):
            price = prices[i]
            
            # Choose
            current_combo.append(price)
            
            # Explore (pass 'i' not 'i+1' because we can reuse the same price)
            backtrack(i, current_combo, current_sum + price)
            
            # Un-choose (backtrack)
            current_combo.pop()
            
    backtrack(0, [], 0)
    return results
`,
        testCases: [
            { id: 'tc1', description: 'Standard case', input: 'prices=[2,3,6,7], target=7', expected: '[[2,2,3], [7]]' },
            { id: 'tc2', description: 'Multiple uses', input: 'prices=[2,3,5], target=8', expected: '[[2,2,2,2], [2,3,3], [3,5]]' },
            { id: 'tc3', description: 'No valid combo', input: 'prices=[2], target=1', expected: '[]' },
            { id: 'tc4', description: 'Target equals element', input: 'prices=[1], target=1', expected: '[[1]]' },
            { id: 'tc5', description: 'Target equals two elements', input: 'prices=[1], target=2', expected: '[[1,1]]' },
        ],
    };

export default challenge;
