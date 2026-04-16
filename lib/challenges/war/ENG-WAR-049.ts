import type { Challenge } from '../types';

// ─── ENG-WAR-049 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-049',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'SLO Budget Burned by a Single Chatty Client',
            companies: ['Google', 'Cloudflare'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `Google's SRE book describes "error budget" management as a key SRE practice. An error budget for 99.9% SLO over 30 days is 43.8 minutes of allowed downtime. A single misbehaving client making 1M requests/minute with a 5% error rate can consume 3,000 errors/minute — burning through a month's error budget in hours. Without per-client attribution, you can't even see this happening.`,
                      desc: `Your API has a 99.9% SLO. Datadog shows your error rate spiked to 5% for the past 3 hours — you've burned 80% of your monthly error budget. The errors are all 429 Too Many Requests responses to a single API key (client_id: ABC-corp-integration). Their integration sends requests in a tight retry loop that ignores 429 responses. How do you protect your SLO going forward?`,
                        solution: `Immediately: block or severely throttle the misbehaving client_id at the API gateway level. Medium-term: implement per-client error budget tracking — when a specific client causes >10% of your total errors, auto-throttle them. Long-term: return Retry-After headers in 429 responses, implement jitter in your rate limiter (progressive throttling), and contact the client to fix their integration.`,
                          explanation: `SLO protection from noisy clients: (1) Per-client rate limiting (not just global) — each API key gets its own quota. (2) 429 response with Retry-After: clients that honor this will back off automatically. (3) Progressive throttling: first violation = 1min throttle, second = 10min, third = 1hr block. (4) Error budget attribution: track which clients contribute to which errors. If client X causes 80% of your 5xx errors, throttle X, not all clients. (5) Alert when a single client burns >20% of your monthly error budget.`,
                            options: [
                              { label: 'A', title: 'Scale up API server capacity to absorb the extra load from the misbehaving client', sub: 'kubectl scale deployment api --replicas=50', isCorrect: false },
                              { label: 'B', title: 'Block the misbehaving client at API gateway; implement per-client throttling + Retry-After', sub: 'Kong/NGINX: deny client_id=ABC-corp; add Retry-After header; per-client rate limit', isCorrect: true },
                              { label: 'C', title: 'Pause your SLO measurement until the client is fixed', sub: 'Disable SLO calculation for this incident window', isCorrect: false },
                              { label: 'D', title: 'Add a CAPTCHA to the API to stop automated clients', sub: 'Require reCAPTCHA v3 token on all API requests', isCorrect: false },
                            ]
  };

export default challenge;
