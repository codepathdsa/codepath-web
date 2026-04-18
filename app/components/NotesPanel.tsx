'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

export default function NotesPanel({ slug, isAuthenticated }: { slug: string; isAuthenticated: boolean }) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadNote() {
      try {
        const res = await fetch(`/api/notes?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.note) {
            setNote(data.note.content);
            setLastSaved(new Date(data.note.updated_at));
          }
        }
      } catch { /* ignore */ }
    }
    loadNote();
  }, [isAuthenticated, slug]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content: note }),
      });
      if (res.ok) setLastSaved(new Date());
    } catch { /* ignore */ }
    setIsSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="notes-card unauth">
        <div className="notes-header">
          <h4>Personal Notes 📝</h4>
        </div>
        <div className="notes-body-lock">
          <p>Writing private notes and activating spaced repetition requires a free account.</p>
          <Link href="/login" className="btn btn--outline" style={{ display: 'inline-block', marginTop: '12px' }}>Login to unlock</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-card">
      <div className="notes-header">
        <h4>Personal Notes 📝</h4>
        <span className="notes-status">{isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}</span>
      </div>
      <textarea 
        className="notes-textarea" 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your insights, 'aha' moments, or Spaced Repetition reminders here..."
      />
      <div className="notes-footer">
         <button className="btn btn--primary" style={{ width: '100%', padding: '10px' }} onClick={handleSave} disabled={isSaving}>
           {isSaving ? 'Syncing to Cloud...' : 'Save Note'}
         </button>
      </div>
    </div>
  );
}
