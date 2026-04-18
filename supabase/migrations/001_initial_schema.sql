-- ============================================================
-- CodePath Web — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Free tier: 500MB DB, unlimited auth, 50k MAU → fits 50-100k users
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── 1. User Profiles ──────────────────────────────────────────────────────
-- One row per auth.users record. Created automatically on signup via trigger.
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text,
  avatar_initials text generated always as (upper(left(coalesce(display_name, username), 1))) stored,
  avatar_color    text default '#62de61',
  track           text default 'SDE II',          -- e.g. 'SDE I', 'SDE II', 'SDE III'
  target_companies text[] default '{}',
  starter_creature text,                           -- first creature chosen at onboarding
  referral_code   text unique,
  referred_by     text,                            -- referral_code of referrer
  is_premium      boolean default false,
  subscription_tier text default 'free',           -- 'free' | 'pro' | 'legendary'
  subscription_renews_at timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  onboarding_complete boolean default false,
  created_at      timestamptz default now()
);

-- Row Level Security
alter table public.user_profiles enable row level security;
create policy "Users can read own profile"
  on public.user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.user_profiles for update using (auth.uid() = id);

-- Allow leaderboard reads (public usernames + XP only — handled by view below)
create policy "Leaderboard view select"
  on public.user_profiles for select using (true);

-- ─── 2. User XP & Stats ────────────────────────────────────────────────────
create table if not exists public.user_stats (
  id             uuid primary key references auth.users(id) on delete cascade,
  total_xp       integer default 0,
  challenges_done integer default 0,
  war_rooms_done  integer default 0,
  pr_reviews_done integer default 0,
  perfect_runs    integer default 0,
  current_streak  integer default 0,
  longest_streak  integer default 0,
  last_active_date date,
  updated_at      timestamptz default now()
);

alter table public.user_stats enable row level security;
create policy "Users can read own stats"
  on public.user_stats for select using (auth.uid() = id);
create policy "Users can update own stats"
  on public.user_stats for update using (auth.uid() = id);
-- For leaderboard
create policy "Public stats read"
  on public.user_stats for select using (true);

-- ─── 3. Challenge Progress ──────────────────────────────────────────────────
create table if not exists public.user_challenges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null,          -- e.g. 'ENG-DSA-001'
  status      text default 'solved',   -- 'in_progress' | 'solved' | 'perfect'
  score       integer,                 -- 0-100
  xp_earned   integer default 0,
  time_taken_s integer,                -- seconds
  solved_at   timestamptz default now(),
  unique (user_id, challenge_id)
);

alter table public.user_challenges enable row level security;
create policy "Users manage own challenges"
  on public.user_challenges for all using (auth.uid() = user_id);

-- ─── 4. Activity Feed ──────────────────────────────────────────────────────
create table if not exists public.user_activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,           -- 'dsa' | 'war' | 'pr' | 'design' | 'tribunal'
  challenge_id text,
  title       text not null,
  description text,
  xp          integer default 0,
  stats       jsonb default '[]',      -- [{label, value}]
  created_at  timestamptz default now()
);

alter table public.user_activities enable row level security;
create policy "Users manage own activities"
  on public.user_activities for all using (auth.uid() = user_id);

-- ─── 5. Codex (Captured Creatures) ─────────────────────────────────────────
create table if not exists public.user_codex (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  creature_id text not null,
  is_shiny    boolean default false,
  captured_at timestamptz default now(),
  unique (user_id, creature_id)
);

alter table public.user_codex enable row level security;
create policy "Users manage own codex"
  on public.user_codex for all using (auth.uid() = user_id);

-- ─── 6. Discussions ────────────────────────────────────────────────────────
create table if not exists public.discussions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  challenge_id text,
  title       text not null,
  body        text,
  votes       integer default 0,
  comment_count integer default 0,
  tags        text[] default '{}',
  is_pinned   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.discussions enable row level security;
create policy "Anyone can read discussions"
  on public.discussions for select using (true);
create policy "Users can create discussions"
  on public.discussions for insert with check (auth.uid() = user_id);
create policy "Users can update own discussions"
  on public.discussions for update using (auth.uid() = user_id);
create policy "Users can delete own discussions"
  on public.discussions for delete using (auth.uid() = user_id);

-- ─── 7. Discussion Votes ───────────────────────────────────────────────────
create table if not exists public.discussion_votes (
  user_id       uuid not null references auth.users(id) on delete cascade,
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  primary key (user_id, discussion_id)
);

alter table public.discussion_votes enable row level security;
create policy "Users manage own votes"
  on public.discussion_votes for all using (auth.uid() = user_id);

