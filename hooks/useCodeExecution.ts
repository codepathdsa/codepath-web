'use client';

import { useRef, useState, useEffect } from 'react';

// Pyodide v0.27.2 — runs Python 3.11 in-browser via WASM. Zero server cost.
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js';
const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/';

// Python driver: injected _user_code and _input_str globals as Pyodide strings,
// then we find the user's function, inspect its signature, and call it with
// the variables that the test-input string defined.
const PYTHON_DRIVER = `
import sys
import io
import inspect as _inspect

_cap = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _cap

try:
    _env = {'__builtins__': __builtins__}
    exec(compile(_user_code, '<solution>', 'exec'), _env)
    exec(compile(_input_str,  '<test_input>', 'exec'), _env)

    # Find first user-defined function (has __code__, not prefixed with _)
    _fn = next(
        (v for k, v in _env.items()
         if callable(v) and not k.startswith('_') and hasattr(v, '__code__')),
        None
    )

    if _fn is None:
        # Fallback: try class named Solution with any public method
        _cls = _env.get('Solution')
        if _cls and callable(_cls):
            _inst = _cls()
            _fn = next(
                (getattr(_inst, m) for m in dir(_inst)
                 if not m.startswith('_') and callable(getattr(_inst, m))),
                None
            )

    if _fn is None:
        raise ValueError("No function found. Define a top-level function e.g. def solve(nums): ...")

    _params = list(_inspect.signature(_fn).parameters.keys())
    _call_args = [_env[p] for p in _params if p in _env]

    if len(_call_args) < len(_params):
        missing = [p for p in _params if p not in _env]
        raise ValueError(f"Missing variables in test input: {missing}")

    _result = _fn(*_call_args)
    sys.stdout.write(repr(_result))

except Exception as _e:
    sys.stdout.write(f"ERROR: {type(_e).__name__}: {_e}")

sys.stdout = _old_stdout
_captured = _cap.getvalue().strip()
`;

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface RunResult {
  passed: boolean;
  actual: string;
  ms: number;
}

export function useCodeExecution() {
  const pyRef = useRef<any>(null);
  const loadingRef = useRef(false);
  const [status, setStatus] = useState<EngineStatus>('idle');

  // Start background load when hook mounts (so engine is warm when user clicks Run)
  useEffect(() => {
    initPyodide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initPyodide(): Promise<any> {
    if (pyRef.current) return pyRef.current;
    if (loadingRef.current) return null;

    loadingRef.current = true;
    setStatus('loading');

    try {
      // Inject CDN script tag once
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(`script[src="${PYODIDE_CDN}"]`);
          if (existing) { resolve(); return; }
          const script = document.createElement('script');
          script.src = PYODIDE_CDN;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Pyodide CDN failed to load'));
          document.head.appendChild(script);
        });
      }

      const py = await (window as any).loadPyodide({ indexURL: PYODIDE_INDEX });
      pyRef.current = py;
      setStatus('ready');
      loadingRef.current = false;
      return py;
    } catch (err) {
      console.warn('[useCodeExecution] Pyodide failed to load:', err);
      setStatus('error');
      loadingRef.current = false;
      return null;
    }
  }

  async function runPython(
    userCode: string,
    inputStr: string,
    expected: string
  ): Promise<RunResult> {
    const py = pyRef.current ?? await initPyodide();
    const start = performance.now();

    if (!py) {
      return { passed: false, actual: 'Python engine unavailable', ms: 0 };
    }

    try {
      // Pass user code and test input as Pyodide globals (avoids string escaping)
      py.globals.set('_user_code', userCode);
      py.globals.set('_input_str', inputStr);

      py.runPython(PYTHON_DRIVER);

      const actual = (py.globals.get('_captured') as string) ?? '';
      const ms = Math.round(performance.now() - start);
      const passed = normalizeOutput(actual) === normalizeOutput(expected);

      return { passed, actual, ms };
    } catch (e: any) {
      const actual = `ERROR: ${e.message ?? String(e)}`;
      return { passed: false, actual, ms: Math.round(performance.now() - start) };
    }
  }

  return { engineStatus: status, runPython, initPyodide };
}

// Normalize for comparison: strip all whitespace, lowercase
// e.g. "[[1, 6], [8, 10]]" == "[[1,6],[8,10]]" ✓
function normalizeOutput(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase();
}
