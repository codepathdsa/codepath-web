'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

import { CHALLENGES, Challenge } from '@/lib/challenges';
import AppNav from '@/app/components/AppNav';
import { getCreatureForChallenge } from '@/lib/codex';
import { useProgress } from '@/app/hooks/useProgress';

const TYPE_XP: Record<string, number> = {
  'War Room': 350,
  'System Design': 300,
  'PR Review': 200,
  'DSA': 150,
  'Tech Debt Tribunal': 250,
};

const AVAILABLE_LANGS = [...new Set(
  CHALLENGES.filter(c => c.lang).map(c => c.lang as string)
)].sort();

const TYPE_COLOR: Record<string, string> = {
  'War Room': 'var(--type-war)',
  'System Design': 'var(--type-design)',
  'PR Review': 'var(--type-pr)',
  'DSA': 'var(--type-dsa)',
  'Tech Debt Tribunal': '#10b981',
};

const TYPE_COUNTS = (['DSA', 'PR Review', 'War Room', 'System Design', 'Tech Debt Tribunal'] as const).map(t => ({
  type: t,
  count: CHALLENGES.filter(c => c.type === t).length,
}));

export default function ChallengesPage() {
  const { solvedState, capturedCodex } = useProgress();
  const [search, setSearch] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 15;

  const enrichedChallenges = CHALLENGES.map(c => {
    let currentStatus = c.status;
    if (solvedState[c.id]) {
      currentStatus = solvedState[c.id].status === 'solved' ? 'Completed' : 'In Progress';
    }
    return { ...c, status: currentStatus };
  });

  const [activeTracks, setActiveTracks] = useState<string[]>(['Junior', 'Mid', 'Senior']);
  const [activeTypes, setActiveTypes] = useState<string[]>(['DSA', 'PR Review', 'War Room', 'System Design', 'Tech Debt Tribunal']);
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['Not Started', 'In Progress', 'Completed']);
  const [activeLanguages, setActiveLanguages] = useState<string[]>(AVAILABLE_LANGS);

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

  const closeDrawer = () => setSelectedChallenge(null);

  const filteredChallenges = enrichedChallenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchesTrack = activeTracks.length === 0 ? true : activeTracks.includes(c.level);
    const matchesType = activeTypes.length === 0 ? true : activeTypes.includes(c.type);
    const matchesStatus = activeStatuses.length === 0 ? true : activeStatuses.includes(c.status);
    const matchesLang = !c.lang || activeLanguages.includes(c.lang);
    return matchesSearch && matchesTrack && matchesType && matchesStatus && matchesLang;
  });
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const paginatedChallenges = filteredChallenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCurrentPage(1);
    setActiveTracks(['Junior', 'Mid', 'Senior']);
    setActiveTypes(['DSA', 'PR Review', 'War Room', 'System Design', 'Tech Debt Tribunal']);
    setActiveStatuses(['Not Started', 'In Progress', 'Completed']);
    setActiveLanguages(AVAILABLE_LANGS);
  };

  const handleRandomChallenge = () => {
    const randomIndex = Math.floor(Math.random() * enrichedChallenges.length);
    setSelectedChallenge(enrichedChallenges[randomIndex]);
  };

  const getChallengeLink = (c: Challenge) => {
    const typeMap: Record<string, string> = {
      'PR Review': 'pr',
      'DSA': 'dsa',
      'War Room': 'war-room',
      'System Design': 'system-design',
      'Tech Debt Tribunal': 'tribunal',
    };
    return `/challenges/${typeMap[c.type] ?? 'dsa'}/${c.id}`;
  };

  const statusClass = (s: string) => {
    if (s === 'Completed') return styles.statusDone;
    if (s === 'In Progress') return styles.statusWip;
    return styles.statusNew;
  };

  return (
    <div className={styles.layout}>

      {/* -- Nav --------------------------------------------------- */}
      <AppNav />

      {/* -- Raid Banner -------------------------------------------- */}
      <div className={styles.raidBanner}>
        <span className={styles.raidBannerDot} />
        <strong>RAID LIVE</strong> — Checkout Meltdown: Redis cache at 31%. 1,203 engineers in.&nbsp;
        <Link href="/raid" className={styles.raidBannerLink}>Join the raid →</Link>
      </div>

      <div className={styles.body}>

        {/* -- Sidebar -------------------------------------------- */}
        {/* Mobile filter overlay backdrop */}
        {showMobileFilters && (
          <div className={styles.mobileFilterBackdrop} onClick={() => setShowMobileFilters(false)} />
        )}

        <aside className={`${styles.sidebar} ${showMobileFilters ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarTop}>
            <span className={styles.filterHeading}>Filters</span>
            <button className={styles.clearFilters} onClick={clearFilters}>Clear all</button>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterGroupTitle}>Track</div>
            {(['Junior', 'Mid', 'Senior'] as const).map(t => (
              <label key={t} className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={activeTracks.includes(t)}
                  onChange={() => toggleArrayItem(activeTracks, setActiveTracks, t)}
                  className={styles.filterCheck}
                />
                {t} Engineer
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterGroupTitle}>Type</div>
            {(['DSA', 'PR Review', 'War Room', 'System Design', 'Tech Debt Tribunal'] as const).map(type => (
              <label key={type} className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={activeTypes.includes(type)}
                  onChange={() => toggleArrayItem(activeTypes, setActiveTypes, type)}
                  className={styles.filterCheck}
                />
                <span className={styles.filterDot} style={{ '--type-c': TYPE_COLOR[type] } as React.CSSProperties} />
                {type}
              </label>
            ))}
          </div>

          {AVAILABLE_LANGS.length > 0 && (
            <div className={styles.filterGroup}>
              <div className={styles.filterGroupTitle}>Language</div>
              {AVAILABLE_LANGS.map(lang => (
                <label key={lang} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={activeLanguages.includes(lang)}
                    onChange={() => toggleArrayItem(activeLanguages, setActiveLanguages, lang)}
                    className={styles.filterCheck}
                  />
                  {lang}
                </label>
              ))}
            </div>
          )}

          <div className={styles.filterGroup}>
            <div className={styles.filterGroupTitle}>Status</div>
            {(['Not Started', 'In Progress', 'Completed'] as const).map(s => (
              <label key={s} className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={activeStatuses.includes(s)}
                  onChange={() => toggleArrayItem(activeStatuses, setActiveStatuses, s)}
                  className={styles.filterCheck}
                />
                {s}
              </label>
            ))}
          </div>

          <div className={styles.sidebarStats}>
            <div className={styles.sidebarStat}>
              <span className={styles.sidebarStatVal}>{enrichedChallenges.filter(c => c.status === 'Completed').length}</span>
              <span className={styles.sidebarStatLabel}>Solved</span>
            </div>
            <div className={styles.sidebarStat}>
              <span className={styles.sidebarStatVal}>{enrichedChallenges.filter(c => c.status === 'In Progress').length}</span>
              <span className={styles.sidebarStatLabel}>In Progress</span>
            </div>
            <div className={styles.sidebarStat}>
              <span className={styles.sidebarStatVal}>{enrichedChallenges.length}</span>
              <span className={styles.sidebarStatLabel}>Total</span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className={styles.categoryBreakdown}>
            {TYPE_COUNTS.map(({ type, count }) => (
              <div key={type} className={styles.categoryRow}>
                <span className={styles.filterDot} style={{ '--type-c': TYPE_COLOR[type] } as React.CSSProperties} />
                <span className={styles.categoryLabel}>{type}</span>
                <span className={styles.categoryCount}>{count}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* -- Main ----------------------------------------------- */}
        <main className={styles.main}>

          <div className={styles.pageHeader}>
            <div className={styles.pageTitleRow}>
              <h1 className={styles.pageTitle}>Challenges</h1>
              <p className={styles.pageSub}>{filteredChallenges.length} of {enrichedChallenges.length} scenarios shown</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.filterToggleBtn}
                onClick={() => setShowMobileFilters(f => !f)}
                aria-label="Toggle filters"
              >
                ☰ Filters
              </button>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>⌕</span>
                <input
                  type="text"
                  placeholder="Search by title, ID, keyword…"
                  className={styles.searchInput}
                  value={search}
                  onChange={handleSearch}
                />
                {search && (
                  <button className={styles.searchClear} onClick={() => { setSearch(''); setCurrentPage(1); }}>✕</button>
                )}
              </div>
              <button className={styles.randomBtn} onClick={handleRandomChallenge}>⚄ Random</button>
            </div>
          </div>

          <div className={styles.scrollArea}>

            {/* Pinned strip */}
            <div className={styles.stripRow}>
              <Link href="/raid" className={`${styles.stripCard} ${styles.stripCardRaid}`}>
                <div className={styles.stripCardEyebrow}>🔴 This week&apos;s Raid</div>
                <div className={styles.stripCardTitle}>Checkout Meltdown: Redis cache at 31%</div>
                <span className={`badge badge-war ${styles.stripBadge}`}>War Room</span>
                <div className={styles.stripXp}>+1,500 XP · 1,203 engineers live</div>
              </Link>
              {(() => {
                const dsaChallenge = enrichedChallenges.find(c => c.id === 'ENG-DSA-001');
                return dsaChallenge ? (
                  <div className={styles.stripCard} onClick={(e) => openDrawer(e, dsaChallenge)}>
                    <div className={styles.stripCardEyebrow}>Weakness: Data Structures</div>
                    <div className={styles.stripCardTitle}>Payment system double-billing</div>
                    <span className={`badge badge-dsa ${styles.stripBadge}`}>DSA</span>
                    <div className={styles.stripXp}>+150 XP</div>
                  </div>
                ) : null;
              })()}
              <div className={styles.stripCard}>
                <div className={styles.stripCardEyebrow}>Next milestone</div>
                <div className={styles.stripCardTitle}>Complete 3 PR Reviews → unlock Stripe track</div>
                <div className={styles.milestoneBar}>
                  <div className={styles.milestoneBarFill} style={{ width: '33%' }} />
                </div>
                <div className={styles.milestoneLabel}>1 / 3</div>
              </div>
            </div>

            {/* Active filter chips */}
            {(search || activeTracks.length < 3 || activeTypes.length < 5 || activeStatuses.length < 3 || activeLanguages.length < AVAILABLE_LANGS.length) && (
              <div className={styles.activeFilters}>
                {search && (
                  <span className={styles.filterChip}>&ldquo;{search}&rdquo; <button onClick={() => { setSearch(''); setCurrentPage(1); }}>✕</button></span>
                )}
                {activeTracks.length < 3 && activeTracks.map(t => (
                  <span key={t} className={styles.filterChip}>{t} <button onClick={() => toggleArrayItem(activeTracks, setActiveTracks, t)}>✕</button></span>
                ))}
                {activeTypes.length < 5 && activeTypes.map(t => (
                  <span key={t} className={styles.filterChip}>{t} <button onClick={() => toggleArrayItem(activeTypes, setActiveTypes, t)}>✕</button></span>
                ))}
                {activeStatuses.length < 3 && activeStatuses.map(s => (
                  <span key={s} className={styles.filterChip}>{s} <button onClick={() => toggleArrayItem(activeStatuses, setActiveStatuses, s)}>✕</button></span>
                ))}
                {activeLanguages.length < AVAILABLE_LANGS.length && activeLanguages.map(l => (
                  <span key={l} className={styles.filterChip}>{l} <button onClick={() => toggleArrayItem(activeLanguages, setActiveLanguages, l)}>✕</button></span>
                ))}
                <button className={styles.filterChipClear} onClick={clearFilters}>Clear all</button>
              </div>
            )}

            {/* Challenge cards */}
            <div className={styles.cardList}>
              {paginatedChallenges.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyEmoji}>🔍</div>
                  <div className={styles.emptyTitle}>No challenges match</div>
                  <div className={styles.emptySub}>Try adjusting your filters or search term</div>
                  <button className={styles.emptyReset} onClick={clearFilters}>Reset filters</button>
                </div>
              ) : paginatedChallenges.map(c => {
                const creature = getCreatureForChallenge(c.id);
                const isCaptured = capturedCodex.has(creature.id);
                return (
                <div key={c.id} className={styles.challengeCard} onClick={(e) => openDrawer(e, c)}>
                  <div className={styles.cardLeft}>
                    <span className={`badge ${c.badgeClass}`}>{c.type}</span>
                    <div className={styles.cardBody}>
                      <div className={styles.cardId}>{c.id}</div>
                      <div className={styles.cardTitle}>{c.title}</div>
                      <div className={styles.cardMeta}>
                        {c.companies.slice(0, 3).map(comp => (
                          <span key={comp} className={styles.companyTag}>{comp}</span>
                        ))}
                        <span className={styles.cardSep}>·</span>
                        <span className={styles.cardTime}>{c.timeEst}</span>
                        <span className={styles.cardSep}>·</span>
                        <span className={styles.cardLevel}>{c.level}</span>
                        <span className={styles.cardSep}>·</span>
                        <span
                          className={styles.creatureReward}
                          style={{ opacity: isCaptured ? 0.45 : 1 }}
                          title={isCaptured ? `${creature.name} already captured` : `Capture ${creature.name} on completion`}
                        >
                          {creature.icon}&nbsp;{creature.name}{isCaptured ? ' ✓' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={styles.cardXp} style={{ '--type-c': TYPE_COLOR[c.type] } as React.CSSProperties}>
                      +{TYPE_XP[c.type] ?? 150} XP
                    </span>
                    <span className={`${styles.statusBadge} ${statusClass(c.status)}`}>{c.status}</span>
                  </div>
                  <div className={styles.cliReveal}>
                    <span>$ engprep pull {c.id.split('-')[1]}</span>
                    <span className={styles.copyLabel}>copy</span>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                >← Prev</button>
                <span className={styles.pageInfo}>Page {currentPage} / {totalPages}</span>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                >Next →</button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* -- Detail Drawer ------------------------------------------ */}
      {selectedChallenge && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span className={`badge ${selectedChallenge.badgeClass}`}>{selectedChallenge.type}</span>
                <h2 className={styles.drawerTitle}>{selectedChallenge.title}</h2>
              </div>
              <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerMeta}>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Est. Time</span>
                  <span className={styles.metaVal}>{selectedChallenge.timeEst}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Level</span>
                  <span className={styles.metaVal}>{selectedChallenge.level}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>XP Reward</span>
                  <span className={`${styles.metaVal} ${styles.metaXp}`}>+{TYPE_XP[selectedChallenge.type] ?? 150} XP</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.metaLabel}>Rating</span>
                  <span className={styles.metaVal}>★ 4.8 / 5</span>
                </div>
              </div>

              <div className={styles.drawerStatusRow}>
                <span className={`${styles.statusBadge} ${statusClass(selectedChallenge.status)}`}>{selectedChallenge.status}</span>
                {selectedChallenge.companies.map(comp => (
                  <span key={comp} className={styles.companyTag}>{comp}</span>
                ))}
              </div>

              <p className={styles.drawerDesc}>{selectedChallenge.desc}</p>

              <div className={styles.creatureTeaser}>
                <div className={styles.creatureTeaserIcon}>🐉</div>
                <div>
                  <div className={styles.creatureTeaserTitle}>Complete to unlock a creature</div>
                  <div className={styles.creatureTeaserSub}>Each solved challenge has a chance to drop a Codex creature</div>
                </div>
                <Link href="/codex" className={styles.creatureTeaserLink}>View Codex →</Link>
              </div>

              <div className={styles.drawerCli}>
                <div className={styles.drawerCliLabel}>Pull via CLI</div>
                <div className={styles.drawerCliCmd}>$ engprep pull {selectedChallenge.id.split('-')[1]}</div>
              </div>

              <div className={styles.drawerDiscussion}>
                <span>💬 14 engineers discussed this</span>
                <a href="#" className={styles.drawerDiscussLink}>How others solved this (Pro)</a>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <Link href={getChallengeLink(selectedChallenge)} className={styles.startBtn}>
                Start Challenge
              </Link>
              <button className={styles.saveBtn} onClick={closeDrawer}>Save for later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
