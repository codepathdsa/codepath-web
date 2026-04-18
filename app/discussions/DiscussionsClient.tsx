'use client';

import { useState, useMemo } from 'react';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';
import type { DbDiscussion } from '@/lib/db/discussions';


/* ── Types ────────────────────────────────────────────────────────────────── */
interface DiscussionsClientProps {
  initialDiscussions: DbDiscussion[];
}

type TabKey = 'trending' | 'new' | 'top';
type CatKey = 'all' | 'design' | 'war' | 'dsa' | 'pr' | 'interview';

const CAT_META: Record<CatKey, { label: string; color: string; keywords: string[] }> = {
  all:       { label: 'Everything',    color: 'var(--text-secondary)', keywords: [] },
  design:    { label: 'System Design', color: '#8b5cf6',               keywords: ['design', 'architecture', 'scale'] },
  war:       { label: 'War Room',      color: '#ef4444',               keywords: ['war', 'incident', 'outage', 'on-call'] },
  dsa:       { label: 'DSA',           color: '#3b82f6',               keywords: ['dsa', 'algorithm', 'leetcode', 'array', 'tree'] },
  pr:        { label: 'PR Review',     color: '#f59e0b',               keywords: ['pr', 'review', 'code review'] },
  interview: { label: 'Interview Prep',color: '#14b8a6',               keywords: ['interview', 'prep', 'offer', 'faang'] },
};

