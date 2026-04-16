'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ReactFlow, ReactFlowProvider, Controls, Background, 
  useNodesState, useEdgesState, addEdge, Connection, Edge, Handle, Position, NodeProps, BackgroundVariant, useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './page.module.css';
import { CHALLENGES } from '@/lib/challenges';
import { 
  Activity, Database, Server, Smartphone, Key, Share2, Layers, HardDrive, 
  Globe, Cpu, Cloud, Hexagon, Network, Antenna, 
  MapPin, Bell, Shield, BookOpen, Clock, ChevronDown, ChevronRight
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'Client Traffic': <Smartphone size={16} color="#a1a1aa" />,
  'Load Balancer': <Layers size={16} color="#60a5fa" />,
  'API Gateway': <Share2 size={16} color="#c084fc" />,
  'API Server': <Server size={16} color="#34d399" />,
  'Worker Node': <Cpu size={16} color="#34d399" />,
  
  // Data stores
  'PostgreSQL': <Database size={16} color="#38bdf8" />,
  'MySQL': <Database size={16} color="#38bdf8" />,
  'Cassandra': <Database size={16} color="#a855f7" />,
  'DynamoDB': <Hexagon size={16} color="#f97316" />,
  'S3 Bucket': <Cloud size={16} color="#f59e0b" />,
  'Redis Cache': <Activity size={16} color="#fb7185" />,
  
  // Queues & streams
  'Kafka Queue': <HardDrive size={16} color="#fbbf24" />,
  
  // Advanced services
  'CDN Edge': <Globe size={16} color="#2dd4bf" />,
  'Zookeeper': <Network size={16} color="#818cf8" />,
  'Bloom Filter': <Key size={16} color="#f43f5e" />,
  'WebSocket Gateway': <Antenna size={16} color="#ec4899" />,
  'Geohash Service': <MapPin size={16} color="#14b8a6" />,
  'APNS/FCM': <Bell size={16} color="#eab308" />,
  'Rate Limiter': <Shield size={16} color="#ef4444" />,
  'Trie Server': <BookOpen size={16} color="#8b5cf6" />,
  'Aggregator Server': <Clock size={16} color="#64748b" />,
  // Aliases for renamed labels in COMPONENT_GROUPS
  'Kafka': <HardDrive size={16} color="#fbbf24" />,
  'Aggregator': <Clock size={16} color="#64748b" />,
  'APNS / FCM': <Bell size={16} color="#eab308" />,
};

// 1. Custom Node Component
const SystemNode = ({ id, data }: NodeProps) => {
  const { setNodes, setEdges } = useReactFlow();
  const isError = !!data.errorMsg;
  const isClient = data.type === 'client' || data.label === 'Client Traffic';

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isClient) onDelete(e);
  };

  return (
    <div 
      className={`${styles.customNode} ${isError ? styles.nodeError : ''}`} 
      style={{ borderColor: isError ? '#ef4444' : (data.color as string || '#3f3f46') }}
      onContextMenu={onContextMenu}
    >
      {!isClient && (
        <button className={styles.nodeDeleteBtn} onClick={onDelete} title="Delete node">
          ×
        </button>
      )}
      <Handle type="target" position={Position.Left} style={{ background: '#555', width: 8, height: 8 }} />
      <div className={styles.nodeHeader}>
        <div className={styles.icon}>{iconMap[String(data.label)] || <Server size={16} />}</div>
        <div className={styles.nodeTypeText}>
           <div className={styles.nodeLabel}>{data.label ? String(data.label) : ''}</div>
           {data.subLabel ? <div className={styles.nodeSub}>{String(data.subLabel)}</div> : null}
        </div>
      </div>
      
      {Array.isArray(data.stats) && data.stats.length > 0 && (
         <div className={styles.nodeStats}>
            {(data.stats as any[]).map((st, i) => (
              <div key={i} className={styles.statRow}>
                 <span>{st.name}</span>
                 <span style={{ color: st.alert ? '#ef4444' : '#a1a1aa'}}>{st.val}</span>
              </div>
            ))}
         </div>
      )}

      {isError && (
        <>
          <div className={styles.errorIcon}>!</div>
          <div className={styles.errorTooltip}>{String(data.errorMsg)}</div>
        </>
      )}

      <Handle type="source" position={Position.Right} style={{ background: '#555', width: 8, height: 8 }} />
    </div>
  );
};

