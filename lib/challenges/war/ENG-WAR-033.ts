import type { Challenge } from '../types';

// ─── ENG-WAR-033 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-033',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'JWT Secret Rotation Causes Instant Global Logout',
          companies: ['Auth0', 'Okta'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A security team rotated their JWT signing secret after a potential key exposure. They replaced the secret immediately in all services. Every existing JWT (signed with the old key) instantly became invalid — logging out every active user globally. The correct approach is a key rotation grace period or using asymmetric keys (RSA/EC) with JWKS endpoint, where old keys are retained for verification until existing tokens expire.`,
                    desc: `Your security team discovered the JWT signing secret may have been exposed in a public GitHub commit 48 hours ago. To mitigate, they immediately rotated the JWT_SECRET environment variable across all API servers. The result: every user on the platform (2 million) was instantly logged out and forced to re-authenticate. The support queue has 10,000 tickets. Is there a better approach for future rotations?`,
                      solution: `The immediate rotation was correct for a known compromised key, but the proper approach for planned rotations is: (1) Generate a new key, (2) Support BOTH old and new keys for verification simultaneously (grace period equal to JWT token lifetime), (3) Issue new tokens with the new key, (4) After max token lifetime expires (e.g., 24h), remove the old key. Use asymmetric keys (RSA/ECDSA) with a JWKS endpoint — this allows key rotation without redeployment.`,
                        explanation: `JWT key rotation graceful procedure: maintain a key ring. When rotating: mark the old key as "verify only" (don't issue new tokens with it), add the new key as the active signing key. All new JWTs get issued with the new key. Old JWTs are still verified with the old key. After max_token_lifetime passes, all in-flight tokens were issued with the new key, so remove the old one. With JWKS (JSON Web Key Sets): your auth server publishes public keys at /.well-known/jwks.json. Clients discover keys automatically, enabling seamless rotation.`,
                          options: [
                            { label: 'A', title: 'The rotation was handled correctly — immediate rotation is always required for exposed keys', sub: 'No change needed; user disruption is acceptable for security incidents', isCorrect: false },
                            { label: 'B', title: 'Implement JWKS + key ring: verify with old key, issue with new key during grace period', sub: 'Key ring: [{kid: "v1", key: OLD, status: "verify-only"}, {kid: "v2", key: NEW, status: "active"}]', isCorrect: true },
                            { label: 'C', title: 'Increase JWT token expiry to 30 days to reduce impact of future rotations', sub: 'JWT exp: now + 30*24*60*60', isCorrect: false },
                            { label: 'D', title: 'Store JWTs in the database and invalidate only compromised tokens individually', sub: 'Add jwt_blacklist table; check on every request', isCorrect: false },
                          ]
};

export default challenge;
