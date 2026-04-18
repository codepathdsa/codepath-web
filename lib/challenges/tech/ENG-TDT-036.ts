import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-036',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Correlation IDs — Untraceable Requests',
  companies: ['Datadog', 'New Relic'],
  timeEst: '~25 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'Logs from 5 microservices are impossible to correlate. When a user reports a failed checkout, support takes 45 minutes to trace the request across services. Add correlation ID propagation via request headers.',
  solution: 'Generate a UUID correlation ID at the API gateway (or first service). Attach it to a requestContext. Propagate it in X-Correlation-ID header to all downstream service calls. Include it in every log entry.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The microservices log thousands of events per second. When a user reports "my checkout failed at 14:32", support must search each of 5 services' logs separately — using user ID and timestamp, hoping the timestamps align.\n\nCorrelation IDs are a standard observability pattern: one UUID per request, passed in headers, included in every log line. One grep finds the entire request chain.\n\nYour mission: implement correlation ID generation, storage, and propagation.`,
    folderPath: 'src/middleware',
    primaryFile: 'correlationId.ts',
    files: [
      {
        name: 'correlationId.ts',
        lang: 'typescript',
        code: `import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// TODO: Implement correlation ID middleware.
// 1. Read X-Correlation-ID from incoming request header (if present)
// 2. Generate a new UUID if none was provided
// 3. Attach to req object: req.correlationId
// 4. Add to response header: X-Correlation-ID
// 5. Export getCorrelationId() for use in logger

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO
  next();
}

export function getCorrelationId(req: Request): string {
  return req.correlationId;
}`,
      },
      {
        name: 'logger.ts',
        lang: 'typescript',
        code: `// TODO: Wrap each log call to include correlation ID.
// log({ correlationId, level, message, ...extra })

export function createLogger(correlationId: string) {
  return {
    info: (message: string, data?: object) => {
      // TODO: include correlationId in every log entry
      console.log(JSON.stringify({ level: 'info', message, ...data }));
    },
    error: (message: string, data?: object) => {
      // TODO: include correlationId in every log entry
      console.error(JSON.stringify({ level: 'error', message, ...data }));
    },
  };
}`,
      },
    ],
    objectives: [
      {
        label: 'Read X-Correlation-ID from request headers',
        check: { type: 'contains', file: 'correlationId.ts', pattern: 'X-Correlation-ID' },
      },
      {
        label: 'Generate UUID when header is absent',
        check: { type: 'contains', file: 'correlationId.ts', pattern: 'randomUUID' },
      },
      {
        label: 'Attach correlation ID to the response header',
        check: { type: 'contains', file: 'correlationId.ts', pattern: 'res.setHeader' },
      },
      {
        label: 'Include correlationId in every log entry in logger.ts',
        check: { type: 'contains', file: 'logger.ts', pattern: 'correlationId' },
      },
    ],
    hints: [
      '`req.correlationId = req.headers["x-correlation-id"] as string || randomUUID();`',
      '`res.setHeader("X-Correlation-ID", req.correlationId);` before next()',
      'In downstream service calls: include `"X-Correlation-ID": req.correlationId` in HTTP headers.',
    ],
    totalTests: 16,
    testFramework: 'Jest + Supertest',
    xp: 360,
    successMessage: `Every log line now contains a correlation ID. A 45-minute debug session becomes a 30-second grep: "correlationId:abc-123" instantly returns all 47 log lines for that request across all 5 services.`,
  },
};

export default challenge;
