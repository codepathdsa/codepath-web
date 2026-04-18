-- Modify award_xp to also insert into user_activities

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
  -- SECURITY: users can only award XP to themselves
  if auth.uid() is not null and auth.uid() != p_user_id then
    raise exception 'Unauthorized: can only update your own XP';
  end if;

  v_validated_xp := least(abs(p_xp), 500);

  -- Upsert the challenge row
  if p_challenge_id is not null then
    insert into public.user_challenges (user_id, challenge_id, xp_earned)
    values (p_user_id, p_challenge_id, v_validated_xp)
    on conflict (user_id, challenge_id) do nothing;

    get diagnostics v_count = row_count;
    if v_count = 0 then
      return; -- already solved, no double XP or duplicate feed entries
    end if;
    
    -- Insert into activity feed
    insert into public.user_activities (user_id, type, challenge_id, title, xp)
    values (
      p_user_id, 
      p_challenge_type, 
      p_challenge_id, 
      'Solved challenge ' || p_challenge_id, 
      v_validated_xp
    );
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
