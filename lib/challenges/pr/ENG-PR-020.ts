import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-020 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-020',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'The "Double-Click" Race Condition',
    companies: ['Stripe', 'Doordash'],
    timeEst: '~12 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Users with slow internet connections occasionally report being charged twice for the same order. A mid-level dev added a `loading` state to disable the button while the API request is in flight, but duplicates are still happening.',
    solution: 'React state updates are asynchronous and batched. If a user double-clicks rapidly, the second click event fires *before* React has re-rendered the button to be `disabled` or updated the `loading` variable. Both clicks pass the `if (loading) return` check. Fix: Use an idempotency key on the backend, or use a `useRef` (e.g., `isSubmittingRef.current = true`) which updates synchronously without waiting for a re-render.',
    prReview: {
        prNumber: 611,
        prBranch: 'fix/double-charge-checkout',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/components/Checkout.tsx',
        background: 'Preventing users from submitting the checkout form multiple times.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'When `setLoading(true)` is called, does the `loading` variable change immediately on the next line?',
            'If two clicks happen 10 milliseconds apart, has React re-rendered the component yet?',
            'How can we store a synchronous flag that doesn\'t wait for the component cycle?'
        ],
        diff: [
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  const [loading, setLoading] = useState(false);' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '' },
            { lineNumL: 14, lineNumR: 14, type: 'normal', text: '  async function handleCheckout() {' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    if (loading) return; // Prevent double clicks' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '    setLoading(true);' },
            { lineNumL: 15, lineNumR: 17, type: 'normal', text: '    try {' },
            { lineNumL: 16, lineNumR: 18, type: 'normal', text: '      await api.chargeCard(cart);' },
            { lineNumL: 17, lineNumR: 19, type: 'normal', text: '    } finally {' },
            { lineNumL: 18, lineNumR: 20, type: 'normal', text: '      setLoading(false);' },
            { lineNumL: 19, lineNumR: 21, type: 'normal', text: '    }' },
            { lineNumL: 20, lineNumR: 22, type: 'normal', text: '  }' },
        ],
        bugOptions: [
            { value: 'async_state', label: 'Async State Race', sub: 'State check bypassed by rapid events' },
            { value: 'missing_await', label: 'Missing Await', sub: 'API call not awaited properly' },
            { value: 'stale_closure', label: 'Stale Closure', sub: 'Loading state is captured incorrectly' },
            { value: 'missing_catch', label: 'Missing Catch', sub: 'API failures crash the handler' },
        ],
        correctBugType: 'async_state',
        successExplanation: "Correct. Because React state updates are scheduled and not immediate, `loading` remains `false` for the entirety of the current render cycle. A rapid second click executes `handleCheckout` again with `loading` still evaluating to `false`. To prevent this on the frontend, use a `useRef` for tracking the submitting status synchronously. (Though a true fix requires backend idempotency!).",
        failExplanation: "The bug is a race condition caused by React's asynchronous state updates. `setLoading(true)` does not immediately mutate `loading`. If a user double-clicks fast enough, both click events fire before the component re-renders, bypassing the `if (loading)` guard entirely."
    },
};

export default challenge;
