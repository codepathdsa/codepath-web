import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-043',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Any Type Everywhere — TypeScript in Name Only',
  companies: ['Microsoft', 'Palantir'],
  timeEst: '~25 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A data processing module is typed as `any` throughout. TypeScript provides no protection. A property rename in the API response broke production — TypeScript said nothing. Add proper types.',
  solution: 'Define interfaces for the API response and internal models. Replace all `any` with specific types. Enable `noImplicitAny: true` in tsconfig.json.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The analytics pipeline was "typed" as \`any\` because the team was in a rush. Last week the upstream API renamed \`user_id\` to \`userId\`. TypeScript didn't complain. The pipeline broke silently in production for 6 hours.\n\nThe purpose of TypeScript is to catch these errors at compile time. \`any\` opts out of the type system entirely.\n\nYour mission: replace all \`any\` with proper interfaces.`,
    folderPath: 'src/analytics',
    primaryFile: 'processor.ts',
    files: [
      {
        name: 'processor.ts',
        lang: 'typescript',
        code: `// TODO: Replace all 'any' with proper types.
// Define interfaces for ApiEvent, ProcessedEvent, and UserMetrics.

export async function processEvents(raw: any[]): Promise<any[]> {
  return raw.map((event: any) => {
    const processed: any = {
      userId: event.user_id,
      action: event.event_type,
      timestamp: new Date(event.ts * 1000),
      value: event.meta?.value ?? 0,
    };
    return processed;
  });
}

export function aggregateByUser(events: any[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const e of events) {
    const existing = map.get(e.userId) ?? { count: 0, totalValue: 0 };
    map.set(e.userId, {
      count: existing.count + 1,
      totalValue: existing.totalValue + e.value,
    });
  }
  return map;
}`,
      },
      {
        name: 'types.ts',
        lang: 'typescript',
        code: `// TODO: Define all interfaces here.

// Shape of raw events from the upstream API
export interface ApiEvent {
  // TODO
}

// Shape after processing
export interface ProcessedEvent {
  // TODO
}

// Shape of per-user aggregate
export interface UserMetrics {
  // TODO
}`,
      },
    ],
    objectives: [
      {
        label: 'Define ApiEvent interface in types.ts',
        check: { type: 'contains', file: 'types.ts', pattern: 'user_id' },
      },
      {
        label: 'Define ProcessedEvent interface in types.ts',
        check: { type: 'contains', file: 'types.ts', pattern: 'ProcessedEvent' },
      },
      {
        label: 'Remove all any from processor.ts function signatures',
        check: { type: 'not_contains', file: 'processor.ts', pattern: ': any' },
      },
      {
        label: 'Use ProcessedEvent and UserMetrics in processor.ts',
        check: { type: 'contains', file: 'processor.ts', pattern: 'ProcessedEvent' },
      },
    ],
    hints: [
      'ApiEvent: `{ user_id: string; event_type: string; ts: number; meta?: { value?: number } }`',
      'ProcessedEvent: `{ userId: string; action: string; timestamp: Date; value: number }`',
      'UserMetrics: `{ count: number; totalValue: number }`',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 200,
    successMessage: `TypeScript is now enforcing types. If the API renames user_id again, the compiler catches it at build time — not in production. 'any' is a code smell, not a shortcut.`,
  },
};

export default challenge;
