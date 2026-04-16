import type { Challenge } from '../types';

// ─── ENG-DSA-012 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-012',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Webhook JSON Payload Validator (Stack)',
        companies: ['Plaid', 'Twilio'],
        timeEst: '~20 min',
        level: 'Junior',
        status: 'Not Started',
        topics: ['Stacks', 'Strings'],
        nextChallengeId: 'ENG-DSA-013',
        realWorldContext: `Twilio's webhook ingestion service crashed during a partner integration because malformed nested bracket structures in the JSON payload caused the parser to hang. Rather than letting the slow JSON parser handle validation, the team added a fast pre-check that validates bracket matching in O(n) time before the expensive parse step.`,
        desc: 'Our webhook ingestion endpoint is crashing because a third-party partner is sending malformed nested JSON/XML strings. Write a fast validator to ensure all opening brackets ({,[, <, () are properly closed in the correct order.',
        whyItMatters: `The Stack is the natural data structure for anything "nested." This pattern appears in: expression evaluators, syntax highlighting, HTML/XML parsers, and undo/redo systems. The bracket matching problem is the canonical introduction to stacks — master it and you'll recognize the stack pattern in dozens of harder problems.`,
        approach: `Think of a stack as a "memory" of what you've opened but not yet closed. Each time you see an opener, push it. Each time you see a closer, the most recently opened bracket should match it (LIFO order). If the stack is empty when you see a closer, or if the top doesn't match, the structure is invalid. At the end, the stack must be empty (all opened brackets were closed).`,
        solution: 'Use a Stack. Iterate through the characters. If it is an opening bracket, push it to the stack. If it is a closing bracket, pop from the stack and verify it matches the corresponding opening bracket. If the stack is empty at the end, it is valid.',
        walkthrough: [
            "payload = '{[<>()]}'. Stack: []",
            "'{' → opener, push. Stack: ['{']",
            "'[' → opener, push. Stack: ['{', '[']",
            "'<' → opener, push. Stack: ['{', '[', '<']",
            "'>' → closer! Pop '<'. Matches mapping['>']=('<'). Stack: ['{', '[']",
            "'(' → push. Stack:['{', '[', '(']",
            "')' → closer! Pop '('. Matches. Stack: ['{', '[']",
            "']' → closer! Pop '['. Matches. Stack: ['{']",
            "'}' → closer! Pop '{'. Matches. Stack:[]",
            "End: stack is empty → VALID ✓"
        ],
        hints: [
            'A stack is the perfect data structure for LIFO (Last-In-First-Out) operations, which is exactly how nested brackets work.',
            'Use a dictionary/hash map to store the matching pairs: { "}": "{", "]": "[", ")": "(", ">": "<" }.',
            'Watch out for edge cases: what if the string starts with a closing bracket? What if the stack isn\'t empty at the very end?'
        ],
        complexity: { time: 'O(n)', space: 'O(n)' },
        starterCode: `def is_valid_payload(payload: str) -> bool:
    """
    Checks if brackets in the payload string are properly closed.
    Supported brackets: (), {},[], <>
    
    Example: "{[<>()]}" → True
    Example: "{[}]" → False (wrong closing order)
    Example: "{" → False (never closed)
    """
    stack =[]
    mapping = {')': '(', '}': '{', ']': '[', '>': '<'}
    
    for char in payload:
        if char in mapping.values():   # It's an opener
            stack.append(char)
        elif char in mapping.keys():   # It's a closer
            if not stack or stack[-1] != mapping[char]:
                return False           # Stack empty, or wrong match
            stack.pop()
            
    return len(stack) == 0  # Valid only if all openers were closed
`,
        testCases: [
            { id: 'tc1', description: 'Valid nested JSON', input: 'payload="{[<>()]}"', expected: 'True' },
            { id: 'tc2', description: 'Invalid closing order', input: 'payload="{[}]"', expected: 'False' },
            { id: 'tc3', description: 'Missing closing bracket', input: 'payload="{"', expected: 'False' },
            { id: 'tc4', description: 'Starts with closing bracket', input: 'payload="}{"', expected: 'False' },
            { id: 'tc5', description: 'String with text inside', input: 'payload="{ user: [1, 2, (3)] }"', expected: 'True' },
        ],
    };

export default challenge;
