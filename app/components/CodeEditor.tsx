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
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++',
};

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

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setHasRun(true);
    setActiveTab('output');

    if (selectedLang === 'python') {
      // Run Python in the browser via Pyodide (loaded from CDN)
      try {
        // @ts-expect-error – Pyodide is loaded globally
        if (!window.__pyodide) {
          setOutput('⏳ Loading Python runtime… (first run takes ~3s)');
          // @ts-expect-error – loadPyodide is a global fn injected by the script tag
          window.__pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
          });
        }
        // @ts-expect-error – pyodide global
        const pyodide = window.__pyodide;

        // Capture stdout
        let captured = '';
        pyodide.setStdout({
          batched: (s: string) => { captured += s + '\n'; },
        });
        pyodide.setStderr({
          batched: (s: string) => { captured += '⚠ ' + s + '\n'; },
        });

        await pyodide.runPythonAsync(code);
        setOutput(captured.trim() || '(no output)');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setOutput('❌ ' + msg);
      }
    } else if (selectedLang === 'javascript') {
      // Run JS safely in an iframe sandbox
      try {
        const logs: string[] = [];
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const win = iframe.contentWindow as Window & {
          console: { log: (...a: unknown[]) => void; error: (...a: unknown[]) => void };
        };
        win.console.log = (...args) => logs.push(args.map(String).join(' '));
        win.console.error = (...args) => logs.push('❌ ' + args.map(String).join(' '));

        try {
          // eslint-disable-next-line no-new-func
          new Function(code).call(win);
        } catch (e: unknown) {
          logs.push('❌ ' + (e instanceof Error ? e.message : String(e)));
        }

        document.body.removeChild(iframe);
        setOutput(logs.length ? logs.join('\n') : '(no output)');
      } catch (err: unknown) {
        setOutput('❌ ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      setOutput(
        `ℹ️ In-browser execution for ${LANG_LABELS[selectedLang]} is not supported yet.\n\n` +
        `Copy the code and run it in your local environment.`
      );
    }

    setIsRunning(false);
  }, [code, selectedLang]);

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
        <div style={{ flex: 1 }} />
        {(selectedLang === 'python' || selectedLang === 'javascript') && (
          <span className="ce-run-note">Runs in-browser ⚡</span>
        )}
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
      </div>
    </div>
  );
}
