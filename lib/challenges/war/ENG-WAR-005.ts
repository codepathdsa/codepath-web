import type { Challenge } from '../types';

// ─── ENG-WAR-005 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
  };

export default challenge;
