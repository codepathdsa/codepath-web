'use client';

import { useState, MouseEvent } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

import { CHALLENGES, Challenge } from '@/lib/challenges';

export default function ChallengesPage() {
  const [search, setSearch] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeTracks, setActiveTracks] = useState<string[]>(['Junior', 'Mid', 'Senior']);
  const [activeTypes, setActiveTypes] = useState<string[]>(['DSA', 'PR Review', 'War Room', 'System Design', 'Tech Debt Tribunal', 'Behavioral']);
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['Not Started', 'In Progress', 'Completed']);

  const toggleArrayItem = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setArr(prev => {
      const newArr = prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item];
      setCurrentPage(1);
      return newArr;
    });
  };

  const openDrawer = (e: MouseEvent, challenge: Challenge) => {
    e.preventDefault();
    setSelectedChallenge(challenge);
  };

  const closeDrawer = () => {
    setSelectedChallenge(null);
  };

  // Pagination Logic
  const filteredChallenges = CHALLENGES.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchesTrack = activeTracks.length === 0 ? true : activeTracks.includes(c.level);
    const matchesType = activeTypes.length === 0 ? true : activeTypes.includes(c.type);
    const matchesStatus = activeStatuses.length === 0 ? true : activeStatuses.includes(c.status);
    return matchesSearch && matchesTrack && matchesType && matchesStatus;
  });
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const paginatedChallenges = filteredChallenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const clearFilters = () => {
    setSearch('');
    setCurrentPage(1);
    setActiveTracks([]);
    setActiveTypes([]);
    setActiveStatuses([]);
  };

  const handleRandomChallenge = () => {
    const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
    setSelectedChallenge(CHALLENGES[randomIndex]);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.nav}>
        <Link href="/" className={styles.navLogo}>engprep<span></span></Link>
      </header>

      <div className={styles.container}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div>
            <button className={styles.clearFilters} onClick={clearFilters}>Clear All</button>
            <h2 className="t-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Filters</h2>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterTitle}>Track</div>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTracks.includes('Junior')} onChange={() => toggleArrayItem(activeTracks, setActiveTracks, 'Junior')} /> Junior Engineer</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTracks.includes('Mid')} onChange={() => toggleArrayItem(activeTracks, setActiveTracks, 'Mid')} /> Mid Engineer</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTracks.includes('Senior')} onChange={() => toggleArrayItem(activeTracks, setActiveTracks, 'Senior')} /> Senior Engineer</label>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterTitle}>Type</div>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTypes.includes('DSA')} onChange={() => toggleArrayItem(activeTypes, setActiveTypes, 'DSA')} /> Contextual DSA</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTypes.includes('PR Review')} onChange={() => toggleArrayItem(activeTypes, setActiveTypes, 'PR Review')} /> PR Review</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTypes.includes('War Room')} onChange={() => toggleArrayItem(activeTypes, setActiveTypes, 'War Room')} /> War Room</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTypes.includes('System Design')} onChange={() => toggleArrayItem(activeTypes, setActiveTypes, 'System Design')} /> System Design</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeTypes.includes('Tech Debt Tribunal')} onChange={() => toggleArrayItem(activeTypes, setActiveTypes, 'Tech Debt Tribunal')} /> Tech Debt Tribunal</label>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterTitle}>Status</div>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeStatuses.includes('Not Started')} onChange={() => toggleArrayItem(activeStatuses, setActiveStatuses, 'Not Started')} /> Not Started</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeStatuses.includes('In Progress')} onChange={() => toggleArrayItem(activeStatuses, setActiveStatuses, 'In Progress')} /> In Progress</label>
            <label className={styles.filterLabel}><input type="checkbox" className="checkbox" checked={activeStatuses.includes('Completed')} onChange={() => toggleArrayItem(activeStatuses, setActiveStatuses, 'Completed')} /> Completed</label>
          </div>
        </aside>

        {/* Main Panel */}
        <main className={styles.mainPanel}>
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Challenges</h1>
              <p className={styles.pageSub}>{CHALLENGES.length} scenarios across 5 engineering tracks</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.searchWrap}>
                <input 
                  type="text" 
                  placeholder="Search ENG tickets, topics, keywords..." 
                  className={styles.searchInput}
                  value={search}
                  onChange={handleSearch} 
                />
              </div>
              <button className="btn-ghost" onClick={handleRandomChallenge}>Random Challenge</button>
            </div>
          </div>

          <div className={styles.scrollArea}>
            <div className={styles.sectionHeader}>Recommended for you</div>
            <div className={styles.horizontalStrip}>
              <div className={styles.stripCard} onClick={(e) => openDrawer(e, CHALLENGES[1])}>
                <div className={styles.stripCardLabel}>This Week's War Room</div>
                <div className="t-body" style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>Checkout failing: Redis hit rate at 31%</div>
                <span className="badge badge-war">War Room</span>
              </div>
              <div className={styles.stripCard} onClick={(e) => openDrawer(e, CHALLENGES[0])}>
                <div className={styles.stripCardLabel}>Weakness: Data Structures</div>
                <div className="t-body" style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>Payment system double-billing</div>
                <span className="badge badge-dsa">DSA Contextual</span>
              </div>
              <div className={styles.stripCard}>
                <div className={styles.stripCardLabel}>Your Next Milestone</div>
                <div className="t-body" style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>Complete 3 PR Reviews to unlock Stripe track</div>
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' }}>
                  <div style={{ background: 'var(--accent)', width: '33%', height: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className={styles.sectionHeader}>All Challenges</div>
            <div className={styles.cardList}>
              {paginatedChallenges.map(c => (
                <div key={c.id} className={styles.challengeCard} onClick={(e) => openDrawer(e, c)}>
                  <div className={styles.cardMain}>
                    <span className={`badge ${c.badgeClass}`}>{c.type}</span>
                    <div className={styles.cardTitleText}>{c.id}: {c.title}</div>
                    <div className={styles.companyTags}>
                      {c.companies.map(comp => <span key={comp} className={styles.tagCompany}>{comp}</span>)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div className="t-body" style={{ fontSize: '12px' }}>{c.timeEst}</div>
                    <div className={styles.cardDot}></div>
                    <div className="badge badge-new" style={{ minWidth: '95px', justifyContent: 'center' }}>{c.status}</div>
                  </div>

                  <div className={styles.cliReveal}>
                    <span>$ engprep pull {c.id.split('-')[1]}</span>
                    <span className={styles.copyLabel}>Copy</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)', padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  className="btn-ghost" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  ← Previous
                </button>
                <div className="t-body" style={{ color: 'var(--text-secondary)' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  className="btn-ghost" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Drawer overlay */}
      {selectedChallenge && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span className={`badge ${selectedChallenge.badgeClass}`} style={{ marginBottom: '12px' }}>{selectedChallenge.type}</span>
                <h2 className={styles.drawerTitle}>{selectedChallenge.title}</h2>
              </div>
              <button className={styles.drawerClose} onClick={closeDrawer}>&times;</button>
            </div>
            
            <div className={styles.drawerBody}>
              <div className={styles.drawerMeta}>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.label}>Est. Time</span>
                  <span className={styles.value}>{selectedChallenge.timeEst}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.label}>Level</span>
                  <span className={styles.value}>{selectedChallenge.level}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.label}>Rating</span>
                  <span className={styles.value}>★ 4.8 / 5</span>
                </div>
              </div>

              <div className={styles.drawerDesc}>
                {selectedChallenge.desc}
              </div>

              <div className={styles.drawerCli}>
                <div className={styles.drawerCliLabel}>Pull via CLI</div>
                <div className={styles.drawerCliCmd}>$ engprep pull {selectedChallenge.id.split('-')[1]}</div>
              </div>
              
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ marginBottom: '8px' }}>💬 14 engineers discussed this</div>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>How others solved this</a> (Pro)
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <Link 
                href={`/challenges/${selectedChallenge.type === 'PR Review' ? 'pr' : selectedChallenge.type === 'DSA' ? 'dsa' : selectedChallenge.type === 'War Room' ? 'war-room' : selectedChallenge.type === 'System Design' ? 'system-design' : selectedChallenge.type === 'Tech Debt Tribunal' ? 'tribunal' : 'behavioral'}/${selectedChallenge.id}`} 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Start Challenge
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
