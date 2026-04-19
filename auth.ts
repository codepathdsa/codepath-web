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
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import NeonAdapter from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

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
    Resend({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Find user in Neon DB
        const users = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;
        const user = users[0];

        if (!user || !user.password_hash) return null;

        // Verify password
        const isValid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!isValid) return null;

        // Check verification
        if (!user.emailVerified) {
          throw new Error('VerificationRequired');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
