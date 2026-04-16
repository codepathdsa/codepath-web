import type { Challenge } from '../types';

// ─── ENG-WAR-032 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-032',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'JSON Serialization of BigInt Causes Silent Data Corruption',
          companies: ['Twitter', 'Instagram'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Twitter famously ran into this bug when JavaScript clients parsed tweet IDs (64-bit integers) via JSON.parse(). JavaScript's Number type is IEEE 754 double-precision float — it can only represent integers exactly up to 2^53. Twitter's snowflake IDs exceeded this range, causing JSON.parse() to silently round the last few digits, making tweet IDs incorrect. Twitter's solution: return IDs as both numbers and strings in their API.`,
                    desc: `Your platform generates 64-bit integer IDs using a snowflake algorithm. Mobile app users report that links to specific content items are "broken" — they navigate to the correct URL but see wrong content. Debugging shows the content ID in the URL is slightly wrong: your server returned ID 9007199254740993 but the mobile client received 9007199254740992 (off by 1). The API returns JSON.`,
                      solution: `JavaScript's JSON.parse() silently truncates 64-bit integers > 2^53 (Number.MAX_SAFE_INTEGER). Serialize large integers as strings in your JSON API response. Add a parallel string field (e.g., "id_str": "9007199254740993") alongside the numeric field for backward compatibility. Validate this in your API contract tests by asserting that the integer value exactly matches its string representation.`,
                        explanation: `IEEE 754 double-precision (JavaScript Number) can represent integers exactly only up to 2^53 = 9,007,199,254,740,992. Your snowflake ID exceeded this. JSON.parse() in JavaScript silently rounds to the nearest representable float — no error, no warning. Fix: in your API, serialize large integer IDs as JSON strings. Many APIs (Twitter, Instagram) return {"id": 12345, "id_str": "12345"} for backward compatibility. Modern JSON libraries in server languages (Java's Jackson, Go's encoding/json) serialize int64 as strings when configured to do so.`,
                          options: [
                            { label: 'A', title: 'Switch to UUIDs to avoid integer overflow issues', sub: 'Generate UUID v4 for all new content IDs', isCorrect: false },
                            { label: 'B', title: 'Serialize large integer IDs as JSON strings in the API response', sub: 'Return "id_str": "9007199254740993" alongside numeric "id" field', isCorrect: true },
                            { label: 'C', title: 'Reset the snowflake ID generator to start from a smaller number', sub: 'ALTER SEQUENCE content_id_seq RESTART WITH 1000', isCorrect: false },
                            { label: 'D', title: 'Compress IDs using base64 encoding before sending to clients', sub: 'base64.encode(int64_id).decode() on all ID fields in response', isCorrect: false },
                          ]
};

export default challenge;
