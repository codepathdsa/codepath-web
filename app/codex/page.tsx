'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';
import { useProgress } from '@/app/hooks/useProgress';
import {
  CREATURES,
  CODEX_CATEGORIES,
  CREATURES_BY_ID,
  TOTAL_CREATURES,
  getCategoryProgress,
  type CodexCategory,
  type Creature,
} from '@/lib/codex';

// --- Sub-components ----------------------------------------------------------

function CreatureCard({
  creature,
  captured,
  isShiny,
  onClick,
}: {
  creature: Creature;
  captured: boolean;
  isShiny: boolean;
  onClick: (c: Creature) => void;
}) {
  const rarityLabel = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    legendary: 'Legendary',
  }[creature.rarity];

  const stageLabel = ['', 'Stage I', 'Stage II', 'Stage III'][creature.stage];

  return (
    <button
      className={`${styles.creatureCard} ${captured ? styles.captured : styles.undiscovered} ${isShiny ? styles.shiny : ''} ${styles[`rarity_${creature.rarity}`]}`}
      style={captured ? ({ '--creature-color': creature.color } as React.CSSProperties) : undefined}
      onClick={() => onClick(creature)}
      title={captured ? creature.name : '???'}
      aria-label={captured ? `${creature.name} — ${rarityLabel}` : 'Undiscovered creature'}
    >
      {captured ? (
        <>
          <div className={styles.creatureGlow} />
          <div className={styles.stageRow}>
            {[1, 2, 3].map(s => (
              <span
                key={s}
                className={`${styles.stageDot} ${creature.stage >= s ? styles.stageFilled : ''}`}
              />
            ))}
          </div>
          {isShiny && <span className={styles.shinyBadge}>✦</span>}
          <div className={styles.creatureIcon}>{creature.icon}</div>
          <div className={styles.creatureName}>{creature.name}</div>
          <div className={styles.creatureMeta}>
            <span className={styles.stagePill}>{stageLabel}</span>
            <span className={`${styles.rarityPill} ${styles[`rarityColor_${creature.rarity}`]}`}>
              {rarityLabel}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.unknownIcon}>?</div>
          <div className={styles.unknownName}>???</div>
          <div className={styles.unknownHint}>Solve a challenge to reveal</div>
        </>
      )}
    </button>
  );
}

