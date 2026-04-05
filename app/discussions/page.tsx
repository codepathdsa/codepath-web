'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.css';

const MOCK_DISCUSSIONS = [
  {
    id: 1,
    title: 'Solving ENG-512 (Global Rate Limiter): Redis vs In-Memory + Gossiping?',
    excerpt: 'I wrapped up the Global Rate limiter challenge tonight but Im realizing my Redis implementation might struggle with cross-region latency. If we need < 10ms decision times globally, does it make more sense to keep limits local in-memory and gossip asynchronously? Curious how you all passed the 5th constraint.',
    author: 'VenkateshwaranPillai',
    timeAgo: '2 hours ago',
    votes: 42,
    comments: 14,
    tags: ['badge-design', 'System Design']
  },
  {
    id: 2,
    title: 'War Room 911: Anyone else drop the database instead of shedding load?',
    excerpt: 'Just failed the 911 incident spectacularly. I assumed restarting the cluster would clear the deadlocks but it caused a massive cache stampede when the app servers came back online. This platform is humbling.',
    author: 'backend_dev_nyc',
    timeAgo: '5 hours ago',
    votes: 89,
    comments: 31,
    tags: ['badge-war', 'War Room']
  },
  {
    id: 3,
    title: 'Meta E5 (Senior) loop specifically testing observability patterns now',
    excerpt: 'Just finished my onsite. Heads up for anyone doing the Senior track: they are heavily indexing on how you handle observability in distributed systems. Knowing how to structure structured logs, distributed tracing, and high-cardinality metrics is basically required for the architecture round now.',
    author: 'staff_eng_throwaway',
    timeAgo: '1 day ago',
    votes: 215,
    comments: 64,
    tags: ['badge-new', 'Interview Prep']
  },
  {
    id: 4,
    title: 'Why O(N) space constraint on duplicate transaction finder? (ENG-402)',
    excerpt: 'For the Contextual DSA ENG-402 question, it forces you to use O(N) space. Why can we not just do an in-place sort? Am I missing a requirement where the original transaction array must remain immutable?',
    author: 'junior_dev_99',
    timeAgo: '2 days ago',
    votes: 18,
    comments: 7,
    tags: ['badge-dsa', 'Contextual DSA']
  },
  {
    id: 5,
    title: 'How to gracefully handle junior devs who write N+1 queries in PRs',
    excerpt: 'I passed ENG-128, but in real life, I find it incredibly difficult to tell a junior dev that their ORM abstraction is basically a ticking time bomb without sounding like a jerk. Does anyone have a good template for commenting on these?',
    author: 'teamlead_sarah',
    timeAgo: '3 days ago',
    votes: 156,
    comments: 42,
    tags: ['badge-pr', 'PR Review']
  }
];

export default function Discussions() {
  const [activeTab, setActiveTab] = useState('trending');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className={styles.layout}>
      {/* Universal Top Nav */}
      <nav style={{ height: '60px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-6)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
          engprep<span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--accent)', marginLeft: '2px', animation: 'cursor-blink 1.2s infinite' }}></span>
        </Link>
        <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms' }}>Dashboard</Link>
          <Link href="/challenges" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms' }}>Challenges</Link>
          <Link href="/roadmap" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms' }}>Roadmap</Link>
          <Link href="/discussions" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none' }}>Discussions</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div className="badge badge-pro">PRO ACTIVE</div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border-strong)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: 600 }}>VP</div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            + New Discussion
          </button>
          
          <div className={styles.sidebarSection} style={{ marginTop: 'var(--space-4)' }}>
            <div className={styles.sidebarTitle}>Categories</div>
            <button className={`${styles.sidebarLink} ${activeCategory === 'all' ? styles.active : ''}`} onClick={() => setActiveCategory('all')}>
              Everything <span className={styles.sidebarCount}>1,204</span>
            </button>
            <button className={`${styles.sidebarLink} ${activeCategory === 'design' ? styles.active : ''}`} onClick={() => setActiveCategory('design')}>
              System Design <span className={styles.sidebarCount}>342</span>
            </button>
            <button className={`${styles.sidebarLink} ${activeCategory === 'warroom' ? styles.active : ''}`} onClick={() => setActiveCategory('warroom')}>
              War Room <span className={styles.sidebarCount}>189</span>
            </button>
            <button className={`${styles.sidebarLink} ${activeCategory === 'dsa' ? styles.active : ''}`} onClick={() => setActiveCategory('dsa')}>
              Contextual DSA <span className={styles.sidebarCount}>421</span>
            </button>
            <button className={`${styles.sidebarLink} ${activeCategory === 'interview' ? styles.active : ''}`} onClick={() => setActiveCategory('interview')}>
              Interview Prep <span className={styles.sidebarCount}>252</span>
            </button>
          </div>

          <div className={styles.sidebarSection} style={{ marginTop: 'var(--space-4)' }}>
            <div className={styles.sidebarTitle}>Your Activity</div>
            <Link href="#" className={styles.sidebarLink}>Your Posts</Link>
            <Link href="#" className={styles.sidebarLink}>Saved</Link>
          </div>
        </aside>

        {/* Main Feed */}
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Discussions</h1>
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${activeTab === 'trending' ? styles.active : ''}`}
                onClick={() => setActiveTab('trending')}
              >Trending</button>
              <button 
                className={`${styles.filterTab} ${activeTab === 'new' ? styles.active : ''}`}
                onClick={() => setActiveTab('new')}
              >New</button>
              <button 
                className={`${styles.filterTab} ${activeTab === 'top' ? styles.active : ''}`}
                onClick={() => setActiveTab('top')}
              >Top (All Time)</button>
            </div>
          </div>

          <div className={styles.discussionList}>
            {MOCK_DISCUSSIONS.map(post => (
              <a href="#" key={post.id} className={styles.discussionItem}>
                <div className={styles.voteBlock}>
                  <button className={styles.voteBtn}>▲</button>
                  <span className={styles.voteCount}>{post.votes}</span>
                </div>
                
                <div className={styles.postContent}>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                  
                  <div className={styles.postMeta}>
                    <div className={styles.metaItem}>
                      {post.tags.map(tag => {
                        if (tag.startsWith('badge-')) return null;
                        const badgeClass = post.tags[0]; // hacky for mock
                        return <span key={tag} className={`badge ${badgeClass}`}>{tag.toUpperCase()}</span>;
                      })}
                    </div>
                    <div className={styles.metaItem}>
                      Posted by <span className={styles.authorTag}>{post.author}</span>
                    </div>
                    <div className={styles.metaItem}>•</div>
                    <div className={styles.metaItem}>{post.timeAgo}</div>
                    <div className={styles.metaItem}>•</div>
                    <div className={styles.commentCount}>
                      <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      {post.comments} comments
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
