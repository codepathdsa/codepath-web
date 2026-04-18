import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-041',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Tight Coupling → Event-Driven Architecture',
  companies: ['Confluent', 'AWS'],
  timeEst: '~40 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'UserService directly calls EmailService, AnalyticsService, and AuditService on every registration. Adding a new side-effect requires changing UserService. Decouple with an event emitter.',
  solution: 'Publish a USER_REGISTERED event after saving the user. EmailService, AnalyticsService, and AuditService subscribe to the event independently. UserService has zero knowledge of its subscribers.',
  lang: 'TypeScript',
  tribunalData: {
    background: `Every time a user registers, UserService makes 3 direct calls: sendWelcomeEmail(), trackSignupEvent(), and writeAuditLog(). When the growth team wanted to add a referral bonus on signup, they had to modify UserService — a core domain service.\n\nEvent-driven architecture decouples producers from consumers. UserService publishes an event and walks away. Anyone who cares subscribes.\n\nYour mission: decouple UserService from its side effects using an event bus.`,
    folderPath: 'src/events',
    primaryFile: 'eventBus.ts',
    files: [
      {
        name: 'eventBus.ts',
        lang: 'typescript',
        code: `// TODO: Implement a simple typed event bus.
// publish(event: AppEvent): void
// subscribe(type: string, handler: (event) => void): void
// unsubscribe(type: string, handler): void

export type AppEvent =
  | { type: 'USER_REGISTERED'; payload: { userId: string; email: string; name: string } }
  | { type: 'ORDER_PLACED'; payload: { orderId: string; userId: string; amount: number } };

export class EventBus {
  // TODO: implement
  publish(event: AppEvent): void {
    throw new Error('Not implemented');
  }

  subscribe(type: AppEvent['type'], handler: (event: AppEvent) => void): void {
    throw new Error('Not implemented');
  }
}

export const eventBus = new EventBus();`,
      },
      {
        name: 'userService.ts',
        lang: 'typescript',
        code: `import { eventBus } from './eventBus';
import { db } from '../db';

// TODO: Replace direct service calls with publishing a USER_REGISTERED event.
// Remove all imports of EmailService, AnalyticsService, AuditService from this file.
export class UserService {
  async registerUser(email: string, password: string, name: string): Promise<string> {
    const userId = await db.insertUser(email, password, name);

    // TODO: Replace these with a single eventBus.publish() call
    // await emailService.sendWelcomeEmail(userId, email, name);
    // await analyticsService.trackSignup(userId, email);
    // await auditService.log('USER_REGISTERED', userId);

    return userId;
  }
}`,
      },
      {
        name: 'handlers.ts',
        lang: 'typescript',
        code: `import { eventBus } from './eventBus';

// TODO: Subscribe each handler to USER_REGISTERED.
// Email, analytics, and audit handlers are defined here —
// UserService should have NO knowledge of these.

export function setupHandlers() {
  // TODO: eventBus.subscribe('USER_REGISTERED', async (event) => { ... })
}`,
      },
    ],
    objectives: [
      {
        label: 'Implement EventBus.publish and EventBus.subscribe',
        check: { type: 'contains', file: 'eventBus.ts', pattern: 'handlers.get' },
      },
      {
        label: 'Publish USER_REGISTERED event from UserService',
        check: { type: 'contains', file: 'userService.ts', pattern: 'USER_REGISTERED' },
      },
      {
        label: 'Subscribe handlers in handlers.ts (not in UserService)',
        check: { type: 'contains', file: 'handlers.ts', pattern: 'USER_REGISTERED' },
      },
      {
        label: 'Remove direct service calls from userService.ts',
        check: { type: 'not_contains', file: 'userService.ts', pattern: 'emailService' },
      },
    ],
    hints: [
      'EventBus internal: `private handlers = new Map<string, Set<Function>>()`',
      'publish: iterate `handlers.get(event.type)` and call each handler.',
      'Adding a referral bonus now means adding one new handler in handlers.ts — zero changes to UserService.',
    ],
    totalTests: 20,
    testFramework: 'Jest',
    xp: 420,
    successMessage: `UserService is truly decoupled. Adding a new side-effect (referral bonus, Slack notification, rate limiter update) requires zero changes to UserService. Publish once, subscribe from anywhere.`,
  },
};

export default challenge;
