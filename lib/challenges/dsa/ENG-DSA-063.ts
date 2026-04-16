import type { Challenge } from '../types';

// ─── ENG-DSA-063 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-063',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Sparse Matrix Integrity Check (Hash Sets)',
        companies: ['Apple', 'Microsoft'],
        timeEst: '~25 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Matrix', 'Hash Set'],
        nextChallengeId: 'ENG-DSA-064',
        realWorldContext: `Scientific computing and machine learning platforms frequently validate structured constraint grids (Sparse Matrices) before running expensive GPU computations. Valid Sudoku is a proxy for this: ensuring no row, column, or specific sub-grid violates uniqueness constraints in O(N^2) time.`,
        desc: 'Determine if a 9x9 Sudoku board is valid. Only the filled cells need to be validated. Each row, column, and 3x3 sub-box must contain the digits 1-9 without repetition. Empty cells are filled with `.`.',
        whyItMatters: `Valid Sudoku requires mapping 2D matrix coordinates into 1D Hash Set identifiers. Specifically, identifying which 3x3 sub-box an \`(r, c)\` coordinate belongs to \`(r//3, c//3)\` is a highly reusable math trick for grid-based algorithms.`,
        approach: `Create three arrays of Hash Sets: 9 for rows, 9 for cols, and 9 for the 3x3 squares. Iterate over the board once. For every number found at (r, c), check if it exists in rows[r], cols[c], or squares[(r//3)*3 + (c//3)]. If it does, return False. Otherwise, add it to those sets.`,
        solution: 'Use Hash Sets to track seen numbers for each row, column, and 3x3 box. The box index is calculated as `(r // 3) * 3 + (c // 3)`. One pass, O(1) space since grid is strictly 9x9.',
        walkthrough: [
            "Grid has '5' at (0, 0). Add '5' to rows[0], cols[0], boxes[0].",
            "Grid has '5' at (2, 2). Box index for (2, 2) is (2//3)*3 + (2//3) = 0.",
            "Is '5' in boxes[0]? YES. Collision detected! Return False."
        ],
        hints: [
            'You only need to validate the numbers currently on the board, not solve it.',
            'You need to know if a number has been seen in its Row, Column, or 3x3 Box.',
            'The tricky part: Which 3x3 box does (r, c) belong to? Try integer division: `box_id = (r // 3) * 3 + (c // 3)`.'
        ],
        complexity: { time: 'O(1) strict 9x9 grid', space: 'O(1) strict 9x9 constraints' },
        starterCode: `def is_valid_sudoku(board: list[list[str]]) -> bool:
    """
    board: 9x9 2D array of chars
    Returns True if the board state is valid according to Sudoku rules.
    """
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes =[set() for _ in range(9)]
    
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
                
            # Calculate box index 0-8
            box_idx = (r // 3) * 3 + (c // 3)
            
            # Check for collisions
            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return False
                
            # Add to sets
            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)
            
    return True
`,
        testCases: [
            { id: 'tc1', description: 'Valid board', input: 'Valid 9x9 standard sudoku configuration', expected: 'True' },
            { id: 'tc2', description: 'Row collision', input: "Two '5's in row 0", expected: 'False' },
            { id: 'tc3', description: 'Col collision', input: "Two '9's in col 8", expected: 'False' },
            { id: 'tc4', description: 'Box collision', input: "Two '1's in the top-left 3x3 box", expected: 'False' },
            { id: 'tc5', description: 'Empty board', input: 'All cells are "."', expected: 'True' },
        ],
    };

export default challenge;
