import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-057',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Array Mutation Instead of Immutable Operations',
  companies: ['React', 'Redux'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A Redux reducer directly mutates the state array using push(), splice(), and sort(). This breaks React\'s reference equality check — components never re-render. Fix it with immutable array operations.',
  solution: 'Replace push() with [...state, newItem]. Replace splice() with filter(). Replace sort() with [...state].sort(). Never mutate arrays in reducers — always return new references.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The task list reducer has been "working" for months — in light use. Under heavy load, components stop re-rendering when tasks change. The bug: direct array mutation.\n\nReact and Redux detect changes by reference equality: if \`state === nextState\`, no re-render. Mutating in-place returns the same reference — React thinks nothing changed.\n\nYour mission: make all three reducer cases immutable.`,
    folderPath: 'src/store',
    primaryFile: 'taskReducer.ts',
    files: [
      {
        name: 'taskReducer.ts',
        lang: 'typescript',
        code: `interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: number;
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'REMOVE_TASK'; id: string }
  | { type: 'SORT_BY_PRIORITY' };

// TODO: Fix all three cases to return NEW array references.
// Never mutate state directly.
export function taskReducer(state: Task[] = [], action: Action): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      // BUG: mutates in place
      state.push(action.task);
      return state;

    case 'REMOVE_TASK':
      // BUG: splice mutates in place
      const idx = state.findIndex(t => t.id === action.id);
      if (idx !== -1) state.splice(idx, 1);
      return state;

    case 'SORT_BY_PRIORITY':
      // BUG: sort mutates in place
      state.sort((a, b) => a.priority - b.priority);
      return state;

    default:
      return state;
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Fix ADD_TASK — use spread instead of push()',
        check: { type: 'not_contains', file: 'taskReducer.ts', pattern: 'state.push' },
      },
      {
        label: 'Fix REMOVE_TASK — use filter() instead of splice()',
        check: { type: 'contains', file: 'taskReducer.ts', pattern: '.filter(' },
      },
      {
        label: 'Fix SORT_BY_PRIORITY — copy array before sorting',
        check: { type: 'contains', file: 'taskReducer.ts', pattern: '[...state]' },
      },
    ],
    hints: [
      'ADD_TASK: `return [...state, action.task];`',
      'REMOVE_TASK: `return state.filter(t => t.id !== action.id);`',
      'SORT_BY_PRIORITY: `return [...state].sort((a, b) => a.priority - b.priority);`',
    ],
    totalTests: 14,
    testFramework: 'Jest',
    xp: 190,
    successMessage: `Reducers now return new array references on every change. React detects changes correctly and re-renders components. Redux DevTools time-travel works properly. Immutability is the contract of every reducer.`,
  },
};

export default challenge;
