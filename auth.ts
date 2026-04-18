/**
 * auth.ts  (project root)
 * Auth.js v5 configuration.
 *
 * Providers used:
 *   - GitHub OAuth (free, no limits)
 *   - Google OAuth (free, no limits)
 *
 * Session persistence: Neon Postgres via @auth/neon-adapter
 *
 * Required env vars:
 *   DATABASE_URL              — Neon connection string
 *   AUTH_SECRET               — random secret (run: npx auth secret)
 *   AUTH_GITHUB_ID            — GitHub OAuth App Client ID
 *   AUTH_GITHUB_SECRET        — GitHub OAuth App Client Secret
 *   AUTH_GOOGLE_ID            — Google OAuth Client ID
 *   AUTH_GOOGLE_SECRET        — Google OAuth Client Secret
 */
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import NeonAdapter from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://user:password@host.tld/dbname' });

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: NeonAdapter(pool),

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  // Custom pages — reuses your existing styled pages
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
    error: '/login',
  },

  callbacks: {
    /**
     * Attach the DB user id to the JWT/session so it's available
     * via `session.user.id` everywhere without extra DB lookups.
     */
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
