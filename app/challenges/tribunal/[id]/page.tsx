'use client';

import { useState } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import styles from './page.module.css';

// Mock Legacy File System
const LEGACY_FILES: Record<string, { name: string, lang: string, code: string }> = {
  'AuthManager.java': {
    name: 'AuthManager.java',
    lang: 'java',
    code: `package com.legacy.app;

import java.sql.Connection;
import java.sql.ResultSet;

public class AuthManager {
    // BUG: God object, tight coupling, high cyclomatic complexity
    public boolean authenticate(String username, String password, String providerType) {
        if (providerType.equals("POSTGRES")) {
            Connection conn = PostgresDB.getConnection();
            try {
                ResultSet rs = conn.createStatement().executeQuery(
                    "SELECT * FROM users WHERE username='" + username + "' AND pass='" + password + "'"
                );
                return rs.next();
            } catch (Exception e) {
                return false;
            }
        } else if (providerType.equals("MONGO")) {
            // Mongo specific logic mixed in
            MongoCollection coll = MongoDB.getCollection("users");
            return coll.find("{ user: '" + username + "', pass: '" + password + "'}").hasNext();
        } else if (providerType.equals("OAUTH")) {
            // TODO: Implement OAuth
            throw new RuntimeException("Not implemented yet");
        } else {
            return false;
        }
    }
}`
  },
  'UserController.java': {
    name: 'UserController.java',
    lang: 'java',
    code: `package com.legacy.app;

public class UserController {
    private AuthManager auth = new AuthManager();

    public void handleLoginRequest(Request req, Response res) {
        String type = req.getHeader("Auth-Type");
        boolean isValid = auth.authenticate(req.getUsername(), req.getPassword(), type);
        
        if (isValid) {
            res.send(200, "OK");
        } else {
            res.send(401, "Unauthorized");
        }
    }
}`
  },
  'AuthStrategy.java': {
    name: 'AuthStrategy.java',
    lang: 'java',
    code: `package com.legacy.app;

// HINT: Implement me to decouple AuthManager
public interface AuthStrategy {
    boolean authenticate(String username, String password);
}`
  }
};

