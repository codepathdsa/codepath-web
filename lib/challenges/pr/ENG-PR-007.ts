import type { Challenge } from '../types';

// â”€â”€â”€ ENG-PR-007 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

// â”€â”€â”€ ENG-PR-007 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
  id: 'ENG-PR-007',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'Direct State Mutation in React',
  companies: ['Atlassian', 'monday.com'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A junior dev added "mark all as done" to the todo list. Clicking it logs the correct data to the console but the UI never updates. No errors, no re-render. Spot the bug.',
  solution: 'items.forEach(item => item.done = true) mutates the existing array elements in-place. React\'s state comparison uses reference equality â€” since the array reference hasn\'t changed, React sees no state update and skips re-rendering. Fix: create a new array with new objects: setItems(items.map(item => ({ ...item, done: true })));',
  prReview: {
    prNumber: 402,
    prBranch: 'feature/mark-all-done',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/components/TodoList.tsx',
    prAge: '5 hours ago',
    background: 'Users requested a one-click "mark all done" button for sprint wrap-up. Items are stored in local React state as an array of objects.',
    changes: 'Added a markAllDone handler that loops through the items state array and sets done = true on each item, then calls setItems with the same array.',
    testing: 'console.log shows all items have done: true after clicking. Looks correct.',
    hints: [
      'After forEach runs, is the items array reference the same object it was before?',
      'How does React determine whether state has changed â€” does it deep-compare objects?',
      'What does Array.map return â€” the same array or a new one?',
    ],
    diff: [
      { lineNumL: 9, lineNumR: 9, type: 'normal', text: '  const [items, setItems] = useState<TodoItem[]>(initialItems);' },
      { lineNumL: 10, lineNumR: 10, type: 'normal', text: '' },
      { lineNumL: null, lineNumR: 11, type: 'addition', text: '  function markAllDone() {' },
      { lineNumL: null, lineNumR: 12, type: 'addition', text: '    items.forEach(item => { item.done = true; });' },
      { lineNumL: null, lineNumR: 13, type: 'addition', text: '    setItems(items);' },
      { lineNumL: null, lineNumR: 14, type: 'addition', text: '  }' },
      { lineNumL: 11, lineNumR: 15, type: 'normal', text: '' },
      { lineNumL: 12, lineNumR: 16, type: 'normal', text: '  return (' },
      { lineNumL: 13, lineNumR: 17, type: 'normal', text: '    <div>' },
      { lineNumL: 14, lineNumR: 18, type: 'normal', text: '      <button onClick={markAllDone}>Mark all done</button>' },
    ],
    bugOptions: [
      { value: 'state_mutation', label: 'Direct state mutation', sub: 'Array mutated in-place, no re-render' },
      { value: 'missing_key', label: 'Missing list key', sub: 'React list items lack unique keys' },
      { value: 'stale_closure', label: 'Stale closure', sub: 'Handler captures outdated items ref' },
      { value: 'wrong_setter', label: 'Wrong setter call', sub: 'setItems called with wrong value' },
      { value: 'missing_memo', label: 'Missing useMemo', sub: 'Expensive compute not memoised' },
      { value: 'type_error', label: 'Type error', sub: 'done property type mismatch' },
    ],
    correctBugType: 'state_mutation',
    successExplanation: "Correct. forEach mutates each object in the existing array in-place. When setItems(items) is called, React receives the same array reference it already holds. Object.is(oldItems, newItems) is true, so React bails out â€” no re-render. The console looks right because the objects were mutated, but React never knew to update the UI. Fix: setItems(items.map(item => ({ ...item, done: true }))) creates a new array with new objects, giving React a new reference to trigger a render.",
    failExplanation: "The bug is on lines 12â€“13: forEach mutates the items array in-place, then setItems is called with the same reference. React compares state using Object.is â€” same reference means no change detected, so no re-render. The underlying data is correct (hence the correct console output) but the UI is frozen. Fix: replace forEach+setItems with setItems(items.map(item => ({ ...item, done: true }))) to produce a new array.",
  },
};

export default challenge;