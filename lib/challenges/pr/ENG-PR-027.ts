import type { Challenge } from '../types';
// ─── ENG-PR-027 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-027',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'CSS Z-Index Stacking Context',
    companies: ['Atlassian', 'Notion'],
    timeEst: '~8 min',
    level: 'Mid-Level',
    status: 'Not Started',
    desc: 'A PR added a subtle fade-in animation to the main application wrapper. Suddenly, all confirmation modals (`z-index: 9999`) are rendering *underneath* the site navigation header (`z-index: 100`).',
    solution: 'Adding `opacity: 0.99` (or `transform`, `filter`, etc.) creates a new "Stacking Context" in CSS. Because the modal is a child of this wrapper, its `9999` z-index is only relative *inside* that wrapper. The whole wrapper is placed beneath the header. Fix: Render modals at the DOM root level using React Portals, or remove opacity from the parent container.',
    prReview: {
        prNumber: 155,
        prBranch: 'feat/smooth-page-load',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/styles/layout.css',
        background: 'Adding a quick opacity transition to prevent UI flickering on mount.',
        hints: [
            'How does the browser handle `z-index` when a parent element has an opacity less than 1?',
            'Is `z-index: 9999` guaranteed to sit on top of the whole page, or just its stacking context?',
            'Why is the modal trapped underneath the header now?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: '.app-wrapper {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  display: flex;' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  flex-direction: column;' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '  min-height: 100vh;' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '  animation: fadeIn 0.3s ease-in;' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '  opacity: 0.99; /* Prevents visual pop */' },
            { lineNumL: 14, lineNumR: 16, type: 'normal', text: '}' },
            { lineNumL: 15, lineNumR: 17, type: 'normal', text: '' },
            { lineNumL: 16, lineNumR: 18, type: 'normal', text: '.modal-overlay {' },
            { lineNumL: 17, lineNumR: 19, type: 'normal', text: '  position: fixed;' },
            { lineNumL: 18, lineNumR: 20, type: 'normal', text: '  z-index: 9999;' },
            { lineNumL: 19, lineNumR: 21, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'stacking_context', label: 'Stacking Context Trap', sub: 'Opacity creates an isolated z-index scope' },
            { value: 'fixed_position', label: 'Fixed Position Bug', sub: 'Fixed ignores parent containers' },
            { value: 'animation_delay', label: 'Animation Delay', sub: 'Modal renders before animation finishes' },
            { value: 'z_index_conflict', label: 'Z-Index Too High', sub: 'Browsers cap z-index at 1000' },
        ],
        correctBugType: 'stacking_context',
        successExplanation: "Correct. Setting `opacity` to anything less than 1.0 automatically establishes a new Stacking Context. The `.modal-overlay`'s `z-index: 9999` is now only valid *inside* `.app-wrapper`. If an element outside `.app-wrapper` has `z-index: 10`, it will sit on top of the modal. The best fix is to use React Portals to attach modals directly to `document.body`.",
        failExplanation: "The bug is the `opacity: 0.99` on line 15. In CSS, applying opacity, transforms, or filters to an element creates a new Stacking Context. The modal inside this wrapper is now isolated; its `z-index: 9999` no longer competes with the rest of the page, causing it to appear behind headers."
    },
};

export default challenge;