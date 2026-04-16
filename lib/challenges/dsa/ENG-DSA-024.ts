import type { Challenge } from '../types';

// ─── ENG-DSA-024 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-024',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Org Chart Access Control (Tree LCA)',
        companies: ['Workday', 'Rippling'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Tree', 'Recursion', 'DFS'],
        nextChallengeId: 'ENG-DSA-025',
        realWorldContext: `Rippling's permission system grants shared access to a file to the lowest common manager of two employees. The org chart is stored as a binary tree. Finding the LCA (Lowest Common Ancestor) in the tree tells us which manager to notify and which permission scope to grant. This must work correctly even when one employee is a direct ancestor of the other.`,
        desc: 'Our permissions model is mapped to the corporate Org Chart (a Binary Tree). We need to grant shared file access to two employees. Write an algorithm to find their Lowest Common Manager (LCA) in the tree.',
        whyItMatters: `LCA (Lowest Common Ancestor) is a fundamental tree algorithm used in: permission systems, phylogenetic trees in bioinformatics, network routing, and range-minimum queries. The elegant recursive solution teaches "return information upward through the tree" — a pattern applicable to dozens of tree problems.`,
        approach: `Recurse through the tree. If the current node IS one of the employees, return it (we found one target; any LCA must include this node or be above it). After recursing left and right: if BOTH return non-null, the current node is split between the two employees — THIS is the LCA. If only one side returns non-null, pass that result upward (both employees are in that subtree).`,
        solution: 'Traverse the tree using DFS. If the current node is Employee A or Employee B, return the node. Recurse left and right. If BOTH left and right recursive calls return a node, the current node is the Lowest Common Manager. If only one returns a node, pass it up.',
        walkthrough: [
            "Tree: 3→[5,1], 5→[6,2], 1→[0,8]. Find LCA(5,1)",
            "DFS(3): recurse left and right.",
            "DFS(5): node==5==p, return node 5. (Don't go deeper)",
            "DFS(1): node==1==q, return node 1.",
            "Back at DFS(3): left=5(non-null), right=1(non-null). BOTH non-null!",
            "Return node 3 — it's the LCA ✓"
        ],
        hints: [
            'If you find Employee A on the left branch, and Employee B on the right branch, you are currently standing on the Lowest Common Manager.',
            'If you find both A and B on the left branch, then the LCA is somewhere further down that left branch.',
            'Base cases: if node is None, return None. If node == p or node == q, return node.'
        ],
        complexity: { time: 'O(n)', space: 'O(h) where h=tree height' },
        starterCode: `class EmployeeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def find_common_manager(root: EmployeeNode, p: EmployeeNode, q: EmployeeNode) -> EmployeeNode:
    """
    Finds the Lowest Common Ancestor (Manager) of two employees in an Org Tree.
    
    Example tree: root=3, left=5, right=1
    find_common_manager(root, node_5, node_1) → node_3
    find_common_manager(root, node_5, node_2) → node_5 (5 is ancestor of 2!)
    """
    # Base Case: null or found one of the targets
    if not root or root == p or root == q:
        return root
        
    # Search both subtrees
    left_search = find_common_manager(root.left, p, q)
    right_search = find_common_manager(root.right, p, q)
    
    # If both sides found something, this node splits the two employees
    if left_search and right_search:
        return root  # This IS the LCA
        
    # Otherwise pass up whichever side found something (or None if neither)
    return left_search if left_search else right_search
`,
        testCases: [
            { id: 'tc1', description: 'Standard branching', input: 'root=[3,5,1,6,2,0,8], p=5, q=1', expected: '3' },
            { id: 'tc2', description: 'Manager is the LCA', input: 'root=[3,5,1,6,2,0,8], p=5, q=4', expected: '5' },
            { id: 'tc3', description: 'Linear tree', input: 'root=[1,2], p=1, q=2', expected: '1' },
            { id: 'tc4', description: 'Deep nested match', input: 'root=[6,2,8,0,4,7,9], p=2, q=8', expected: '6' },
            { id: 'tc5', description: 'Same side match', input: 'root=[6,2,8,0,4,7,9], p=2, q=4', expected: '2' },
        ],
    };

export default challenge;
