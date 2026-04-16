import type { Challenge } from '../types';

// ─── ENG-DSA-018 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-018',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Dynamic API Routing (Trie)',
        companies: ['Vercel', 'Next.js'],
        timeEst: '~50 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Trie', 'Design'],
        nextChallengeId: 'ENG-DSA-019',
        realWorldContext: `Next.js's file-based routing system must match incoming request paths like "/users/123/profile" against registered routes like "/users/*/profile". A HashMap works for exact matches, but wildcard routing requires a Trie. This is the same algorithm used by Express.js, FastAPI, and virtually every web framework's router.`,
        desc: 'You are writing the core router for a new web framework. You need to support fast path matching, including wildcard parameters (e.g., `/users/*/profile`). Implement an `add_route(path)` and `match_route(path)` using a Trie data structure.',
        whyItMatters: `Tries (Prefix Trees) are essential for: autocomplete systems, IP routing tables (longest prefix match), DNS resolution, and web framework routing. The wildcard extension shown here teaches how to extend exact-match algorithms to handle parametric patterns — a critical skill for building routing infrastructure.`,
        approach: `Split paths by "/" and build a Trie where each path segment is a node. For wildcards ("*"), insert a special node that matches any segment. When matching, use DFS with two branches at each step: (1) try exact segment match, (2) try wildcard match. The DFS explores both possibilities, returning True if either path leads to a valid route endpoint.`,
        solution: 'Split the path by "/" and insert each segment as a node in a Trie. For wildcard parameters like "*", insert a special node. When searching, recursively traverse. If the current segment matches exactly, proceed. If a wildcard node exists, try that path as a fallback.',
        walkthrough: [
            "add_route('/api/users/*'): segments=['api','users','*']",
            "Trie: root→api→users→*(end=True)",
            "match_route('/api/users/123'): segments=['api','users','123']",
            "Traverse: root→api(exact match)→users(exact match)→'123'",
            "No exact node '123'. Check wildcard: '*' exists! Follow wildcard.",
            "At '*' node: index=3==len(segments). is_end=True. MATCH ✓"
        ],
        hints: [
            'A Hash Map works for exact matches, but fails for wildcards. A Trie (Prefix Tree) is required.',
            'Split the string "/users/123" into an array of segments ["users", "123"].',
            'When traversing for `match_route`, if you hit a node with a `*` child, it matches any string segment.'
        ],
        complexity: { time: 'O(L) per operation where L=path length', space: 'O(N*L)' },
        starterCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_route = False

class Router:
    def __init__(self):
        self.root = TrieNode()

    def add_route(self, path: str) -> None:
        """Register a route. '*' matches any single path segment.
        Example: add_route('/users/*/profile')"""
        segments = [s for s in path.split('/') if s]
        curr = self.root
        for seg in segments:
            if seg not in curr.children:
                curr.children[seg] = TrieNode()
            curr = curr.children[seg]
        curr.is_end_of_route = True

    def match_route(self, path: str) -> bool:
        """Check if path matches any registered route.
        Tries exact match first, falls back to wildcard."""
        segments =[s for s in path.split('/') if s]
        
        def dfs(node: TrieNode, index: int) -> bool:
            if index == len(segments):
                return node.is_end_of_route
                
            seg = segments[index]
            # Try exact match first (higher priority than wildcard)
            if seg in node.children and dfs(node.children[seg], index + 1):
                return True
            # Fall back to wildcard
            if '*' in node.children and dfs(node.children['*'], index + 1):
                return True
                
            return False
            
        return dfs(self.root, 0)
`,
        testCases: [
            { id: 'tc1', description: 'Exact match', input: 'add("/api/users"), match("/api/users")', expected: 'True' },
            { id: 'tc2', description: 'Wildcard match', input: 'add("/api/users/*"), match("/api/users/123")', expected: 'True' },
            { id: 'tc3', description: 'Failing subpath', input: 'add("/api/users"), match("/api/users/123")', expected: 'False' },
            { id: 'tc4', description: 'Nested wildcards', input: 'add("/org/*/users/*"), match("/org/apple/users/jason")', expected: 'True' },
            { id: 'tc5', description: 'Order precedence', input: 'add("/a/b"), add("/a/*"), match("/a/b")', expected: 'True' },
        ],
    };

export default challenge;
