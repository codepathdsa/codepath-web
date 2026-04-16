import type { Challenge } from '../types';

// ─── ENG-DSA-064 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-064',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Drone Area Sweep (Matrix Traversal)',
        companies: ['Tesla', 'Waymo'],
        timeEst: '~35 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Matrix', 'Simulation'],
        nextChallengeId: 'ENG-DSA-065',
        realWorldContext: `Autonomous farming drones and robotic vacuum cleaners need to cover a rectangular plot of land efficiently. The spiral sweep pattern starts at the perimeter and circles inward. Generating the navigation waypoints requires translating this 2D matrix boundary contraction into sequential logic.`,
        desc: 'Given an `m x n` matrix, return all elements of the matrix in spiral order (starting from top-left, going right, down, left, up, inward).',
        whyItMatters: `Spiral Matrix is a pure array manipulation and boundary tracking problem. It has no "trick" (like DP or Hash Sets); it simply tests a developer's ability to maintain clear mental models of multiple moving boundary variables without succumbing to off-by-one errors.`,
        approach: `Maintain 4 boundaries: top, bottom, left, right. Use a while loop as long as \`top <= bottom\` and \`left <= right\`. Traverse left->right, then increment top. Traverse top->bottom, decrement right. Traverse right->left, decrement bottom. Traverse bottom->top, increment left. IMPORTANT: Check boundaries again before traversing left and up to prevent duplicate processing on non-square matrices.`,
        solution: 'Track 4 boundaries. Loop through the 4 directions sequentially. Shrink boundaries after each directional pass. Add safety checks for single row/col remnants.',
        walkthrough: [
            "Matrix: [[1,2,3],[4,5,6],[7,8,9]]",
            "top=0, bot=2, left=0, right=2",
            "Go right: 1, 2, 3. top becomes 1.",
            "Go down: 6, 9. right becomes 1.",
            "Go left: 8, 7. bot becomes 1.",
            "Go up: 4. left becomes 1.",
            "top(1) <= bot(1) and left(1) <= right(1). Go right: 5. top=2.",
            "top > bot. Loop ends. Output: 1,2,3,6,9,8,7,4,5 ✓"
        ],
        hints: [
            'Set up `top`, `bottom`, `left`, and `right` boundary variables.',
            'After traversing the top row from left to right, increment the `top` boundary.',
            'Because matrices can be rectangles (not just squares), ensure `top <= bottom` and `left <= right` before doing the backward passes (right-to-left and bottom-to-top).'
        ],
        complexity: { time: 'O(m * n)', space: 'O(1) excluding output' },
        starterCode: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    """
    Returns elements of the matrix in a spiral order.
    """
    if not matrix:
        return[]
        
    result =[]
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        # Traverse from left to right across the top row
        for i in range(left, right + 1):
            result.append(matrix[top][i])
        top += 1
        
        # Traverse from top to bottom down the right column
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        if top <= bottom:
            # Traverse from right to left across the bottom row
            for i in range(right, left - 1, -1):
                result.append(matrix[bottom][i])
            bottom -= 1
            
        if left <= right:
            # Traverse from bottom to top up the left column
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
            
    return result
`,
        testCases: [
            { id: 'tc1', description: '3x3 Square', input: '[[1,2,3],[4,5,6],[7,8,9]]', expected: '[1,2,3,6,9,8,7,4,5]' },
            { id: 'tc2', description: '3x4 Rectangle', input: '[[1,2,3,4],[5,6,7,8],[9,10,11,12]]', expected: '[1,2,3,4,8,12,11,10,9,5,6,7]' },
            { id: 'tc3', description: 'Single row', input: '[[1,2,3]]', expected: '[1,2,3]' },
            { id: 'tc4', description: 'Single column', input: '[[1],[2],[3]]', expected: '[1,2,3]' },
            { id: 'tc5', description: 'Empty', input: '[]', expected: '[]' },
        ],
    };

export default challenge;
