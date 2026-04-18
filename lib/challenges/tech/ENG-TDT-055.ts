import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-055',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Array Mutation Instead of Immutable Operations',
  companies: ['Redux', 'Facebook'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A Redux reducer mutates arrays directly using push(), splice(), and sort(). This bypasses React\'s change detection — components don\'t re-render when state changes. Rewrite with immutable operations.',
  solution: 'Replace push() with [...state, item]. Replace splice() with filter(). Replace sort() with [...arr].sort(). Never mutate the original array — always return a new reference.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The shopping cart reducer was written by someone coming from an imperative background. \`state.items.push(item)\` mutates the array in place — the array reference doesn't change, so React's shallow equality check sees no change and skips the re-render.\n\nRedux requires reducers to be pure: same inputs → same outputs, no side effects, no mutations.\n\nYour mission: rewrite all three operations to be immutable.`,
    folderPath: 'src/store',
    primaryFile: 'cartReducer.ts',
    files: [
      {
        name: 'cartReducer.ts',
        lang: 'typescript',
        code: `interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'SORT_BY_PRICE' };

// TODO: Replace all mutations with immutable operations.
// push → spread operator
// splice → filter
// sort → copy then sort
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      // BUG: mutates state
      state.items.push(action.item);
      return state;

    case 'REMOVE_ITEM':
      // BUG: mutates state
      const idx = state.items.findIndex(i => i.id === action.id);
      if (idx !== -1) state.items.splice(idx, 1);
      return state;

    case 'SORT_BY_PRICE':
      // BUG: sort() mutates in place
      state.items.sort((a, b) => a.price - b.price);
      return state;

    default:
      return state;
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Fix ADD_ITEM to return new state with spread operator',
        check: { type: 'contains', file: 'cartReducer.ts', pattern: '[...state.items' },
      },
      {
        label: 'Fix REMOVE_ITEM to use filter() instead of splice()',
        check: { type: 'contains', file: 'cartReducer.ts', pattern: '.filter(' },
      },
      {
        label: 'Fix SORT_BY_PRICE to copy array before sorting',
        check: { type: 'contains', file: 'cartReducer.ts', pattern: '[...state.items].sort' },
      },
      {
        label: 'Remove all direct mutations (push, splice)',
        check: { type: 'not_contains', file: 'cartReducer.ts', pattern: '.push(' },
      },
    ],
    hints: [
      'ADD_ITEM: `return { ...state, items: [...state.items, action.item] }`',
      'REMOVE_ITEM: `return { ...state, items: state.items.filter(i => i.id !== action.id) }`',
      'SORT_BY_PRICE: `return { ...state, items: [...state.items].sort((a, b) => a.price - b.price) }`',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 200,
    successMessage: `Each action returns a new state reference. React's shallow equality check detects the change and re-renders correctly. No more "why didn't my cart update?" bugs.`,
  },
};

export default challenge;
