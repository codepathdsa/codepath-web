import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-045',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Inline Styles → CSS Modules',
  companies: ['Figma', 'Linear'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A React component has 200 lines of inline style objects. Dark mode requires duplicating every value. Performance suffers because style objects are recreated on every render. Migrate to CSS Modules.',
  solution: 'Move all styles to a .module.css file. Replace inline style objects with className={styles.xxx}. Extract design tokens to CSS variables for theme support.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The ProfileCard component has inline styles like \`style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '16px' }}\` on every element. There are 45 style objects.\n\nProblems: (1) A new object is allocated on every render, causing unnecessary re-renders downstream. (2) Dark mode requires a theme prop threading through all 45 objects. (3) No CSS pseudo-classes (\`:hover\`, \`:focus\`).\n\nYour mission: migrate to CSS Modules.`,
    folderPath: 'src/components/ProfileCard',
    primaryFile: 'ProfileCard.tsx',
    files: [
      {
        name: 'ProfileCard.tsx',
        lang: 'typescript',
        code: `import React from 'react';
// TODO: import styles from './ProfileCard.module.css'

interface Props {
  name: string;
  title: string;
  avatarUrl: string;
  isOnline: boolean;
}

// TODO: Replace ALL inline style objects with CSS module classNames.
export function ProfileCard({ name, title, avatarUrl, isOnline }: Props) {
  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid #333' }}>
      <div style={{ position: 'relative' }}>
        <img
          src={avatarUrl}
          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
          alt={name}
        />
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '12px', height: '12px', borderRadius: '50%',
          backgroundColor: isOnline ? '#22c55e' : '#6b7280',
          border: '2px solid #1a1a1a'
        }} />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 600, color: '#ffffff', fontSize: '16px' }}>{name}</p>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>{title}</p>
      </div>
    </div>
  );
}`,
      },
      {
        name: 'ProfileCard.module.css',
        lang: 'css',
        code: `/* TODO: Define all styles here.
   Use CSS custom properties (variables) for theme-able values.
   Add :hover and :focus styles that weren't possible with inline styles. */
`,
      },
    ],
    objectives: [
      {
        label: 'Import CSS module styles in ProfileCard.tsx',
        check: { type: 'contains', file: 'ProfileCard.tsx', pattern: "from './ProfileCard.module.css'" },
      },
      {
        label: 'Remove all inline style objects from ProfileCard.tsx',
        check: { type: 'not_contains', file: 'ProfileCard.tsx', pattern: 'style={{' },
      },
      {
        label: 'Define card class in ProfileCard.module.css',
        check: { type: 'contains', file: 'ProfileCard.module.css', pattern: '.card' },
      },
      {
        label: 'Use CSS custom properties for themeable values',
        check: { type: 'contains', file: 'ProfileCard.module.css', pattern: '--' },
      },
    ],
    hints: [
      'CSS Modules: `import styles from "./ProfileCard.module.css"` → `className={styles.card}`',
      'Conditional class: `className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`}`',
      'Now you can add `.card:hover { box-shadow: ... }` — impossible with inline styles.',
    ],
    totalTests: 12,
    testFramework: 'React Testing Library',
    xp: 200,
    successMessage: `Inline styles are gone. CSS Modules enable hover states, focus rings, and dark mode via a single CSS variable swap. Performance improves because class names are static strings, not recreated objects.`,
  },
};

export default challenge;
