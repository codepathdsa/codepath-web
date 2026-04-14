'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Globe, Cpu, Zap, Cloud, Hexagon, Network, Antenna, 
  MapPin, Bell, Shield, BookOpen, Clock
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

const COMPONENTS = [
  // Compute & Network
  { id: 'load_balancer', label: 'Load Balancer', subLabel: 'Networking', color: '#60a5fa' },
  { id: 'api_server', label: 'API Server', subLabel: 'Compute', color: '#34d399' },
  { id: 'worker', label: 'Worker Node', subLabel: 'Async Compute', color: '#34d399' },
  { id: 'cdn', label: 'CDN Edge', subLabel: 'Caching', color: '#2dd4bf' },
  { id: 'websocket_gateway', label: 'WebSocket Gateway', subLabel: 'Real-time', color: '#ec4899' },
  
  // Data Stores
  { id: 'postgres', label: 'PostgreSQL', subLabel: 'Relational DB', color: '#38bdf8' },
  { id: 'mysql', label: 'MySQL', subLabel: 'Relational DB', color: '#38bdf8' },
  { id: 'cassandra', label: 'Cassandra', subLabel: 'Wide-Column DB', color: '#a855f7' },
  { id: 'dynamo', label: 'DynamoDB', subLabel: 'NoSQL DB', color: '#f97316' },
  { id: 's3', label: 'S3 Bucket', subLabel: 'Object Store', color: '#f59e0b' },
  
  // Queues & Cache
  { id: 'redis', label: 'Redis Cache', subLabel: 'Key-Value Memory', color: '#fb7185' },
  { id: 'kafka', label: 'Kafka Queue', subLabel: 'Event Stream', color: '#fbbf24' },
  { id: 'zookeeper', label: 'Zookeeper', subLabel: 'Consensus', color: '#818cf8' },
  
  // Specialized Services
  { id: 'bloom_filter', label: 'Bloom Filter', subLabel: 'Probabilistic', color: '#f43f5e' },
  { id: 'geohash_service', label: 'Geohash Service', subLabel: 'Geospatial', color: '#14b8a6' },
  { id: 'apns_fcm', label: 'APNS/FCM', subLabel: 'Push Service', color: '#eab308' },
  { id: 'rate_limiter', label: 'Rate Limiter', subLabel: 'Protection', color: '#ef4444' },
  { id: 'trie_server', label: 'Trie Server', subLabel: 'Autocomplete', color: '#8b5cf6' },
  { id: 'aggregator_server', label: 'Aggregator Server', subLabel: 'Batching', color: '#64748b' },
];

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

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
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

  const addLog = useCallback((msg: string, category: LogLine['category'] = 'default') => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      time: new Date().toISOString().split('T')[1].substring(0, 8),
      msg,
      category
    }]);
  }, []);

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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const componentDataStr = event.dataTransfer.getData('application/reactflow');
      if (!componentDataStr || !reactFlowBounds) return;

      const component = JSON.parse(componentDataStr);
      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const newNode = {
        id: `${component.id}-${Date.now()}`,
        type: 'system',
        position,
        data: { label: component.label, subLabel: component.subLabel, color: component.color, type: component.id },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

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
       addLog(`>> [SYS_OK] Redis Cache absorbing 9,000 read queries/sec.`, 'ok');
       addLog(`>> Architecture sequence validated.`, 'ok');
       setSuccessRate(100);
       setLatency(42);
       
       setNodes(nds => nds.map(n => {
         if (n.data.type === 'postgres') {
            return { ...n, data: { ...n.data, errorMsg: null, stats: [{ name: 'CPU', val: '15%' }, { name: 'Disk IOPS', val: '1.2k/sec' }] } };
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
        setLogs([]);
        addLog('Starting simulation initialization...', 'default');
     } else {
        setStatus('IDLE');
        setTraffic(0);
        setSuccessRate(100);
        setLatency(0);
        setNodes(nds => nds.map(n => ({...n, data: {...n.data, errorMsg: null, stats: undefined}})));
        setEdges(eds => eds.map(e => ({...e, style: { stroke: '#71717a', strokeWidth: 2}})));
     }
  };

  return (
    <div className={styles.layout}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f4f5', fontWeight: 500, fontSize: '14px' }}>
          <Link href="/challenges" style={{ color: '#a1a1aa', textDecoration: 'none' }}>←</Link>
          <span style={{ color: '#71717a', margin: '0 8px' }}>|</span>
          <span style={{ color: '#a1a1aa' }}>{challenge?.level} /</span>
          <span>{challenge?.title || 'Design a System'}</span>
          <span className="badge" style={{ background: '#2563eb', color: '#fff', fontSize: '10px', marginLeft: '8px' }}>SIMULATION</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {status !== 'IDLE' && (
            <button className="btn" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }} onClick={handleToggleSim}>
               ■ STOP TRAFFIC
            </button>
          )}
          {status === 'IDLE' && (
            <button className="btn-primary" onClick={handleToggleSim}>▶ Start Simulation</button>
          )}
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.mainRow}>
           {/* Left Panel */}
           <div className={styles.leftPanel}>
             <div className={styles.panelHeader}>CONSTRAINTS</div>
             <div style={{ paddingBottom: '16px', borderBottom: '1px solid #27272a', marginBottom: '8px' }}>
                {challenge?.simulation?.constraints?.map((constraint, i) => (
                   <div key={i} className={styles.constraintRow}><span>{constraint.label}:</span><span>{constraint.value}</span></div>
                )) || (
                   <div className={styles.constraintRow}>
                     <span>Target Load:</span><span>10k RPS</span>
                   </div>
                )}
             </div>

             <div className={styles.panelHeader}>COMPONENTS</div>
             <div>
               {COMPONENTS.map((comp) => (
                 <div key={comp.id} className={styles.nodeType} draggable onDragStart={(e) => onDragStart(e, comp)}>
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
           </div>

           {/* Canvas panel */}
           <div className={styles.canvasPanel} ref={reactFlowWrapper}>
             <ReactFlowProvider>
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
                 <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#3f3f46" />
                 <Controls style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} />
               </ReactFlow>
             </ReactFlowProvider>
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
