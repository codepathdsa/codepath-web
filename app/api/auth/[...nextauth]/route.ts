/**
 * app/api/auth/[...nextauth]/route.ts
 * Auth.js v5 route handler — handles all /api/auth/* requests.
 * (sign-in, sign-out, callbacks, session etc.)
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
