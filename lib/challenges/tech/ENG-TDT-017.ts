import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-017',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Callback Hell → Async/Await',
  companies: ['Netflix', 'Disney+'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A media upload pipeline is written with 5 nested callbacks. Error handling is impossible. The rightward drift makes it unreadable. Flatten it with async/await.',
  solution: 'Convert each callback-based function to return a Promise (or use util.promisify). Then rewrite the pipeline with await, adding a single try/catch block.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The media upload pipeline was written when the team only knew Node.js callbacks. Five levels of nesting make it impossible to add error handling without copy-pasting the same \`if (err) return cb(err)\` line everywhere.\n\nA bug in step 3 silently swallows errors — reported by 12 users over 3 months.\n\nYour mission: flatten the pyramid with async/await and add a single top-level try/catch.`,
    folderPath: 'src/pipeline',
    primaryFile: 'uploadPipeline.ts',
    files: [
      {
        name: 'uploadPipeline.ts',
        lang: 'typescript',
        code: `import { validateFile, compressImage, uploadToS3, updateDatabase, notifyUser } from './steps';

// TODO: Flatten this callback pyramid with async/await.
// Add a single try/catch for error handling.
export function processUpload(userId: string, filePath: string, callback: (err: Error | null) => void) {
  validateFile(filePath, (err, meta) => {
    if (err) return callback(err);
    compressImage(filePath, meta!, (err2, compressed) => {
      if (err2) return callback(err2);
      uploadToS3(compressed!, (err3, url) => {
        if (err3) return callback(err3);
        updateDatabase(userId, url!, (err4) => {
          if (err4) return callback(err4);
          notifyUser(userId, url!, (err5) => {
            if (err5) return callback(err5);
            callback(null);
          });
        });
      });
    });
  });
}`,
      },
      {
        name: 'steps.ts',
        lang: 'typescript',
        readOnly: true,
        code: `// These have already been promisified — use them directly with await.
export function validateFile(path: string): Promise<{ width: number; height: number }>;
export function compressImage(path: string, meta: object): Promise<Buffer>;
export function uploadToS3(data: Buffer): Promise<string>;
export function updateDatabase(userId: string, url: string): Promise<void>;
export function notifyUser(userId: string, url: string): Promise<void>;`,
      },
    ],
    objectives: [
      {
        label: 'Remove all nested callbacks from uploadPipeline.ts',
        check: { type: 'not_contains', file: 'uploadPipeline.ts', pattern: '=> {' },
      },
      {
        label: 'Use async/await in processUpload',
        check: { type: 'contains', file: 'uploadPipeline.ts', pattern: 'async' },
      },
      {
        label: 'Add a try/catch block for centralised error handling',
        check: { type: 'contains', file: 'uploadPipeline.ts', pattern: 'try {' },
      },
    ],
    hints: [
      'Make `processUpload` async and return a Promise<void> instead of taking a callback.',
      'Each step is already promisified — just `await` them in sequence.',
      'One `try/catch` at the top replaces the 5 individual `if (err) return callback(err)` checks.',
    ],
    totalTests: 14,
    testFramework: 'Jest',
    xp: 200,
    successMessage: `The pyramid is flat. Error handling is centralised. The code reads top-to-bottom like synchronous code but runs asynchronously. Adding a 6th step takes 1 line.`,
  },
};

export default challenge;
