'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// --- Plan data ----------------------------------------------------------------

interface PlanFeature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  legend: string | boolean;
}

const FEATURES: PlanFeature[] = [
  { label: 'Challenges',            free: '10 (sampler)',       pro: 'All 150+',            legend: 'All 150+' },
  { label: 'War Room incidents',    free: '2 free attempts',    pro: 'Unlimited',            legend: 'Unlimited + early access' },
  { label: 'System Design rooms',   free: '2 free attempts',    pro: 'Unlimited',            legend: 'Unlimited' },
  { label: 'PR Code Reviews',       free: '3 free attempts',    pro: 'Unlimited',            legend: 'Unlimited' },
  { label: 'Mastery Codex',         free: '10 creatures',       pro: 'All 31 creatures',     legend: 'All 31 + Shiny variants' },
  { label: 'Daily Encounter',       free: true,                 pro: true,                   legend: true },
  { label: 'Streak Engine',         free: 'View only',          pro: '+ Shields (1/mo)',     legend: '+ Shields (3/mo)' },
  { label: 'Streak Shields',        free: false,                pro: '1 per month',          legend: '3 per month' },
  { label: 'Engineering rank card', free: true,                 pro: '+ Rank flair badge',   legend: '+ Custom color theme' },
  { label: 'Leaderboard',          free: 'View only',          pro: 'Top 100 entry',        legend: 'Global + filter by company' },
  { label: 'Notes panel',           free: false,                pro: true,                   legend: 'true + AI suggest' },
  { label: 'Activity history',      free: '7 days',             pro: 'Full history',         legend: 'Full + export CSV' },
  { label: 'XP & level system',     free: true,                 pro: '+ XP boosts',          legend: '+ Double XP events' },
  { label: 'Interview roadmap',     free: '4-week preview',     pro: '12-week full plan',    legend: '12-week + custom schedule' },
  { label: 'Support',               free: 'Community forum',   pro: 'Email (48h)',          legend: 'Priority email (8h)' },
];

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel from your account settings with one click. If you cancel, you keep access until the end of your billing period. No questions asked.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free tier gives you permanent access to 10 challenges, 2 War Rooms, and the full Codex viewer. Upgrade to Pro when you\'re ready to go unlimited.',
  },
  {
    q: 'What\'s the difference between Pro and Legendary?',
    a: 'Pro is everything most engineers need. Legendary adds Shiny creature variants, 3 Streak Shields per month, custom profile themes, Double XP events, and priority support. It\'s for the obsessive few.',
  },
  {
    q: 'Do you offer student or team discounts?',
    a: 'Email us at team@engprep.dev with a .edu address or your company name. We\'ll sort something out.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit/debit cards via Stripe. We\'re working on adding PayPal. Invoicing available for teams of 5+.',
  },
];

// Stripe price IDs — replace with real IDs from the Stripe Dashboard
const PRICE_IDS = {
  PRO_MONTHLY:    'price_pro_monthly_placeholder',
  PRO_ANNUAL:     'price_pro_annual_placeholder',
  LEGEND_MONTHLY: 'price_legend_monthly_placeholder',
  LEGEND_ANNUAL:  'price_legend_annual_placeholder',
};

// --- Components ---------------------------------------------------------------

function FeatureVal({ val }: { val: string | boolean }) {
  if (val === true)  return <span className={`${styles.featureVal} ${styles.featureYes}`}>✓</span>;
  if (val === false) return <span className={`${styles.featureVal} ${styles.featureNo}`}>—</span>;
  return <span className={`${styles.featureVal} ${styles.featureText}`}>{val}</span>;
}

