'use client';

import { useState } from 'react';

interface QuizProps {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export default function Quiz({ question, options, answerIndex, explanation }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const hasAnswered = selected !== null;

  let safeOptions: string[] = [];
  if (Array.isArray(options)) safeOptions = options;
  else if (typeof options === 'string') {
    try { safeOptions = JSON.parse(options); } catch (e) {}
  }

  return (
    <div className="quiz-container">
      <div className="quiz-question">{question}</div>
      <div className="quiz-options">
        {safeOptions.map((option, index) => {
          let btnClass = 'quiz-option';
          if (hasAnswered) {
            if (index === answerIndex) {
              btnClass += ' correct';
            } else if (index === selected) {
              btnClass += ' wrong';
            } else {
              btnClass += ' disabled';
            }
          }

          return (
            <button
              key={index}
              className={btnClass}
              onClick={() => !hasAnswered && setSelected(index)}
              disabled={hasAnswered}
            >
              <div className="quiz-option-letter">{String.fromCharCode(65 + index)}</div>
              <div className="quiz-option-text">{option}</div>
            </button>
          );
        })}
      </div>
      
      {hasAnswered && explanation && (
        <div className={`quiz-explanation ${selected === answerIndex ? 'success' : 'error'}`}>
          <strong>{selected === answerIndex ? 'Correct! 🎉' : 'Not quite. '}</strong>
          {explanation}
        </div>
      )}
    </div>
  );
}
