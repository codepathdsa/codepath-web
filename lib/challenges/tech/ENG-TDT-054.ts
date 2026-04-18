import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-054',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'String Template Literals Over Array Join',
  companies: ['Google', 'Amazon'],
  timeEst: '~15 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'An email template builder concatenates 50+ lines with string interpolation in a loop, creating a massive string via `+=`. In memory-constrained lambdas, this causes GC pressure. Refactor to collect parts in an array and join() at the end.',
  solution: 'Replace all `html += \`...\`` string concatenation with `parts.push(...)`. Call `parts.join("")` once at the end. For dynamic lists, use array.map().join("").',
  lang: 'TypeScript',
  tribunalData: {
    background: `The email template engine was written before the team knew about string immutability. Every \`html += "..."\` creates a new string in memory — the old one becomes garbage. Building a 500-item order confirmation creates hundreds of intermediate strings.\n\nIn AWS Lambda (128MB), this causes GC pauses mid-execution. P99 email generation latency is 800ms.\n\nYour mission: refactor to array-based string building.`,
    folderPath: 'src/email',
    primaryFile: 'templateBuilder.ts',
    files: [
      {
        name: 'templateBuilder.ts',
        lang: 'typescript',
        code: `interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
}

// TODO: Replace string concatenation with array collect + join.
export function buildOrderConfirmationEmail(order: Order): string {
  let html = '';

  html += '<!DOCTYPE html><html><body>';
  html += \`<h1>Hi \${order.customerName},</h1>\`;
  html += '<p>Thank you for your order!</p>';
  html += \`<p>Order ID: <strong>\${order.id}</strong></p>\`;
  html += '<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>';

  for (const item of order.items) {
    html += '<tr>';
    html += \`<td>\${item.name}</td>\`;
    html += \`<td>\${item.qty}</td>\`;
    html += \`<td>$\${item.price.toFixed(2)}</td>\`;
    html += '</tr>';
  }

  html += '</tbody></table>';
  html += \`<p><strong>Total: $\${order.total.toFixed(2)}</strong></p>\`;
  html += '</body></html>';

  return html;
}`,
      },
    ],
    objectives: [
      {
        label: 'Replace let html = "" with const parts: string[] = []',
        check: { type: 'contains', file: 'templateBuilder.ts', pattern: 'parts: string[]' },
      },
      {
        label: 'Use parts.push() instead of html +=',
        check: { type: 'contains', file: 'templateBuilder.ts', pattern: 'parts.push' },
      },
      {
        label: 'Return parts.join("") at the end',
        check: { type: 'contains', file: 'templateBuilder.ts', pattern: "parts.join('')" },
      },
      {
        label: 'Remove all html += concatenation',
        check: { type: 'not_contains', file: 'templateBuilder.ts', pattern: 'html +=' },
      },
    ],
    hints: [
      'Replace `let html = ""` with `const parts: string[] = []`',
      'Every `html += "..."` becomes `parts.push("...")`',
      'For the items loop: `parts.push(...order.items.map(item => \`<tr>...\`))`',
    ],
    totalTests: 8,
    testFramework: 'Jest',
    xp: 170,
    successMessage: `P99 email generation time dropped from 800ms to 40ms. Array.push is O(1) amortised, and join() allocates exactly one final string. GC pressure in Lambda is negligible.`,
  },
};

export default challenge;
