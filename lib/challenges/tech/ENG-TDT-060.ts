import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-060',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Reflection-Based JSON Serialization Performance',
  companies: ['Uber', 'Twitter'],
  timeEst: '~35 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'An API endpoint uses JSON.stringify on large objects with circular reference guards via a custom replacer that traverses the entire object graph using reflection. At 10K req/s, serialization is 40% of CPU. Replace with a schema-based fast serializer.',
  solution: 'Define a JSON schema (using fast-json-stringify or flatbuffers). Pre-compile the serializer. Replace the custom replacer with the compiled serialize function. Use field selection to avoid sending unnecessary data.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The /feed endpoint returns 50 posts per page. Each post is serialized with a custom JSON.stringify replacer that recursively inspects every property for circular references and strips undefined values.\n\nAt 10K req/s, \`JSON.stringify\` with the custom replacer consumes 40% of a CPU core. The profiler shows the replacer is called 2,400 times per request.\n\nFast-json-stringify pre-compiles a serializer from a JSON schema — 2-4x faster than generic JSON.stringify by skipping reflection entirely.\n\nYour mission: replace the generic serializer with a schema-based fast serializer.`,
    folderPath: 'src/serialization',
    primaryFile: 'feedSerializer.ts',
    files: [
      {
        name: 'feedSerializer.ts',
        lang: 'typescript',
        code: `import fastJson from 'fast-json-stringify';

// TODO: Define the JSON schema for a Post and compile the serializer.
// Then use it in serializeFeed() instead of the slow custom replacer.

interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  voteCount: number;
  commentCount: number;
  createdAt: string;  // ISO string
  tags: string[];
}

// CURRENT SLOW APPROACH: custom replacer traverses the entire object graph
function safeReplacer(key: string, value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value === 'object' && value !== null && seen.has(value)) return '[Circular]';
  if (typeof value === 'object' && value !== null) seen.add(value);
  return value;
}
let seen = new WeakSet();

export function serializeFeed(posts: Post[]): string {
  seen = new WeakSet();
  return JSON.stringify(posts, safeReplacer);
}

// TODO: Define the Post schema and compile with fast-json-stringify
// export const serializeFeedFast = ...(posts: Post[]) => string`,
      },
    ],
    objectives: [
      {
        label: 'Define a JSON schema for Post matching the interface',
        check: { type: 'contains', file: 'feedSerializer.ts', pattern: 'type: \'object\'' },
      },
      {
        label: 'Compile a serializer using fastJson()',
        check: { type: 'contains', file: 'feedSerializer.ts', pattern: 'fastJson(' },
      },
      {
        label: 'Replace the custom replacer call with the compiled serializer',
        check: { type: 'contains', file: 'feedSerializer.ts', pattern: 'serializeFeedFast' },
      },
      {
        label: 'Remove the slow custom replacer function',
        check: { type: 'not_contains', file: 'feedSerializer.ts', pattern: 'safeReplacer' },
      },
    ],
    hints: [
      'fast-json-stringify schema: `fastJson({ type: "object", properties: { id: {type:"string"}, title: {type:"string"}, voteCount: {type:"integer"}, tags: {type:"array", items:{type:"string"}} } })`',
      'For an array: wrap in `{ type: "array", items: { <Post schema> } }`',
      'The compiled `serialize` function is called once — store it at module level, not inside the handler.',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 420,
    successMessage: `Serialization CPU dropped from 40% to 10%. fast-json-stringify avoids reflection by knowing the schema upfront — it generates optimised code that directly accesses known properties. Throughput increased from 10K to 16K req/s on the same hardware.`,
  },
};

export default challenge;
