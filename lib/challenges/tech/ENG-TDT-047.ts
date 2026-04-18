import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-047',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Loading and Error States in React',
  companies: ['Airbnb', 'Booking.com'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A listings page renders nothing while fetching and silently shows an empty list on error. Users think there are no results. Add proper loading skeleton and error recovery UI.',
  solution: 'Add isLoading, error, and data states. Show a skeleton UI during loading. Show an error message with a retry button on failure. Only show the empty state when data loads successfully but is empty.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The listings page has three states: loading, error, and data — but only handles one of them. While fetching, it renders an empty \`<ul>\`. On network error, same empty \`<ul>\`. Users can't tell if there are no results, the page is loading, or something broke.\n\nGood UX requires explicit handling of all three states. Skeleton loaders communicate progress. Error messages with retry buttons prevent frustration.\n\nYour mission: add loading and error states to the component.`,
    folderPath: 'src/components/ListingsPage',
    primaryFile: 'ListingsPage.tsx',
    files: [
      {
        name: 'ListingsPage.tsx',
        lang: 'typescript',
        code: `import { useState, useEffect } from 'react';
import styles from './ListingsPage.module.css';

interface Listing {
  id: string;
  title: string;
  price: number;
}

// TODO: Add isLoading, error states with skeleton and error UI.
export function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => setListings(data));
    // BUG: No loading state, no error handling
  }, []);

  // BUG: Empty list renders identically whether loading or truly empty
  if (listings.length === 0) {
    return <p>No listings found.</p>;
  }

  return (
    <ul>
      {listings.map(l => (
        <li key={l.id}>{l.title} — \${l.price}</li>
      ))}
    </ul>
  );
}`,
      },
      {
        name: 'ListingsPage.module.css',
        lang: 'css',
        code: `/* TODO: Add skeleton animation styles */

.skeleton {
  /* TODO: animated loading placeholder */
}

.errorContainer {
  /* TODO: error state styles */
}`,
      },
    ],
    objectives: [
      {
        label: 'Add isLoading state that is true during fetch',
        check: { type: 'contains', file: 'ListingsPage.tsx', pattern: 'isLoading' },
      },
      {
        label: 'Add error state and catch fetch errors',
        check: { type: 'contains', file: 'ListingsPage.tsx', pattern: '.catch(' },
      },
      {
        label: 'Show skeleton or loading UI when isLoading is true',
        check: { type: 'contains', file: 'ListingsPage.tsx', pattern: 'skeleton' },
      },
      {
        label: 'Show retry button in error state',
        check: { type: 'contains', file: 'ListingsPage.tsx', pattern: 'retry' },
      },
    ],
    hints: [
      'Three states: `const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string|null>(null);`',
      'Skeleton: render 6 `<li className={styles.skeleton}>` elements during loading — they animate with CSS.',
      'Retry: `<button onClick={() => { setError(null); setIsLoading(true); fetchData(); }}>Retry</button>`',
    ],
    totalTests: 14,
    testFramework: 'React Testing Library',
    xp: 200,
    successMessage: `Three distinct states, three distinct UIs. Users see a skeleton during loading, a friendly error with retry on failure, and "No listings found" only when data truly comes back empty.`,
  },
};

export default challenge;
