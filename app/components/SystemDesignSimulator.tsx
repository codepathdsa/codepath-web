'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Types ──────────────────────────────────────────────────────────────────
type BlockType = 'client' | 'compute' | 'database' | 'cache' | 'queue' | 'storage';

interface BaseNodeData extends Record<string, unknown> {
  label: string;
  type: BlockType;
  config?: Record<string, string>;
}

type AppNode = Node<BaseNodeData>;

// ── Custom Nodes ───────────────────────────────────────────────────────────
const iconMap: Record<BlockType, string> = {
  client: '📱',
  compute: '⚙️',
  database: '💾',
  cache: '⚡',
  queue: '📨',
  storage: '📦',
};

const colorMap: Record<BlockType, string> = {
  client: '#4ade80',  // green-400
  compute: '#60a5fa', // blue-400
  database: '#fb923c',// orange-400
  cache: '#facc15',   // yellow-400
  queue: '#c084fc',   // purple-400
  storage: '#94a3b8', // slate-400
};

const CustomNodeComponent = ({ data, selected }: { data: BaseNodeData; selected: boolean }) => {
  return (
    <div style={{
      padding: '10px 15px',
      borderRadius: '8px',
      background: '#1A202C', // dark Gray
      color: '#fff',
      border: `2px solid ${selected ? '#63b3ed' : colorMap[data.type] || '#555'}`,
      boxShadow: selected ? '0 0 0 2px rgba(99, 179, 237, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '120px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <span style={{ fontSize: '18px' }}>{iconMap[data.type]}</span>
      <span style={{ fontWeight: 'bold' }}>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = { custom: CustomNodeComponent };

// ── Sidebar (Drag source) ──────────────────────────────────────────────────
const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: BlockType, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const blocks: { type: BlockType; label: string }[] = [
    { type: 'client', label: 'Client (Web/Mobile)' },
    { type: 'compute', label: 'API / Server' },
    { type: 'database', label: 'Database (SQL/NoSQL)' },
    { type: 'cache', label: 'Cache (Redis)' },
    { type: 'queue', label: 'Message Queue' },
    { type: 'storage', label: 'Object Storage' },
  ];

  return (
    <aside style={{ width: '250px', background: '#0B0C10', borderRight: '1px solid #2D3748', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ color: '#E2E8F0', marginTop: 0, marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>Components</h3>
      <p style={{ color: '#A0AEC0', fontSize: '12px', marginBottom: '15px' }}>Drag and drop to canvas</p>
      {blocks.map((b) => (
        <div
          key={b.type}
          onDragStart={(event) => onDragStart(event, b.type, b.label)}
          draggable
          style={{
            padding: '10px',
            border: `1px solid ${colorMap[b.type]}`,
            borderRadius: '6px',
            background: '#1A202C',
            color: '#E2E8F0',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <span>{iconMap[b.type]}</span>
          {b.label}
        </div>
      ))}
    </aside>
  );
};

// ── Config Panel (Right) ───────────────────────────────────────────────────
const ConfigPanel = ({ selectedNode, updateNodeLabel }: { selectedNode: AppNode | null, updateNodeLabel: (id: string, newLabel: string) => void }) => {
  if (!selectedNode) {
    return (
      <aside style={{ width: '300px', background: '#0B0C10', borderLeft: '1px solid #2D3748', padding: '20px', color: '#A0AEC0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Select a node to configure
      </aside>
    );
  }

  return (
    <aside style={{ width: '300px', background: '#0B0C10', borderLeft: '1px solid #2D3748', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h3 style={{ color: '#E2E8F0', marginTop: 0, marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>Configuration</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ color: '#A0AEC0', fontSize: '12px', fontWeight: 'bold' }}>Node Name</label>
        <input 
          type="text" 
          value={selectedNode.data.label} 
          onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
          style={{
            background: '#1A202C',
            border: '1px solid #4A5568',
            color: '#E2E8F0',
            padding: '8px 12px',
            borderRadius: '4px',
            outline: 'none',
          }}
        />
      </div>
      
      <div style={{ padding: '15px', background: '#2D374840', borderRadius: '6px', marginTop: 'auto', border: '1px solid #4A556840' }}>
         <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E0' }}>
           Type: <strong>{selectedNode.data.type}</strong>
         </p>
         <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#A0AEC0' }}>
           ID: {selectedNode.id}
         </p>
      </div>
    </aside>
  );
};

// ── Rule Evaluation Engine ──────────────────────────────────────────────────
// Very basic JSON rule engine implementation
const ruleEngineJSON = {
  "required_nodes": ["client", "compute", "database"],
  "forbidden_connections": [
    {"from": "client", "to": "database", "error": "Clients cannot talk directly to the Database. Use an API/Server."}
  ],
  "upstream_requirements": [
    {"node": "database", "requires_upstream": "compute", "error": "Database must be accessed by an API / Server."}
  ]
};

const evaluateArchitecture = (nodes: AppNode[], edges: Edge[]) => {
  let errors: string[] = [];
  
  // Rule 1: Required nodes
  const nodeTypesPresent = new Set(nodes.map(n => n.data.type));
  ruleEngineJSON.required_nodes.forEach(req => {
    if (!nodeTypesPresent.has(req as BlockType)) {
      errors.push(`Missing required component type: ${req}`);
    }
  });

  // Rule 2: Forbidden connections
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    ruleEngineJSON.forbidden_connections.forEach(rule => {
      if (sourceNode.data.type === rule.from && targetNode.data.type === rule.to) {
        errors.push(rule.error);
      }
    });
  });

  // Rule 3: Upstream requirements
  ruleEngineJSON.upstream_requirements.forEach(rule => {
    const targetNodes = nodes.filter(n => n.data.type === rule.node);
    targetNodes.forEach(target => {
      // Find all edges pointing to this target
      const incomingEdges = edges.filter(e => e.target === target.id);
      const incomingNodes = incomingEdges.map(e => nodes.find(n => n.id === e.source)).filter(Boolean) as AppNode[];
      
      const hasRequiredUpstream = incomingNodes.some(n => n.data.type === rule.requires_upstream);
      if (!hasRequiredUpstream && incomingNodes.length > 0) {
        errors.push(`Node '${target.data.label}' failed requirement: ${rule.error}`);
      }
    });
  });

  return errors;
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function SystemDesignSimulator() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', messages: string[]} | null>(null);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#CBD5E0', strokeWidth: 2 } }, eds));
    setFeedback(null);
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setFeedback(null);

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const dragDataStr = event.dataTransfer.getData('application/reactflow');
      
      if (!dragDataStr || !reactFlowBounds || !reactFlowInstance) return;

      let dragData;
      try { dragData = JSON.parse(dragDataStr); } catch(e) { return; }
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AppNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position,
        data: { label: dragData.label, type: dragData.type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, label: newLabel } };
        }
        return n;
      })
    );
  };

  const onSelectionChange = ({ nodes }: { nodes: AppNode[] }) => {
    if (nodes.length === 1) {
      setSelectedNodeId(nodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  };

  const attemptEvaluation = () => {
    if (nodes.length === 0) {
      setFeedback({ type: 'error', messages: ["Architecture is empty. Add some components."] });
      return;
    }
    
    // Evaluate logic
    const errors = evaluateArchitecture(nodes, edges);
    if (errors.length > 0) {
      setFeedback({ type: 'error', messages: errors });
    } else {
      setFeedback({ type: 'success', messages: ["Success! Architecture Approved!"] });
      // TODO: confetti
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: '600px', fontFamily: 'sans-serif' }}>
      
      {/* Header / Evaluate Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#0B0C10', borderBottom: '1px solid #2D3748' }}>
        <h2 style={{ margin: 0, color: '#E2E8F0', fontSize: '18px', fontWeight: 'bold' }}>System Design Sandbox</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {feedback && (
            <div style={{ color: feedback.type === 'success' ? '#4ade80' : '#f87171', fontSize: '14px', fontWeight: 'bold' }}>
              {feedback.type === 'success' ? '✓ Passed' : '⚠ Failed Rules'}
            </div>
          )}
          <button
            onClick={attemptEvaluation}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#4ade80',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#62de61'}
            onMouseOut={(e) => e.currentTarget.style.background = '#4ade80'}
          >
            Evaluate Design
          </button>
        </div>
      </div>

      {feedback && feedback.type === 'error' && (
        <div style={{ background: '#7f1d1d80', color: '#fca5a5', padding: '10px 20px', borderBottom: '1px solid #991b1b', fontSize: '14px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {feedback.messages.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      {feedback && feedback.type === 'success' && (
        <div style={{ background: '#14532d80', color: '#86efac', padding: '10px 20px', borderBottom: '1px solid #166534', fontSize: '14px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>🎉 {feedback.messages[0]}</p>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ReactFlowProvider>
          <Sidebar />
          
          <div style={{ flex: 1, position: 'relative', background: '#0F111A' }} ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange as any}
              nodeTypes={nodeTypes}
              fitView
              colorMode="dark"
            >
              <Background gap={20} color="#2D3748" />
              <Controls showInteractive={false} style={{ fill: '#E2E8F0', color: '#E2E8F0' }} />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  const nodeType = n.data?.type as BlockType;
                  return colorMap[nodeType] || '#555';
                }}
                nodeColor="#1A202C"
                maskColor="rgba(11, 12, 16, 0.7)"
              />
            </ReactFlow>
          </div>

          <ConfigPanel selectedNode={selectedNode} updateNodeLabel={updateNodeLabel} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
