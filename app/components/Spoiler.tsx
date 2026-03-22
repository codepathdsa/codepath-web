'use client';

import { useState } from 'react';

interface SpoilerProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * A highly premium "Spoiler Shield" component.
 * Blurs the content inside until the user explicitly decides to reveal it.
 * Perfect for progressive disclosure in interview prep.
 */
export default function Spoiler({ title = "Reveal Next Hint", children }: SpoilerProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (isRevealed) {
    return (
      <div className="spoiler-revealed">
        {children}
      </div>
    );
  }

  return (
    <div className="spoiler-container">
      {/* The blurred content underneath */}
      <div className="spoiler-content" aria-hidden="true">
        {children}
      </div>
      
      {/* The interactive glassmorphism overlay */}
      <div className="spoiler-overlay">
        <button 
          className="spoiler-btn"
          onClick={() => setIsRevealed(true)}
        >
          <span className="spoiler-icon">👁️</span>
          <span className="spoiler-text">{title}</span>
        </button>
      </div>
    </div>
  );
}
