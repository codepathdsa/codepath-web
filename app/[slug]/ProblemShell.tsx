'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import NotesPanel from '@/app/components/NotesPanel';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// -- Types ------------------------------------------------------------------
interface ProblemMeta {
  title: string;
  difficulty?: string;
  topics?: string[];
  companies?: string[];
  acceptance?: string;
  readTime?: string;
  approaches?: number;
  leetcode_url?: string;
}

interface ProblemShellProps {
  slug: string;
  meta: ProblemMeta;
  isAuthenticated: boolean;
  question: React.ReactNode;
  solution: React.ReactNode;
  hint: React.ReactNode;
  visualTree?: React.ReactNode;
  starterCode?: string;
}

// -- Language registry ------------------------------------------------------
const LANGS: Record<string, { label: string; ext: string; monacoId: string }> = {
  python:     { label: 'Python',     ext: '.py',   monacoId: 'python'     },
  javascript: { label: 'JavaScript', ext: '.js',   monacoId: 'javascript' },
  typescript: { label: 'TypeScript', ext: '.ts',   monacoId: 'typescript' },
  go:         { label: 'Go',         ext: '.go',   monacoId: 'go'         },
  java:       { label: 'Java',       ext: '.java', monacoId: 'java'       },
  cpp:        { label: 'C++',        ext: '.cpp',  monacoId: 'cpp'        },
};

