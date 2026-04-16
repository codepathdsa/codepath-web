import type { Challenge } from '../types';

// ─── ENG-WAR-041 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-041',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'GitHub Secret Exposed in Public Repository',
          companies: ['GitHub', 'Twilio'],
            timeEst: '~20 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `GitHub's secret scanning alerts and Twilio's security team have documented hundreds of incidents where API keys were accidentally committed to public GitHub repositories. Once pushed to a public repo, the secret should be considered fully compromised — bots scan GitHub in real-time and can use the secret within seconds of the commit. Rotating the secret is mandatory, and git history must be cleaned.`,
                    desc: `An engineer accidentally committed a file containing your production Stripe secret key (sk_live_...) to a public GitHub repository 30 minutes ago. GitHub's secret scanning sent an alert. The commit has already been pushed to the main branch. The Stripe key has full read/write access to all payment data. What do you do RIGHT NOW?`,
                      solution: `Step 1 (immediate, before anything else): Rotate the Stripe API key in the Stripe dashboard. This invalidates the exposed key — any attacker using it immediately loses access. Step 2: Audit Stripe logs for any unauthorized API calls in the last 30 minutes. Step 3: Remove the secret from git history using git filter-repo or BFG Repo Cleaner and force-push. Step 4: Add the secret to .gitignore and move to a secrets manager.`,
                        explanation: `Key rotation MUST happen FIRST — before cleaning git history, before writing incident reports. Every second the key is valid is a risk window. Rotation sequence: (1) Stripe Dashboard → API Keys → Roll Secret Key (immediate invalidation). (2) Update secret in AWS Secrets Manager / HashiCorp Vault. (3) Redeploy application with new key. (4) Clean git history (this is cosmetic after rotation — the key is already dead). (5) Enable GitHub secret scanning alerts. (6) Require pre-commit hooks that scan for secrets (git-secrets, detect-secrets).`,
                          options: [
                            { label: 'A', title: 'Delete the commit and force-push to remove the secret from history', sub: 'git reset HEAD~1 && git push --force origin main', isCorrect: false },
                            { label: 'B', title: 'Make the repository private immediately to hide the secret', sub: 'GitHub: Settings → Change visibility → Private', isCorrect: false },
                            { label: 'C', title: 'Immediately rotate the Stripe key, then audit logs, then clean git history', sub: 'Stripe: Roll API key NOW → audit logs → git filter-repo', isCorrect: true },
                            { label: 'D', title: 'Contact GitHub support to remove the commit from their servers', sub: 'Submit GitHub DMCA/security takedown for the commit', isCorrect: false },
                          ]
};

export default challenge;
