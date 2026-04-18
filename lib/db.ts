/**
 * lib/db.ts
 * Neon Postgres serverless driver — works in Cloudflare Workers + Node.js.
 * Use the `sql` tagged-template for all DB queries.
 *
 * Usage:
 *   import { sql } from '@/lib/db';
 *   const rows = await sql`SELECT * FROM user_profiles WHERE id = ${userId}`;
 */
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@host.tld/dbname');
