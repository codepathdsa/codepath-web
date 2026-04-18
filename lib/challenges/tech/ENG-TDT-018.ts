import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-018',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Mutable Shared State in Concurrent Workers',
  companies: ['Uber', 'DoorDash'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A Python Flask app uses a module-level dict as a shared cache. Under concurrent requests (Gunicorn 4 workers), the cache corrupts silently. Fix it with a proper cache abstraction backed by Redis.',
  solution: 'Remove the module-level dict. Create a Cache class that wraps redis.Redis with get/set/delete methods. Replace all direct dict accesses with the Cache class. The cache is process-isolated.',
  lang: 'Python',
  tribunalData: {
    background: `The promo code validation service uses a simple Python dict as an in-memory cache. It worked great in development with a single process.\n\nAfter deploying with Gunicorn (4 workers), each worker has its own copy of the dict. Codes marked "used" in worker 1 are still "unused" in worker 3 — causing double-spend bugs worth $8k/week.\n\nYour mission: replace the in-process dict with a Redis-backed cache abstraction.`,
    folderPath: 'src/promo',
    primaryFile: 'cache.py',
    files: [
      {
        name: 'cache.py',
        lang: 'python',
        code: `# TODO: Replace this in-process dict with a Redis-backed cache.
# The dict is NOT shared between Gunicorn workers.

_used_codes: dict[str, bool] = {}

def mark_used(code: str) -> None:
    _used_codes[code] = True

def is_used(code: str) -> bool:
    return _used_codes.get(code, False)

def clear(code: str) -> None:
    _used_codes.pop(code, None)`,
      },
      {
        name: 'promo_service.py',
        lang: 'python',
        readOnly: true,
        code: `from cache import mark_used, is_used

def apply_promo(code: str, user_id: str) -> dict:
    if is_used(code):
        return {'error': 'Code already used'}
    # ... validate and apply discount ...
    mark_used(code)
    return {'discount': 0.20}`,
      },
      {
        name: 'redis_client.py',
        lang: 'python',
        readOnly: true,
        code: `import redis
import os

redis_client = redis.Redis.from_url(
    os.environ.get('REDIS_URL', 'redis://localhost:6379'),
    decode_responses=True
)`,
      },
    ],
    objectives: [
      {
        label: 'Remove the module-level _used_codes dict',
        check: { type: 'not_contains', file: 'cache.py', pattern: '_used_codes' },
      },
      {
        label: 'Use Redis for mark_used and is_used',
        check: { type: 'contains', file: 'cache.py', pattern: 'redis' },
      },
      {
        label: 'Set a TTL on Redis keys to avoid unbounded growth',
        check: { type: 'contains', file: 'cache.py', pattern: 'ex=' },
      },
    ],
    hints: [
      'Import `redis_client` from redis_client.py.',
      '`redis_client.set(code, "1", ex=86400)` stores the key with a 24h TTL.',
      '`redis_client.exists(code)` returns 1 if the key exists, 0 otherwise.',
    ],
    totalTests: 16,
    testFramework: 'pytest + fakeredis',
    xp: 280,
    successMessage: `Promo codes are now validated against a shared Redis store across all Gunicorn workers. The double-spend bug is eliminated. TTL prevents the keyspace from growing unboundedly.`,
  },
};

export default challenge;
