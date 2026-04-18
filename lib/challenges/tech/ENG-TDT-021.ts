import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-021',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing React Error Boundary',
  companies: ['Meta', 'Twitter'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A single unhandled exception in a data table component crashes the entire React app — white screen, no message. Add an ErrorBoundary class component to isolate the failure.',
  solution: 'Create an ErrorBoundary class component with getDerivedStateFromError and componentDidCatch. Wrap the DataTable with it. Show a fallback UI instead of crashing the whole app.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The analytics dashboard has 5 widgets. When the DataTable receives malformed API data and throws during render, React unmounts the entire tree — white screen for all users, including those whose other widgets were fine.\n\nError boundaries are React's way of catching render-phase exceptions and displaying fallback UI. They must be class components.\n\nYour mission: create an ErrorBoundary and wrap the DataTable to isolate failures.`,
    folderPath: 'src/components',
    primaryFile: 'ErrorBoundary.tsx',
    files: [
      {
        name: 'ErrorBoundary.tsx',
        lang: 'typescript',
        code: `import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// TODO: Implement the ErrorBoundary class component.
// It must:
//   1. Implement getDerivedStateFromError to update state on error
//   2. Implement componentDidCatch to log the error
//   3. Render props.fallback (or a default message) when hasError is true
export class ErrorBoundary extends React.Component<Props, State> {
  // TODO
}`,
      },
      {
        name: 'Dashboard.tsx',
        lang: 'typescript',
        code: `import { ErrorBoundary } from './ErrorBoundary';
import { DataTable } from './DataTable';
import { MetricsCard } from './MetricsCard';

// TODO: Wrap DataTable with ErrorBoundary so its crashes don't
// take down MetricsCard and the rest of the dashboard.
export function Dashboard() {
  return (
    <div>
      <MetricsCard />
      <DataTable data={undefined as any} />
    </div>
  );
}`,
      },
      {
        name: 'DataTable.tsx',
        lang: 'typescript',
        readOnly: true,
        code: `interface Props { data: { rows: string[][] } }

export function DataTable({ data }: Props) {
  // Throws when data is undefined — this is the bug we're isolating
  return (
    <table>
      {data.rows.map((row, i) => (
        <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
      ))}
    </table>
  );
}`,
      },
    ],
    objectives: [
      {
        label: 'Implement getDerivedStateFromError in ErrorBoundary',
        check: { type: 'contains', file: 'ErrorBoundary.tsx', pattern: 'getDerivedStateFromError' },
      },
      {
        label: 'Implement componentDidCatch for error logging',
        check: { type: 'contains', file: 'ErrorBoundary.tsx', pattern: 'componentDidCatch' },
      },
      {
        label: 'Wrap DataTable with ErrorBoundary in Dashboard.tsx',
        check: { type: 'contains', file: 'Dashboard.tsx', pattern: '<ErrorBoundary' },
      },
    ],
    hints: [
      'getDerivedStateFromError is static: `static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }`',
      'componentDidCatch receives `error` and `info` — log both to your error tracking service.',
      'In render(), return `this.props.fallback ?? <p>Something went wrong.</p>` when `this.state.hasError`.',
    ],
    totalTests: 12,
    testFramework: 'React Testing Library',
    xp: 200,
    successMessage: `DataTable crashes are now isolated. The rest of the dashboard renders normally. Users see a friendly fallback instead of a white screen — and the error gets sent to your monitoring tool.`,
  },
};

export default challenge;
