import type { Challenge } from '../types';

// ─── ENG-WAR-047 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-047',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Cardinality Explosion Kills Prometheus',
            companies: ['Grafana', 'SoundCloud'],
              timeEst: '~25 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `SoundCloud created Prometheus and documented early production incidents with metric cardinality. A common issue: adding a user_id label to a metric. Instead of 1 time series per metric, you now have 10 million time series (one per user). Prometheus's memory usage explodes, it falls behind on scraping, and eventually OOM-kills. Grafana Cloud's engineering blog documents this as the #1 Prometheus production incident.`,
                      desc: `A developer added a label user_id to a request latency metric: http_request_duration_seconds{user_id="...", endpoint="/api/orders"}. With 5 million users, this created 5 million × 50 endpoints = 250 million time series in Prometheus. Prometheus memory usage jumped from 4GB to 60GB in 2 hours. Prometheus is now OOM-killing, losing all scraped data. Grafana dashboards show gaps.`,
                        solution: `Immediately remove the high-cardinality user_id label from the metric definition and redeploy the instrumented service. Prometheus will stop receiving the cardinality explosion on next scrape. The existing high-cardinality series will be gradually garbage-collected as they go stale (default: 5 minutes). Add cardinality guards: use recording rules to pre-aggregate, and use metric_relabel_configs to drop high-cardinality labels at the scraper level.`,
                          explanation: `Prometheus cardinality: each unique combination of label values = one time series. High-cardinality labels (user_id, request_id, session_id, IP address) create millions of series. Rule of thumb: any label value with unbounded or high cardinality (> 100 unique values) should never be a label. What to do instead: record per-user metrics in a database (PostgreSQL, ClickHouse) for user-level analytics. Prometheus is for system-level (per-service, per-endpoint, per-status-code) metrics. Detection: use prometheus TSDB analyzer or Grafana's cardinality browser to find offending metrics.`,
                            options: [
                              { label: 'A', title: 'Scale Prometheus to a larger server with 256GB RAM', sub: 'Migrate to r5.8xlarge (256GB) + attach 2TB EBS volume', isCorrect: false },
                              { label: 'B', title: 'Remove the high-cardinality user_id label; add cardinality guards in relabeling config', sub: 'Remove user_id label from metric; add metric_relabel_configs: action: drop for high-cardinality labels', isCorrect: true },
                              { label: 'C', title: 'Switch from Prometheus to InfluxDB which handles high cardinality better', sub: 'Migrate to InfluxDB Cloud for better cardinality support', isCorrect: false },
                              { label: 'D', title: 'Increase Prometheus retention period to avoid frequent reloads', sub: 'prometheus: --storage.tsdb.retention.time=90d', isCorrect: false },
                            ]
  };

export default challenge;