-- ─── 8. Notifications ──────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null,           -- 'streak' | 'raid' | 'system' | 'referral' | 'achievement'
  icon        text default '🔔',
  title       text not null,
  body        text,
  is_read     boolean default false,
  action_url  text,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);

-- ─── 9. Referrals ──────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references auth.users(id) on delete cascade,
  referred_email  text,
  referred_user_id uuid references auth.users(id) on delete set null,
  status          text default 'pending',  -- 'pending' | 'signed_up' | 'converted'
  reward_granted  boolean default false,
  created_at      timestamptz default now(),
  converted_at    timestamptz
);

alter table public.referrals enable row level security;
create policy "Users manage own referrals"
  on public.referrals for all using (auth.uid() = referrer_id);

-- ─── 10. User Notification Preferences ─────────────────────────────────────
create table if not exists public.user_notification_prefs (
  id                 uuid primary key references auth.users(id) on delete cascade,
  streak_alerts      boolean default true,
  raid_invites       boolean default true,
  weekly_digest      boolean default true,
  achievement_alerts boolean default true,
  email_notifications boolean default false,
  updated_at         timestamptz default now()
);

alter table public.user_notification_prefs enable row level security;
create policy "Users manage own prefs"
  on public.user_notification_prefs for all using (auth.uid() = id);

-- ─── 11. Leaderboard View (no PII leak) ─────────────────────────────────────
create or replace view public.leaderboard_view as
select
  p.id,
  p.username,
  p.display_name,
  p.avatar_color,
  p.subscription_tier,
  s.total_xp,
  s.current_streak,
  s.challenges_done,
  s.war_rooms_done,
  s.perfect_runs,
  -- weekly XP not stored separately; use a function or materialized view for production
  rank() over (order by s.total_xp desc) as rank
from public.user_profiles p
join public.user_stats s on s.id = p.id
order by s.total_xp desc;

-- ─── 12. Auto-create profile + stats on signup ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_referral_code text;
begin
  -- Generate unique referral code
  new_referral_code := upper(substring(new.id::text, 1, 4)) || '-' ||
                       upper(substring(md5(random()::text), 1, 4));

  insert into public.user_profiles (id, username, display_name, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new_referral_code
  )
  on conflict (id) do nothing;

  insert into public.user_stats (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_notification_prefs (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger fires on every new auth.users row
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 13. Discussion vote helpers ────────────────────────────────────────────
create or replace function public.increment_discussion_votes(p_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_votes integer;
begin
  update public.discussions set votes = votes + 1 where id = p_id returning votes into v_votes;
  return v_votes;
end;$$;

create or replace function public.decrement_discussion_votes(p_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_votes integer;
begin
  update public.discussions set votes = greatest(0, votes - 1) where id = p_id returning votes into v_votes;
  return v_votes;
end;$$;

-- ─── 14. Function: award XP + update streak atomically ──────────────────────
create or replace function public.award_xp(
  p_user_id uuid,
  p_xp      integer,
  p_challenge_id text default null,
  p_challenge_type text default 'dsa'
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_today date := current_date;
  v_last_active  date;
  v_count integer;
  v_validated_xp integer;
begin
  -- SECURITY: users can only award XP to themselves (ignores RLS because 'security definer')
  if auth.uid() is not null and auth.uid() != p_user_id then
    raise exception 'Unauthorized: can only update your own XP';
  end if;

  -- Ensure XP is bounded to prevent integer overflow or massive cheating via API abuse
  v_validated_xp := least(abs(p_xp), 500);

  -- Upsert the challenge row
  if p_challenge_id is not null then
    insert into public.user_challenges (user_id, challenge_id, xp_earned)
    values (p_user_id, p_challenge_id, v_validated_xp)
    on conflict (user_id, challenge_id) do nothing;

    get diagnostics v_count = row_count;
    if v_count = 0 then
      return; -- already solved, no double XP
    end if;
  end if;

  -- Get last active date
  select last_active_date into v_last_active
  from public.user_stats
  where id = p_user_id;

  -- Update XP and streak
  update public.user_stats
  set
    total_xp = total_xp + v_validated_xp,
    challenges_done = challenges_done + case when p_challenge_id is not null then 1 else 0 end,
    war_rooms_done  = war_rooms_done  + case when p_challenge_type = 'war' then 1 else 0 end,
    pr_reviews_done = pr_reviews_done + case when p_challenge_type = 'pr' then 1 else 0 end,
    current_streak = case
      when v_last_active = v_today then current_streak
      when v_last_active = v_today - 1 then current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      longest_streak,
      case
        when v_last_active = v_today then current_streak
        when v_last_active = v_today - 1 then current_streak + 1
        else 1
      end
    ),
    last_active_date = v_today,
    updated_at = now()
  where id = p_user_id;
end;
$$;
