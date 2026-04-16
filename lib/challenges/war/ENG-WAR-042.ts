import type { Challenge } from '../types';

// ─── ENG-WAR-042 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-042',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'SSRF Attack Through User-Provided Image URL',
          companies: ['GitLab', 'Confluence'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `GitLab had a critical SSRF (Server-Side Request Forgery) vulnerability where the wiki's image import feature allowed attackers to make the GitLab server fetch arbitrary URLs — including internal AWS EC2 metadata endpoint (http://169.254.169.254/latest/meta-data/iam/security-credentials/) to steal IAM credentials. This is a CVSS 10.0 critical vulnerability class.`,
                    desc: `Your platform allows users to embed images by URL. Security monitoring flagged a series of requests where a user is submitting image URLs like http://169.254.169.254/latest/meta-data/iam/security-credentials/. Your backend is fetching these URLs server-side to proxy/validate images. The attacker is attempting SSRF (Server-Side Request Forgery) to read AWS EC2 instance metadata and potentially steal IAM credentials.`,
                      solution: `Block the SSRF immediately: (1) Add URL allowlist validation — only permit HTTPS URLs to known CDN domains. (2) Block all private/internal IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16) before making any HTTP request. (3) Enable AWS IMDSv2 (token-required metadata) on all EC2 instances — this blocks SSRF attacks against the metadata endpoint. Audit logs to check if any successful SSRF responses contained credential data.`,
                        explanation: `SSRF allows attackers to make your server issue HTTP requests to internal services. The AWS metadata endpoint (169.254.169.254) is the most dangerous SSRF target — it returns IAM role credentials that grant cloud access. Defense: (1) URL validation: parse URL, resolve hostname to IP, block private ranges before requesting. (2) Use a separate network-isolated fetching service (network policy: no access to RFC1918 ranges). (3) Enable IMDSv2 (PUT request required before GET) — mitigates SSRF against metadata endpoint. (4) Use pre-signed S3 URLs so users upload directly to S3, not through your server.`,
                          options: [
                            { label: 'A', title: 'Disable the image URL embedding feature entirely until fixed', sub: 'Remove image URL field from all forms; ship hotfix', isCorrect: false },
                            { label: 'B', title: 'Block private IP ranges in URL validation + enable IMDSv2 + audit credential exposure', sub: 'Block 169.254.x.x, 10.x.x.x, 172.16-31.x.x; aws ec2 modify-instance-metadata-options --http-tokens required; audit CloudTrail', isCorrect: true },
                            { label: 'C', title: 'Add rate limiting on the image URL feature to slow down attacks', sub: '10 image URL requests per minute per user', isCorrect: false },
                            { label: 'D', title: 'Require users to submit image URLs only from approved domains', sub: 'Allow only imgur.com, cloudinary.com, s3.amazonaws.com', isCorrect: false },
                          ]
};

export default challenge;