const nodeTypes = {
  system: SystemNode,
};

// Inner component rendered inside ReactFlowProvider so it can call useReactFlow().
// This is required to get screenToFlowPosition(), which correctly accounts for
// canvas zoom and pan — the old manual (clientX - bounds.left) approach does not.
interface FlowCanvasProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onDragOver: (e: React.DragEvent) => void;
  nodeTypes: typeof nodeTypes;
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  showHint: boolean;
}

function FlowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragOver, nodeTypes, setNodes, showHint }: FlowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentDataStr = event.dataTransfer.getData('application/reactflow');
      if (!componentDataStr) return;

      const component = JSON.parse(componentDataStr);
      // screenToFlowPosition converts viewport (screen) coords to canvas coords,
      // correctly handling any zoom level and pan offset.
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const newNode = {
        id: `${component.id}-${Date.now()}`,
        type: 'system',
        position,
        data: { label: component.label, subLabel: component.subLabel, color: component.color, type: component.id },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <>
      {showHint && (
        <div className={styles.canvasHint}>
          <div style={{ fontSize: '30px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7', marginBottom: '6px' }}>Design your architecture</div>
          <div style={{ fontSize: '12px', color: '#52525b', lineHeight: 1.7, maxWidth: '280px', textAlign: 'center' }}>
            Drag components from the left panel · Connect them by drawing from a node handle · Hit Start Simulation to validate
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
        <Controls style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} />
      </ReactFlow>
    </>
  );
}

const COMPONENT_GROUPS = [
  {
    label: 'Compute & Network',
    items: [
      { id: 'load_balancer',     label: 'Load Balancer',      subLabel: 'Distribute traffic',     color: '#60a5fa', tip: 'Routes traffic across multiple servers. Prevents any single server becoming a bottleneck.' },
      { id: 'api_gateway',       label: 'API Gateway',        subLabel: 'Entry point / auth',      color: '#c084fc', tip: 'Single entry point. Handles auth, rate limiting, routing. Stateless — scales infinitely.' },
      { id: 'api_server',        label: 'API Server',         subLabel: 'Business logic',          color: '#34d399', tip: 'Stateless compute. Handles requests, calls downstream services. Scale horizontally.' },
      { id: 'worker',            label: 'Worker Node',        subLabel: 'Async processing',        color: '#34d399', tip: 'Consumes jobs from a queue. Decouples slow work (email, thumbnails) from the request path.' },
      { id: 'cdn',               label: 'CDN Edge',           subLabel: 'Global cache',            color: '#2dd4bf', tip: 'Serves static assets from 200+ edge locations. Cuts origin load and latency by 80-90%.' },
      { id: 'websocket_gateway', label: 'WebSocket Gateway',  subLabel: 'Persistent connections',  color: '#ec4899', tip: 'Maintains long-lived connections for real-time push (chat, live scores, notifications).' },
    ],
  },
  {
    label: 'Data Stores',
    items: [
      { id: 'postgres',  label: 'PostgreSQL', subLabel: 'Relational DB',   color: '#38bdf8', tip: 'ACID transactions, joins, complex queries. Great up to ~5k write RPS. Shard at scale.' },
      { id: 'mysql',     label: 'MySQL',      subLabel: 'Relational DB',   color: '#38bdf8', tip: 'Battle-tested relational DB. Many companies run it at massive scale with careful sharding.' },
      { id: 'cassandra', label: 'Cassandra',  subLabel: 'Wide-Column DB',  color: '#a855f7', tip: 'Scales to millions of writes/sec. No joins. Best for time-series, event logs, key-value.' },
      { id: 'dynamo',    label: 'DynamoDB',   subLabel: 'NoSQL / Managed', color: '#f97316', tip: 'AWS managed key-value + document. Single-digit ms latency at any scale.' },
      { id: 's3',        label: 'S3 Bucket',  subLabel: 'Object storage',  color: '#f59e0b', tip: 'Unlimited cheap object storage. Blobs, images, backups, Parquet. 11 nines durability.' },
    ],
  },
  {
    label: 'Queues & Cache',
    items: [
      { id: 'redis',     label: 'Redis Cache', subLabel: 'In-memory store', color: '#fb7185', tip: 'Sub-ms reads. Use for caching DB results, sessions, rate-limiting counters, pub/sub.' },
      { id: 'kafka',     label: 'Kafka',       subLabel: 'Event stream',    color: '#fbbf24', tip: 'Durable, ordered event log. Millions of events/sec. Multiple consumers replay independently.' },
      { id: 'zookeeper', label: 'Zookeeper',   subLabel: 'Coordination',    color: '#818cf8', tip: 'Distributed consensus: leader election, distributed locks, service discovery.' },
    ],
  },
  {
    label: 'Specialized',
    items: [
      { id: 'bloom_filter',      label: 'Bloom Filter',    subLabel: 'Probabilistic set',  color: '#f43f5e', tip: 'O(1) membership check — ~1% false-positive rate. Zero false negatives.' },
      { id: 'rate_limiter',      label: 'Rate Limiter',    subLabel: 'Throttling',         color: '#ef4444', tip: 'Token bucket or sliding window. Prevents API abuse. Redis stores the counters.' },
      { id: 'geohash_service',   label: 'Geohash Service', subLabel: 'Geospatial index',   color: '#14b8a6', tip: 'Encodes lat/lng into a string prefix. Nearby points share a prefix for fast radius queries.' },
      { id: 'trie_server',       label: 'Trie Server',     subLabel: 'Prefix search',      color: '#8b5cf6', tip: 'In-memory prefix tree for autocomplete. O(k) lookup where k = query length.' },
      { id: 'apns_fcm',          label: 'APNS / FCM',      subLabel: 'Push notifications', color: '#eab308', tip: "Apple/Google push gateways. Your server calls them; they deliver to the user's device." },
      { id: 'aggregator_server', label: 'Aggregator',      subLabel: 'Batch / roll-up',    color: '#64748b', tip: 'Batches high-freq writes (view counts) and flushes periodically to cut write amplification.' },
    ],
  },
];

