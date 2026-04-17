import type { Challenge } from '../types';
// ─── ENG-PR-026 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-026',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'TypeScript `any` Leaking through Generics',
    companies: ['Microsoft', 'Linear'],
    timeEst: '~10 min',
    level: 'Mid-Level',
    status: 'Not Started',
    desc: 'A developer created a nice reusable `apiFetch` wrapper. It looks type-safe, but teammates report that if they forget to pass a type parameter, TypeScript silently defaults to `any`, completely disabling type checking for the API response.',
    solution: 'The generic `<T = any>` provides `any` as a fallback. When a developer writes `const user = await apiFetch("/user")` without specifying the type, TypeScript resolves `T` to `any`. They can access `user.fakeProperty` with no errors. Fix: Default to `unknown` (`<T = unknown>`), forcing the caller to either provide an explicit type or parse the response safely using Zod.',
    prReview: {
        prNumber: 310,
        prBranch: 'chore/api-client-wrapper',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/utils/api.ts',
        background: 'Centralizing `fetch` calls to inject auth headers automatically.',
        hints: [
            'What type does `const data = await apiFetch("/data");` assign to `data`?',
            'Is `any` a safe default for untyped API responses?',
            'What TypeScript type forces developers to explicitly assert or validate the structure of an object before using it?'
        ],
        diff: [
            { lineNumL: 1, lineNumR: 1, type: 'normal', text: '/**' },
            { lineNumL: 2, lineNumR: 2, type: 'normal', text: ' * A typed wrapper around fetch' },
            { lineNumL: 3, lineNumR: 3, type: 'normal', text: ' */' },
            { lineNumL: 4, lineNumR: null, type: 'deletion', text: 'export async function apiFetch(url: string) {' },
            { lineNumL: null, lineNumR: 4, type: 'addition', text: 'export async function apiFetch<T = any>(url: string): Promise<T> {' },
            { lineNumL: 5, lineNumR: 5, type: 'normal', text: '  const response = await fetch(url, {' },
            { lineNumL: 6, lineNumR: 6, type: 'normal', text: '    headers: { Authorization: `Bearer ${getToken()}` }' },
            { lineNumL: 7, lineNumR: 7, type: 'normal', text: '  });' },
            { lineNumL: 8, lineNumR: 8, type: 'normal', text: '' },
            { lineNumL: 9, lineNumR: null, type: 'deletion', text: '  return response.json();' },
            { lineNumL: null, lineNumR: 9, type: 'addition', text: '  return response.json() as Promise<T>;' },
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'unsafe_generic', label: 'Unsafe Generic Fallback', sub: 'Defaults to `any` disabling TS safety' },
            { value: 'double_promise', label: 'Double Promise', sub: 'response.json() already returns a Promise' },
            { value: 'missing_catch', label: 'Missing Catch', sub: 'Fetch errors are not handled' },
            { value: 'stale_closure', label: 'Stale Token', sub: 'getToken() captures an old token' },
        ],
        correctBugType: 'unsafe_generic',
        successExplanation: "Correct. `<T = any>` completely defeats the purpose of TypeScript. If a developer forgets to pass a generic (e.g., `apiFetch<User>`), it quietly falls back to `any`. The correct pattern is `<T = unknown>`, which ensures that if they don't explicitly declare the type, TypeScript will complain if they try to access properties on it.",
        failExplanation: "The issue is the `<T = any>` fallback on line 4. By defaulting to `any`, developers who forget to provide a type parameter will accidentally disable TypeScript checking for the response data. A better default is `unknown`, which forces the developer to handle the typing explicitly."
    },
};
export default challenge;