import { Challenge } from './types';

export const techChallenges: Challenge[] = [
  {
    id: 'ENG-TDT-001',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Refactor the God Class (AuthManager)',
    companies: ['Amazon', 'Stripe'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'AuthManager.java is a 4,000-line file with a massive `switch(loginType)` for Email, Google, Apple, and SAML. Adding a new provider breaks everything.',
    solution: 'Refactor using the Strategy Design Pattern. Create an `IAuthStrategy` interface. Extract GoogleAuth, AppleAuth, etc. into their own classes. Inject the correct strategy at runtime via a Factory.'
  },
  {
    id: 'ENG-TDT-002',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Decouple Tight Database Dependencies',
    companies: ['Shopify', 'Airbnb'],
    timeEst: '~30 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Our `InvoiceService` instantiates a raw MySQL connection inside its methods. We cannot write unit tests without spinning up a real database container.',
    solution: 'Implement Dependency Injection (DI) and the Repository Pattern. Pass an `IInvoiceRepository` interface into the constructor. In tests, pass a mocked version of the interface.'
  },
  {
    id: 'ENG-TDT-003',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Break the Circular Dependency',
    companies: ['Uber', 'Doordash'],
    timeEst: '~45 min',
    level: 'Senior',
    status: 'Not Started',
    desc: '`OrderService` imports `BillingEngine` to charge the card. `BillingEngine` imports `OrderService` to update the order status to PAID. The compiler is failing due to circular imports.',
    solution: 'Untangle using an Event-Driven architecture (Pub/Sub) or by introducing a third Coordinator layer. `BillingEngine` should emit a "PaymentSucceeded" event, which `OrderService` listens to, breaking the direct import.'
  },
  {
    id: 'ENG-TDT-004',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Monolith to Microservice (Strangler Fig)',
    companies: ['Netflix', 'Atlassian'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'We have a 10-year-old Ruby on Rails monolith. We need to extract the "Search" feature into a high-performance Go microservice without downtime.',
    solution: 'Use the Strangler Fig pattern. Place an API Gateway in front of the monolith. Build the Go service. Route 1% of Search traffic to Go, 99% to Ruby. Gradually dial up to 100%, then delete the Ruby code.'
  },
  {
    id: 'ENG-TDT-005',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'React Prop Drilling Hell',
    companies: ['Meta', 'Figma'],
    timeEst: '~30 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'The `currentUser` object is passed down through 8 layers of React components just so the deep `Avatar` component can render a picture. It makes refactoring impossible.',
    solution: 'Implement a state management solution (React Context API, Redux, or Zustand) at the top of the tree. The `Avatar` component can consume the context directly, bypassing the intermediate components.'
  },
  {
    id: 'ENG-TDT-006',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Standardize the Logging Facade',
    companies: ['Datadog', 'Splunk'],
    timeEst: '~20 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'Across the codebase, developers have imported Winston, Morgan, and native `console.log` arbitrarily. We are switching to Datadog, and now we have to rewrite 500 files.',
    solution: 'Implement the Facade Pattern. Create a single `AppLogger` utility that all files import. Inside `AppLogger`, route the logs to Winston/Datadog. Future changes only require editing this one file.'
  },
  {
    id: 'ENG-TDT-007',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Unify Scattered Magic Strings',
    companies: ['Apple', 'Microsoft'],
    timeEst: '~15 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'The string "PAYMENT_PENDING" is hardcoded in 42 different files. Last week, a dev misspelled it as "PAYMNT_PENDING" and broke the checkout flow.',
    solution: 'Refactor magic strings into a centralized Enum or exported constants file. Use TypeScript Enums (`OrderStatus.PENDING`) to enforce compile-time safety across the codebase.'
  },
  {
    id: 'ENG-TDT-008',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Migrate off deprecated library',
    companies: ['Expedia', 'Booking'],
    timeEst: '~30 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'The project heavily relies on `moment.js` for dates, which is now deprecated, bloated, and causing slow page loads. We need to switch to native `Date` or `date-fns`.',
    solution: 'Create an Adapter class `DateAdapter` that mimics the old `moment` API but uses native functions under the hood. Swap out the imports, test, and gradually inline the native methods.'
  },
  {
    id: 'ENG-TDT-009',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Fix Mutable Shared State',
    companies: ['Google', 'Notion'],
    timeEst: '~25 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A global config object is imported by multiple modules. Module A changes the timeout setting to 50ms, which accidentally causes Module B to fail its 100ms API calls.',
    solution: 'Refactor the global state to be immutable. Use `Object.freeze()` or require modules to instantiate their own isolated config instances via a Factory method.'
  },
  {
    id: 'ENG-TDT-010',
    type: 'Tech Debt Tribunal',
    badgeClass: 'badge-error',
    title: 'Extract Hardcoded Cloud Providers',
    companies: ['HashiCorp', 'Snowflake'],
    timeEst: '~30 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'Our file upload service makes direct calls to the `aws-sdk` S3 library. Management just signed a massive deal with Azure, and we need to support Azure Blob Storage by Friday.',
    solution: 'Use the Adapter/Bridge pattern. Create an `IStorageService` interface (`upload()`, `download()`). Write `S3Adapter` and `AzureAdapter` implementations. Toggle them via environment variables.'
  }
];
