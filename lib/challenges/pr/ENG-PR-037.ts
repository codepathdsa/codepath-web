// ─── ENG-PR-037 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-037',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'React Concurrent Mode Tearing',
    companies: ['Facebook', 'Atlassian'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A team implemented a custom global state manager. In React 18 (with Concurrent Features enabled), users sometimes see the UI in an inconsistent state: the Header shows 5 items in the cart, but the Sidebar shows 4. A split second later, it resolves.',
    solution: 'Reading mutable external state directly during render causes "tearing" in Concurrent React. React might pause rendering halfway through the tree. If the external state changes during that pause, the second half of the tree renders with the *new* data, while the first half has the *old* data. Fix: Use the `useSyncExternalStore` hook, which guarantees consistency across the entire React render pass.',
    prReview: {
        prNumber: 808,
        prBranch: 'core/custom-state-store',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/hooks/useStore.ts',
        background: 'A custom hook to read from a vanilla JS event emitter store.',
        hints: [
            'If React pauses rendering between Component A and Component B, and `store.getState()` changes, what happens?',
            'How does React know if external mutable data changed during a render transition?',
            'What hook was introduced in React 18 specifically to read from external stores safely?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export function useStore(store) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const [state, setState] = useState(store.getState());' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '  useEffect(() => {' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '    const unsubscribe = store.subscribe(() => {' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '      setState(store.getState());' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '    });' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    return unsubscribe;' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '  }, [store]);' },
            { lineNumL: 13, lineNumR: 19, type: 'normal', text: '' },
            { lineNumL: 14, lineNumR: 20, type: 'normal', text: '  return state;' },
            { lineNumL: 15, lineNumR: 21, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'tearing', label: 'UI Tearing', sub: 'External state reads are unsafe in Concurrent Mode' },
            { value: 'stale_closure', label: 'Stale State', sub: 'Store changes missed before useEffect fires' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Unsubscribe is not called correctly' },
            { value: 'infinite_loop', label: 'Infinite Loop', sub: 'setState triggers immediate re-render' },
        ],
        correctBugType: 'tearing',
        successExplanation: "Exactly. This is the classic 'tearing' problem React 18 solves. Because `store.getState()` is a mutable source outside React's control, reading it directly during render (via `useState` initialization) means different components can get different values if React pauses the render to handle a high-priority interaction. You must use `useSyncExternalStore`.",
        failExplanation: "The flaw is UI Tearing due to Concurrent React. `useEffect` subscribes *after* the initial render. If the store changes between the initial read and the effect attachment, the UI becomes stale. Furthermore, in React 18 concurrent mode, different components might read different values if a render is paused. Fix: Replace the entire hook with `useSyncExternalStore(store.subscribe, store.getState)`."
    },
};
export default challenge;