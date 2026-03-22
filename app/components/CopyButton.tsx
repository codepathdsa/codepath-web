'use client';

import { useState } from 'react';

/**
 * Client-side copy button for code blocks.
 * Receives the text to copy as a plain string (safe across the RSC boundary).
 */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
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
