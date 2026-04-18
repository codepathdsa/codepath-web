import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-011 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-011',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Race Condition in Search Input â€” Stale Results Override Fresh',
    companies: ['Algolia', 'Figma'],
    timeEst: '~12 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'The new search bar occasionally shows wrong results â€” typing "react" quickly sometimes displays results for "re" or "rea" instead. It\'s intermittent and hard to reproduce slowly. Spot the structural issue.',
    solution: 'There is no cancellation or ordering guard. Each keystroke fires a fetch. A slow network response for an earlier query (e.g. "re") can resolve after a faster response for the latest query ("react"), overwriting the correct results with stale ones. Fix: use an AbortController per request and abort the previous one on each new keystroke, or track a request ID and discard responses that don\'t match the latest.',
    prReview: {
        prNumber: 774,
        prBranch: 'feature/product-search',
        prBase: 'main',
        prAuthor: 'junior-dev-99',
        prFile: 'src/components/SearchBar.tsx',
        prAge: '1 day ago',
        background: 'The product catalogue previously required a form submit to search. This PR makes search reactive â€” results update on every keystroke for a live search UX.',
        changes: 'Added a useEffect that fires a fetch to /api/search?q= on every change to the query state. Results are written to state and rendered.',
        testing: 'Works well on fast connection. Search feels snappy locally.',
        hints: [
            'If the user types three characters quickly, three fetch requests fire. Is there any guarantee about the order they resolve?',
            'What happens to the state if the response for "re" arrives after the response for "react"?',
            'What browser API can cancel a pending fetch request when a newer one is started?',
        ],
        diff: [
            { lineNumL: 7, lineNumR: 7, type: 'normal', text: '  const [query, setQuery]     = useState(\'\');' },
            { lineNumL: 8, lineNumR: 8, type: 'normal', text: '  const [results, setResults] = useState([]);' },
            { lineNumL: 9, lineNumR: 9, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 10, type: 'addition', text: '  useEffect(() => {' },
            { lineNumL: null, lineNumR: 11, type: 'addition', text: '    if (!query) return;' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: "    fetch(`/api/search?q=${query}`)" },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '      .then(r => r.json())' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '      .then(data => setResults(data.results));' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '  }, [query]);' },
        ],
        bugOptions: [
            { value: 'race_condition', label: 'Async race condition', sub: 'Stale response overwrites fresh state' },
            { value: 'missing_debounce', label: 'Missing debounce', sub: 'Too many requests fired per keystroke' },
            { value: 'no_error_handle', label: 'No error handling', sub: 'Failed fetches update nothing' },
            { value: 'missing_cleanup', label: 'Missing cleanup', sub: 'Effect not cancelled on unmount' },
            { value: 'xss_risk', label: 'XSS risk', sub: 'Query rendered without sanitising' },
            { value: 'missing_loading', label: 'No loading state', sub: 'UI shows stale results during fetch' },
        ],
        correctBugType: 'race_condition',
        successExplanation: "Right. Each query change fires a new fetch with no guarantee of resolution order. A slow response for 're' can arrive after a fast response for 'react', calling setResults with outdated data. Fix: create an AbortController at the start of the effect, pass signal to fetch, and return () => controller.abort() as cleanup. This cancels the in-flight request whenever the effect re-runs, ensuring only the latest query's response updates state. Note: missing debounce is also worth flagging â€” but that's a performance issue, not a correctness bug.",
        failExplanation: "The bug is a classic search race condition. Multiple fetches can be in-flight simultaneously with no ordering guarantee. A response for an earlier query that resolves late will call setResults and overwrite whatever the latest query returned. The fix: AbortController. const controller = new AbortController(); fetch(url, { signal: controller.signal }) and return () => controller.abort(); in the cleanup. This ensures only the response to the current query ever updates state.",
    },
};
export default challenge;