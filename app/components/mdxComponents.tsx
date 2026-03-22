import type { MDXComponents } from 'mdx/types';
import { CopyButton } from './CopyButton';
import Spoiler from './Spoiler';
import Quiz from './Quiz';
import Drill from './Drill';
import React from 'react';

/**
 * Extract language from a <code> element's className.
 * rehype-highlight sets className like "hljs language-python".
 */
function getLanguage(className?: string): string {
  if (!className) return '';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : '';
}

/**
 * Extract the raw text content from a React node tree.
 */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in (node as object)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return '';
}

/**
 * Styled code block — wraps <pre><code> in the .code-block shell
 * with a language label and copy button.
 */
function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  // children is the <code> element rendered by rehype-highlight
  const codeEl = React.Children.only(children) as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
  const lang = getLanguage(codeEl?.props?.className);
  const rawText = extractText(codeEl?.props?.children ?? '');

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{lang || 'code'}</span>
        <CopyButton value={rawText} />
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}

/**
 * Inline code — small pill style already defined in globals.css via `code {}`.
 * Nothing custom needed; just return as-is.
 */

/**
 * Table — applies the .complexity-table class.
 */
function Table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table className="complexity-table" {...props}>{children}</table>
    </div>
  );
}

/**
 * Blockquote — style as a neutral callout.
 */
function Blockquote({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="callout" {...props as React.HTMLAttributes<HTMLDivElement>}>
      {children}
    </div>
  );
}

/**
 * Build the full MDX component map, merging in any extra components
 * (e.g. the Premium gate) that are passed in per-page.
 */
export function buildMdxComponents(
  extras: MDXComponents = {}
): MDXComponents {
  return {
    // Code block wrapper
    pre: CodeBlock as MDXComponents['pre'],
    // Table
    table: Table as MDXComponents['table'],
    // Blockquote → callout
    blockquote: Blockquote as MDXComponents['blockquote'],
    // Explicit Spoiler component
    Spoiler: Spoiler as unknown as MDXComponents['Spoiler'],
    // Explicit Quiz component
    Quiz: Quiz as unknown as MDXComponents['Quiz'],
    // Explicit Drill component for System Design
    Drill: Drill as unknown as MDXComponents['Drill'],
    // Per-page extras (e.g. Premium)
    ...extras,
  };
}
