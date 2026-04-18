import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-021 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-021',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Prototype Pollution via Recursive Merge',
    companies: ['Snyk', 'GitHub'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A custom `deepMerge` utility was added to combine default user settings with incoming JSON payloads. A security researcher demonstrated they could elevate their privileges to `admin` simply by saving their user profile.',
    solution: 'This is Prototype Pollution. If an attacker sends a JSON payload with `{"__proto__": {"isAdmin": true}}`, the recursive merge function applies it to `Object.prototype`. Suddenly, *every* object in the Node.js process inherits `isAdmin: true` if it doesn\'t explicitly define it. Fix: Block the keys `__proto__`, `constructor`, and `prototype` during merges.',
    prReview: {
        prNumber: 904,
        prBranch: 'feat/user-settings-merge',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/utils/object.ts',
        background: 'Merging parsed JSON configurations.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'What happens if `sourceKey` is the string `"__proto__"`?',
            'If you modify `target["__proto__"]`, what are you actually modifying?',
            'How does JavaScript prototype inheritance handle missing properties?'
        ],
        diff: [
            { lineNumL: 1, lineNumR: 1, type: 'normal', text: 'export function deepMerge(target: any, source: any) {' },
            { lineNumL: 2, lineNumR: 2, type: 'normal', text: '  for (const key in source) {' },
            { lineNumL: 3, lineNumR: 3, type: 'normal', text: '    if (typeof source[key] === "object" && source[key] !== null) {' },
            { lineNumL: 4, lineNumR: 4, type: 'normal', text: '      if (!target[key]) target[key] = {};' },
            { lineNumL: 5, lineNumR: 5, type: 'normal', text: '      deepMerge(target[key], source[key]);' },
            { lineNumL: 6, lineNumR: 6, type: 'normal', text: '    } else {' },
            { lineNumL: null, lineNumR: 7, type: 'addition', text: '      target[key] = source[key];' },
            { lineNumL: 8, lineNumR: 8, type: 'normal', text: '    }' },
            { lineNumL: 9, lineNumR: 9, type: 'normal', text: '  }' },
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: '  return target;' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'prototype_pollution', label: 'Prototype Pollution', sub: 'Unsafe object modification' },
            { value: 'infinite_recursion', label: 'Infinite Recursion', sub: 'Circular references cause stack overflow' },
            { value: 'type_coercion', label: 'Type Coercion', sub: 'Arrays merged into objects' },
            { value: 'xss', label: 'XSS Injection', sub: 'Unsanitized strings added to object' },
        ],
        correctBugType: 'prototype_pollution',
        successExplanation: "Exactly. By iterating over keys without filtering, an attacker can pass `__proto__` as a key. This modifies the global `Object.prototype`, meaning every single object in your application will now inherit the injected properties. You must explicitly reject `__proto__`, `constructor`, and `prototype` in recursive merges.",
        failExplanation: "The vulnerability is Prototype Pollution. Because there's no check on `key`, an attacker can pass `__proto__` in their JSON payload. Line 7 will assign the attacker's values directly to `Object.prototype`, globally poisoning every object in the Node application."
    },
};
export default challenge;