const TAG_COLORS: Record<string, string> = {
  'system design': '#8b5cf6', 'architecture': '#8b5cf6',
  'war room': '#ef4444', 'incident': '#ef4444',
  'dsa': '#3b82f6', 'algorithms': '#3b82f6',
  'pr review': '#f59e0b', 'code review': '#f59e0b',
  'interview': '#14b8a6',
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function tagColor(tags?: string[] | null) {
  if (!tags?.length) return 'var(--text-tertiary)';
  const t = tags[0].toLowerCase();
  for (const [k, v] of Object.entries(TAG_COLORS)) {
    if (t.includes(k)) return v;
  }
  return 'var(--text-tertiary)';
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/* ── Compose panel ────────────────────────────────────────────────────────── */
function ComposePanel({ onClose, onSubmit }: { onClose: () => void; onSubmit: (t: string, b: string, tag: string) => void }) {
  const [title, setTitle] = useState('');
  const [body,  setBody]  = useState('');
  const [tag,   setTag]   = useState('System Design');

  return (
    <div className={styles.composeOverlay} onClick={onClose}>
      <div className={styles.composePanel} onClick={e => e.stopPropagation()}>
        <div className={styles.composePanelHeader}>
          <span className={styles.composePanelTitle}>New Discussion</span>
          <button className={styles.composePanelClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.composeForm}>
          <input
            className={styles.composeInput}
            placeholder="What do you want to discuss?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
          />

          <textarea
            className={styles.composeTextarea}
            placeholder="Share context, ask a question, or spark a debate..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
          />

          <div className={styles.composeFooter}>
            <select
              className={styles.composeSelect}
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              <option>System Design</option>
              <option>War Room</option>
              <option>DSA</option>
              <option>PR Review</option>
              <option>Interview Prep</option>
            </select>

            <div className={styles.composeActions}>
              <button className={styles.composeCancelBtn} onClick={onClose}>Cancel</button>
              <button
                className={styles.composeSubmitBtn}
                disabled={!title.trim()}
                onClick={() => { onSubmit(title, body, tag); onClose(); }}
              >
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Discussion card ──────────────────────────────────────────────────────── */
function DiscussionCard({ post, onVote, voted }: { post: DbDiscussion; onVote: (id: string) => void; voted: boolean }) {
  const color = tagColor(post.tags);
  const tag   = post.tags?.[0] ?? 'General';

  return (
    <div className={`${styles.card} ${voted ? styles.cardVoted : ''}`}>
      {/* Vote column */}
      <div className={styles.voteCol}>
        <button
          className={`${styles.voteBtn} ${voted ? styles.voteBtnActive : ''}`}
          onClick={() => onVote(post.id)}
          title={voted ? 'Remove vote' : 'Upvote'}
        >
          ▲
        </button>
        <span className={`${styles.voteCount} ${voted ? styles.voteCountActive : ''}`}>
          {post.votes + (voted ? 1 : 0)}
        </span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.cardTopRow}>
          <span className={styles.cardTag} style={{ color, borderColor: `${color}30`, background: `${color}10` }}>
            {tag}
          </span>
          <span className={styles.cardTime}>{timeAgo(post.created_at)}</span>
        </div>

        <h2 className={styles.cardTitle}>{post.title}</h2>

        {post.body && (
          <p className={styles.cardExcerpt}>{post.body}</p>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.cardAuthor}>
            <span className={styles.authorAvatar} style={{ background: `${color}22`, color }}>
              {initials(post.author_username ?? 'AN')}
            </span>
            <span className={styles.authorName}>{post.author_username ?? 'anonymous'}</span>
          </div>

          <div className={styles.cardStats}>
            <span className={styles.cardStat}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              {post.comment_count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState({ onCompose }: { onCompose: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>💬</div>
      <div className={styles.emptyTitle}>No discussions yet</div>
      <div className={styles.emptySub}>Be the first to start a conversation in this category.</div>
      <button className={styles.emptyBtn} onClick={onCompose}>Start a Discussion</button>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function DiscussionsClient({ initialDiscussions }: DiscussionsClientProps) {
  const [tab,      setTab]      = useState<TabKey>('trending');
  const [cat,      setCat]      = useState<CatKey>('all');
  const [search,   setSearch]   = useState('');
  const [compose,  setCompose]  = useState(false);
  const [voted,    setVoted]    = useState<Set<string>>(new Set());
  const [posts,    setPosts]    = useState<DbDiscussion[]>(initialDiscussions);

  /* Filter + sort */
  const visible = useMemo(() => {
    let list = [...posts];

    // Category filter
    if (cat !== 'all') {
      const kws = CAT_META[cat].keywords;
      list = list.filter(p => {
        const hay = [(p.tags ?? []).join(' '), p.title, p.body ?? ''].join(' ').toLowerCase();
        return kws.some(k => hay.includes(k));
      });
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.body ?? '').toLowerCase().includes(q) ||
        (p.author_username ?? '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (tab === 'new')      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (tab === 'top')      list.sort((a, b) => b.votes - a.votes);
    if (tab === 'trending') list.sort((a, b) => (b.votes * 2 + (b.comment_count ?? 0)) - (a.votes * 2 + (a.comment_count ?? 0)));

    return list;
  }, [posts, cat, search, tab]);

  function handleVote(id: string) {
    const isDecrement = voted.has(id);
    setVoted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Fire-and-forget fetch vote (non-blocking)
    fetch('/api/discussions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: isDecrement ? 'decrement' : 'increment' })
    }).catch(() => {});
  }

  async function handleNewPost(title: string, body: string, tag: string) {
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, tag })
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setPosts(prev => [data, ...prev]);
        }
      }
    } catch { /* ignore err */ }
  }

  return (
    <div className={styles.layout}>
      <AppNav />

      {compose && <ComposePanel onClose={() => setCompose(false)} onSubmit={handleNewPost} />}

      <main className={styles.mainContainer}>
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <button className={styles.newPostBtn} onClick={() => setCompose(true)}>
            <span>+</span> New Discussion
          </button>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>Categories</div>
            {(Object.entries(CAT_META) as [CatKey, typeof CAT_META[CatKey]][]).map(([key, meta]) => (
              <button
                key={key}
                className={`${styles.catBtn} ${cat === key ? styles.catBtnActive : ''}`}
                onClick={() => setCat(key)}
                style={cat === key ? { color: meta.color, borderColor: `${meta.color}30` } : {}}
              >
                <span className={styles.catDot} style={{ background: meta.color }} />
                {meta.label}
              </button>
            ))}
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>Your Activity</div>
            <button className={styles.catBtn}>My Posts</button>
            <button className={styles.catBtn}>Saved</button>
          </div>
        </aside>

        {/* ── Main feed ────────────────────────────────────────────── */}
        <div className={styles.feed}>
          {/* Header */}
          <div className={styles.feedHeader}>
            <div className={styles.feedHeaderTop}>
              <h1 className={styles.feedTitle}>Discussions</h1>
              <div className={styles.feedTabs}>
                {(['trending', 'new', 'top'] as TabKey[]).map(t => (
                  <button
                    key={t}
                    className={`${styles.feedTab} ${tab === t ? styles.feedTabActive : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t === 'trending' ? '🔥 Trending' : t === 'new' ? '✨ New' : '⭐ Top'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.searchRow}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className={styles.searchInput}
                  placeholder="Search discussions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
                )}
              </div>
              <span className={styles.resultCount}>{visible.length} posts</span>
            </div>
          </div>

          {/* Cards */}
          {visible.length === 0 ? (
            <EmptyState onCompose={() => setCompose(true)} />
          ) : (
            <div className={styles.cardList}>
              {visible.map(post => (
                <DiscussionCard
                  key={post.id}
                  post={post}
                  voted={voted.has(post.id)}
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