// Flat list for drag operations
const COMPONENTS = COMPONENT_GROUPS.flatMap(g => g.items);

type SimStatus = 'IDLE' | 'RAMPING' | 'FAILING' | 'SOLVED';

interface LogLine {
  id: number;
  time: string;
  msg: string;
  category: 'info' | 'warn' | 'fatal' | 'ok' | 'default';
}

export default function SystemDesignSimulator() {
  const params = useParams();
  const challengeId = params.id as string;
  const challenge = CHALLENGES.find(c => c.id === challengeId) ?? CHALLENGES.find(c => c.type === 'System Design');

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([
    { id: 'client-1', type: 'system', position: { x: 50, y: 250 }, data: { label: 'Client Traffic', subLabel: '11,000 req/s', color: '#52525b' } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Simulation State
  const [status, setStatus] = useState<SimStatus>('IDLE');
  const [simLevelIdx, setSimLevelIdx] = useState(-1);
  const [traffic, setTraffic] = useState(0);
  const [successRate, setSuccessRate] = useState(100);
  const [latency, setLatency] = useState(45);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [timer, setTimer] = useState(0);
  const [rightTab, setRightTab] = useState<'brief' | 'questions' | 'solution'>('brief');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
  const [levelToast, setLevelToast] = useState<string | null>(null);
  const [compSearch, setCompSearch] = useState('');

  const addLog = useCallback((msg: string, category: LogLine['category'] = 'default') => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      time: new Date().toISOString().split('T')[1].substring(0, 8),
      msg,
      category
    }]);
  }, []);

  // Timer — runs while simulation is active
  useEffect(() => {
    if (status === 'IDLE') return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#71717a', strokeWidth: 2 } }, eds));
    },
    [setEdges],
  );

  const onDragStart = (event: React.DragEvent, component: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Simulation Engine Effect
  useEffect(() => {


    const simConfig = challenge?.simulation;
    if (!simConfig || status === 'IDLE') return;

    let timer: NodeJS.Timeout;

    // Topology Evaluator Helper
    const evaluateTopology = () => {
      const typeMap = new Map();
      nodes.forEach(n => typeMap.set(n.id, n.data.type || 'client'));
      const graph = new Map<string, Set<string>>();
      edges.forEach(e => {
        const src = typeMap.get(e.source);
        const tgt = typeMap.get(e.target);
        if (!graph.has(src)) graph.set(src, new Set());
        graph.get(src)!.add(tgt);
      });
      return { typeMap, graph };
    };

    const runChecks = (checks: any[], graph: Map<string, Set<string>>) => {
      for (const check of checks) {
        if (check.type === 'hasPath') {
          if (!graph.has(check.source)) return false;
          const q = [check.source];
          const v = new Set();
          let found = false;
          while (q.length > 0) {
            const n = q.shift() as string;
            if (n === check.target) { found = true; break; }
            if (v.has(n)) continue;
            v.add(n);
            graph.get(n)?.forEach(t => q.push(t));
          }
          if (!found) return false;
        } else if (check.type === 'hasEdge') {
          if (!graph.get(check.source)?.has(check.target)) return false;
        } else if (check.type === 'hasNode') {
          if (!graph.has(check.source)) return false;
        }
      }
      return true;
    };

    if (status === 'RAMPING') {
      timer = setTimeout(() => {
        const nextIdx = simLevelIdx + 1;
        const { graph } = evaluateTopology();

        if (nextIdx >= simConfig.levels.length) {
            setStatus('SOLVED');
            return;
        }

        const level = simConfig.levels[nextIdx];
        
        if (nextIdx === 0) {
            addLog(`>> Initializing simulation engine...`, 'default');
        }

        if (!runChecks(level.checks, graph)) {
            setStatus('FAILING');
        } else {
            addLog(`>> [SYS_OK] Target reached.`, 'ok');
            addLog(`>> ${level.successMsg}`, 'info');
            setTraffic(level.traffic);
            setLatency(level.targetLatency);
            setSimLevelIdx(nextIdx);
            // Level advancement toast
            const isLast = nextIdx + 1 >= simConfig.levels.length;
            setLevelToast(isLast
              ? `✓ All ${simConfig.levels.length} levels cleared — unlock Solution!`
              : `Level ${nextIdx + 1} cleared · ramping to ${simConfig.levels[nextIdx + 1]?.traffic?.toLocaleString()} RPS`);
            setTimeout(() => setLevelToast(null), 2800);
        }
      }, 2000);
    } else if (status === 'FAILING') {
       const failLevel = simConfig.levels[simLevelIdx + 1] || simConfig.levels[0];
       
       addLog(`>> [FATAL] Node Failure.`, 'fatal');
       addLog(`>> ${failLevel.failMsg}`, 'fatal');
       setSuccessRate(62.4);
       setLatency(3402);
       
       // Mutate target node to show error
       if (failLevel.failNode) {
           setNodes(nds => nds.map(n => {
             if (n.data.type === failLevel.failNode || (failLevel.failNode === 'client' && n.id.includes('client'))) {
                return {
                   ...n,
                   data: {
                      ...n.data,
                      errorMsg: failLevel.failTooltip,
                      stats: [
                         { name: 'CPU', val: '99%', alert: true }, { name: 'Health', val: 'FAILING', alert: true }
                      ]
                   }
                };
             }
             return n;
           }));
       }
       
       // Make edges red and dashed
       setEdges(eds => eds.map(e => {
          return { ...e, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, animated: true };
       }));
       
    } else if (status === 'SOLVED') {
       addLog(`>> [SYS_OK] All traffic levels handled. Architecture validated.`, 'ok');
       addLog(`>> Unlock the Solution tab for the reference architecture.`, 'ok');
       setSuccessRate(100);
       setLatency(42);
       
       setNodes(nds => nds.map(n => {
         if (n.data.type === 'cassandra' || n.data.type === 'postgres' || n.data.type === 'dynamo') {
            return { ...n, data: { ...n.data, errorMsg: null, stats: [{ name: 'CPU', val: '15%' }, { name: 'Disk IOPS', val: '1.2k/s' }] } };
         }
         if (n.data.type === 'redis') {
            return { ...n, data: { ...n.data, stats: [{ name: 'Hit Rate', val: '94%' }, { name: 'Latency', val: '1ms' }] } };
         }
         return { ...n, data: { ...n.data, errorMsg: null } };
       }));
       
       setEdges(eds => eds.map(e => {
          return { ...e, style: { stroke: '#34d399', strokeWidth: 2 }, animated: true };
       }));
    }

    return () => clearTimeout(timer);
  }, [status, traffic, nodes.length, edges.length, challenge, simLevelIdx]);

  // Watch for connection fixes during failure to recover dynamically
  useEffect(() => {
     const simConfig = challenge?.simulation;
     if (status === 'FAILING' && simConfig) {
        const failIdx = simLevelIdx + 1;
        const level = simConfig.levels[failIdx];
        if (!level) return;

        const typeMap = new Map();
        nodes.forEach(n => typeMap.set(n.id, n.data.type || 'client'));
        const graph = new Map<string, Set<string>>();
        edges.forEach(e => {
           const src = typeMap.get(e.source);
           const tgt = typeMap.get(e.target);
           if (!graph.has(src)) graph.set(src, new Set());
           graph.get(src)!.add(tgt);
        });

        const runChecks = (checks: any[], graph: Map<string, Set<string>>) => {
           for (const check of checks) {
             if (check.type === 'hasPath') {
               if (!graph.has(check.source)) return false;
               const q = [check.source];
               const v = new Set();
               let found = false;
               while (q.length > 0) {
                 const n = q.shift() as string;
                 if (n === check.target) { found = true; break; }
                 if (v.has(n)) continue;
                 v.add(n);
                 graph.get(n)?.forEach(t => q.push(t));
               }
               if (!found) return false;
             } else if (check.type === 'hasEdge') {
               if (!graph.get(check.source)?.has(check.target)) return false;
             } else if (check.type === 'hasNode') {
               if (!graph.has(check.source)) return false;
             }
           }
           return true;
        };

        if (runChecks(level.checks, graph)) {
           // Fixed! Restore edges and resume ramping
           setEdges(eds => eds.map(e => ({ ...e, style: { stroke: '#71717a', strokeWidth: 2, strokeDasharray: 'none' } })));
           setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, errorMsg: null, stats: undefined } })));
           setStatus('RAMPING');
           setSuccessRate(100);
        }
     }
  }, [nodes, edges, status, simLevelIdx, challenge]);

  const handleToggleSim = () => {
     if (status === 'IDLE') {
        setStatus('RAMPING');
        setSimLevelIdx(-1);
        setTraffic(0);
        setTimer(0);
        setLogs([]);
        addLog('>> Simulation engine initializing...', 'default');
        addLog(`>> Challenge: ${challenge?.title}`, 'default');
        addLog(`>> Traffic levels to handle: ${challenge?.simulation?.levels?.length ?? 0}`, 'default');
     } else {
        setStatus('IDLE');
        setTraffic(0);
        setSuccessRate(100);
        setLatency(0);
        setLevelToast(null);
        setNodes(nds => nds.map(n => ({...n, data: {...n.data, errorMsg: null, stats: undefined}})));
        setEdges(eds => eds.map(e => ({...e, style: { stroke: '#71717a', strokeWidth: 2}, animated: false})));
     }
  };

  const simLevels = challenge?.simulation?.levels ?? [];
  const isSolved = status === 'SOLVED';

  // Filter component palette by search query
  const filteredGroups = compSearch.trim() === ''
    ? COMPONENT_GROUPS
    : (() => {
        const q = compSearch.toLowerCase();
        return COMPONENT_GROUPS
          .map(g => ({ ...g, items: g.items.filter(c => c.label.toLowerCase().includes(q) || c.subLabel.toLowerCase().includes(q)) }))
          .filter(g => g.items.length > 0);
      })();

  return (
    <div className={styles.layout}>
      {/* Level advancement toast */}
      {levelToast && (
        <div className={styles.levelToast}>{levelToast}</div>
      )}

      {/* Top Bar */}
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/challenges" style={{ color: '#71717a', textDecoration: 'none', fontSize: '18px' }}>←</Link>
          <div style={{ width: 1, height: 20, background: '#27272a' }} />
          <span className="badge" style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>SYSTEM DESIGN</span>
          <span style={{ color: '#f4f4f5', fontWeight: 600, fontSize: '14px' }}>{challenge?.title || 'Design a System'}</span>
          {challenge?.companies?.map(c => (
            <span key={c} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#18181b', color: '#71717a', border: '1px solid #27272a' }}>{c}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Level progress dots */}
          {simLevels.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#3f3f46', fontFamily: 'var(--font-mono)' }}>TRAFFIC LEVEL</span>
              {simLevels.map((_, i) => (
                <div key={i} className={`${styles.levelDot} ${
                  isSolved ? styles.levelDotDone :
                  i < simLevelIdx ? styles.levelDotDone :
                  i === simLevelIdx && status === 'FAILING' ? styles.levelDotFail :
                  i === simLevelIdx ? styles.levelDotActive : ''
                }`} />
              ))}
              <span style={{ fontSize: '11px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>
                {isSolved ? 'SOLVED ✓' : simLevelIdx >= 0 ? `${simLevelIdx + 1}/${simLevels.length}` : `—/${simLevels.length}`}
              </span>
            </div>
          )}
          {status !== 'IDLE' && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#52525b', letterSpacing: '0.05em' }}>{formatTime(timer)}</span>
          )}
          {status !== 'IDLE' && (
            <button className="btn" style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#ef4444', fontSize: '12px', padding: '5px 12px' }} onClick={handleToggleSim}>
              ■ Stop
            </button>
          )}
          {status === 'IDLE' && (
            <button className="btn-primary" style={{ fontSize: '13px', padding: '6px 16px' }} onClick={handleToggleSim}>▶ Start Simulation</button>
          )}
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.mainRow}>
           {/* Left Panel — Component Palette */}
           <div className={styles.leftPanel}>
             {/* Pinned: constraints */}
             <div className={styles.panelHeader}>CONSTRAINTS</div>
             <div style={{ paddingBottom: '12px', borderBottom: '1px solid #27272a', marginBottom: '4px' }}>
                {(challenge?.simulation?.constraints ?? [{ label: 'Target Load', value: '10k RPS' }]).map((c, i) => (
                   <div key={i} className={styles.constraintRow}><span>{c.label}</span><span>{c.value}</span></div>
                ))}
             </div>

             {/* Pinned: search box */}
             <div className={styles.compSearchWrap}>
               <input
                 className={styles.compSearch}
                 type="text"
                 placeholder="Search components…"
                 value={compSearch}
                 onChange={e => setCompSearch(e.target.value)}
                 spellCheck={false}
               />
               {compSearch && (
                 <button className={styles.compSearchClear} onClick={() => setCompSearch('')} title="Clear">×</button>
               )}
             </div>

             {/* Scrollable: component groups */}
             <div className={styles.leftPanelScroll}>
               {filteredGroups.length === 0 && (
                 <div style={{ padding: '20px 16px', fontSize: '12px', color: '#3f3f46', textAlign: 'center' }}>No components match</div>
               )}
               {filteredGroups.map(group => (
                 <div key={group.label}>
                   {compSearch.trim() === '' && <div className={styles.panelGroupLabel}>{group.label}</div>}
                   {group.items.map(comp => (
                     <div key={comp.id} className={styles.nodeType} draggable onDragStart={(e) => onDragStart(e, comp)} title={comp.tip}>
                       <div className={styles.nodeTypeIcon} style={{ color: comp.color }}>
                          {iconMap[comp.label] || <Server size={16} />}
                       </div>
                       <div className={styles.nodeTypeText}>
                          <span className={styles.nodeTypeLabel}>{comp.label}</span>
                          <span className={styles.nodeTypeSub}>{comp.subLabel}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ))}
             </div>
             <div className={styles.leftPanelHint}>
               Drag to canvas · Hover node for <strong style={{ color: '#52525b' }}>×</strong> to delete · Draw from handle to connect
             </div>
           </div>

           {/* Canvas panel — ReactFlowProvider must wrap FlowCanvas so that
               useReactFlow() (needed for screenToFlowPosition) is accessible */}
           <div className={styles.canvasPanel}>
             <ReactFlowProvider>
               <FlowCanvas
                 nodes={nodes}
                 edges={edges}
                 onNodesChange={onNodesChange}
                 onEdgesChange={onEdgesChange}
                 onConnect={onConnect}
                 onDragOver={onDragOver}
                 nodeTypes={nodeTypes}
                 setNodes={setNodes}
                 showHint={status === 'IDLE' && edges.length === 0}
               />
             </ReactFlowProvider>
           </div>

           {/* Right Info Panel */}
           <div className={styles.rightPanel}>
             <div className={styles.rightTabBar}>
               <button className={`${styles.rightTabBtn} ${rightTab === 'brief' ? styles.rightTabActive : ''}`} onClick={() => setRightTab('brief')}>
                 📋 Brief
               </button>
               <button className={`${styles.rightTabBtn} ${rightTab === 'questions' ? styles.rightTabActive : ''}`} onClick={() => setRightTab('questions')}>
                 💬 Q&amp;A
               </button>
               <button className={`${styles.rightTabBtn} ${rightTab === 'solution' ? styles.rightTabActive : ''}`} onClick={() => setRightTab('solution')}>
                 {isSolved ? '✅ Solution' : '🔒 Solution'}
               </button>
             </div>

             {/* Brief tab */}
             {rightTab === 'brief' && (
               <div className={styles.rightTabContent}>
                 <div className={styles.incidentBanner}>
                   <div className={styles.incidentTop}>
                     <span className={styles.incidentBadge}>🚨 INCIDENT</span>
                     <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                       {challenge?.companies?.map(c => (
                         <span key={c} className={styles.incidentCo}>{c}</span>
                       ))}
                     </div>
                   </div>
                   <p className={styles.incidentBody}>
                     {challenge?.realWorldContext || challenge?.desc}
                   </p>
                   <div className={styles.incidentAssign}>
                     <span style={{ color: '#52525b' }}>📥 Assigned to:</span>
                     <span style={{ color: '#62de61', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>You — {challenge?.level} Engineer</span>
                   </div>
                 </div>

                 {challenge?.desc && challenge?.realWorldContext && (
                   <>
                     <div className={styles.rightSectionLabel}>YOUR TASK</div>
                     <div className={styles.taskBox}>
                       <p style={{ margin: 0, fontSize: '13px', color: '#d4d4d8', lineHeight: 1.6 }}>{challenge.desc}</p>
                     </div>
                   </>
                 )}

                 <div className={styles.rightSectionLabel}>SCALE LEVELS</div>
                 {simLevels.map((lv, i) => (
                   <div key={i} className={`${styles.levelRow} ${
                     isSolved ? styles.levelRowDone :
                     i < simLevelIdx ? styles.levelRowDone :
                     i === simLevelIdx && status === 'FAILING' ? styles.levelRowFail :
                     i === simLevelIdx ? styles.levelRowActive : ''
                   }`}>
                     <span className={styles.levelRowNum}>{i + 1}</span>
                     <div>
                       <div style={{ fontSize: '12px', fontWeight: 600, color: '#e4e4e7', fontFamily: 'var(--font-mono)' }}>{lv.traffic.toLocaleString()} RPS</div>
                       <div style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>Target: &lt;{lv.targetLatency}ms</div>
                     </div>
                     {(isSolved || i < simLevelIdx) && <span style={{ marginLeft: 'auto', color: '#62de61', fontSize: '13px' }}>✓</span>}
                     {i === simLevelIdx && status === 'FAILING' && <span style={{ marginLeft: 'auto', color: '#ef4444', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>FAIL</span>}
                     {i === simLevelIdx && status === 'RAMPING' && <span style={{ marginLeft: 'auto', color: '#fbbf24', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>LIVE</span>}
                   </div>
                 ))}
               </div>
             )}

             {/* Q&A tab */}
             {rightTab === 'questions' && (
               <div className={styles.rightTabContent}>
                 <div className={styles.questionsIntro}>
                   Work through these after building your diagram. Interviewers ask all of them.
                 </div>
                 {(challenge?.questions ?? []).map((q, i) => (
                   <div key={i} className={styles.questionBlock}>
                     <button
                       className={styles.questionToggle}
                       onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                     >
                       <span style={{ color: '#62de61', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, marginRight: '8px', flexShrink: 0 }}>Q{i+1}</span>
                       <span style={{ flex: 1, textAlign: 'left', fontSize: '12px' }}>{q.q}</span>
                       {expandedQ === i ? <ChevronDown size={13} color="#52525b" /> : <ChevronRight size={13} color="#52525b" />}
                     </button>
                     {expandedQ === i && (
                       <div className={styles.questionBody}>
                         <div className={styles.hintBox}>💡 {q.hint}</div>
                         {!revealedAnswers.includes(i) ? (
                           <button className={styles.revealBtn} onClick={() => setRevealedAnswers(prev => [...prev, i])}>
                             Reveal answer
                           </button>
                         ) : (
                           <div className={styles.answerBox}>{q.answer}</div>
                         )}
                       </div>
                     )}
                   </div>
                 ))}
                 {(challenge?.questions ?? []).length === 0 && (
                   <div style={{ padding: '32px 16px', fontSize: '13px', color: '#3f3f46', textAlign: 'center' }}>
                     No interview questions for this challenge yet.
                   </div>
                 )}
               </div>
             )}

             {/* Solution tab */}
             {rightTab === 'solution' && (
               <div className={styles.rightTabContent}>
                 {!isSolved ? (
                   <div className={styles.solutionLock}>
                     <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔒</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7', marginBottom: '6px' }}>Solution Locked</div>
                     <p style={{ fontSize: '12px', color: '#52525b', lineHeight: 1.7, maxWidth: '210px', textAlign: 'center', margin: '0' }}>
                       Pass all traffic levels in the simulation to unlock the reference architecture.
                     </p>
                     <button className="btn-primary" style={{ marginTop: '20px', fontSize: '12px', padding: '6px 16px' }} onClick={() => setRightTab('brief')}>
                       ← Back to Brief
                     </button>
                   </div>
                 ) : (
                   <div style={{ padding: '0 16px 24px' }}>
                     <div className={styles.solvedBanner}>✓ Architecture Validated</div>
                     <div className={styles.rightSectionLabel}>REFERENCE APPROACH</div>
                     <div className={styles.solutionText}>{challenge?.solution}</div>
                     {challenge?.whyItMatters && (
                       <>
                         <div className={styles.rightSectionLabel}>WHY IT MATTERS</div>
                         <div className={styles.solutionText}>{challenge.whyItMatters}</div>
                       </>
                     )}
                     {challenge?.approach && (
                       <>
                         <div className={styles.rightSectionLabel}>DEEP DIVE</div>
                         <div className={styles.solutionText}>{challenge.approach}</div>
                       </>
                     )}
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>

        {/* Bottom Simulation Dashboard */}
        <div className={styles.bottomPanel}>
           <div className={styles.consoleLog}>
              {logs.map(log => (
                 <div key={log.id} className={styles.logLine}>
                    {/* <span className={styles.logTime}>[{log.time}]</span> */}
                    <span className={
                       log.category === 'info' ? styles.logInfo :
                       log.category === 'warn' ? styles.logWarn :
                       log.category === 'fatal' ? styles.logFatal :
                       log.category === 'ok' ? styles.logOk : styles.logDefault
                    }>{log.msg}</span>
                 </div>
              ))}
           </div>
           
           <div className={styles.metricsPanel}>
              <div style={{ display: 'flex', gap: '16px' }}>
                 <div className={styles.metricWidget} style={{ flex: 1 }}>
                    <div className={styles.metricLabel}>GLOBAL SUCCESS RATE</div>
                    <div className={`${styles.metricValue} ${successRate < 99 ? styles.metricFail : styles.metricSuccess}`}>
                       {successRate.toFixed(1)}%
                    </div>
                 </div>
                 
                 <div className={styles.metricWidget} style={{ flex: 1 }}>
                    <div className={styles.metricLabel}>P99 LATENCY</div>
                    <div className={`${styles.metricValue} ${latency > 200 ? styles.metricFail : styles.metricWarn}`}>
                       {latency.toLocaleString()}<span className={styles.metricUnit}>ms</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#71717a' }}>Target: &lt; 200ms</div>
                 </div>
              </div>
              
              <div className={styles.progressBarWrapper}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#71717a', fontWeight: 'bold' }}>
                    <span>TOTAL RPS INGESTED</span>
                    <span>{traffic.toLocaleString()} / 11,000</span>
                 </div>
                 <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${(traffic / 11000) * 100}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
