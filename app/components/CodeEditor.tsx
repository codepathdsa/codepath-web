'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Monaco must be loaded client-side only (no SSR)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  /** The language for syntax highlighting & defaults */
  language?: string;
  /** Starter code shown in the editor */
  defaultCode?: string;
  /** Optional title shown in the header */
  title?: string;
  /** Height of the editor panel in px */
  height?: number;
}

// -- Built-in starter templates ---------------------------------------------
const TEMPLATES: Record<string, string> = {
  python: `# Write your solution here
def solution(nums):
    # TODO: implement
    pass

# Example test
print(solution([1, 2, 3]))
`,
  javascript: `// Write your solution here
function solution(nums) {
  // TODO: implement
}

// Example test
console.log(solution([1, 2, 3]));
`,
  typescript: `// Write your solution here
function solution(nums: number[]): number[] {
  // TODO: implement
  return nums;
}

console.log(solution([1, 2, 3]));
`,
  go: `package main

import "fmt"

func solution(nums []int) []int {
	// TODO: implement
	return nums
}

func main() {
	result := solution([]int{1, 2, 3})
	fmt.Println(result)
}
`,
  java: `// Write your solution here
public class Solution {
  public int[] solution(int[] nums) {
    // TODO: implement
    return nums;
  }
}
`,
  cpp: `// Write your solution here
#include <vector>
using namespace std;

vector<int> solution(vector<int>& nums) {
  // TODO: implement
  return nums;
}
`,
};

const LANG_LABELS: Record<string, string> = {
  python:     'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go:         'Go',
  java:       'Java',
  cpp:        'C++',
};

// Languages that can run in-browser with no external API
const BROWSER_LANGS = new Set(['python', 'javascript', 'typescript']);
// Languages routed through a lightweight server proxy (free, no key)
const PROXY_LANGS   = new Set(['go']);
// Languages that require a local runtime
const LOCAL_LANGS   = new Set(['java', 'cpp']);

