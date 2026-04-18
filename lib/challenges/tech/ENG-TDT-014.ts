import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-014',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Mutable Default Arguments (Python Anti-Pattern)',
  companies: ['Palantir', 'Stripe'],
  timeEst: '~15 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A Python function uses a mutable list as a default argument. State leaks between calls — a classic Python footgun that causes bizarre, intermittent bugs in production.',
  solution: 'Replace the mutable default `items=[]` with `items=None`, then set `items = items or []` as the first line of the function body.',
  lang: 'Python',
  tribunalData: {
    background: `Every Python developer hits this eventually. A function uses \`def add_item(name, items=[])\`. The list is created ONCE when the module loads — and shared across every call that doesn't explicitly pass items.\n\nResult: items accumulate across requests in a Flask app. User A's cart bleeds into User B's cart.\n\nYour mission: fix all three functions using the None sentinel pattern.`,
    folderPath: 'src/cart',
    primaryFile: 'cart.py',
    files: [
      {
        name: 'cart.py',
        lang: 'python',
        code: `# TODO: All three functions use mutable default arguments.
# This is a Python footgun — the list/dict is shared across all calls.

def add_item(name: str, items: list = []) -> list:
    items.append(name)
    return items

def build_headers(extra: dict = {}) -> dict:
    extra['Content-Type'] = 'application/json'
    return extra

def create_order(products: list = [], metadata: dict = {}) -> dict:
    return {'products': products, 'meta': metadata}`,
      },
      {
        name: 'test_cart.py',
        lang: 'python',
        readOnly: true,
        code: `from cart import add_item

def test_no_state_leak():
    cart1 = add_item('apple')
    cart2 = add_item('banana')
    # Each call with no explicit list should start fresh
    assert cart1 == ['apple'], f"Expected ['apple'], got {cart1}"
    assert cart2 == ['banana'], f"Expected ['banana'], got {cart2}"`,
      },
    ],
    objectives: [
      {
        label: 'Fix add_item — use None sentinel instead of mutable default',
        check: { type: 'not_contains', file: 'cart.py', pattern: 'items: list = []' },
      },
      {
        label: 'Fix build_headers — use None sentinel instead of mutable default',
        check: { type: 'not_contains', file: 'cart.py', pattern: 'extra: dict = {}' },
      },
      {
        label: 'Use None as the default value in all signatures',
        check: { type: 'contains', file: 'cart.py', pattern: '= None' },
      },
    ],
    hints: [
      'Change `items: list = []` to `items: list | None = None`.',
      'Add `items = items if items is not None else []` as the first line.',
      'Apply the same fix to both `extra: dict = {}` and `metadata: dict = {}`.',
    ],
    totalTests: 9,
    testFramework: 'pytest',
    xp: 160,
    successMessage: `State no longer leaks between calls. The None sentinel pattern is idiomatic Python — every experienced Python dev will immediately understand it.`,
  },
};

export default challenge;
