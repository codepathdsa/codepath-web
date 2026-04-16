import type { Challenge } from '../types';

// ─── ENG-TDT-005 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-005',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'React Prop Drilling Hell',
  companies: ['Meta', 'Figma'],
  timeEst: '~30 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'currentUser flows as a prop through App -> Layout -> Sidebar -> NavMenu -> Avatar. Adding one new field means touching 5 files. Use React Context to fix it.',
  solution: 'Create UserContext with React.createContext(). Wrap the app root in UserContext.Provider. Avatar reads the user with useContext() directly — no intermediate props.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The design team added an online status indicator to Avatar. Simple request — except currentUser has to be threaded through 4 intermediate components that don't use it at all.\n\nThis is prop drilling: passing data through the tree only to reach a deeply nested child. Every new field on the user object triggers a refactor cascade.\n\nYour mission: create a UserContext, wrap the app in its Provider, and have Avatar consume it with useContext. Intermediate components should not receive currentUser as a prop at all.`,
    folderPath: 'src/components',
    primaryFile: 'App.tsx',
    files: [
      {
        name: 'App.tsx',
        lang: 'typescript',
        code: `import React from 'react';
import { Sidebar } from './Sidebar';

const currentUser = { name: 'Ada Lovelace', avatarUrl: '/ada.png', online: true };

/**
 * TODO: Wrap this tree in <UserContext.Provider value={currentUser}>.
 * Remove currentUser prop from Sidebar once Avatar reads from context.
 */
export function App() {
  return (
    <div className="app">
      <Sidebar currentUser={currentUser} />
    </div>
  );
}`,
      },
      {
        name: 'Sidebar.tsx',
        lang: 'typescript',
        code: `import React from 'react';
import { NavMenu } from './NavMenu';

/**
 * TODO: Remove currentUser prop.
 * Sidebar does not use it — only passes it down.
 */
export function Sidebar({ currentUser }: { currentUser: any }) {
  return (
    <nav className="sidebar">
      <NavMenu currentUser={currentUser} />
    </nav>
  );
}`,
      },
      {
        name: 'NavMenu.tsx',
        lang: 'typescript',
        code: `import React from 'react';
import { Avatar } from './Avatar';

/**
 * TODO: Remove currentUser prop.
 * NavMenu does not render it — only Avatar does.
 */
export function NavMenu({ currentUser }: { currentUser: any }) {
  return (
    <ul className="nav-menu">
      <li>Home</li>
      <li>Challenges</li>
      <li><Avatar currentUser={currentUser} /></li>
    </ul>
  );
}`,
      },
      {
        name: 'Avatar.tsx',
        lang: 'typescript',
        code: `import React from 'react';

/**
 * TODO: Replace the currentUser prop with useContext(UserContext).
 * This component should read the user from context directly.
 */
export function Avatar({ currentUser }: { currentUser: any }) {
  return (
    <div className="avatar">
      <img src={currentUser.avatarUrl} alt={currentUser.name} />
      {currentUser.online && <span className="online-dot" />}
    </div>
  );
}`,
      },
      {
        name: 'UserContext.ts',
        lang: 'typescript',
        code: `import { createContext } from 'react';

/**
 * HINT: Define the User type and create the context here.
 * Export UserContext so App.tsx can provide it
 * and Avatar.tsx can consume it.
 */
export interface User {
  name: string;
  avatarUrl: string;
  online: boolean;
}

// TODO: export const UserContext = createContext<User | null>(null);`,
      },
    ],
    objectives: [
      {
        label: 'Wrap the app tree in UserContext.Provider in App.tsx',
        check: { type: 'contains', file: 'App.tsx', pattern: 'UserContext.Provider' },
      },
      {
        label: 'Avatar reads user from useContext instead of a prop',
        check: { type: 'contains', file: 'Avatar.tsx', pattern: 'useContext' },
      },
      {
        label: 'Remove currentUser prop drilling through Sidebar',
        check: { type: 'not_contains', file: 'Sidebar.tsx', pattern: 'currentUser' },
      },
    ],
    hints: [
      'In UserContext.ts: `export const UserContext = createContext<User | null>(null);`',
      'In App.tsx: import UserContext, then wrap the return with `<UserContext.Provider value={currentUser}>...</UserContext.Provider>`.',
      'In Avatar.tsx: `const user = useContext(UserContext);` — remove the prop from the signature and all parent components.',
    ],
    totalTests: 16,
    testFramework: 'React Testing Library',
    xp: 200,
    successMessage: 'Prop drilling eliminated. Avatar reads the user from context directly. Adding a new field to User now only requires updating UserContext.ts and Avatar.tsx — zero other files.',
  },
};

export default challenge;
