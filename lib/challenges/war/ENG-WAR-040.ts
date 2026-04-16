import type { Challenge } from '../types';

// ─── ENG-WAR-040 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-040',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Race Condition in Distributed Payment Processing',
          companies: ['Stripe', 'PayPal'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `A classic distributed systems bug: two concurrent requests to "use loyalty points for purchase" both check available points simultaneously, both see 500 points available, both approve the purchase, and both deduct 500 points — leaving the account at -500 points. Without proper database-level locking, this race condition allows users to spend the same resource twice. Stripe documents this as a common pitfall in payment systems.`,
                    desc: `Your loyalty points redemption system has a bug: some customers have negative point balances (e.g., -500 points). Customer support confirms these customers didn't cheat — they appear to have made two rapid simultaneous purchases that both used the same points. The application code checks: if user.points >= purchase_cost: user.points -= purchase_cost but doesn't lock the row during the check-then-act.`,
                      solution: `Use a database-level lock or atomic update to prevent the race condition. In SQL: replace the check-then-act pattern with an atomic conditional update: UPDATE users SET points = points - $cost WHERE user_id = $id AND points >= $cost. If rows_affected == 0, the deduction failed (insufficient points). This is atomic at the database level — no two concurrent transactions can both succeed if only enough points exist for one.`,
                        explanation: `TOCTOU (Time of Check to Time of Use) race condition: you check a condition, then act on it, but the condition can change between check and act if another process runs concurrently. Database-level fix (most reliable): atomic conditional UPDATE. ORM equivalents: User.update_all("points = points - #{cost}", "id = #{id} AND points >= #{cost}"). Alternative: SELECT FOR UPDATE (pessimistic lock) — but this holds a lock and reduces throughput. For distributed systems: use idempotency keys + database unique constraints to prevent double-spending.`,
                          options: [
                            { label: 'A', title: 'Add a mutex (in-process lock) around the points deduction code', sub: 'threading.Lock() or sync.Mutex around: check_points + deduct_points', isCorrect: false },
                            { label: 'B', title: 'Add a Redis distributed lock (SETNX) around the points operation per user', sub: 'redis.set(f"lock:user:{id}", 1, nx=True, ex=5)', isCorrect: false },
                            { label: 'C', title: 'Use atomic conditional database UPDATE: SET points = points - cost WHERE points >= cost', sub: 'UPDATE users SET points=points-$cost WHERE id=$id AND points>=$cost; check rows_affected', isCorrect: true },
                            { label: 'D', title: 'Process all point redemptions in a single-threaded queue', sub: 'Serialize all redemption requests through a single worker', isCorrect: false },
                          ]
};

export default challenge;
