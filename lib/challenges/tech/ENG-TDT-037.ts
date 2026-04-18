import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-037',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Polling → Server-Sent Events',
  companies: ['Linear', 'Asana'],
  timeEst: '~35 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A task management app polls the server every 2 seconds to check for updates. With 50,000 users, this generates 1.5M requests/minute. Replace the polling loop with Server-Sent Events (SSE).',
  solution: 'Create a GET /events SSE endpoint that sends Connection: keep-alive and Content-Type: text/event-stream. Push events when tasks change. On the client, use EventSource instead of setInterval.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The task board refreshes by polling GET /tasks every 2 seconds. At 50,000 concurrent users, that's 1.5M requests/minute — most returning "no changes."\n\nServer-Sent Events (SSE) is a browser-native push mechanism over HTTP. The server holds the connection open and pushes data when it has something to say. Clients get real-time updates without polling.\n\nYour mission: replace polling with SSE on both server and client.`,
    folderPath: 'src/realtime',
    primaryFile: 'sseServer.ts',
    files: [
      {
        name: 'sseServer.ts',
        lang: 'typescript',
        code: `import { Router, Request, Response } from 'express';

// TODO: Implement SSE endpoint.
// GET /events
// Headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
// Send events as: "data: {json}\\n\\n"
// Clean up on client disconnect: res.on('close', ...)

const clients = new Set<Response>();

export const sseRouter = Router();

sseRouter.get('/events', (req: Request, res: Response) => {
  // TODO: implement SSE connection setup
  res.status(200).end();
});

// Called by other services when a task changes
export function broadcastTaskUpdate(task: object) {
  // TODO: send to all connected clients
}`,
      },
      {
        name: 'taskClient.ts',
        lang: 'typescript',
        code: `// TODO: Replace polling with EventSource (SSE).
// Current: polls every 2 seconds
// Goal: open one SSE connection, handle incoming events

// CURRENT POLLING (replace this):
let pollingInterval: ReturnType<typeof setInterval>;

export function startPolling(onUpdate: (task: object) => void) {
  pollingInterval = setInterval(async () => {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    onUpdate(tasks);
  }, 2000);
}

export function stopPolling() {
  clearInterval(pollingInterval);
}`,
      },
    ],
    objectives: [
      {
        label: 'Set Content-Type: text/event-stream header in SSE endpoint',
        check: { type: 'contains', file: 'sseServer.ts', pattern: 'text/event-stream' },
      },
      {
        label: 'Track connected clients and clean up on disconnect',
        check: { type: 'contains', file: 'sseServer.ts', pattern: "res.on('close'" },
      },
      {
        label: 'Implement broadcastTaskUpdate to push to all clients',
        check: { type: 'contains', file: 'sseServer.ts', pattern: 'clients.forEach' },
      },
      {
        label: 'Replace setInterval polling with EventSource in taskClient.ts',
        check: { type: 'contains', file: 'taskClient.ts', pattern: 'EventSource' },
      },
    ],
    hints: [
      'SSE format: `res.write(\`data: \${JSON.stringify(payload)}\\n\\n\`)`',
      'Add `res.flushHeaders()` immediately after setting headers to flush the HTTP handshake.',
      'Client: `const source = new EventSource("/api/events"); source.onmessage = (e) => onUpdate(JSON.parse(e.data));`',
    ],
    totalTests: 18,
    testFramework: 'Jest + Supertest',
    xp: 400,
    successMessage: `1.5M polling requests/minute → 50,000 long-lived SSE connections. Server load dropped 96%. Task updates are now instantaneous instead of up to 2 seconds delayed. Cost decreased by 94%.`,
  },
};

export default challenge;
