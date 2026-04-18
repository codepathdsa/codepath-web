import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-033',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'useEffect with Missing Dependency Array',
  companies: ['Vercel', 'Next.js'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A React component uses useEffect with an empty dependency array but references props and state inside. Stale closures cause the effect to read initial values forever. Fix the dependency arrays.',
  solution: 'Add all referenced values to the dependency arrays. For effects that should only run once (setup/teardown), extract stable references using useCallback or useRef for functions.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The live price ticker component subscribes to a WebSocket on mount. The onMessage handler uses the current selectedSymbol prop to filter incoming prices — but because the dependency array is empty, onMessage captured the initial symbol and never updates.\n\nUsers select a new stock symbol, but the ticker keeps showing prices for the original symbol because the effect closure is stale.\n\nYour mission: fix all three useEffect calls with correct dependency arrays.`,
    folderPath: 'src/components/PriceTicker',
    primaryFile: 'PriceTicker.tsx',
    files: [
      {
        name: 'PriceTicker.tsx',
        lang: 'typescript',
        code: `import { useState, useEffect, useCallback } from 'react';

interface Props {
  selectedSymbol: string;
  onPriceUpdate: (price: number) => void;
}

export function PriceTicker({ selectedSymbol, onPriceUpdate }: Props) {
  const [price, setPrice] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  // BUG 1: Empty deps — onMessage is stale. It always filters by the initial selectedSymbol.
  useEffect(() => {
    const ws = new WebSocket('wss://prices.example.com');
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol === selectedSymbol) {  // stale closure
        setPrice(data.price);
        onPriceUpdate(data.price);  // stale closure
      }
    };
    return () => ws.close();
  }, []); // TODO: fix this

  // BUG 2: Effect logs price changes but never re-runs because price is missing from deps
  useEffect(() => {
    console.log(\`Price updated to \${price}\`);  // stale closure
  }, []); // TODO: fix this

  // BUG 3: Title update effect is fine for initial render but never updates
  useEffect(() => {
    document.title = \`\${selectedSymbol}: $\${price}\`;  // both are stale
  }, [price]); // TODO: fix this (missing selectedSymbol)

  return <div>{isConnected ? \`\${selectedSymbol}: $\${price}\` : 'Connecting...'}</div>;
}`,
      },
    ],
    objectives: [
      {
        label: 'Fix BUG 1 — add selectedSymbol and onPriceUpdate to dependency array',
        check: { type: 'contains', file: 'PriceTicker.tsx', pattern: 'selectedSymbol, onPriceUpdate' },
      },
      {
        label: 'Fix BUG 2 — add price to the logging effect dependency array',
        check: { type: 'contains', file: 'PriceTicker.tsx', pattern: '[price]' },
      },
      {
        label: 'Fix BUG 3 — add selectedSymbol to the title effect dependency array',
        check: { type: 'contains', file: 'PriceTicker.tsx', pattern: '[price, selectedSymbol]' },
      },
    ],
    hints: [
      'For BUG 1, adding `selectedSymbol` and `onPriceUpdate` causes reconnection on every symbol change — that\'s correct! The WebSocket cleanup runs and a new one opens.',
      'Wrap `onPriceUpdate` in `useCallback` in the parent component to stabilise the reference and avoid unnecessary reconnections.',
      'The ESLint rule `react-hooks/exhaustive-deps` would have caught all three of these automatically.',
    ],
    totalTests: 14,
    testFramework: 'React Testing Library + Jest',
    xp: 190,
    successMessage: `All stale closures are gone. Changing the selected symbol reconnects to the WebSocket with the new symbol. Price and title updates reflect the current state, not the initial render.`,
  },
};

export default challenge;
