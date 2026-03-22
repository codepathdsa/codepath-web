'use client';

import { useState, useRef } from 'react';

/**
 * Client-side copy button for code blocks.
 * Reads text from a sibling <code> element.
 */
export function CopyButton({ getValue }: { getValue: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getValue());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button className="copy-btn" onClick={handleCopy} aria-label="Copy code">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
