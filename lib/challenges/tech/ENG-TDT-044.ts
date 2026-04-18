import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-044',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Feature Flags Hardcoded in Source Code',
  companies: ['LaunchDarkly', 'Statsig'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'Feature toggles are hardcoded booleans: `const ENABLE_NEW_CHECKOUT = true`. Releasing a flag requires a code deploy. Extract to a runtime feature flag service backed by environment variables.',
  solution: 'Create a FeatureFlags service that reads flags from environment variables (or a feature flag provider). Replace all hardcoded booleans with isEnabled("FLAG_NAME") calls.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The team has 12 feature flags scattered across the codebase as hardcoded booleans. To disable the new checkout flow when it causes issues in production, an engineer must change code, open a PR, get it reviewed, and deploy — taking 30-60 minutes.\n\nRuntime feature flags can be toggled in seconds without a deploy. They also enable gradual rollouts, A/B testing, and kill switches.\n\nYour mission: extract all flags to a runtime-configurable system.`,
    folderPath: 'src/features',
    primaryFile: 'featureFlags.ts',
    files: [
      {
        name: 'featureFlags.ts',
        lang: 'typescript',
        code: `// TODO: Build a feature flag service backed by environment variables.
// isEnabled('ENABLE_NEW_CHECKOUT') reads FEATURE_ENABLE_NEW_CHECKOUT from process.env
// Default: false if env var not set
// Support: override all flags in tests by injecting a custom provider

export type FlagName =
  | 'ENABLE_NEW_CHECKOUT'
  | 'ENABLE_AI_RECOMMENDATIONS'
  | 'ENABLE_DARK_MODE'
  | 'ENABLE_REFERRAL_BONUS';

export interface FlagProvider {
  isEnabled(flag: FlagName): boolean;
}

// TODO: Implement EnvFlagProvider (reads from process.env)
export class EnvFlagProvider implements FlagProvider {
  isEnabled(flag: FlagName): boolean {
    // TODO: read FEATURE_{flag} from process.env
    return false;
  }
}

// TODO: Export a singleton and isEnabled helper
export let flagProvider: FlagProvider = new EnvFlagProvider();

export function isEnabled(flag: FlagName): boolean {
  return flagProvider.isEnabled(flag);
}`,
      },
      {
        name: 'checkout.ts',
        lang: 'typescript',
        code: `import { isEnabled } from '../features/featureFlags';

// TODO: Replace hardcoded booleans with isEnabled() calls.
// The hardcoded version:
//   const ENABLE_NEW_CHECKOUT = true;
//   if (ENABLE_NEW_CHECKOUT) { ... }

export async function handleCheckout(cart: object) {
  // HARDCODED: replace with isEnabled('ENABLE_NEW_CHECKOUT')
  const ENABLE_NEW_CHECKOUT = true;

  if (ENABLE_NEW_CHECKOUT) {
    return runNewCheckoutFlow(cart);
  } else {
    return runLegacyCheckoutFlow(cart);
  }
}

async function runNewCheckoutFlow(cart: object) { return { flow: 'new' }; }
async function runLegacyCheckoutFlow(cart: object) { return { flow: 'legacy' }; }`,
      },
    ],
    objectives: [
      {
        label: 'Implement EnvFlagProvider reading from process.env',
        check: { type: 'contains', file: 'featureFlags.ts', pattern: 'process.env' },
      },
      {
        label: 'Use FEATURE_{flag} naming convention for env vars',
        check: { type: 'contains', file: 'featureFlags.ts', pattern: 'FEATURE_' },
      },
      {
        label: 'Replace hardcoded boolean in checkout.ts with isEnabled()',
        check: { type: 'contains', file: 'checkout.ts', pattern: "isEnabled('ENABLE_NEW_CHECKOUT')" },
      },
      {
        label: 'Remove hardcoded boolean constant from checkout.ts',
        check: { type: 'not_contains', file: 'checkout.ts', pattern: 'ENABLE_NEW_CHECKOUT = true' },
      },
    ],
    hints: [
      '`isEnabled`: `return process.env[\`FEATURE_\${flag}\`] === "true"` — env vars are strings, not booleans.',
      'In tests: `flagProvider = { isEnabled: () => true }` — override the provider without touching env vars.',
      'Extend FlagProvider to support percentage rollouts later: `getRolloutPercentage(flag): number`.',
    ],
    totalTests: 16,
    testFramework: 'Jest',
    xp: 260,
    successMessage: `Feature flags are now toggled by setting an environment variable. No code change. No deploy. New checkout can be disabled in 30 seconds via config update. A/B testing is now possible without code changes.`,
  },
};

export default challenge;
