import type { Challenge } from '../types';

// ─── ENG-PR-001 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-PR-001',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'React useEffect Infinite Loop',
  companies: ['Figma', 'Vercel'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A junior dev reorganised the data-fetch logic inside a React component. QA reports the browser freezes instantly when loading the profile page. Spot the bug in the PR diff.',
  solution: 'userQuery is declared inside the component body, producing a new object reference on every render. React dep comparison uses Object.is() (reference equality), so the effect re-fires unconditionally, calling setLoading(true) each time, triggering another render — infinite loop. Fix: use [userId] directly, or memoize with useMemo.',
  prReview: {
    prNumber: 847,
    prBranch: 'feature/profile-eager-load',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/components/UserProfile.tsx',
    prAge: '3 hours ago',
    background: "ProfilePage wasn't reflecting account switches — users had to hard-reload to see the correct profile. The useEffect had an empty dependency array, so it only ran once regardless of which userId was in the URL.",
    changes: "I introduced a `userQuery` config object to organise the fetch params and added it to the useEffect dependency array so the effect re-runs when the query changes.",
    testing: 'Tested locally: profile now updates correctly when switching accounts. CI is green.',
    hints: [
      'Where exactly is `userQuery` declared — inside or outside the component function body?',
      'JavaScript compares objects by reference, not value. `{ id: "a" } === { id: "a" }` is `false`. What comparison does React use for dependency checks?',
      'Every render creates a new `userQuery` → new reference → effect fires → `setLoading(true)` → re-render → repeat. What is the minimal fix?',
    ],
    diff: [
      { lineNumL: 5,    lineNumR: 5,    type: 'normal',   text: 'export function UserProfile({ userId }: Props) {' },
      { lineNumL: 6,    lineNumR: 6,    type: 'normal',   text: '  const [profile, setProfile] = useState<UserProfile | null>(null);' },
      { lineNumL: 7,    lineNumR: 7,    type: 'normal',   text: '  const [loading, setLoading]   = useState(true);' },
      { lineNumL: null, lineNumR: 8,    type: 'addition', text: '  const userQuery = { userId, includeActivity: true };' },
      { lineNumL: 8,    lineNumR: 9,    type: 'normal',   text: '' },
      { lineNumL: 9,    lineNumR: 10,   type: 'normal',   text: '  useEffect(() => {' },
      { lineNumL: 10,   lineNumR: 11,   type: 'normal',   text: '    setLoading(true);' },
      { lineNumL: 11,   lineNumR: null, type: 'deletion', text: '    api.fetchProfile(userId).then((p) => {' },
      { lineNumL: null, lineNumR: 12,   type: 'addition', text: '    api.fetchProfile(userQuery).then((p) => {' },
      { lineNumL: 12,   lineNumR: 13,   type: 'normal',   text: '      setProfile(p);' },
      { lineNumL: 13,   lineNumR: 14,   type: 'normal',   text: '      setLoading(false);' },
      { lineNumL: 14,   lineNumR: 15,   type: 'normal',   text: '    });' },
      { lineNumL: 15,   lineNumR: null, type: 'deletion', text: '  }, [userId]);' },
      { lineNumL: null, lineNumR: 16,   type: 'addition', text: '  }, [userQuery]);' },
      { lineNumL: 16,   lineNumR: 17,   type: 'normal',   text: '' },
      { lineNumL: 17,   lineNumR: 18,   type: 'normal',   text: '  if (loading) return <Spinner />;' },
      { lineNumL: 18,   lineNumR: 19,   type: 'normal',   text: '  return <UserCard profile={profile} />;' },
    ],
    bugOptions: [
      { value: 'missing_deps',     label: 'Missing deps',        sub: 'Effect runs less often than needed' },
      { value: 'unstable_ref_dep', label: 'Unstable dep ref',    sub: 'Object/array recreated every render' },
      { value: 'no_cleanup',       label: 'Missing cleanup',     sub: 'No return/cleanup function' },
      { value: 'wrong_deps',       label: 'Wrong dep list',      sub: "Deps don't match effect variables" },
      { value: 'stale_closure',    label: 'Stale closure',       sub: 'Effect captures outdated value' },
      { value: 'async_race',       label: 'Async race',          sub: 'Response arrives out of order' },
    ],
    correctBugType: 'unstable_ref_dep',
    successExplanation: "Nailed it. userQuery is declared inside the component body, so every render produces a brand-new object reference. React's dep check uses Object.is() (reference equality) — {} !== {} even when the contents are identical. The effect fires after every render, calling setLoading(true), which schedules a re-render, which creates another new userQuery reference. Infinite loop. Fix: put userId directly in the array, or wrap userQuery in useMemo(() => ({ userId, includeActivity: true }), [userId]).",
    failExplanation: "The bug is line 16: [userQuery] in the dependency array. userQuery is declared inside the component, so it's a new object reference on every single render. React's useEffect compares deps using Object.is() — it checks references, not values — so the effect fires unconditionally after every render. This triggers setLoading(true) -> re-render -> new userQuery reference -> effect fires again. The fix: use [userId] directly, or memoize with useMemo.",
  },
};

export default challenge;
