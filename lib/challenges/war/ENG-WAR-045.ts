import type { Challenge } from '../types';

// ─── ENG-WAR-045 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-045',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Supply Chain Attack via Compromised NPM Package',
            companies: ['GitHub', 'Sonatype'],
              timeEst: '~25 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `The ua-parser-js npm package (used by millions of projects including Facebook, Microsoft, and Google) was compromised in October 2021 — attackers published malicious versions that installed a crypto miner and a password stealer. Any project running npm install that accepted the latest version got the malware. GitHub's dependency scanning (Dependabot) flagged the issue, but many teams auto-merged dependency updates.`,
                      desc: `GitHub Security Advisory alerts triggered 30 minutes ago: a widely-used npm package (event-stream equivalent) in your dependency tree was compromised — the latest version contains a crypto miner and credential harvester. npm install would have fetched this version. CI/CD ran 2 hours ago and deployed builds that include this package. The malicious code runs during the build and during application startup.`,
                        solution: `(1) Immediately rotate all secrets the compromised systems had access to (API keys, database credentials, CI/CD secrets — the malware targets these). (2) Roll back to the last known-good deployment (before the malicious npm package was included). (3) Lock the compromised package version in package-lock.json to the last safe version. (4) Scan all build artifacts and running systems for indicators of compromise (the miner/harvester processes). (5) Enable npm package signatures verification and lock all transitive dependencies.`,
                          explanation: `Supply chain attacks target the build pipeline — your application becomes the delivery vehicle for malware. Response: (1) Rotate secrets FIRST (the harvester may have already exfiltrated them). (2) Roll back deployed artifacts. (3) Audit CI/CD logs for the malware's fingerprint. Prevention: (a) npm ci instead of npm install (uses locked package-lock.json, prevents version drift). (b) Require package signature verification. (c) Private npm registry (Artifactory, Verdaccio) as a mirror with manual approval for new package versions. (d) Never auto-merge dependency update PRs to production without review.`,
                            options: [
                              { label: 'A', title: 'Remove the compromised package from package.json and redeploy', sub: 'npm uninstall compromised-package && npm install && deploy', isCorrect: false },
                              { label: 'B', title: 'Rotate all secrets, roll back deployment, lock package version, scan for compromise', sub: 'Rotate secrets → rollback → package-lock.json pin → IOC scan → forensics', isCorrect: true },
                              { label: 'C', title: 'Run npm audit fix to automatically patch the compromised package', sub: 'npm audit fix --force', isCorrect: false },
                              { label: 'D', title: 'Block all outbound network traffic from application servers', sub: 'iptables -P OUTPUT DROP', isCorrect: false },
                            ]
  };

export default challenge;
