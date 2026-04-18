'use client';
import { useState } from 'react';
import styles from '../u/[username]/page.module.css';

export function CopyShareBtn({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={styles.shareBtn} onClick={handle}>
      {copied ? '✓ Link Copied!' : '⎘ Share Profile'}
    </button>
  );
}
