// ─── ENG-PR-040 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-040',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Node.js Stream Unhandled Error Flaw',
    companies: ['Dropbox', 'DigitalOcean'],
    timeEst: '~12 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A proxy endpoint downloads a file from S3 and pipes it directly to the user\'s HTTP response. If the S3 file doesn\'t exist, or S3 times out, the entire Node.js server crashes abruptly. No catch blocks are triggering.',
    solution: 'In Node.js, `readable.pipe(writable)` does NOT forward errors from the readable stream to the writable stream. If the read stream emits an `error` event and there is no `.on("error")` handler attached to it, Node treats it as an Unhandled EventEmitter Exception and crashes the process. Fix: Use the modern `stream.pipeline()` API which handles errors and cleanup automatically.',
    prReview: {
        prNumber: 312,
        prBranch: 'feat/s3-stream-proxy',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/controllers/download.ts',
        background: 'Piping data straight from AWS to the client to save memory.',
        hints: [
            'If `s3Stream` throws an error, does `.pipe()` catch it?',
            'What happens in Node.js when an EventEmitter emits an "error" event with no listeners?',
            'What is the modern standard for safely piping streams in Node.js?'
        ],
        diff: [
            { lineNumL: 14, lineNumR: 14, type: 'normal', text: 'export async function downloadFile(req: Request, res: Response) {' },
            { lineNumL: 15, lineNumR: 15, type: 'normal', text: '  try {' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '    const s3Stream = s3.getObject({ Bucket: "b", Key: req.params.key })' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '      .createReadStream();' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    ' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '    res.setHeader("Content-Type", "application/octet-stream");' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '    s3Stream.pipe(res);' },
            { lineNumL: 16, lineNumR: 21, type: 'normal', text: '  } catch (err) {' },
            { lineNumL: 17, lineNumR: 22, type: 'normal', text: '    res.status(500).send("Error downloading file");' },
            { lineNumL: 18, lineNumR: 23, type: 'normal', text: '  }' },
            { lineNumL: 19, lineNumR: 24, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'unhandled_stream_error', label: 'Unhandled Stream Error', sub: 'pipe() does not catch read errors' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Stream is not closed on success' },
            { value: 'header_sent', label: 'Headers Already Sent', sub: 'Catch block writes after pipe starts' },
            { value: 'missing_await', label: 'Missing Await', sub: 'createReadStream is async' },
        ],
        correctBugType: 'unhandled_stream_error',
        successExplanation: "Correct. The `.pipe()` method does not forward errors. If S3 fails, the `s3Stream` emits an 'error' event. Because there's no listener attached, Node treats it as a fatal exception and crashes. The `try/catch` block does nothing because streams are event-based, not promise-based. Fix: Use `import { pipeline } from 'stream/promises'` and `await pipeline(s3Stream, res)`.",
        failExplanation: "The bug is Unhandled Stream Errors. `try/catch` only catches synchronous errors and rejected Promises. Streams use EventEmitters. If `s3Stream` fails, it emits an 'error' event. Because `.pipe()` doesn't attach an error listener, Node.js crashes the entire application. You should use `stream.pipeline()` instead of `.pipe()`."
    },
};

export default challenge;