function CheckoutButton({
  label,
  priceId,
  variant,
}: {
  label: string;
  priceId: string;
  variant: 'pro' | 'legend' | 'free';
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (variant === 'free') {
      router.push('/signup');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (res.status === 401) {
        // Not logged in — go sign up first
        router.push('/signup?next=/pricing');
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${styles.ctaBtn} ${styles[`cta_${variant}`]}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <span className={styles.ctaSpinner} /> : label}
    </button>
  );
}

// --- Main Page ----------------------------------------------------------------

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const proMonthly   = 39;
  const proAnnual    = Math.round((399 / 12));     // ~$33/mo
  const legendMonthly = 79;
  const legendAnnual  = Math.round((799 / 12));    // ~$67/mo

  const proPrice    = annual ? '$399' : '$39';
  const legendPrice = annual ? '$799' : '$79';
  const proPer      = annual ? '/year' : '/month';
  const legendPer   = annual ? '/year' : '/month';
  const proSub      = annual ? `~$${proAnnual}/mo — save $69` : `$${proMonthly}/mo billed monthly`;
  const legendSub   = annual ? `~$${legendAnnual}/mo — save $149` : `$${legendMonthly}/mo billed monthly`;

  const proPriceId    = annual ? PRICE_IDS.PRO_ANNUAL    : PRICE_IDS.PRO_MONTHLY;
  const legendPriceId = annual ? PRICE_IDS.LEGEND_ANNUAL : PRICE_IDS.LEGEND_MONTHLY;

  return (
    <div className={styles.layout}>
      {/* -- Nav ----------------------------------------------------------- */}
      <AppNav />

      <main className={styles.main}>

        {/* -- Urgency banner -------------------------------------------- */}
        <div className={styles.urgencyBanner}>
          <span className={styles.urgencyDot} />
          <span>
            <strong>Early adopter pricing</strong> — Pro locks in at $399/yr forever.
            Price increases to $599/yr when we hit 500 members.
          </span>
          <span className={styles.urgencyCount}>247 / 500 slots filled</span>
        </div>

        {/* -- Hero ------------------------------------------------------- */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>Pricing</div>
          <h1 className={styles.heroTitle}>
            Stop grinding LeetCode.<br />
            <span className={styles.heroAccent}>Start thinking like a senior engineer.</span>
          </h1>
          <p className={styles.heroSub}>
            Real incident War Rooms, system design with constraints, code reviews that teach you
            to spot N+1 bugs — not memorize array rotations.
          </p>

          {/* Social proof */}
          <div className={styles.socialRow}>
            <div className={styles.avatarStack}>
              {['SL', 'PR', 'AK', 'MN', 'VB'].map((init) => (
                <div key={init} className={styles.socialAvatar}>{init}</div>
              ))}
            </div>
            <span className={styles.socialText}>
              <strong>1,243 engineers</strong> currently preparing for FAANG & top startups
            </span>
          </div>
        </div>

        {/* -- Toggle ----------------------------------------------------- */}
        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggleBtn} ${!annual ? styles.toggleActive : ''}`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`${styles.toggleBtn} ${annual ? styles.toggleActive : ''}`}
            onClick={() => setAnnual(true)}
          >
            Annual
            <span className={styles.saveBadge}>Save 15%</span>
          </button>
        </div>

        {/* -- Plan cards ------------------------------------------------- */}
        <div className={styles.plansGrid}>

          {/* Free */}
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>🌱</div>
              <div className={styles.planName}>Free</div>
              <div className={styles.planTagline}>Explore the platform</div>
            </div>
            <div className={styles.planPrice}>
              <span className={styles.priceNum}>$0</span>
              <span className={styles.pricePer}> forever</span>
            </div>
            <div className={styles.planPriceNote}>No credit card required</div>
            <CheckoutButton label="Start for free" priceId="" variant="free" />
            <div className={styles.planDivider} />
            <ul className={styles.planHighlights}>
              <li>10 challenges (sampler set)</li>
              <li>2 War Room attempts</li>
              <li>10 Codex creatures</li>
              <li>Streak tracking</li>
              <li>Public profile & rank card</li>
            </ul>
          </div>

          {/* Pro — featured */}
          <div className={`${styles.planCard} ${styles.planFeatured}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <div className={styles.planGlow} aria-hidden />
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>⚡</div>
              <div className={styles.planName}>Pro</div>
              <div className={styles.planTagline}>Serious interview prep</div>
            </div>
            <div className={styles.planPrice}>
              <span className={styles.priceNum}>{proPrice}</span>
              <span className={styles.pricePer}>{proPer}</span>
            </div>
            <div className={styles.planPriceNote}>{proSub}</div>
            <CheckoutButton label="Upgrade to Pro →" priceId={proPriceId} variant="pro" />
            <div className={styles.planDivider} />
            <ul className={styles.planHighlights}>
              <li>Everything in Free</li>
              <li><strong>All 150+ challenges</strong></li>
              <li><strong>All 31 Codex creatures</strong></li>
              <li>Unlimited War Rooms</li>
              <li>1 Streak Shield / month</li>
              <li>XP boosts + leaderboard</li>
              <li>Full activity history</li>
              <li>12-week roadmap</li>
            </ul>
          </div>

          {/* Legendary */}
          <div className={`${styles.planCard} ${styles.planLegendary}`}>
            <div className={styles.legendBadge}>🔮 Legendary</div>
            <div className={styles.legendGlow} aria-hidden />
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>🔮</div>
              <div className={styles.planName}>Legendary</div>
              <div className={styles.planTagline}>For the obsessive few</div>
            </div>
            <div className={styles.planPrice}>
              <span className={`${styles.priceNum} ${styles.priceGold}`}>{legendPrice}</span>
              <span className={styles.pricePer}>{legendPer}</span>
            </div>
            <div className={styles.planPriceNote}>{legendSub}</div>
            <CheckoutButton label="Go Legendary →" priceId={legendPriceId} variant="legend" />
            <div className={styles.planDivider} />
            <ul className={styles.planHighlights}>
              <li>Everything in Pro</li>
              <li><strong>Shiny creature variants</strong></li>
              <li>3 Streak Shields / month</li>
              <li>Double XP weekend events</li>
              <li>Custom profile theme</li>
              <li>Global leaderboard filter</li>
              <li>Priority support (8h)</li>
              <li>Early access to new War Rooms</li>
            </ul>
          </div>
        </div>

        {/* -- Full comparison table -------------------------------------- */}
        <div className={styles.tableWrap}>
          <div className={styles.tableTitle}>Full Feature Comparison</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thFeature}>Feature</th>
                <th className={styles.th}>Free</th>
                <th className={`${styles.th} ${styles.thPro}`}>Pro</th>
                <th className={`${styles.th} ${styles.thLegend}`}>Legendary</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.tdLabel}>{f.label}</td>
                  <td className={styles.td}><FeatureVal val={f.free} /></td>
                  <td className={`${styles.td} ${styles.tdPro}`}><FeatureVal val={f.pro} /></td>
                  <td className={styles.td}><FeatureVal val={f.legend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* -- Why not LeetCode premium ---------------------------------- */}
        <div className={styles.diffSection}>
          <div className={styles.diffTitle}>Why engineers choose engprep over LeetCode Premium</div>
          <div className={styles.diffGrid}>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>🔴</div>
              <div className={styles.diffHead}>LeetCode Premium ($159/yr)</div>
              <ul className={styles.diffList}>
                <li>Pattern-matching puzzles</li>
                <li>Company-specific question lists</li>
                <li>Editorial solutions (memorize this)</li>
                <li>No real-world incident context</li>
                <li>No system design simulation</li>
              </ul>
            </div>
            <div className={`${styles.diffCard} ${styles.diffCardUs}`}>
              <div className={styles.diffIcon}>⚡</div>
              <div className={styles.diffHead}>engprep Pro ($399/yr)</div>
              <ul className={styles.diffList}>
                <li>Real incident War Rooms with a timer</li>
                <li>System design with failure-injection</li>
                <li>PR reviews that teach production thinking</li>
                <li>Mastery creature system (you actually remember)</li>
                <li>Adaptive roadmap based on your weak spots</li>
              </ul>
            </div>
          </div>
        </div>

        {/* -- FAQ ------------------------------------------------------- */}
        <div className={styles.faqSection}>
          <div className={styles.faqTitle}>Frequently asked questions</div>
          <div className={styles.faqList}>
            {FAQ.map((item, i) => (
              <div key={i} className={`${styles.faqItem} ${expandedFaq === i ? styles.faqOpen : ''}`}>
                <button
                  className={styles.faqQ}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  aria-expanded={expandedFaq === i}
                >
                  <span>{item.q}</span>
                  <span className={styles.faqChevron}>{expandedFaq === i ? '−' : '+'}</span>
                </button>
                {expandedFaq === i && (
                  <div className={styles.faqA}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* -- Bottom CTA ------------------------------------------------- */}
        <div className={styles.bottomCta}>
          <div className={styles.bottomCtaTitle}>
            Your dream offer is one incident response away.
          </div>
          <div className={styles.bottomCtaSub}>
            Start free. Upgrade when you're ready to go all in.
          </div>
          <div className={styles.bottomCtaActions}>
            <Link href="/signup" className={styles.ctaLarge}>
              Start for free — no card needed
            </Link>
            <Link href="/challenges" className={styles.ctaSecondary}>
              Browse free challenges →
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
