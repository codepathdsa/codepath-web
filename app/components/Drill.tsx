'use client';

import { useState } from 'react';

interface DrillProps {
  question: string;
  children: React.ReactNode;
}

export default function Drill({ question, children }: DrillProps) {
  const [response, setResponse] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  const handleSubmit = () => {
    if (response.trim().length === 0) return;
    setIsRevealed(true);
  };

  return (
    <div className="drill-container">
      <div className="drill-header">
        <span className="drill-icon">📝</span>
        <h4 className="drill-question">{question}</h4>
      </div>
      
      {!isRevealed ? (
        <div className="drill-interactive">
          <textarea
            className="drill-textarea"
            placeholder="Type your design hypothesis or reasoning here..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
          />
          <button 
            className="drill-submit-btn" 
            onClick={handleSubmit}
            disabled={response.trim().length === 0}
          >
            Submit to Reveal Model Answer
          </button>
        </div>
      ) : (
        <div className="drill-result">
          <div className="drill-user-response">
            <div className="drill-label">Your Answer:</div>
            <p>{response}</p>
          </div>
          <div className="drill-model-answer">
            <div className="drill-label">Model Answer:</div>
            <div className="drill-model-content">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