function CategoryRow({
  category,
  capturedSet,
  selectedCategory,
  onSelect,
}: {
  category: CodexCategory;
  capturedSet: Set<string>;
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
}) {
  const progress = getCategoryProgress(category.id, capturedSet);
  const isComplete = progress.captured === progress.total && progress.total > 0;
  const isSelected = selectedCategory === category.id;

  return (
    <button
      className={`${styles.categoryRow} ${isSelected ? styles.categorySelected : ''} ${isComplete ? styles.categoryComplete : ''}`}
      style={{ '--cat-color': category.color } as React.CSSProperties}
      onClick={() => onSelect(isSelected ? null : category.id)}
    >
      <div className={styles.catLeft}>
        <div className={styles.catName}>
          {isComplete && <span className={styles.catCheck}>✓</span>}
          {category.name}
        </div>
        <div className={styles.catDesc}>{category.description}</div>
      </div>
      <div className={styles.catRight}>
        <div className={styles.catCount}>
          <span className={styles.catCaptured}>{progress.captured}</span>
          <span className={styles.catTotal}>/{progress.total}</span>
        </div>
        <div className={styles.catBarTrack}>
          <div
            className={styles.catBarFill}
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function CreatureDetailPanel({
  creature,
  captured,
  isShiny,
  capturedSet,
  onClose,
}: {
  creature: Creature | null;
  captured: boolean;
  isShiny: boolean;
  capturedSet: Set<string>;
  onClose: () => void;
}) {
  if (!creature) return null;

  const prevCreature = creature.evolvesFrom ? CREATURES_BY_ID[creature.evolvesFrom] : null;
  const nextCreature = creature.evolvesTo ? CREATURES_BY_ID[creature.evolvesTo] : null;

  return (
    <div
      className={styles.detailOverlay}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${styles.detailPanel} ${captured ? styles.detailCaptured : ''}`}
        style={{ '--creature-color': creature.color } as React.CSSProperties}
      >
        <button className={styles.detailClose} onClick={onClose}>
          ✕
        </button>

        <div className={styles.detailHeader}>
          <div className={styles.detailIconWrap}>
            <div className={styles.detailIconGlow} />
            <div className={styles.detailIcon}>
              {captured ? creature.icon : '?'}
            </div>
            {isShiny && <div className={styles.detailShiny}>✦ Perfect Run</div>}
          </div>
          <div>
            <div className={styles.detailName}>
              {captured ? creature.name : '??? Undiscovered'}
            </div>
            <div className={styles.detailDomain}>
              {creature.domain.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} ·{' '}
              <span className={`${styles.detailRarity} ${styles[`rarityColor_${creature.rarity}`]}`}>
                {creature.rarity.charAt(0).toUpperCase() + creature.rarity.slice(1)}
              </span>
            </div>
            <div className={styles.detailStages}>
              {[1, 2, 3].map(s => (
                <span
                  key={s}
                  className={`${styles.detailStageDot} ${creature.stage >= s ? styles.detailStageFilled : ''}`}
                />
              ))}
              <span className={styles.detailStageLabel}>
                Stage {['I', 'II', 'III'][creature.stage - 1]}
              </span>
            </div>
          </div>
        </div>

        {captured && (
          <p className={styles.detailDesc}>{creature.description}</p>
        )}

        <div className={styles.detailXP}>
          <span className={styles.detailXPLabel}>XP Value</span>
          <span className={styles.detailXPVal}>+{creature.xpValue} XP</span>
        </div>

        {(prevCreature || nextCreature) && (
          <div className={styles.evolutionChain}>
            <div className={styles.evolutionTitle}>Evolution Chain</div>
            <div className={styles.evolutionRow}>
              {prevCreature && (
                <>
                  <div className={`${styles.evoNode} ${capturedSet.has(prevCreature.id) ? styles.evoCaptured : styles.evoLocked}`}>
                    <span className={styles.evoIcon}>
                      {capturedSet.has(prevCreature.id) ? prevCreature.icon : '?'}
                    </span>
                    <span className={styles.evoName}>
                      {capturedSet.has(prevCreature.id) ? prevCreature.name : '???'}
                    </span>
                  </div>
                  <div className={styles.evoArrow}>→</div>
                </>
              )}
              <div className={`${styles.evoNode} ${styles.evoActive}`}>
                <span className={styles.evoIcon}>{captured ? creature.icon : '?'}</span>
                <span className={styles.evoName}>{captured ? creature.name : '???'}</span>
              </div>
              {nextCreature && (
                <>
                  <div className={styles.evoArrow}>→</div>
                  <div className={`${styles.evoNode} ${capturedSet.has(nextCreature.id) ? styles.evoCaptured : styles.evoLocked}`}>
                    <span className={styles.evoIcon}>
                      {capturedSet.has(nextCreature.id) ? nextCreature.icon : '?'}
                    </span>
                    <span className={styles.evoName}>
                      {capturedSet.has(nextCreature.id) ? nextCreature.name : '???'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!captured && (
          <Link href="/challenges" className="btn-primary" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            Solve a challenge to capture →
          </Link>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---------------------------------------------------------------

export default function CodexPage() {
  const { capturedCodex, shinyCodex, loading } = useProgress();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'captured' | 'undiscovered'>('all');
  const [detailCreature, setDetailCreature] = useState<Creature | null>(null);

  if (loading) {
    return (
      <div className={styles.layout}>
        <AppNav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          Hydrating Codex…
        </div>
      </div>
    );
  }

  // Derive display list
  const allCreatures = selectedCategory
    ? CODEX_CATEGORIES.find(c => c.id === selectedCategory)?.creatureIds.map(id => CREATURES_BY_ID[id]) ?? []
    : CREATURES;

  const displayCreatures = allCreatures.filter(c => {
    if (filter === 'captured') return capturedCodex.has(c.id);
    if (filter === 'undiscovered') return !capturedCodex.has(c.id);
    return true;
  });

  const capturedCount = [...capturedCodex].filter(id => CREATURES_BY_ID[id]).length;
  const totalPct = Math.round((capturedCount / TOTAL_CREATURES) * 100);

  return (
    <div className={styles.layout}>
      <AppNav />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <div className="t-section-label" style={{ marginBottom: 'var(--space-2)' }}>
              Mastery Codex
            </div>
            <h1 className={styles.pageTitle}>Capture. Evolve. Master.</h1>
            <p className={styles.pageSubtitle}>
              Every engineering skill you master captures a creature. 
              Complete evolution chains to prove true mastery.
            </p>
          </div>

          <div className={styles.globalProgress}>
            <svg className={styles.ringChart} viewBox="0 0 80 80">
              <circle
                className={styles.ringBg}
                cx="40" cy="40" r="32"
                strokeWidth="5"
                fill="none"
              />
              <circle
                className={styles.ringFill}
                cx="40" cy="40" r="32"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${totalPct * 2.01} 201`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className={styles.ringCenter}>
              <span className={styles.ringPct}>{capturedCount}</span>
              <span className={styles.ringTotal}>/{TOTAL_CREATURES}</span>
            </div>
            <div className={styles.ringLabel}>Captured</div>
          </div>
        </div>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}>Categories</div>
            <button
              className={`${styles.categoryRow} ${selectedCategory === null ? styles.categorySelected : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <div className={styles.catLeft}>
                <div className={styles.catName}>All Creatures</div>
                <div className={styles.catDesc}>Entire Codex — {TOTAL_CREATURES} entries</div>
              </div>
              <div className={styles.catRight}>
                <div className={styles.catCount}>
                  <span className={styles.catCaptured}>{capturedCount}</span>
                  <span className={styles.catTotal}>/{TOTAL_CREATURES}</span>
                </div>
                <div className={styles.catBarTrack}>
                  <div className={styles.catBarFill} style={{ width: `${totalPct}%` }} />
                </div>
              </div>
            </button>

            {CODEX_CATEGORIES.map(cat => (
              <CategoryRow
                key={cat.id}
                category={cat}
                capturedSet={capturedCodex}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            ))}
          </aside>

          <section className={styles.gridSection}>
            <div className={styles.filterBar}>
              <div className={styles.filterTabs}>
                {(['all', 'captured', 'undiscovered'] as const).map(f => (
                  <button
                    key={f}
                    className={`${styles.filterTab} ${filter === f ? styles.filterActive : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'captured' && (
                      <span className={styles.filterBadge}>{capturedCount}</span>
                    )}
                    {f === 'undiscovered' && (
                      <span className={styles.filterBadge}>{TOTAL_CREATURES - capturedCount}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className={styles.filterCount}>
                {displayCreatures.length} creature{displayCreatures.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className={styles.creatureGrid}>
              {displayCreatures.map(creature => (
                <CreatureCard
                  key={creature.id}
                  creature={creature}
                  captured={capturedCodex.has(creature.id)}
                  isShiny={shinyCodex.has(creature.id)}
                  onClick={setDetailCreature}
                />
              ))}
            </div>

            {displayCreatures.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔭</div>
                <div className={styles.emptyTitle}>Nothing to show</div>
                <p className={styles.emptyBody}>
                  {filter === 'captured'
                    ? 'You haven\'t captured any creatures in this category yet. Solve challenges to start.'
                    : 'You\'ve captured everything here. Legendary status achieved.'}
                </p>
                {filter === 'captured' && (
                  <Link href="/challenges" className="btn-primary">
                    Find a challenge →
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <CreatureDetailPanel
        creature={detailCreature}
        captured={detailCreature ? capturedCodex.has(detailCreature.id) : false}
        isShiny={detailCreature ? shinyCodex.has(detailCreature.id) : false}
        capturedSet={capturedCodex}
        onClose={() => setDetailCreature(null)}
      />
    </div>
  );
}
