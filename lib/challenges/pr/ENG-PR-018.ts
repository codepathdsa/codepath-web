import type { Challenge } from '../types';
// ─── ENG-PR-018 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-018',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Stale Closure in useCallback',
    companies: ['Airbnb', 'Palantir'],
    timeEst: '~12 min',
    level: 'Mid-Level',
    status: 'Not Started',
    desc: 'A dev is using a debounced "Auto-Save" feature in a text editor. Users report that when they type "Hello World", the database often only saves "H" or nothing at all, despite the UI showing the full text.',
    solution: 'This is a stale closure. The `useCallback` hook has an empty dependency array `[]`. This means the function inside it only ever "sees" the value of `text` from the very first render (likely an empty string). When the debounced function finally runs, it uses that stale variable. Fix: Add `text` to the dependency array, or use a `ref` for the latest value.',
    prReview: {
        prNumber: 712,
        prBranch: 'fix/autosave-stale-data',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/components/Editor.tsx',
        background: 'Debouncing API calls to save user input without hitting the server on every keystroke.',
        hints: [
            'What value of `text` does the function on line 12 have access to?',
            'How often is the `saveToServer` function recreated?',
            'If `text` changes, does the `saveToServer` reference update?'
        ],
        diff: [
            { lineNumL: 8, lineNumR: 8, type: 'normal', text: '  const [text, setText] = useState("");' },
            { lineNumL: 9, lineNumR: 9, type: 'normal', text: '' },
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: '  const saveToServer = useCallback(' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '    debounce(() => {' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '      console.log("Saving:", text);' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '      api.save(text);' },
            { lineNumL: 14, lineNumR: 14, type: 'normal', text: '    }, 1000),' },
            { lineNumL: 15, lineNumR: 15, type: 'deletion', text: '    []' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    [] // Empty deps to "prevent unnecessary re-renders"' },
            { lineNumL: 16, lineNumR: 16, type: 'normal', text: '  );' },
        ],
        bugOptions: [
            { value: 'stale_closure', label: 'Stale Closure', sub: 'Function captures old state variables' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Debounce timers not cleared' },
            { value: 'infinite_loop', label: 'Infinite Loop', sub: 'Callback triggers its own re-run' },
            { value: 'unstable_ref', label: 'Unstable Reference', sub: 'Debounce created on every render' },
        ],
        correctBugType: 'stale_closure',
        successExplanation: "Exactly. This is a classic React pitfall. Because the dependency array is `[]`, the anonymous function inside `debounce` is only defined once. It captures the initial `text` value (empty string) in its closure. Every time the debounce triggers, it saves that empty string. Adding `[text]` would fix the closure, but it would also reset the debounce timer on every keystroke. The best fix is often a `useRef` for the latest text value.",
        failExplanation: "The bug is the stale closure on line 12. Since the dependency array is empty, the `saveToServer` function is memoized forever with the value of `text` from the first render. You're effectively saving an empty string every time. You need to allow the function to see the updated state."
    },
};

export default challenge;