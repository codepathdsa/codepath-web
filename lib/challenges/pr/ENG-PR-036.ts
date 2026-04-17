// ─── ENG-PR-036 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-036',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Unbounded Concurrency Explosion',
    companies: ['Amazon', 'Dropbox'],
    timeEst: '~12 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A background cron job processes an S3 bucket with 50,000 images, resizing them and uploading them. Every night at 2 AM, the container crashes with `EMFILE: too many open files` or an Out Of Memory (OOM) error.',
    solution: 'The dev used `Promise.all(files.map(processImage))`. This fires 50,000 asynchronous network and file-system operations simultaneously. The OS runs out of socket descriptors or RAM trying to handle them all at once. Fix: Implement a concurrency limit (using libraries like `p-limit` or a batching chunk array loop) to process max 50–100 at a time.',
    prReview: {
        prNumber: 521,
        prBranch: 'chore/s3-image-resizer',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/jobs/resize.ts',
        background: 'Batch processing tens of thousands of objects in cloud storage.',
        hints: [
            'Does `Promise.all` process items one by one, or all at exactly the same time?',
            'If you initiate 50,000 HTTP requests simultaneously, what happens to the OS network sockets?',
            'How can you limit the number of in-flight promises?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function processAllImages() {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const files = await s3.listAllObjects("raw-images");' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '  // Speed up processing by running them all concurrently' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '  await Promise.all(' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    files.map(async (file) => {' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '      const img = await s3.download(file.key);' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '      const resized = await resizeImage(img);' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '      await s3.upload(file.key + "-small", resized);' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '    })' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '  );' },
            { lineNumL: 13, lineNumR: 21, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'unbounded_concurrency', label: 'Unbounded Concurrency', sub: 'Firing 50k promises crashes the system' },
            { value: 'missing_await', label: 'Missing Await', sub: 'Map callback does not await inner functions' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Images are not garbage collected' },
            { value: 'unhandled_rejection', label: 'Unhandled Rejection', sub: 'One failure kills the entire Promise.all' },
        ],
        correctBugType: 'unbounded_concurrency',
        successExplanation: "Correct. `Promise.all` executes everything simultaneously. 50,000 files means 50,000 open file handles and HTTP sockets at the exact same moment. The Node event loop can handle it, but the underlying OS cannot (`EMFILE` error) and RAM will exhaust. You must chunk the array or use a concurrency limiter (like `p-limit`). (Note: the unhandled rejection behavior of `Promise.all` is also a flaw, but OS resource exhaustion happens first).",
        failExplanation: "The bug is Unbounded Concurrency. `Promise.all` tries to run all mapped promises simultaneously. For an array of 50,000 items, it opens 50,000 concurrent network streams. The OS limits the number of file descriptors/sockets a process can hold, causing a hard crash. Fix: Chunk the work or use a concurrency limit."
    },
};

export default challenge;