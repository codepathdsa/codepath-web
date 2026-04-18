// â”€â”€â”€ ENG-PR-039 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-039',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Regular Expression Denial of Service (ReDoS)',
    companies: ['Cloudflare', 'Snyk'],
    timeEst: '~10 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A validation regex was added to ensure usernames only contain alphanumeric characters and spaces. A user registers with the username `"aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"` and the entire Node.js API server freezes at 100% CPU for 4 minutes.',
    solution: 'The regex `^([a-zA-Z0-9]+\\s?)+$` contains overlapping repeating groups. When the regex engine evaluates a string that *almost* matches but fails at the very end (like ending with `!`), it begins catastrophic backtracking, trying every possible permutation of groups. Fix: Remove the nested quantification: `^[a-zA-Z0-9]+(\\s[a-zA-Z0-9]+)*$` or avoid regex entirely.',
    prReview: {
        prNumber: 994,
        prBranch: 'sec/username-validation',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/utils/validators.ts',
        prAge: '1 hour ago',
        background: 'Validating that a username is alphanumeric and can contain single spaces between words.',
        changes: 'Adds a regex-based validation function for usernames. Intended to block special characters while allowing spaces between words.',
        testing: 'Manual testing with valid usernames passed. No fuzz testing or adversarial input was applied against the regex.',

        hints: [
            'Look at the nested plus signs: `([a-z]+)+`. What happens if the string is "aaaa" but ends in a forbidden character?',
            'How many ways can the regex engine group "aaaa" to try and find a match? (a)(a)(a)(a), (aa)(aa), (aaa)(a)...',
            'What happens to a single-threaded server when a regex takes 5 minutes to evaluate?'
        ],
        diff: [
            { lineNumL: 4, lineNumR: 4, type: 'normal', text: 'export function isValidUsername(username: string): boolean {' },
            { lineNumL: 5, lineNumR: 5, type: 'normal', text: '  if (username.length < 3 || username.length > 50) return false;' },
            { lineNumL: 6, lineNumR: 6, type: 'normal', text: '  ' },
            { lineNumL: null, lineNumR: 7, type: 'addition', text: '  // Must be alphanumeric, allows spaces between words' },
            { lineNumL: null, lineNumR: 8, type: 'addition', text: '  const regex = /^([a-zA-Z0-9]+\\s?)+$/;' },
            { lineNumL: null, lineNumR: 9, type: 'addition', text: '  return regex.test(username);' },
            { lineNumL: 7, lineNumR: 10, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'redos', label: 'Catastrophic Backtracking', sub: 'Nested quantifiers cause CPU lockup' },
            { value: 'xss_injection', label: 'XSS Risk', sub: 'Regex does not escape HTML' },
            { value: 'unicode_fail', label: 'Unicode Failure', sub: 'Regex fails on emoji inputs' },
            { value: 'bypass_start', label: 'Bypass Anchor', sub: 'Missing multiline flag allows bypass' },
        ],
        correctBugType: 'redos',
        successExplanation: "Exactly. This is a ReDoS (Regular Expression Denial of Service). Because of the `+` inside the group and the `+` outside the group, the engine attempts exponential backtracking (O(2^n)) when an invalid character appears at the end of a long string. It locks the V8 event loop entirely.",
        failExplanation: "The flaw is Catastrophic Backtracking (ReDoS). The regex `^([a-zA-Z0-9]+\\s?)+$` has overlapping quantifiers (the plus inside and the plus outside). If fed a long string that fails at the very end, the regex engine tries millions of grouping permutations to see if it can force a match, completely freezing the Node server."
    },
};

export default challenge;