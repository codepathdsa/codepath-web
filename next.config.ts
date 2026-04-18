import type { NextConfig } from "next";

// Security headers applied to all routes
const securityHeaders = [
  // Prevent clickjacking — only same-origin frames allowed (Monaco editor needs this)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information sent with requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // HSTS — force HTTPS for 2 years (only active in production with HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Legacy XSS filter (defense in depth for older browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  {
    key: 'Content-Security-Policy',
    value: [
      // Default: only same-origin
      "default-src 'self'",
      // Scripts: same-origin + Monaco/Pyodide CDNs + unsafe-eval required by Monaco editor
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      // Styles: same-origin + inline + Monaco CDN (Monaco editor injects styles & loads CSS from CDN)
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      // Images: same-origin, data URIs, and HTTPS sources (avatars, etc.)
      "img-src 'self' data: https:",
      // Web workers (Pyodide uses them) and API connections
      "worker-src 'self' blob:",
      // Allowed connection targets (Neon DB via serverless driver + Auth.js providers)
      "connect-src 'self' https://*.neon.tech https://api.github.com https://accounts.google.com https://go.dev https://cdn.jsdelivr.net",
      // Fonts from same origin + Monaco CDN
      "font-src 'self' https://cdn.jsdelivr.net",
      // No plugins, no base tag hijacking, no object embeds
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
