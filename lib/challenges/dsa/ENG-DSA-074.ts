import type { Challenge } from '../types';

// ─── ENG-DSA-074 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-074',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Visible Security Cameras (Binary Tree Right Side View)',
                    companies: ['Verkada', 'Google'],
                        timeEst: '~30 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Trees', 'BFS', 'DFS'],
                                        nextChallengeId: 'ENG-DSA-075',
                                            realWorldContext: `Verkada's physical security planning software renders a 2D side-profile of buildings to show camera placement. Given a binary tree representing a building's network topology, the engine must return a list of nodes that are directly visible when the tree is viewed perfectly from the right side.`,
                                                desc: 'Given the `root` of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
                                                    whyItMatters: `Right Side View introduces a specific twist on standard Level-Order Traversal (BFS). Instead of collecting all nodes on a level, you only want the LAST node processed on each level. It demonstrates mastery of queue manipulation for tree depth processing.`,
                                                        approach: `Use a BFS Queue. To process level by level, take the \`length\` of the queue at the start of the loop. Loop exactly \`length\` times, popping nodes. The *last* node popped in this inner loop is the right-most node for that level—add its value to the results. Push left and right children to the queue for the next level.`,
                                                            solution: 'Level-order traversal (BFS). Record the value of the final node processed at each depth level.',
                                                                walkthrough: [
                                                                    "Tree:   1\n       / \\\n      2   3\n       \\\n        5",
                                                                    "Level 0: Queue=[1]. Len=1. Pop 1. End of level -> add 1 to result. Q=[2,3]",
                                                                    "Level 1: Queue=[2,3]. Len=2. Pop 2 (add 5). Pop 3. End of level -> add 3. Q=[5]",
                                                                    "Level 2: Queue=[5]. Len=1. Pop 5. End of level -> add 5. Q=[]",
                                                                    "Result: [1, 3, 5] ✓"
                                                                ],
                                                                    hints: [
                                                                        'Perform a standard Breadth-First Search (BFS) using a Queue.',
                                                                        'Instead of popping one node at a time blindly, determine the `size` of the queue, then loop `size` times. This isolates each depth level.',
                                                                        'Append the value of the very last node in the inner loop to your results array.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def right_side_view(root: TreeNode) -> list[int]:
    """
    Returns the values of nodes visible from the right side.
    """
    if not root:
        return []
        
    result = []
    queue = deque([root])
    
    while queue:
        level_length = len(queue)
        
        # Process all nodes at the current level
        for i in range(level_length):
            node = queue.popleft()
            
            # If it's the last node in this level, it's visible from the right
            if i == level_length - 1:
                result.append(node.val)
                
            # Add children for the next level
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
                
    return result
`,
        testCases: [
            { id: 'tc1', description: 'Standard tree', input: 'Tree:[1,2,3,null,5,null,4]', expected: '[1, 3, 4]' },
            { id: 'tc2', description: 'Left skewed (left visible)', input: 'Tree: [1,2,3,4]', expected: '[1, 3, 4] (4 is visible because right has no nodes at depth 2)' },
            { id: 'tc3', description: 'Empty tree', input: 'Tree: []', expected: '[]' },
            { id: 'tc4', description: 'Single node', input: 'Tree: [1]', expected: '[1]' },
            { id: 'tc5', description: 'Deep left branch', input: 'Tree:[1,2,3,4,null,null,null,5]', expected: '[1, 3, 4, 5]' },
        ],
    };

export default challenge;
