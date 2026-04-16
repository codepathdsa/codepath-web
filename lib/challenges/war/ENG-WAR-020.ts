import type { Challenge } from '../types';

// ─── ENG-WAR-020 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-020',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Let\'s Encrypt Rate Limit Blocks Certificate Renewal',
          companies: ['Vercel', 'Netlify'],
            timeEst: '~20 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `Vercel and Netlify automatically provision Let's Encrypt TLS certificates for millions of custom domains. Let's Encrypt enforces a rate limit of 50 certificates per registered domain per week. A misconfigured certificate manager that retries on failure can quickly exhaust this limit, leaving all new custom domains unable to get certificates — causing HTTPS to fail for hundreds of customer sites.`,
                    desc: `Your platform provisions Let's Encrypt certificates automatically for customer custom domains. An engineer deployed a bug that caused the certificate provisioning service to retry failed ACME requests in a tight loop (no exponential backoff). Within 4 hours, the service burned through all 50 certificates for your wildcard domain for the week. New customers adding custom domains get HTTPS errors. Existing customers are unaffected.`,
                      solution: `Switch to Let's Encrypt Staging environment for testing to avoid burning rate limits. For the current week, use a different CA as fallback (ZeroSSL offers the same ACME protocol with separate rate limits). Fix the retry logic to use exponential backoff with jitter. Monitor certificate issuance rates with alerting before limits are reached.`,
                        explanation: `Let's Encrypt rate limits: 50 new certificates per registered domain per week, 5 failed validation attempts per hostname per hour. When a cert provisioner retries in a tight loop, it hits the failed validation limit first (per-hostname), then exhausts the weekly certificate limit. The fix: implement proper backoff (double the retry interval each time), add rate limit monitoring, and use ZeroSSL as a fallback CA since it uses the same ACME protocol and has independent limits.`,
                          options: [
                            { label: 'A', title: 'Contact Let\'s Encrypt to request a rate limit increase', sub: 'Submit form at letsencrypt.org/docs/rate-limits/', isCorrect: false },
                            { label: 'B', title: 'Switch to ZeroSSL as fallback CA; fix retry loop with exponential backoff', sub: 'ACME directory: acme.zerossl.com; backoff: min(2^attempt * 1s, 300s)', isCorrect: true },
                            { label: 'C', title: 'Issue a self-signed certificate for all new customers until the rate limit resets', sub: 'openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365', isCorrect: false },
                            { label: 'D', title: 'Pause new customer onboarding for 7 days until the rate limit resets', sub: 'Disable custom domain feature for one week', isCorrect: false },
                          ]
};

export default challenge;
