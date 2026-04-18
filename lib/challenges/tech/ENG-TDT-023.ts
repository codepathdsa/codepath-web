import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-023',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Direct DOM Manipulation in React',
  companies: ['Figma', 'Canva'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A tooltip component uses document.getElementById and direct style mutation inside a React component. It fights React\'s virtual DOM, causing stale state and memory leaks. Refactor it to use useRef and controlled state.',
  solution: 'Replace document.getElementById with useRef. Move tooltip visibility into useState. Use a CSS class or inline style based on state instead of directly mutating DOM element styles.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The tooltip component was written by someone who came from a jQuery background. It directly queries the DOM with getElementById and mutates element.style.display every 200ms via a setInterval — even when the component is unmounted.\n\nThis causes memory leaks (the interval keeps running), stale state (React doesn't know about the display change), and hydration mismatches in SSR.\n\nYour mission: rewrite it the React way.`,
    folderPath: 'src/components/Tooltip',
    primaryFile: 'Tooltip.tsx',
    files: [
      {
        name: 'Tooltip.tsx',
        lang: 'typescript',
        code: `import React, { useEffect } from 'react';

interface Props {
  id: string;
  content: string;
  children: React.ReactNode;
}

// TODO: Replace direct DOM manipulation with useRef + useState.
// Current issues:
//   1. document.getElementById bypasses React — tooltip DOM node may not exist yet
//   2. Mutating element.style directly fights React's reconciler
//   3. setInterval has no cleanup — memory leak when component unmounts
export function Tooltip({ id, content, children }: Props) {
  useEffect(() => {
    const interval = setInterval(() => {
      const tip = document.getElementById(\`tooltip-\${id}\`);
      if (tip) {
        const parent = tip.parentElement!;
        const isHovered = parent.matches(':hover');
        tip.style.display = isHovered ? 'block' : 'none';
      }
    }, 200);
    // BUG: No cleanup!
  }, [id]);

  return (
    <span style={{ position: 'relative' }}>
      {children}
      <span
        id={\`tooltip-\${id}\`}
        style={{ display: 'none', position: 'absolute', background: '#333', color: '#fff', padding: '4px 8px' }}
      >
        {content}
      </span>
    </span>
  );
}`,
      },
    ],
    objectives: [
      {
        label: 'Remove document.getElementById from Tooltip.tsx',
        check: { type: 'not_contains', file: 'Tooltip.tsx', pattern: 'getElementById' },
      },
      {
        label: 'Remove setInterval from Tooltip.tsx',
        check: { type: 'not_contains', file: 'Tooltip.tsx', pattern: 'setInterval' },
      },
      {
        label: 'Use useState to control tooltip visibility',
        check: { type: 'contains', file: 'Tooltip.tsx', pattern: 'useState' },
      },
      {
        label: 'Use onMouseEnter/onMouseLeave event handlers',
        check: { type: 'contains', file: 'Tooltip.tsx', pattern: 'onMouseEnter' },
      },
    ],
    hints: [
      'Add `const [visible, setVisible] = useState(false)` and toggle it with `onMouseEnter`/`onMouseLeave` on the outer span.',
      'Use `display: visible ? "block" : "none"` on the tooltip span — no need for a ref or DOM queries.',
      'Delete the entire `useEffect` — you no longer need it.',
    ],
    totalTests: 11,
    testFramework: 'React Testing Library',
    xp: 190,
    successMessage: `The tooltip now lives entirely within React's state model. No DOM queries, no intervals, no memory leaks. Hover events drive state, state drives rendering — pure React.`,
  },
};

export default challenge;