export default function TribunalWorkspace({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'briefing' | 'explorer'>('explorer');
  const [activeFile, setActiveFile] = useState('AuthManager.java');
  const [files, setFiles] = useState(LEGACY_FILES);
  
  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [complexity, setComplexity] = useState(14); // High complexity init
  const [testsPassed, setTestsPassed] = useState(42); 
  const [testsTotal, setTestsTotal] = useState(42);
  const [isResolved, setIsResolved] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles({
        ...files,
        [activeFile]: { ...files[activeFile], code: value }
      });
      
      // Simulate real-time linting / complexity change
      if (activeFile === 'AuthManager.java') {
        const ifCount = (value.match(/if\s*\(/g) || []).length;
        const newComplexity = 1 + ifCount;
        setComplexity(newComplexity);
      }
    }
  };

  const runEvaluator = () => {
    setIsEvaluating(true);
    
    // Simulate backend AST parsing and test running
    setTimeout(() => {
      // Very basic mock evaluation criteria:
      // Complexity dropped, "implements AuthStrategy" exists
      const authManagerCode = files['AuthManager.java'].code;
      const strategyCode = files['AuthStrategy.java'].code;
      
      let newPassed = testsTotal;
      let success = false;

      if (complexity <= 4 && authManagerCode.includes("AuthStrategy") && !authManagerCode.includes("if (providerType")) {
        success = true;
      } else {
        newPassed = 38; // Mock failing tests due to breaking change or unchanged logic
      }

      setTestsPassed(newPassed);
      if (success) {
        setIsResolved(true);
      }
      setIsEvaluating(false);
    }, 1500);
  };

  return (
    <div className={styles.layout}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/challenges" style={{ color: 'var(--text-tertiary)'}}>←</Link>
          <span className="badge badge-error">TECH DEBT TRIBUNAL</span>
          <span>Refactor AuthManager God Object</span>
        </div>
        <button className="btn-ghost" style={{ padding: '6px 12px' }}>Leave Workspace</button>
      </div>

      <div className={styles.workspace}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.panelTabHeader}>
            <button className={`${styles.panelTab} ${activeTab === 'explorer' ? styles.active : ''}`} onClick={() => setActiveTab('explorer')}>Explorer</button>
            <button className={`${styles.panelTab} ${activeTab === 'briefing' ? styles.active : ''}`} onClick={() => setActiveTab('briefing')}>Briefing</button>
          </div>
          
          <div className={styles.panelBody}>
            {activeTab === 'explorer' && (
              <div>
                <div className={styles.folderItem}>📂 src/main/java/com/legacy/app</div>
                {Object.keys(files).map((filename) => (
                  <div 
                    key={filename} 
                    className={`${styles.fileItem} ${activeFile === filename ? styles.active : ''}`}
                    onClick={() => setActiveFile(filename)}
                  >
                    <span className={styles.fileIcon}>📄</span>
                    {filename}
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'briefing' && (
              <div>
                <h2 className={styles.objectiveTitle}>The Spaghetti Auth</h2>
                <div className={styles.objectiveDesc}>
                  Our startup needs to add OAuth, but <code>AuthManager.java</code> has become a tightly coupled God Object. Every time we add a new auth provider, we have to modify the core loop, breaking the Open-Closed Principle.
                </div>
                
                <h3 className={styles.reqTitle}>Refactoring Objectives</h3>
                <ul className={styles.reqList}>
                  <li className={complexity <= 3 ? styles.done : ''}>Reduce AuthManager cyclomatic complexity (Target: &lt; 4)</li>
                  <li className={files['AuthManager.java'].code.includes("implements AuthStrategy") || files['AuthManager.java'].code.includes("AuthStrategy ") ? styles.done : ''}>Implement the Strategy Design Pattern</li>
                  <li className={testsPassed === testsTotal ? styles.done : ''}>Maintain 42/42 passing acceptance tests</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel (IDE) */}
        <div className={styles.centerPanel}>
          <div className={styles.ideHeader}>
            {Object.keys(files).map(filename => (
              <div 
                key={filename}
                className={`${styles.fileTab} ${activeFile === filename ? styles.active : ''}`}
                onClick={() => setActiveFile(filename)}
              >
                {filename}
              </div>
            ))}
          </div>
          <div className={styles.ideContent}>
            <Editor
              height="100%"
              language={files[activeFile].lang}
              theme="vs-dark"
              value={files[activeFile].code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
                padding: { top: 20 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Right Panel (Evaluator) */}
        <div className={styles.rightPanel}>
          <div className={styles.evalHeader}>
            <span className={styles.evalTitle}>Live Analysis</span>
            <button className="btn-ghost runBtn" onClick={runEvaluator} disabled={isEvaluating}>
              {isEvaluating ? 'Checking...' : '▶ Run Checks'}
            </button>
          </div>
          <div className={styles.evalMetrics}>
            <div className={styles.metricBox}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>Cyclomatic Complexity</span>
                <span className="badge badge-active" style={{ fontSize: '10px' }}>AST PARSER</span>
              </div>
              <div className={`${styles.metricVal} ${complexity > 10 ? styles.danger : complexity > 4 ? styles.warn : styles.good}`}>
                {complexity} <span style={{fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal'}}>/ 4 Target</span>
              </div>
              <div className={styles.metricSub}>
                {complexity > 4 ? 'AuthManager.java has too many independent execution paths. Needs decoupling.' : 'Complexity is well within acceptable limits.'}
              </div>
            </div>

            <div className={styles.metricBox}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>Acceptance Tests</span>
                <span className="badge badge-warning" style={{ fontSize: '10px' }}>JUnit 5</span>
              </div>
              <div className={`${styles.metricVal} ${testsPassed === testsTotal ? styles.good : styles.danger}`}>
                {testsPassed} <span style={{fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal'}}>/ {testsTotal}</span>
              </div>
              <div className={styles.metricSub}>
                {testsPassed === testsTotal ? 'All critical user authentication flows are passing.' : 'Your refactor broke core authentication functionality.'}
              </div>
            </div>
            
            <div className={styles.metricBox}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>Code Smells</span>
                <span className="badge badge-error" style={{ fontSize: '10px' }}>SONAR</span>
              </div>
              <div className={`${styles.metricVal} ${files['AuthManager.java'].code.includes('if (providerType.equals(') ? styles.danger : styles.good}`}>
                {files['AuthManager.java'].code.includes('if (providerType.equals(') ? '1' : '0'} Major
              </div>
              <div className={styles.metricSub}>
                {files['AuthManager.java'].code.includes('if (providerType.equals(') ? 'Violation of Open-Closed Principle detected.' : 'No major code smells detected.'}
              </div>
            </div>
          </div>
          
          <div className={styles.actionArea}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={runEvaluator} disabled={isEvaluating}>
              Submit Refactor
            </button>
          </div>
        </div>
      </div>

      {isResolved && (
        <div className={styles.successModal}>
          <div className={styles.successCard}>
            <div style={{ width: '64px', height: '64px', background: 'var(--bg-success)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>✓</div>
            <h2 className="t-heading" style={{ marginBottom: '8px' }}>Tech Debt Resolved!</h2>
            <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You successfully decoupled the AuthManager using the Strategy pattern without breaking any legacy tests. The architecture is now scalable.</p>
            <div className="badge badge-active" style={{ fontSize: '16px', padding: '6px 12px', display: 'inline-flex', marginBottom: '32px' }}>+300 XP</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link href="/challenges" className="btn-primary">Complete Tribunal</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
