import type { Challenge } from '../types';

// ─── ENG-DSA-073 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-073',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'UI Component Tree Reconstruction',
                    companies: ['Meta', 'Vercel'],
                        timeEst: '~50 min',
                            level: 'Senior',
                                status: 'Not Started',
                                    topics: ['Trees', 'Recursion', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-074',
                                            realWorldContext: `React's Virtual DOM represents the UI as a tree. During server-side rendering (SSR) hydration, the client receives serialized flat arrays of components. To rebuild the exact component hierarchy in memory, the hydration engine processes preorder (root first) and inorder (left, root, right) traversal logs.`,
                                                desc: 'Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return the binary tree.',
                                                    whyItMatters: `Construct Binary Tree from Preorder and Inorder Traversal is a true test of understanding tree traversal mechanics. Preorder tells you exactly *what* the root is. Inorder tells you *how many* nodes are in the left vs right subtrees. Combining these two properties via recursion reconstructs the entire structure.`,
                                                        approach: `The first element in \`preorder\` is ALWAYS the root. Find that root's value in the \`inorder\` array. Everything to the left of it in \`inorder\` belongs to the left subtree; everything to the right belongs to the right subtree. The number of elements in the left subtree tells you exactly how many elements in \`preorder\` belong to the left branch. Recursively build \`root.left\` and \`root.right\` using array slices.`,
                                                            solution: 'First element of preorder is root. Locate root in inorder to partition left/right subtrees. Recursively pass sliced preorder and inorder arrays to build left and right children.',
                                                                walkthrough: [
                                                                    "pre=[3,9,20,15,7], in=[9,3,15,20,7]",
                                                                    "Root is pre[0] = 3. Find 3 in inorder -> index 1.",
                                                                    "Left subtree inorder: in[0:1] = [9]. Right subtree inorder: in[2:] =[15,20,7]",
                                                                    "Left subtree size = 1. So left preorder is pre[1:2] = [9]. Right preorder is pre[2:] = [20,15,7]",
                                                                    "Recurse left(pre=[9], in=[9]): root=9. Done.",
                                                                    "Recurse right(pre=[20,15,7], in=[15,20,7]): root=20. Left=15, Right=7. Done.",
                                                                    "Tree restored! ✓"
                                                                ],
                                                                    hints: [
                                                                        'Preorder traversal is `[Root, Left Subtree, Right Subtree]`.',
                                                                        'Inorder traversal is `[Left Subtree, Root, Right Subtree]`.',
                                                                        'Use a Hash Map to store `value -> index` for the inorder array so you don\'t have to use `.index()` in O(N) time during every recursive step.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(preorder: list[int], inorder: list[int]) -> TreeNode:
    """
    Reconstructs the binary tree from preorder and inorder traversals.
    """
    # Map value to its index in inorder array for O(1) lookups
    inorder_idx_map = {val: idx for idx, val in enumerate(inorder)}
    
    def array_to_tree(pre_left: int, pre_right: int, in_left: int, in_right: int) -> TreeNode:
        if pre_left > pre_right or in_left > in_right:
            return None
            
        # The first element in preorder window is the root
        root_val = preorder[pre_left]
        root = TreeNode(root_val)
        
        # Find root index in inorder window
        mid_idx = inorder_idx_map[root_val]
        
        # Calculate size of left subtree
        left_subtree_size = mid_idx - in_left
        
        # Recursively build left and right subtrees
        root.left = array_to_tree(pre_left + 1, pre_left + left_subtree_size, in_left, mid_idx - 1)
        root.right = array_to_tree(pre_left + left_subtree_size + 1, pre_right, mid_idx + 1, in_right)
        
        return root
        
    return array_to_tree(0, len(preorder) - 1, 0, len(inorder) - 1)
`,
        testCases: [
            { id: 'tc1', description: 'Standard Tree', input: 'pre=[3,9,20,15,7], in=[9,3,15,20,7]', expected: 'Root=3, L=9, R=20(L15, R7)' },
            { id: 'tc2', description: 'Single node', input: 'pre=[-1], in=[-1]', expected: 'Root=-1' },
            { id: 'tc3', description: 'Left heavy', input: 'pre=[1,2,3], in=[3,2,1]', expected: '1 -> L:2 -> L:3' },
            { id: 'tc4', description: 'Right heavy', input: 'pre=[1,2,3], in=[1,2,3]', expected: '1 -> R:2 -> R:3' },
            { id: 'tc5', description: 'Empty', input: 'pre=[], in=[]', expected: 'None' },
        ],
    };

export default challenge;
