import type { Challenge } from '../types';

// ─── ENG-DSA-075 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-075',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Nested Payload Decoder (Stack)',
                    companies: ['Stripe', 'Twilio'],
                        timeEst: '~35 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Stack', 'Strings'],
                                        nextChallengeId: 'ENG-DSA-076',
                                            realWorldContext: `To minimize payload sizes over constrained networks, mobile APIs sometimes compress redundant JSON data structures. A payload encoded as "3[msg]" needs to be expanded into "msgmsgmsg". Nested compression like "2[b3[a]]" requires evaluating structures from the inside out.`,
                                                desc: 'Given an encoded string, return its decoded string. The encoding rule is: `k[encoded_string]`, where the encoded_string inside the square brackets is being repeated exactly `k` times. Note that `k` is guaranteed to be a positive integer.',
                                                    whyItMatters: `Decode String requires processing operations in a Last-In-First-Out sequence (inner brackets must be resolved before outer brackets). Using a Stack gracefully holds the "context" of outer operations while inner operations finish processing.`,
                                                        approach: `Traverse the string. Maintain a \`current_string\` and a \`current_num\`. When encountering a digit, update \`current_num\` (handles multi-digit like "12["). When \`[\`, push \`current_string\` and \`current_num\` to the stack, then reset both. When \`]\`, pop \`prev_num\` and \`prev_str\` from the stack. Update \`current_string = prev_str + (current_string * prev_num)\`. Regular letters simply append to \`current_string\`.`,
                                                            solution: 'Use a stack. Build strings and numbers. On `[`, push current state and reset. On `]`, pop state, multiply current string, and append to popped string.',
                                                                walkthrough: [
                                                                    "s = '3[a2[c]]'",
                                                                    "Read '3'. curr_num=3.",
                                                                    "Read '['. Push (3, ''). curr_num=0, curr_str=''. Stack=[(3, '')]",
                                                                    "Read 'a'. curr_str='a'.",
                                                                    "Read '2'. curr_num=2.",
                                                                    "Read '['. Push (2, 'a'). curr_num=0, curr_str=''. Stack=[(3, ''), (2, 'a')]",
                                                                    "Read 'c'. curr_str='c'.",
                                                                    "Read ']'. Pop (2, 'a'). curr_str = 'a' + ('c'*2) = 'acc'.",
                                                                    "Read ']'. Pop (3, ''). curr_str = '' + ('acc'*3) = 'accaccacc'.",
                                                                    "Return 'accaccacc' ✓"
                                                                ],
                                                                    hints: [
                                                                        'When you see a `[`, you need to pause building the current string, save it (and the multiplier) to the stack, and start building the inner string.',
                                                                        'When you see a `]`, you have finished the inner string. Pop the previous string and multiplier from the stack, and combine them.',
                                                                        'Numbers can be multiple digits! Build the number by multiplying by 10 (e.g., `num = num * 10 + int(char)`).'
                                                                    ],
                                                                        complexity: { time: 'O(Max Output Length)', space: 'O(Max Output Length)' },
    starterCode: `def decode_string(s: str) -> str:
    """
    Decodes strings like "3[a]2[bc]" into "aaabcbc".
    Supports nested decoding like "3[a2[c]]".
    """
    stack =[]
    current_num = 0
    current_string = ""
    
    for char in s:
        if char.isdigit():
            current_num = current_num * 10 + int(char)
        elif char == '[':
            # Save the current state before descending into nested brackets
            stack.append((current_string, current_num))
            current_string = ""
            current_num = 0
        elif char == ']':
            # Complete the inner bracket and merge with the outer state
            prev_string, num = stack.pop()
            current_string = prev_string + (current_string * num)
        else:
            # Just a regular character
            current_string += char
            
    return current_string
`,
        testCases: [
            { id: 'tc1', description: 'Simple', input: 's="3[a]2[bc]"', expected: '"aaabcbc"' },
            { id: 'tc2', description: 'Nested', input: 's="3[a2[c]]"', expected: '"accaccacc"' },
            { id: 'tc3', description: 'Double nested', input: 's="2[abc]3[cd]ef"', expected: '"abcabccdcdcdef"' },
            { id: 'tc4', description: 'No numbers', input: 's="hello"', expected: '"hello"' },
            { id: 'tc5', description: 'Multi-digit number', input: 's="10[a]"', expected: '"aaaaaaaaaa"' },
        ],
    };

export default challenge;
