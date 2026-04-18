import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-023 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-023',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Zombie Event Listeners',
    companies: ['Figma', 'Miro'],
    timeEst: '~10 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Users report the application slows down progressively and eventually crashes the browser tab after opening and closing the "Interactive Map" modal a dozen times.',
    solution: 'The developer is passing an anonymous arrow function `() => handleResize(mapId)` directly to `addEventListener` and `removeEventListener`. In JavaScript, two identical arrow functions have different memory references. The `removeEventListener` call fails silently, leaving a "zombie" listener attached to `window`. Fix: Extract the function into a variable or `useCallback` so the exact same reference is passed to both.',
    prReview: {
        prNumber: 419,
        prBranch: 'feat/map-resize-handler',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/components/Map.tsx',
        background: 'Ensuring a WebGL map canvas resizes dynamically when the browser window changes.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'Does `() => {} === () => {}` evaluate to true or false in JavaScript?',
            'How does `removeEventListener` identify which function to remove?',
            'What happens if the function passed to `remove` doesn\'t match the one passed to `add`?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: '  useEffect(() => {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '    if (!mapId) return;' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '    window.addEventListener("resize", () => updateMapBounds(mapId));' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    return () => {' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '      window.removeEventListener("resize", () => updateMapBounds(mapId));' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    };' },
            { lineNumL: 13, lineNumR: 18, type: 'normal', text: '  }, [mapId]);' },
        ],
        bugOptions: [
            { value: 'zombie_listener', label: 'Zombie Listener', sub: 'removeEventListener fails due to new reference' },
            { value: 'missing_dep', label: 'Missing Dependency', sub: 'updateMapBounds not in dependency array' },
            { value: 'memory_leak', label: 'React State Leak', sub: 'State updated after unmount' },
            { value: 'infinite_loop', label: 'Infinite Re-render', sub: 'Effect runs on every render' },
        ],
        correctBugType: 'zombie_listener',
        successExplanation: "Exactly. `removeEventListener` checks for exact referential equality. Since `() => updateMapBounds(mapId)` creates a brand new function in memory, the browser cannot find it in the listener registry. The old listener stays active. To fix: `const handler = () => update...; window.addEventListener(..., handler); return () => window.removeEventListener(..., handler);`.",
        failExplanation: "The bug is on line 16. `removeEventListener` requires the *exact same function reference* that was passed to `addEventListener`. Because the developer used inline arrow functions, they created two completely different functions in memory. The removal fails silently, causing a severe memory leak."
    },
};

export default challenge;