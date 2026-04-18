import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-048',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Health Check Endpoint',
  companies: ['Kubernetes', 'AWS ECS'],
  timeEst: '~20 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'The API has no /health endpoint. Kubernetes marks pods as ready immediately at startup — before the DB connection pool initialises. New pods receive live traffic before they can handle it, causing 503 errors during deploys.',
  solution: 'Add a /health/live (always 200) and /health/ready (200 only when DB connected, dependencies initialised) endpoint. Configure Kubernetes liveness and readiness probes.',
  lang: 'TypeScript',
  tribunalData: {
    background: `During Kubernetes rolling deploys, new pods receive traffic 3 seconds after startup — but the DB connection pool takes 5 seconds to warm up. Result: 2 seconds of 503 errors on every deploy.\n\nKubernetes has two health probes:\n- **Liveness**: is the process alive? (restart if not)\n- **Readiness**: is the pod ready to receive traffic? (remove from load balancer if not)\n\nYour mission: implement both health check endpoints.`,
    folderPath: 'src',
    primaryFile: 'healthRoutes.ts',
    files: [
      {
        name: 'healthRoutes.ts',
        lang: 'typescript',
        code: `import { Router } from 'express';
import { db } from './db';
import { redis } from './redis';

const router = Router();

// TODO: Add two health check endpoints:
//
// GET /health/live
//   - Always returns 200 { status: 'ok' }
//   - Kubernetes uses this to decide if the process should be RESTARTED
//   - Should be fast (<5ms)
//
// GET /health/ready
//   - Returns 200 only when the service can handle traffic
//   - Check: DB connection pool is available, Redis is reachable
//   - Returns 503 with details when any dependency is down

// TODO: implement both endpoints here

export default router;`,
      },
      {
        name: 'k8s-deployment.yaml',
        lang: 'yaml',
        code: `# TODO: Add liveness and readiness probes to this K8s deployment spec.
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: api
          image: myapp:latest
          ports:
            - containerPort: 3000
          # TODO: add livenessProbe and readinessProbe here`,
      },
    ],
    objectives: [
      {
        label: 'Implement GET /health/live returning 200',
        check: { type: 'contains', file: 'healthRoutes.ts', pattern: '/health/live' },
      },
      {
        label: 'Implement GET /health/ready with DB check',
        check: { type: 'contains', file: 'healthRoutes.ts', pattern: '/health/ready' },
      },
      {
        label: 'Return 503 from /health/ready when a dependency is down',
        check: { type: 'contains', file: 'healthRoutes.ts', pattern: '503' },
      },
      {
        label: 'Configure readinessProbe in Kubernetes deployment YAML',
        check: { type: 'contains', file: 'k8s-deployment.yaml', pattern: 'readinessProbe' },
      },
    ],
    hints: [
      'Readiness check: `try { await db.query("SELECT 1"); } catch { return res.status(503).json({ status: "not ready", db: "down" }); }`',
      'Kubernetes readiness probe: `httpGet: { path: /health/ready, port: 3000 }, initialDelaySeconds: 5, periodSeconds: 5`',
      'Liveness probe: set `periodSeconds: 30, failureThreshold: 3` — only restart if down 3 times in a row.',
    ],
    totalTests: 12,
    testFramework: 'Jest + Supertest',
    xp: 250,
    successMessage: `Zero 503 errors during rolling deploys. Kubernetes keeps new pods out of the load balancer rotation until they\'re ready. The liveness probe ensures hung processes are automatically restarted.`,
  },
};

export default challenge;
