import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-013 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-013',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Context API Re-render Storm',
    companies: ['Facebook', 'Uber'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A mid-level dev refactored the global state to use React Context. In production, typing a single character into a search bar causes the entire 5,000-row dashboard to freeze for 200ms. Profiler shows the Dashboard component re-renders on every keystroke, even though it doesnâ€™t use the search state.',
    solution: 'The provider value is a new object literal created on every render. Because the object reference changes every time the SearchBar updates the context, every single component wrapped in that Provider (including the heavy Dashboard) must re-render, regardless of which part of the state they actually use. Fix: Wrap the value in useMemo or split the context into separate Providers (e.g., SearchContext, UserContext).',
    prReview: {
        prNumber: 882,
        prBranch: 'refactor/global-state-context',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/context/AppContext.tsx',
        prAge: '4 hours ago',
        background: 'We are moving away from Redux to native React Context to reduce bundle size. The AppProvider now holds user info, theme, and the global search query.',
        changes: 'Combined all global state into one AppContext.Provider for simplicity.',
        testing: 'Functionally correct. State updates correctly across the app.',
        hints: [
            'What happens to referential equality of the "value" prop on line 14 when the component re-renders?',
            'If a component consumes Context A, and Context Aâ€™s value changes, does that component re-render even if it only uses a property that didnâ€™t change?',
            'How can we ensure the object passed to the Provider only changes when its internal values change?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export const AppProvider = ({ children }) => {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const [user, setUser] = useState(null);' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  const [query, setQuery] = useState("");' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '  const [theme, setTheme] = useState("light");' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '  return (' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    <AppContext.Provider value={{ user, query, theme, setUser, setQuery, setTheme }}>' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '      {children}' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    </AppContext.Provider>' },
            { lineNumL: 14, lineNumR: 18, type: 'normal', text: '  );' },
            { lineNumL: 15, lineNumR: 19, type: 'normal', text: '};' },
        ],
        bugOptions: [
            { value: 'unstable_reference', label: 'Unstable Object Reference', sub: 'Context value creates new object on every render' },
            { value: 'prop_drilling', label: 'Prop Drilling', sub: 'Components passed through too many layers' },
            { value: 'missing_memo', label: 'Missing React.memo', sub: 'Children components need memoization' },
            { value: 'context_hell', label: 'Context Bloat', sub: 'Too many unrelated states in one provider' },
        ],
        correctBugType: 'unstable_reference',
        successExplanation: "Exactly. The object literal `{{ user, query, ... }}` is created fresh on every render of `AppProvider`. Since React Context uses `Object.is` to check for changes, every consumer is forced to re-render. To fix, you must `useMemo(() => ({ user, query... }), [user, query, theme])`. Or better yet, split them so a change in `query` doesn't trigger components listening to `user`.",
        failExplanation: "The issue is that the Provider's `value` is a brand new object on every render. Even if `user` and `theme` haven't changed, the search `query` change causes `AppProvider` to re-render, creating a new object reference. This forces every single child component using `useContext(AppContext)` to re-render. You need `useMemo` to stabilize the reference."
    },
};

export default challenge;