export default function CodeEditor({
  language = 'python',
  defaultCode,
  title = 'Practice Editor',
  height = 320,
}: CodeEditorProps) {
  const [selectedLang, setSelectedLang] = useState(language);
  const [code, setCode] = useState<string>(
    defaultCode ?? TEMPLATES[language] ?? ''
  );
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
  const [hasRun, setHasRun] = useState(false);

  const handleLangChange = useCallback((lang: string) => {
    setSelectedLang(lang);
    setCode(TEMPLATES[lang] ?? '');
    setOutput('');
    setHasRun(false);
  }, []);

  // ── JS/TS: run in a sandboxed iframe (zero API cost) ───────────────────────
  const runInIframe = useCallback((jsCode: string): string => {
    const logs: string[] = [];
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow as Window & {
      console: { log: (...a: unknown[]) => void; error: (...a: unknown[]) => void; warn: (...a: unknown[]) => void };
    };
    win.console.log   = (...args) => logs.push(args.map(a => JSON.stringify(a) ?? String(a)).join(' '));
    win.console.warn  = (...args) => logs.push('⚠ ' + args.map(String).join(' '));
    win.console.error = (...args) => logs.push('❌ ' + args.map(String).join(' '));

    try {
      // eslint-disable-next-line no-new-func
      new Function(jsCode).call(win);
    } catch (e: unknown) {
      logs.push('❌ ' + (e instanceof Error ? e.message : String(e)));
    }

    document.body.removeChild(iframe);
    return logs.length ? logs.join('\n') : '(no output)';
  }, []);

  // ── TypeScript: transpile via CDN compiler, then run in iframe ─────────────
  const loadTsCompiler = useCallback(async (): Promise<boolean> => {
    if ((window as any).ts) return true;
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.4.5/typescript.min.js';
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setHasRun(true);
    setActiveTab('output');

    // ── Python (Pyodide WASM — zero cost) ────────────────────────────────────
    if (selectedLang === 'python') {
      try {
        // @ts-expect-error – Pyodide is loaded globally
        if (!window.__pyodide) {
          setOutput('⏳ Loading Python runtime… (first run takes ~3 s)');
          // @ts-expect-error – loadPyodide is a CDN global
          window.__pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
          });
        }
        // @ts-expect-error – pyodide global
        const pyodide = window.__pyodide;
        let captured = '';
        pyodide.setStdout({ batched: (s: string) => { captured += s + '\n'; } });
        pyodide.setStderr({ batched: (s: string) => { captured += '⚠ ' + s + '\n'; } });
        await pyodide.runPythonAsync(code);
        setOutput(captured.trim() || '(no output)');
      } catch (err: unknown) {
        setOutput('❌ ' + (err instanceof Error ? err.message : String(err)));
      }

    // ── JavaScript (iframe sandbox — zero cost) ───────────────────────────────
    } else if (selectedLang === 'javascript') {
      try {
        setOutput(runInIframe(code));
      } catch (err: unknown) {
        setOutput('❌ ' + (err instanceof Error ? err.message : String(err)));
      }

    // ── TypeScript (CDN transpile → iframe — zero cost) ───────────────────────
    } else if (selectedLang === 'typescript') {
      try {
        setOutput('⏳ Loading TypeScript compiler…');
        const ok = await loadTsCompiler();
        if (!ok) { setOutput('❌ TypeScript compiler failed to load'); setIsRunning(false); return; }
        const ts = (window as any).ts;
        const result = ts.transpileModule(code, {
          compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
        });
        if (result.diagnostics?.length) {
          setOutput('❌ TS error: ' + result.diagnostics[0].messageText);
          setIsRunning(false);
          return;
        }
        setOutput(runInIframe(result.outputText));
      } catch (err: unknown) {
        setOutput('❌ ' + (err instanceof Error ? err.message : String(err)));
      }

    // ── Go (server proxy → go.dev/_/compile — free, no key) ──────────────────
    } else if (selectedLang === 'go') {
      setOutput('⏳ Sending to Go Playground…');
      try {
        const resp = await fetch('/api/compile/go', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          signal: AbortSignal.timeout(14_000),
        });
        const data = await resp.json() as { output?: string; errors?: string; error?: string };
        if (data.error) { setOutput('❌ ' + data.error); setIsRunning(false); return; }
        const out = [data.errors?.trim(), data.output?.trim()].filter(Boolean).join('\n');
        setOutput(out || '(no output)');
      } catch (err: unknown) {
        setOutput('❌ ' + (err instanceof Error ? err.message : 'Network error'));
      }

    // ── Java / C++ — local only ───────────────────────────────────────────────
    } else if (LOCAL_LANGS.has(selectedLang)) {
      setOutput(
        `ℹ️  ${LANG_LABELS[selectedLang]} runs on your machine, not in the browser.\n\n` +
        `Save your code below, then run it locally:\n\n` +
        (selectedLang === 'java'
          ? `  javac Solution.java && java Solution`
          : `  g++ -o solution solution.cpp && ./solution`)
      );
    }

    setIsRunning(false);
  }, [code, selectedLang, runInIframe, loadTsCompiler]);

  const handleReset = useCallback(() => {
    setCode(TEMPLATES[selectedLang] ?? '');
    setOutput('');
    setHasRun(false);
    setActiveTab('editor');
  }, [selectedLang]);

  // Inject Pyodide script once when python is selected
  const pyodideScriptRef = useRef(false);
  useEffect(() => {
    if (selectedLang === 'python' && !pyodideScriptRef.current) {
      pyodideScriptRef.current = true;
      const existing = document.getElementById('pyodide-script');
      if (!existing) {
        const s = document.createElement('script');
        s.id = 'pyodide-script';
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js';
        s.async = true;
        document.head.appendChild(s);
      }
    }
  }, [selectedLang]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {});
  }, [code]);

  const runtimeLabel = BROWSER_LANGS.has(selectedLang)
    ? '⚡ Runs in browser'
    : PROXY_LANGS.has(selectedLang)
    ? '☁️ Go Playground'
    : '💻 Run locally';

  const canRun = !LOCAL_LANGS.has(selectedLang);

  return (
    <div className="code-editor-widget">
      {/* Header */}
      <div className="ce-header">
        <div className="ce-title-row">
          <span className="ce-icon">⌨️</span>
          <span className="ce-title">{title}</span>
          <span className="ce-badge">Browser IDE</span>
        </div>
        <div className="ce-lang-pills">
          {Object.keys(TEMPLATES).map((lang) => (
            <button
              key={lang}
              className={`ce-lang-pill${selectedLang === lang ? ' active' : ''}`}
              onClick={() => handleLangChange(lang)}
            >
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="ce-tabs">
        <button
          className={`ce-tab${activeTab === 'editor' ? ' active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Code
        </button>
        <button
          className={`ce-tab${activeTab === 'output' ? ' active' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          Output {hasRun && <span className="ce-dot" />}
        </button>
      </div>

      {/* Editor / Output panels */}
      <div className="ce-body">
        {activeTab === 'editor' ? (
          <div className="ce-monaco-wrap" style={{ height }}>
            <MonacoEditor
              height="100%"
              language={selectedLang === 'cpp' ? 'cpp' : selectedLang}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 13.5,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'all',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                fontLigatures: true,
              }}
            />
          </div>
        ) : (
          <div className="ce-output" style={{ minHeight: height }}>
            {output ? (
              <pre className="ce-output-pre">{output}</pre>
            ) : (
              <div className="ce-output-empty">
                <span>▶ Run your code to see the output here</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer toolbar */}
      <div className="ce-footer">
        <button className="ce-btn ce-btn--ghost" onClick={handleReset}>
          ↺ Reset
        </button>
        <button className="ce-btn ce-btn--ghost" onClick={handleCopyCode} title="Copy code to clipboard">
          📋 Copy
        </button>
        <div style={{ flex: 1 }} />
        <span className="ce-run-note">{runtimeLabel}</span>
        {canRun ? (
          <button
            className="ce-btn ce-btn--run"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <><span className="ce-spinner" /> Running…</>
            ) : (
              '▶ Run Code'
            )}
          </button>
        ) : (
          <button className="ce-btn ce-btn--ghost" onClick={handleCopyCode}>
            📋 Copy code
          </button>
        )}
      </div>
    </div>
  );
}
