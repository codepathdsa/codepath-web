'use client';

import { useState, useCallback } from 'react';

// -- Types ------------------------------------------------------------------
export interface TreeNode {
  id: string;
  label: string;
  /** 'start' | 'end' | 'step' | 'decision' | 'loop' | 'return' */
  type?: 'start' | 'end' | 'step' | 'decision' | 'loop' | 'return';
  detail?: string;
  complexity?: string;
  children?: TreeNode[];
  /** For decision nodes: label for the true branch */
  yesLabel?: string;
  /** For decision nodes: label for the false branch */
  noLabel?: string;
}

interface VisualTreeProps {
  /** Title shown above the tree */
  title?: string;
  /** The root node of the tree — can be passed as object or as treeJson string */
  tree?: TreeNode | TreeNode[];
  /** JSON string of the tree — easier to use from MDX */
  treeJson?: string;
  /** Optional complexity summary shown at the bottom */
  complexity?: { time?: string; space?: string };
  /** JSON string of complexity — easier from MDX */
  complexityJson?: string;
}

// -- Icons per node type ---------------------------------------------------
const TYPE_META: Record<string, { icon: string; cls: string; label: string }> = {
  start:    { icon: '🚀', cls: 'vt-node--start',    label: 'START'    },
  end:      { icon: '🏁', cls: 'vt-node--end',      label: 'END'      },
  step:     { icon: '▶',  cls: 'vt-node--step',     label: 'STEP'     },
  decision: { icon: '⬡',  cls: 'vt-node--decision', label: 'DECISION' },
  loop:     { icon: '🔁', cls: 'vt-node--loop',     label: 'LOOP'     },
  return:   { icon: '↩',  cls: 'vt-node--return',   label: 'RETURN'   },
};

// -- Single node renderer --------------------------------------------------
function Node({
  node,
  depth = 0,
  activeId,
  onActivate,
}: {
  node: TreeNode;
  depth?: number;
  activeId: string | null;
  onActivate: (id: string | null) => void;
}) {
  // Guard against undefined/null nodes (can happen with trailing commas in MDX)
  if (!node || typeof node !== 'object') return null;

  const type = node.type ?? 'step';
  const meta = TYPE_META[type] ?? TYPE_META.step;
  const isActive = activeId === node.id;
  // Filter out any undefined entries that might come from MDX trailing commas
  const children = (node.children ?? []).filter(Boolean);
  const hasChildren = children.length > 0;
  const isDecision = type === 'decision';

  return (
    <div className={`vt-row vt-row--depth-${Math.min(depth, 4)}`}>
      {/* Connector line from parent */}
      {depth > 0 && <div className="vt-connector" />}

      {/* The node box */}
      <button
        className={`vt-node ${meta.cls}${isActive ? ' vt-node--active' : ''}`}
        onClick={() => onActivate(isActive ? null : node.id)}
        aria-expanded={isActive}
        title={node.detail ?? node.label}
      >
        <span className="vt-node-icon">{meta.icon}</span>
        <span className="vt-node-label">{node.label}</span>
        {node.complexity && (
          <span className="vt-node-complexity">{node.complexity}</span>
        )}
        {hasChildren && (
          <span className="vt-chevron">{isActive ? '▲' : '▼'}</span>
        )}
      </button>

      {/* Expanded detail popover */}
      {isActive && node.detail && (
        <div className="vt-detail">
          <span className="vt-detail-tag">{meta.label}</span>
          <p>{node.detail}</p>
        </div>
      )}

      {/* Children (branching) */}
      {hasChildren && (
        <div className={`vt-children${isDecision ? ' vt-children--split' : ''}`}>
          {isDecision && node.yesLabel && (
            <span className="vt-branch-label vt-branch-label--yes">✓ {node.yesLabel}</span>
          )}
          {isDecision && node.noLabel && (
            <span className="vt-branch-label vt-branch-label--no">✗ {node.noLabel}</span>
          )}
          {children.map((child) => (
            <Node
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onActivate={onActivate}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// -- Main component --------------------------------------------------------
export default function VisualTree({ title = 'Algorithm Walkthrough', tree, treeJson, complexity, complexityJson }: VisualTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Support both direct object prop and JSON string prop (for MDX compatibility)
  const resolvedTree: TreeNode | TreeNode[] | undefined = tree ?? (treeJson ? JSON.parse(treeJson) : undefined);
  const resolvedComplexity = complexity ?? (complexityJson ? JSON.parse(complexityJson) : undefined);

  const roots: TreeNode[] = resolvedTree
    ? (Array.isArray(resolvedTree) ? resolvedTree : [resolvedTree]).filter(Boolean)
    : [];

  const handleActivate = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  return (
    <div className="visual-tree-widget">
      {/* Header */}
      <div className="vt-header">
        <div className="vt-header-left">
          <span className="vt-header-icon">🌳</span>
          <span className="vt-header-title">{title}</span>
        </div>
        <span className="vt-header-hint">Click any node to expand</span>
      </div>

      {/* Legend */}
      <div className="vt-legend">
        {Object.entries(TYPE_META).map(([key, m]) => (
          <span key={key} className={`vt-legend-item ${m.cls}`}>
            {m.icon} {m.label}
          </span>
        ))}
      </div>

      {/* Tree body */}
      <div className="vt-body">
        {roots.map((node) => (
          <Node
            key={node.id}
            node={node}
            depth={0}
            activeId={activeId}
            onActivate={handleActivate}
          />
        ))}
      </div>

      {/* Complexity summary */}
      {resolvedComplexity && (
        <div className="vt-complexity-bar">
          {resolvedComplexity.time && (
            <span className="vt-complexity-pill">
              ⏱ Time: <strong>{resolvedComplexity.time}</strong>
            </span>
          )}
          {resolvedComplexity.space && (
            <span className="vt-complexity-pill">
              💾 Space: <strong>{resolvedComplexity.space}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
