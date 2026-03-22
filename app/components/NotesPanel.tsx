'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function NotesPanel({ slug, isAuthenticated }: { slug: string; isAuthenticated: boolean }) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadNote() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('user_notes')
        .select('content, updated_at')
        .eq('user_id', user.id)
        .eq('problem_slug', slug)
        .maybeSingle(); // maybeSingle so it doesn't throw if 0 rows
      
      if (data) {
        setNote(data.content);
        setLastSaved(new Date(data.updated_at));
      }
    }
    loadNote();
  }, [isAuthenticated, slug, supabase]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_notes')
      .upsert({ 
        user_id: user.id, 
        problem_slug: slug, 
        content: note, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id, problem_slug' });

    setIsSaving(false);
    if (!error) setLastSaved(new Date());
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
