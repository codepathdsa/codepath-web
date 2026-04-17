// ─── ENG-PR-035 ─────────────────────────────────────────────────────────────────
import { Challenge } from "../types";
const challenge: Challenge = {
    id: 'ENG-PR-035',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Next.js SSR Global State Memory Leak',
    companies: ['Vercel', 'Shopify'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A team migrated a React SPA to Next.js for Server-Side Rendering (SSR). In production, memory usage grows linearly until the server crashes with OOM. Also, User A sometimes sees User B’s private data on the screen for a split second.',
    solution: 'The developer used a module-level variable (`const store = new Store()`) outside the component tree. In a Node.js server environment (SSR), module scope is shared globally across ALL incoming user requests. Data from one user leaks into another, and because the server never unmounts, memory grows infinitely. Fix: Global state in SSR must be initialized inside the React tree (e.g., inside a Provider on a per-request basis).',
    prReview: {
        prNumber: 991,
        prBranch: 'feat/ssr-redux-store',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/store/index.ts',
        background: 'Setting up a global state store for the Next.js application.',
        hints: [
            'In a browser, how many users are sharing the memory of the `window` object?',
            'In a Node.js SSR environment, how many users are sharing the memory of a file-level constant?',
            'What happens to `store.data` if User A makes a request, and then User B makes a request to the same server container?'
        ],
        diff: [
            { lineNumL: 1, lineNumR: 1, type: 'normal', text: 'import { createStore } from "zustand";' },
            { lineNumL: 2, lineNumR: 2, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 3, type: 'addition', text: '// Initialize the store once to prevent re-renders' },
            { lineNumL: null, lineNumR: 4, type: 'addition', text: 'export const globalStore = createStore({ user: null, cart: [] });' },
            { lineNumL: null, lineNumR: 5, type: 'addition', text: '' },
            { lineNumL: 3, lineNumR: 6, type: 'normal', text: 'export function AppProvider({ children, initialState }) {' },
            { lineNumL: null, lineNumR: 7, type: 'addition', text: '  // Hydrate store on page load' },
            { lineNumL: null, lineNumR: 8, type: 'addition', text: '  if (initialState) {' },
            { lineNumL: null, lineNumR: 9, type: 'addition', text: '    globalStore.setState(initialState);' },
            { lineNumL: null, lineNumR: 10, type: 'addition', text: '  }' },
            { lineNumL: 4, lineNumR: 11, type: 'normal', text: '  return <Provider store={globalStore}>{children}</Provider>;' },
            { lineNumL: 5, lineNumR: 12, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'cross_request_leak', label: 'Cross-Request State Leak', sub: 'Module scope is shared globally in Node.js' },
            { value: 'hydration_error', label: 'Hydration Mismatch', sub: 'Server UI does not match Client UI' },
            { value: 'infinite_loop', label: 'Infinite Re-render', sub: 'setState triggers recursive render' },
            { value: 'stale_closure', label: 'Stale State', sub: 'initialState is memoized forever' },
        ],
        correctBugType: 'cross_request_leak',
        successExplanation: "Exactly. In the browser, a file-level `const` is perfectly safe because it's isolated to one user's tab. In Node.js (SSR), that same file-level `const` acts as a global singleton across all incoming HTTP requests. User A's data hydrates the store, and User B receives a page rendered with User A's data. You must instantiate a fresh store *inside* the component or request handler.",
        failExplanation: "The bug is a Cross-Request State Leak (and memory leak). In an SSR environment, `globalStore` is initialized once per server process, not once per user. When multiple users hit the server, their data overwrites each other in the shared `globalStore`. You must create a new store instance for every request."
    },
};

export default challenge;