import type { Challenge } from '../types';

// ─── ENG-DSA-010 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-010',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Log Stream Pattern Search (Aho-Corasick)',
        companies: ['Elastic', 'Splunk'],
        timeEst: '~60 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Trie', 'String Matching', 'Automata'],
        nextChallengeId: 'ENG-DSA-011',
        realWorldContext: `Elastic's SIEM (Security Information and Event Management) system must scan 5 GB/s of raw log data for 10,000 known malicious IP addresses. Running 10,000 regex patterns sequentially would take ~500ms per GB. Aho-Corasick's automaton scans ALL patterns simultaneously in a single O(N) pass — 500x faster.`,
        desc: "Scan a live 5 GB/s log stream for 10,000 banned IPs simultaneously. Running 10,000 separate regex scans pegs CPU at 100%. Build an Aho-Corasick automaton to search all patterns in a single O(N) pass.",
        whyItMatters: `Aho-Corasick is the algorithm behind intrusion detection systems, antivirus scanners, network packet inspection, and grep -F (fixed-string search). It's the most important multi-pattern string matching algorithm in existence. Understanding it demonstrates mastery of both Trie data structures and finite automata theory.`,
        approach: `Phase 1 (Build Trie): Insert all patterns character by character. Phase 2 (Add Failure Links via BFS): For each state, compute the longest proper suffix that is also a valid Trie prefix. This is the "failure link" — when the current match fails, jump to the failure link instead of restarting from root. Phase 3 (Search): Follow goto links on match, failure links on mismatch — single pass through text.`,
        solution: 'Build a Trie from all 10,000 patterns. Add BFS-computed failure links so when a partial match fails, you transition to the longest proper suffix that IS a state in the Trie. Then scan the text in a single pass using goto/fail transitions.',
        walkthrough: [
            "Patterns: ['he', 'she', 'his', 'hers']",
            "Build Trie: root→h→e(end:'he')→r→s(end:'hers'). root→s→h→e(end:'she'). root→h→i→s(end:'his')",
            "Failure links (BFS): state 'h' fails to root. State 'he' fails to 'e' (suffix). State 'she' fails to 'he' (also matches 'he'!).",
            "Scanning 'ushers': u→fail→root. s→s. h→sh. e→she (match:'she'!). r→sher. s→shers (match:'hers' via output link, 'he' via fail!).",
            "Result: matches for 'she','he','hers' — all found in single pass ✓"
        ],
        hints: [
            'A regular Trie finds single patterns fast. Aho-Corasick extends it to find ALL patterns simultaneously by adding "failure links".',
            'Failure link for state S = the longest proper suffix of the string ending at S that is also a valid Trie prefix. Compute these via BFS from the root.',
            'When scanning: follow goto links on match. On mismatch, follow the failure link (not back to root) — this avoids re-scanning characters and achieves O(N) total search time.'
        ],
        complexity: { time: 'O(M) build + O(N+Z) search where Z=matches', space: 'O(M * alphabet)' },
        starterCode: `from collections import deque

class AhoCorasick:
    """Multi-pattern search: build once O(M), scan in O(N) per log line.
    M = total length of all patterns, N = text length."""

    def __init__(self):
        self.goto = [{}]   # goto[state][char] = next_state
        self.fail = [0]    # failure function: longest proper suffix state
        self.out = [[]]    # out[state] = list of patterns ending here

    def build(self, patterns: list[str]):
        """Phase 1: insert all patterns into the Trie."""
        for pattern in patterns:
            state = 0
            for ch in pattern:
                if ch not in self.goto[state]:
                    self.goto.append({})
                    self.fail.append(0)
                    self.out.append([])
                    self.goto[state][ch] = len(self.goto) - 1
                state = self.goto[state][ch]
            self.out[state].append(pattern)

        """Phase 2: BFS to compute failure links.
        fail[s] = longest proper suffix of s that is also a Trie state."""
        q = deque()
        for ch, s in self.goto[0].items():
            self.fail[s] = 0  # Depth-1 nodes fail to root
            q.append(s)
        while q:
            r = q.popleft()
            for ch, s in self.goto[r].items():
                q.append(s)
                state = self.fail[r]
                while state and ch not in self.goto[state]:
                    state = self.fail[state]
                self.fail[s] = self.goto[state].get(ch, 0)
                if self.fail[s] == s:
                    self.fail[s] = 0
                self.out[s] += self.out[self.fail[s]]  # Inherit suffix matches

    def search(self, text: str) -> list[tuple[int, str]]:
        """Scan text in O(N), return (start_index, pattern) for all matches."""
        results =[]
        state = 0
        for i, ch in enumerate(text):
            while state and ch not in self.goto[state]:
                state = self.fail[state]  # Follow failure link
            state = self.goto[state].get(ch, 0)
            for pattern in self.out[state]:
                results.append((i - len(pattern) + 1, pattern))
        return results
`,
        testCases: [
            { id: 'tc1', description: 'Single pattern found', input: "patterns=['10.0.0.1'], text='request from 10.0.0.1 at port 443'", expected: "[(13, '10.0.0.1')]" },
            { id: 'tc2', description: 'Multiple patterns in one scan', input: "patterns=['192.168.1.1','10.0.0.1'], text='blocked 10.0.0.1 and 192.168.1.1'", expected: '2 matches found' },
            { id: 'tc3', description: 'Pattern not in text', input: "patterns=['1.2.3.4'], text='no match here'", expected: '[] (empty)' },
            { id: 'tc4', description: 'Overlapping prefix patterns', input: "patterns=['he','she','his','hers'], text='ushers'", expected: "matches for 'he','she','hers'" },
            { id: 'tc5', description: 'Empty text', input: "patterns=['abc'], text=''", expected: '[] (empty)' },
        ],
    };

export default challenge;