const TEMPLATES: Record<string, string> = {
  python: `class Solution:
    def solve(self, nums: List[int]) -> int:
        pass
`,
  javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function solve(nums) {
    // TODO: implement
    return 0;
}

console.log(solve([1, 2, 3]));
`,
  typescript: `function solve(nums: number[]): number {
    // TODO: implement
    return 0;
}

console.log(solve([1, 2, 3]));
`,
  go: `package main

import "fmt"

func solve(nums []int) int {
	// TODO: implement
	return 0
}

func main() {
	fmt.Println(solve([]int{1, 2, 3}))
}
`,
  java: `class Solution {
    public int solve(int[] nums) {
        return 0;
    }
}
`,
  cpp: `class Solution {
public:
    int solve(vector<int>& nums) {
        return 0;
    }
};
`,
};

type Panel = 'read' | 'visualize' | 'notes';

// SVG Icons
const Icons = {
  Question: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Solution: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>,
  Notes: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
};

const NAV_ITEMS: { id: Panel; icon: React.ReactNode; label: string }[] = [
  { id: 'read',      icon: Icons.Question, label: 'Question'  },
  { id: 'visualize', icon: Icons.Solution, label: 'Solution'   },
  { id: 'notes',     icon: Icons.Notes,    label: 'Notes'    },
];

const DIFF_MAP: Record<string, { label: string; bg: string; text: string }> = {
  easy:   { label: 'Easy',   bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
  medium: { label: 'Medium', bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
  hard:   { label: 'Hard',   bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' },
};

export default function ProblemShell({
  slug, meta, isAuthenticated, question, solution, hint, visualTree, starterCode,
}: ProblemShellProps) {
  const [panel, setPanel] = useState<Panel>('read');
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(starterCode ?? TEMPLATES.python);
  const [output, setOutput] = useState('');
  const [outputOpen, setOutputOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const pyLoaded = useRef(false);
  const tsLoaded = useRef(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('cp_progress') ?? '{}');
      if (s[slug]?.v === 1) setSolved(true);
    } catch {}
  }, [slug]);

  const toggleSolved = () => setSolved(p => {
    const next = !p;
    try {
      const s = JSON.parse(localStorage.getItem('cp_progress') ?? '{}');
      s[slug] = next ? { v: 1, t: Date.now() } : {};
      localStorage.setItem('cp_progress', JSON.stringify(s));
    } catch {}
    return next;
  });

  const switchLang = useCallback((l: string) => {
    setLang(l);
    setCode(TEMPLATES[l] ?? '');
    setOutput('');
    setOutputOpen(false);
  }, []);

  useEffect(() => {
    if (lang === 'python' && !pyLoaded.current) {
      pyLoaded.current = true;
      if (!document.getElementById('_pyodide')) {
        const s = document.createElement('script');
        s.id = '_pyodide';
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js';
        s.async = true;
        document.head.appendChild(s);
      }
    }
  }, [lang]);

  // Helper: run JS string in a sandboxed iframe, capture console output.
  // SECURITY: sandbox='allow-scripts' (no allow-same-origin) prevents user code from
  // accessing window.parent, localStorage, or making credentialed requests.
  const runInIframe = useCallback((jsCode: string): Promise<string> => {
    return new Promise((resolve) => {
      const logs: string[] = [];
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(logs.length ? logs.join('\n') : '(timeout — code ran > 5s)');
      }, 5000);

      const onMessage = (e: MessageEvent) => {
        if (e.source !== iframe.contentWindow) return;
        if (e.data?.type === 'log')  logs.push(String(e.data.text));
        if (e.data?.type === 'done') {
          clearTimeout(timeout);
          cleanup();
          resolve(logs.length ? logs.join('\n') : '(no output)');
        }
      };
      window.addEventListener('message', onMessage);

      // Base64-encode user code to safely embed without injection risk in srcdoc.
      const encoded = btoa(unescape(encodeURIComponent(jsCode)));
      iframe.srcdoc = `<!DOCTYPE html><html><body><script>
        var _code = decodeURIComponent(escape(atob("${encoded}")));
        var _post = function(t, x) { parent.postMessage({ type: t, text: x }, '*'); };
        var _fmt = function() { return Array.prototype.slice.call(arguments).map(function(x) { return typeof x === 'object' ? JSON.stringify(x) : String(x); }).join(' '); };
        console.log   = function() { _post('log', _fmt.apply(null, arguments)); };
        console.warn  = function() { _post('log', '\u26a0 ' + _fmt.apply(null, arguments)); };
        console.error = function() { _post('log', '\u274c ' + _fmt.apply(null, arguments)); };
        try { eval(_code); } catch(e) { _post('log', '\u274c ' + (e && e.message ? e.message : String(e))); }
        _post('done', '');
      <\/script></body></html>`;
    });
  }, []);

  // Helper: load TypeScript compiler from CDN once
  const loadTsCompiler = useCallback((): Promise<boolean> => {
    if ((window as any).ts) return Promise.resolve(true);
    if (tsLoaded.current) return Promise.resolve(false);
    tsLoaded.current = true;
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.4.5/typescript.min.js';
      // SECURITY: SRI hash prevents CDN compromise from injecting malicious code
      s.integrity = 'sha512-0UCKt8uycAQgaUOBbpmTPr3+f7UnbkiQpyjH5hXGTJWhVeimh5gc3GUKd7BbyuLt/84sivVbtXa5GplGr8Y3cA==';
      s.crossOrigin = 'anonymous';
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setOutputOpen(true);

    // ── Python (Pyodide WASM — zero cost) ────────────────────────────────────────
    if (lang === 'python') {
      try {
        // @ts-expect-error global
        if (!window.__py) {
          setOutput('Loading Python…');
          // @ts-expect-error global
          window.__py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/' });
        }
        // @ts-expect-error global
        const py = window.__py;
        let out = '';
        py.setStdout({ batched: (s: string) => { out += s + '\n'; } });
        py.setStderr({ batched: (s: string) => { out += '⚠ ' + s + '\n'; } });
        await py.runPythonAsync(code);
        setOutput(out.trim() || '(no output)');
      } catch (e: unknown) { setOutput('✕ ' + (e instanceof Error ? e.message : String(e))); }

    // ── JavaScript (iframe sandbox — zero cost) ─────────────────────────
    } else if (lang === 'javascript') {
      try {
        setOutput(await runInIframe(code));
      } catch (e: unknown) {
        setOutput('✕ ' + (e instanceof Error ? e.message : String(e)));
      }

    // ── TypeScript (CDN transpile → iframe — zero cost) ─────────────────
    } else if (lang === 'typescript') {
      setOutput('Loading TypeScript compiler…');
      const ok = await loadTsCompiler();
      if (!ok) { setOutput('✕ TypeScript compiler failed to load'); setRunning(false); return; }
      try {
        const ts = (window as any).ts;
        const result = ts.transpileModule(code, {
          compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
        });
        setOutput(await runInIframe(result.outputText));
      } catch (e: unknown) {
        setOutput('✕ ' + (e instanceof Error ? e.message : String(e)));
      }

    // ── Go (server proxy → go.dev/_/compile — free, no key) ─────────────
    } else if (lang === 'go') {
      setOutput('Sending to Go Playground…');
      try {
        const resp = await fetch('/api/compile/go', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          signal: AbortSignal.timeout(14_000),
        });
        const data = await resp.json() as { output?: string; errors?: string; error?: string };
        if (data.error) { setOutput('✕ ' + data.error); setRunning(false); return; }
        const out = [data.errors?.trim(), data.output?.trim()].filter(Boolean).join('\n');
        setOutput(out || '(no output)');
      } catch (e: unknown) {
        setOutput('✕ ' + (e instanceof Error ? e.message : 'Network error'));
      }

    // ── Java / C++ — local only ─────────────────────────────────────
    } else {
      const cmd = lang === 'java'
        ? 'javac Solution.java && java Solution'
        : 'g++ -o solution solution.cpp && ./solution';
      setOutput(
        `ℹ️  ${LANGS[lang].label} runs on your machine, not in the browser.\n\n` +
        `Copy your code, save it as solution${LANGS[lang].ext}, then run:\n  ${cmd}`
      );
    }

    setRunning(false);
  }, [code, lang, runInIframe, loadTsCompiler]);

  const diff = DIFF_MAP[(meta.difficulty ?? '').toLowerCase()] ?? DIFF_MAP.easy;

  return (
    <div className={`ide-root`}>
      
      {/* LEFT PANEL */}
      <div className="ide-left">
        <div className="ide-panel-tabs">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`ide-tab ${panel === item.id ? 'active' : ''}`}
              onClick={() => setPanel(item.id)}
            >
              <span className="ide-tab-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="ide-content-scroll">
          {panel === 'read' && (
            <div className="ide-article">
              <h1 className="ide-title">{meta.title}</h1>
              <div className="ide-meta-row">
                <span className="ide-badge" style={{ backgroundColor: diff.bg, color: diff.text }}>
                  {diff.label}
                </span>
                {meta.topics?.map(t => (
                  <span key={t} className="ide-topic-chip">{t}</span>
                ))}
              </div>
              <div className="ide-description">
                {question}
              </div>
            </div>
          )}
          
          {panel === 'visualize' && (
            <div className="ide-article">
              <div className="ide-description">
                {solution}
              </div>
              {visualTree ? visualTree : <div className="ide-empty">No visual solution available.</div>}
            </div>
          )}

          {panel === 'notes' && (
            <div className="ide-notes-cnt">
              <NotesPanel slug={slug} isAuthenticated={isAuthenticated} />
            </div>
          )}
        </div>
      </div>

      {/* DRAG SEAM */}
      <div className="ide-seam"></div>

      {/* RIGHT PANEL */}
      <div className="ide-right">
        {/* Editor Top Bar */}
        <div className="ide-editor-bar">
          <div className="ide-lang-select-wrap">
            <select 
              className="ide-lang-select" 
              value={lang} 
              onChange={(e) => switchLang(e.target.value)}
            >
              {Object.entries(LANGS).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ⌄</option>
              ))}
            </select>
          </div>
          <div className="ide-editor-actions">
            <button className="ide-icon-btn" title="Settings">⚙️</button>
            <button className="ide-icon-btn" title="Fullscreen">⛶</button>
          </div>
        </div>

        {/* Editor Inner Tabs */}
        <div className="ide-editor-inner-tabs">
          <div className="ide-inner-tab active">Solution 1 <span className="add-sol">+</span></div>
          <div className="ide-inner-actions">
            <button className="ide-robot-btn"><span>🤖</span> NeetBot</button>
            <button className="ide-hint-btn" onClick={() => setHintOpen(!hintOpen)}><span>💡</span> Hint</button>
          </div>
        </div>

        {/* Hint Popup */}
        {hintOpen && (
          <div className="ide-hint-popup">
            <div className="ide-hint-header">
              <span className="hint-lbl">Intuition</span>
              <button className="hint-close" onClick={() => setHintOpen(false)}>✕</button>
            </div>
            <div className="ide-description">
              {hint ? hint : "No hint available for this problem."}
            </div>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="ide-monaco-wrap">
          <MonacoEditor
            language={LANGS[lang].monacoId}
            value={code}
            onChange={(v: string | undefined) => setCode(v ?? '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              lineHeight: 24,
              minimap: { enabled: false },
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              renderLineHighlight: 'all',
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            }}
            beforeMount={(monaco: any) => {
              monaco.editor.defineTheme('dsa-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                  { token: 'comment', foreground: '6A9955' },
                  { token: 'keyword', foreground: '569CD6' },
                ],
                colors: {
                  'editor.background': '#1e1e1e',
                  'editor.lineHighlightBackground': '#2d2d30',
                }
              });
              monaco.editor.setTheme('dsa-dark');
            }}
            onMount={(editor: any) => {
              editor.updateOptions({ theme: 'dsa-dark' });
            }}
          />
        </div>

        {/* Output Console area (Slides up) */}
        {outputOpen && (
          <div className="ide-output">
            <div className="ide-output-header">
              <span className="out-lbl">Output</span>
              <button className="out-close" onClick={() => setOutputOpen(false)}>✕</button>
            </div>
            <pre className="ide-output-content">{output || '...'}</pre>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="ide-bottom-bar">
          <button className="ide-console-btn" onClick={() => setOutputOpen(!outputOpen)}>
            Console <span>{outputOpen ? '⌃' : '⌄'}</span>
          </button>
          <div className="ide-run-actions">
            {(lang === 'java' || lang === 'cpp') ? (
              <button
                className="ide-btn-run"
                onClick={() => { navigator.clipboard.writeText(code).catch(() => {}); setOutput(`Copied! Run locally:\n  ${lang === 'java' ? 'javac Solution.java && java Solution' : 'g++ -o sol solution.cpp && ./sol'}`); setOutputOpen(true); }}
              >
                📋 Copy code
              </button>
            ) : (
              <button className="ide-btn-run" onClick={run} disabled={running}>
                {running ? 'Running…' : lang === 'go' ? '▶ Run (Go Playground)' : '▶ Run'}
              </button>
            )}
            <button className="ide-btn-submit" onClick={toggleSolved}>
              {solved ? 'Solved ✔' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
