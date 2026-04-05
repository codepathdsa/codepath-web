'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ReactFlow, 
  ReactFlowProvider, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './page.module.css';

// 1. Custom Node Component
const SystemNode = ({ data }: NodeProps) => {
  return (
    <div className={styles.customNode} style={{ borderColor: data.color as string || 'var(--border-strong)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#555', width: 8, height: 8 }} />
      <div className={styles.icon}>{data.icon as string}</div>
      <div>{data.label as string}</div>
      <Handle type="source" position={Position.Right} style={{ background: '#555', width: 8, height: 8 }} />
    </div>
  );
};

const nodeTypes = {
  system: SystemNode,
};

// 2. Define Components Library
const COMPONENTS = [
  { id: 'client', label: 'Client App', icon: '📱', color: '#3b82f6' },
  { id: 'api_gw', label: 'API Gateway', icon: '🚪', color: '#8b5cf6' },
  { id: 'load_bal', label: 'Load Balancer', icon: '⚖️', color: '#6366f1' },
  { id: 'api_server', label: 'API Server', icon: '⚙️', color: '#10b981' },
  { id: 'redis', label: 'Redis Cache', icon: '⚡', color: '#ef4444' },
  { id: 'postgres', label: 'PostgreSQL', icon: '🗄️', color: '#0ea5e9' },
  { id: 'kafka', label: 'Kafka Queue', icon: '📨', color: '#f59e0b' },
];

export default function SystemDesignSimulator() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [tab, setTab] = useState<'req' | 'lib'>('lib');
  const [rules, setRules] = useState([
    { id: 'gw', text: 'Uses an API Gateway or Load Balancer entrypoint', met: false },
    { id: 'cache', text: 'Uses a fast Key-Value store (Redis) for low latency', met: false },
    { id: 'db', text: 'Persists data to disk (PostgreSQL)', met: false },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Add Edge connects nodes and triggers rule evaluation
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--accent)' } }, eds));
    },
    [setEdges],
  );

  // Rule Evaluation Engine
  useEffect(() => {
    // Re-evaluate rules based on current nodes on canvas
    const nodeTypesOnCanvas = nodes.map(n => n.data.type as string);
    const hasGw = nodeTypesOnCanvas.includes('api_gw') || nodeTypesOnCanvas.includes('load_bal');
    const hasCache = nodeTypesOnCanvas.includes('redis');
    const hasDb = nodeTypesOnCanvas.includes('postgres');

    setRules([
      { id: 'gw', text: 'Uses an API Gateway or Load Balancer entrypoint', met: hasGw },
      { id: 'cache', text: 'Uses a fast Key-Value store (Redis) for low latency', met: hasCache },
      { id: 'db', text: 'Persists data to disk (PostgreSQL)', met: hasDb },
    ]);
  }, [nodes, edges]);

  // Drag and Drop Handlers
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
        x: event.clientX - reactFlowBounds.left - 50,
        y: event.clientY - reactFlowBounds.top - 20,
      };

      const newNode = {
        id: `${component.id}-${Date.now()}`,
        type: 'system',
        position,
        data: { label: component.label, icon: component.icon, type: component.id, color: component.color },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleSubmit = () => {
    if (rules.every(r => r.met)) {
      setShowSuccess(true);
    } else {
      alert("Please satisfy all architecture requirements first.");
    }
  };

  return (
    <div className={styles.layout}>
      {/* 8.1 Global Header */}
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-primary)', fontWeight: 500 }}>
          <Link href="/challenges" style={{ color: 'var(--text-tertiary)' }}>←</Link>
          <span className="badge badge-design">ENG-512</span>
          <span>Global Rate Limiter Design</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-ghost">Save Canvas</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit Architecture</button>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* 8.2 Left Panel: Assets & Requirements */}
        <div className={styles.leftPanel}>
          <div className={styles.tabRow}>
            <button className={`${styles.tabBtn} ${tab === 'req' ? styles.active : ''}`} onClick={() => setTab('req')}>Requirements</button>
            <button className={`${styles.tabBtn} ${tab === 'lib' ? styles.active : ''}`} onClick={() => setTab('lib')}>Components</button>
          </div>
          
          <div className={styles.panelBody}>
            {tab === 'req' && (
              <div className={styles.reqList}>
                <h3>Goal</h3>
                <p>Design a distributed rate limiter to handle 100M requests per day.</p>
                <h3>Constraints</h3>
                <ul>
                  <li>Must impose extremely low latency (&lt; 5ms)</li>
                  <li>Needs a central entrypoint to direct traffic</li>
                  <li>Must persist configuration and user tiers to disk</li>
                </ul>
              </div>
            )}
            
            {tab === 'lib' && (
              <>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}>Drag nodes to canvas</div>
                {COMPONENTS.map((comp) => (
                  <div 
                    key={comp.id} 
                    className={styles.nodeType} 
                    draggable 
                    onDragStart={(e) => onDragStart(e, comp)}
                  >
                    <div className={styles.nodeTypeIcon}>{comp.icon}</div>
                    {comp.label}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 8.3 Center Canvas */}
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
              proOptions={{ hideAttribution: true }} // hide react flow watermark
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#333" />
              <Controls style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* 8.4 Right Panel: Live Evaluator */}
        <div className={styles.rightPanel}>
          <div className={styles.panelHeader}>
            Live Evaluator
          </div>
          <div className={styles.panelBody}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}>Automated Analysis</div>
            
            {rules.map((rule) => (
              <div key={rule.id} className={`${styles.evalRule} ${rule.met ? styles.met : ''}`}>
                <div className={styles.evalStatus}>{rule.met ? '✓' : ''}</div>
                <div className={styles.evalText}>{rule.text}</div>
              </div>
            ))}
            
            <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              The evaluator analyzes the graph topology in real-time. Missing nodes or incorrect edge connections will fail the criteria.
            </div>
          </div>
          <div className={styles.submitArea}>
            <button 
              className={rules.every(r => r.met) ? "btn-primary" : "btn-ghost"} 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSubmit}
            >
              {rules.every(r => r.met) ? 'Submit Architecture' : 'Incomplete Architecture'}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className={styles.successModal}>
          <div className={styles.successCard}>
            <div style={{ width: '64px', height: '64px', background: 'var(--bg-success)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>✓</div>
            <h2 className="t-heading" style={{ marginBottom: '8px' }}>Architecture Approved</h2>
            <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your system design successfully met all scaling, latency, and persistence constraints.</p>
            <div className="badge badge-active" style={{ fontSize: '16px', padding: '6px 12px', display: 'inline-flex', marginBottom: '32px' }}>+150 XP</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link href="/challenges" className="btn-primary">Return to Challenges</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
