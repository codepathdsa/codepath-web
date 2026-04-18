import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-031',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Job Scheduler (Cron-as-a-Service)',
  companies: ['AWS', 'Cloudflare', 'Temporal'],
  timeEst: '~45 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a distributed job scheduler that runs user-defined jobs at specific times or intervals. ' +
    'Support cron expressions (every 5 minutes), one-time scheduled jobs, retry on failure, ' +
    'and 10M scheduled jobs across 1000 tenants. Each job must fire within 5 seconds of its scheduled time.',
  solution:
    'A polling-based scheduler: a cluster of workers poll a DB for jobs due in the next 30 seconds. ' +
    'Jobs are claimed atomically (SELECT FOR UPDATE SKIP LOCKED) to prevent double-execution. ' +
    'Completed/failed jobs are updated with status and next_run_at computed from the cron expression. ' +
    'A leader election (Redis lock) picks one master scheduler that distributes work to workers.',

  simulation: {
    constraints: [
      { label: 'Scheduled jobs', value: '10M' },
      { label: 'Jobs firing/sec', value: '~170 (10M / 86400 sec avg)' },
      { label: 'Peak jobs/sec', value: '50,000 (many jobs at :00)' },
      { label: 'Scheduling accuracy', value: '< 5 sec of scheduled time' },
      { label: 'Retry policy', value: 'Exponential backoff, max 5 retries' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 5000,
        successMsg: 'Job scheduler running — cron jobs firing on schedule.',
        failMsg: '[FATAL] Jobs not executing. Add a scheduler that polls for due jobs.',
        failNode: 'api_server',
        failTooltip:
          'Schema: jobs(id, cron_expression, next_run_at, status, handler_url). ' +
          'Scheduler polls: SELECT * FROM jobs WHERE next_run_at <= NOW() AND status = \'pending\'. ' +
          'Execute job, update: status = \'running\'. On completion: compute next_run_at, reset to \'pending\'.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 1000,
        successMsg: 'Distributed workers preventing double-execution via SELECT FOR UPDATE SKIP LOCKED.',
        failMsg:
          '[DOUBLE EXECUTION] Two workers picked up the same job simultaneously. ' +
          'Use SELECT FOR UPDATE SKIP LOCKED for atomic job claiming.',
        failNode: 'postgres',
        failTooltip:
          'SKIP LOCKED: if a row is locked by another transaction, skip it — try the next row. ' +
          'This is a PostgreSQL-native job queue pattern. ' +
          'Prevents two workers from claiming the same job without explicit locking overhead.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'worker', target: 'kafka' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 500,
        successMsg: 'SYSTEM STABLE — 50k jobs/sec at the top of the hour, accurate within 2 sec.',
        failMsg:
          '[MISSED JOBS] Many jobs scheduled at 10:00:00 are running at 10:01:30 (90 sec late). ' +
          'Shard the polling across multiple workers by job_id range.',
        failNode: 'worker',
        failTooltip:
          'Worker sharding: worker 1 handles job_ids ending in 0-3, worker 2 handles 4-7, etc. ' +
          'Each worker polls only its shard. 8 workers → 8x polling throughput. ' +
          'No single-worker bottleneck at peak load.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'worker', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you compute the next_run_at for a job with cron expression "0 */4 * * *" (every 4 hours)?',
      hint: 'Cron parsing library.',
      answer:
        'Use a cron parsing library (e.g., node-cron, croniter in Python). ' +
        'After a job completes, call: next_run_at = cronParser.getNextTime(cron_expression, lastRunAt). ' +
        'Store next_run_at as a UTC timestamp in Postgres. ' +
        'Indexed column: CREATE INDEX ON jobs (next_run_at) WHERE status = \'pending\'. ' +
        'The scheduler\'s polling query is fast: range scan on an indexed timestamp.',
    },
    {
      q: 'A job fails with an exception. How do you implement exponential backoff retries?',
      hint: 'next_run_at = now + delay where delay grows exponentially.',
      answer:
        'On failure: increment retry_count, compute next_run_at with exponential backoff: ' +
        'delay = min(2^retry_count * baseDelay, maxDelay). ' +
        'Example: retry 1 → 30s, retry 2 → 60s, retry 3 → 120s, retry 4 → 240s, retry 5 → 480s. ' +
        'After maxRetries, set status = \'dead\' and alert the job owner. ' +
        'Add jitter to the delay to prevent thundering herd (many failed jobs retrying simultaneously).',
    },
    {
      q: 'How do you prevent a single long-running job from blocking the worker forever?',
      hint: 'Job timeout.',
      answer:
        'Set a job_timeout per job (configurable, default 60 seconds). ' +
        'When a worker claims a job, it sets claimed_until = NOW() + job_timeout. ' +
        'A watchdog process scans for jobs where status = \'running\' AND claimed_until < NOW(). ' +
        'Those jobs are reset to \'pending\' (stale worker crashed). ' +
        'For the running job itself, use a language-level timeout (promise.race, setTimeout).',
    },
    {
      q: 'How would you design job fan-out — a parent job that spawns 1000 child jobs?',
      hint: 'Workflow orchestration.',
      answer:
        'Parent job completes → emits 1000 child job records to the jobs table. ' +
        'Track: jobs(id, parent_id, status). ' +
        'Parent status aggregation: the parent is "complete" when all children complete. ' +
        'A completion check query: SELECT COUNT(*) FROM jobs WHERE parent_id = X AND status != \'completed\'. ' +
        'For complex multi-step workflows, use a dedicated orchestration system (Temporal, AWS Step Functions) ' +
        'instead of building this in the scheduler.',
    },
  ],
};

export default challenge;
