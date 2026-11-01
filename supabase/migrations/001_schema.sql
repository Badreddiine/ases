-- ASES – schéma Supabase (PostgreSQL) + RLS + fonctions transactionnelles
create extension if not exists "pgcrypto";

create type user_role as enum ('admin','rh','member','event_manager');
create type member_status as enum ('active','pending','suspended');
create type event_status as enum ('draft','published','full','completed','cancelled');
create type reservation_status as enum ('confirmed','waitlisted','cancelled','checked_in');
create type attendance_status as enum ('present','absent','late','excused');
create type absence_status as enum ('pending','approved','rejected');

-- ============ TABLES ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, phone text, student_id text unique, avatar_url text,
  role user_role not null default 'member',
  status member_status not null default 'pending',
  registered_at timestamptz not null default now()
);
create table sports_sections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, slug text not null unique, description text, image_url text, schedule text,
  manager_id uuid references profiles(id) on delete set null
);
create table member_sections (
  member_id uuid references profiles(id) on delete cascade,
  section_id uuid references sports_sections(id) on delete cascade,
  primary key (member_id, section_id)
);
create table boards (
  id uuid primary key default gen_random_uuid(),
  academic_year text not null unique check (academic_year ~ '^\d{4}-\d{4}$'),
  title text, description text, group_photo_url text, president_message text,
  start_date date, end_date date, is_active boolean not null default false
);
create unique index one_active_board on boards (is_active) where is_active;
create table board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  position text not null, biography text, photo_url text, linkedin_url text, instagram_url text,
  display_order int not null default 0,
  unique (board_id, profile_id)
);
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, category text, location text, poster_url text,
  starts_at timestamptz not null, registration_deadline timestamptz,
  capacity int not null check (capacity > 0), conditions text,
  allow_cancel_until timestamptz,
  status event_status not null default 'draft',
  manager_id uuid references profiles(id) on delete set null,
  created_by uuid references profiles(id), created_at timestamptz not null default now()
);
create index on events (status, starts_at);
create table reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status reservation_status not null,
  qr_token text unique default encode(gen_random_bytes(16),'hex'),
  checked_in_at timestamptz, created_at timestamptz not null default now()
);
-- anti-doublon : une seule réservation active par membre et événement
create unique index one_active_reservation on reservations (event_id, user_id) where status <> 'cancelled';
create index on reservations (event_id, status);
create table attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null, kind text not null check (kind in ('meeting','training','event')),
  event_id uuid references events(id) on delete set null,
  session_date timestamptz not null, created_by uuid references profiles(id)
);
create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  status attendance_status not null,
  unique (session_id, member_id)
);
create table absence_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references profiles(id) on delete cascade,
  start_date date not null, end_date date not null check (end_date >= start_date),
  reason text not null, description text, document_url text,
  status absence_status not null default 'pending',
  rh_comment text, reviewed_by uuid references profiles(id), reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null, body text, is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on notifications (user_id, is_read);
create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null, excerpt text, content text, image_url text, category text,
  is_published boolean not null default false, published_at timestamptz default now()
);
create table gallery (
  id uuid primary key default gen_random_uuid(),
  title text, url text not null, media_type text not null default 'image' check (media_type in ('image','video')),
  category text, created_at timestamptz not null default now()
);
create table contact_messages (id uuid primary key default gen_random_uuid(), name text, email text, message text, created_at timestamptz default now());
create table membership_applications (id uuid primary key default gen_random_uuid(), full_name text, email text, student_id text, sports text, created_at timestamptz default now());

-- ============ HELPERS ============
create function current_role_name() returns user_role language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() $$;

-- Création de profil : le rôle est TOUJOURS 'member' (aucune élévation possible à l'inscription)
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Empêche un utilisateur de modifier son propre rôle / statut
create function protect_profile_privileges() returns trigger language plpgsql as $$
begin
  if coalesce(current_role_name(),'member') <> 'admin' and auth.uid() is not null
     and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'Modification du rôle ou du statut réservée à l''administrateur';
  end if;
  return new;
end $$;
create trigger profile_guard before update on profiles for each row execute function protect_profile_privileges();

create function notify(p_user uuid, p_title text, p_body text) returns void language sql security definer set search_path = public as
$$ insert into notifications (user_id, title, body) values (p_user, p_title, p_body) $$;

-- ============ FONCTIONS MÉTIER ============
create function event_remaining(p_event uuid) returns int language sql stable security definer set search_path = public as
$$ select e.capacity - count(r.*)::int from events e left join reservations r on r.event_id = e.id and r.status in ('confirmed','checked_in') where e.id = p_event group by e.capacity $$;

-- Réservation transactionnelle (verrou de ligne = pas de surréservation en concurrence)
create function reserve_event(p_event uuid) returns text language plpgsql security definer set search_path = public as $$
declare e events; taken int; st reservation_status;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select * into e from events where id = p_event for update;
  if not found or e.status not in ('published','full') then raise exception 'Événement indisponible'; end if;
  if e.registration_deadline is not null and now() > e.registration_deadline then raise exception 'Les inscriptions sont closes'; end if;
  if exists (select 1 from reservations where event_id = p_event and user_id = auth.uid() and status <> 'cancelled') then raise exception 'Vous avez déjà réservé cet événement'; end if;
  select count(*) into taken from reservations where event_id = p_event and status in ('confirmed','checked_in');
  st := case when taken < e.capacity then 'confirmed' else 'waitlisted' end;
  insert into reservations (event_id, user_id, status) values (p_event, auth.uid(), st);
  if st = 'confirmed' and taken + 1 >= e.capacity then update events set status = 'full' where id = p_event; end if;
  perform notify(auth.uid(), case when st='confirmed' then 'Réservation confirmée' else 'Liste d''attente' end, e.title);
  return st::text;
end $$;

create function cancel_reservation(p_reservation uuid) returns void language plpgsql security definer set search_path = public as $$
declare r reservations; e events; nxt reservations;
begin
  select * into r from reservations where id = p_reservation and user_id = auth.uid() and status <> 'cancelled' for update;
  if not found then raise exception 'Réservation introuvable'; end if;
  select * into e from events where id = r.event_id for update;
  if e.allow_cancel_until is not null and now() > e.allow_cancel_until then raise exception 'Le délai d''annulation est dépassé'; end if;
  update reservations set status = 'cancelled' where id = r.id;
  perform notify(auth.uid(), 'Réservation annulée', e.title);
  if r.status = 'confirmed' then  -- promotion de la liste d'attente
    select * into nxt from reservations where event_id = e.id and status = 'waitlisted' order by created_at limit 1 for update;
    if found then
      update reservations set status = 'confirmed' where id = nxt.id;
      perform notify(nxt.user_id, 'Place disponible', 'Votre réservation est confirmée : ' || e.title);
    elsif e.status = 'full' then update events set status = 'published' where id = e.id; end if;
  end if;
end $$;

-- Check-in par QR Code (admin, RH, responsable de l'événement)
create function check_in(p_token text) returns json language plpgsql security definer set search_path = public as $$
declare r reservations; e events; p profiles;
begin
  select * into r from reservations where qr_token = p_token for update;
  if not found then raise exception 'QR Code invalide'; end if;
  select * into e from events where id = r.event_id;
  if not (current_role_name() = 'admin' or e.manager_id = auth.uid()) then raise exception 'Accès refusé'; end if;
  if r.status = 'checked_in' then raise exception 'Déjà enregistré à %', r.checked_in_at; end if;
  if r.status <> 'confirmed' then raise exception 'Réservation non confirmée'; end if;
  update reservations set status = 'checked_in', checked_in_at = now() where id = r.id;
  select * into p from profiles where id = r.user_id;
  return json_build_object('member', p.full_name, 'student_id', p.student_id, 'event', e.title);
end $$;

create function activate_board(p_board uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if current_role_name() <> 'admin' then raise exception 'Réservé à l''administrateur'; end if;
  update boards set is_active = false where is_active;   -- archive l'ancien, sans rien supprimer
  update boards set is_active = true where id = p_board;
end $$;

-- Notifications absences
create function absence_notify() returns trigger language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if tg_op = 'INSERT' then
    for r in select id from profiles where role in ('admin','rh') loop perform notify(r.id, 'Nouvelle demande d''absence', new.reason); end loop;
  elsif new.status <> old.status then
    perform notify(new.member_id, case new.status when 'approved' then 'Absence approuvée' else 'Absence refusée' end, coalesce(new.rh_comment, new.reason));
  end if;
  return new;
end $$;
create trigger absence_events after insert or update on absence_requests for each row execute function absence_notify();

-- ============ ROW LEVEL SECURITY ============
do $$ declare t text; begin
  foreach t in array array['profiles','sports_sections','member_sections','boards','board_members','events','reservations','attendance_sessions','attendance_records','absence_requests','notifications','news','gallery','contact_messages','membership_applications']
  loop execute format('alter table %I enable row level security', t); end loop;
end $$;

create policy "profiles_read_own_or_staff" on profiles for select using (id = auth.uid() or current_role_name() in ('admin','rh'));
create policy "profiles_public_board_names" on profiles for select using (exists (select 1 from board_members bm join boards b on b.id = bm.board_id where bm.profile_id = profiles.id));
create policy "profiles_update_own" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_staff_update" on profiles for update using (current_role_name() in ('admin','rh'));

create policy "sections_public" on sports_sections for select using (true);
create policy "sections_admin" on sports_sections for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');
create policy "ms_own_or_staff" on member_sections for select using (member_id = auth.uid() or current_role_name() in ('admin','rh'));
create policy "ms_own_write" on member_sections for all using (member_id = auth.uid() or current_role_name() = 'admin') with check (member_id = auth.uid() or current_role_name() = 'admin');

create policy "boards_public" on boards for select using (true);
create policy "boards_admin" on boards for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');
create policy "bm_public" on board_members for select using (true);
create policy "bm_admin" on board_members for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');

create policy "events_public" on events for select using (status <> 'draft' or current_role_name() = 'admin' or manager_id = auth.uid());
create policy "events_admin" on events for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');
create policy "events_manager_update" on events for update using (manager_id = auth.uid() and current_role_name() = 'event_manager');

create policy "res_own" on reservations for select using (user_id = auth.uid());
create policy "res_staff_read" on reservations for select using (current_role_name() = 'admin' or exists (select 1 from events e where e.id = event_id and e.manager_id = auth.uid()));
-- aucune écriture directe : tout passe par reserve_event / cancel_reservation / check_in

create policy "att_sessions_read" on attendance_sessions for select using (auth.uid() is not null);
create policy "att_sessions_staff" on attendance_sessions for all using (current_role_name() in ('admin','rh')) with check (current_role_name() in ('admin','rh'));
create policy "att_rec_own" on attendance_records for select using (member_id = auth.uid());
create policy "att_rec_rh" on attendance_records for all using (current_role_name() in ('admin','rh')) with check (current_role_name() in ('admin','rh'));

create policy "abs_own_read" on absence_requests for select using (member_id = auth.uid());
create policy "abs_own_insert" on absence_requests for insert with check (member_id = auth.uid() and status = 'pending');
create policy "abs_rh_all" on absence_requests for all using (current_role_name() in ('admin','rh')) with check (current_role_name() in ('admin','rh'));

create policy "notif_own" on notifications for select using (user_id = auth.uid());
create policy "notif_own_update" on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "news_public" on news for select using (is_published or current_role_name() = 'admin');
create policy "news_admin" on news for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');
create policy "gallery_public" on gallery for select using (true);
create policy "gallery_admin" on gallery for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');

create policy "contact_insert" on contact_messages for insert with check (true);
create policy "contact_admin_read" on contact_messages for select using (current_role_name() = 'admin');
create policy "apply_insert" on membership_applications for insert with check (true);
create policy "apply_staff_read" on membership_applications for select using (current_role_name() in ('admin','rh'));

-- ============ STORAGE ============
insert into storage.buckets (id, name, public) values
  ('avatars','avatars',true), ('board','board',true), ('posters','posters',true), ('documents','documents',false)
on conflict do nothing;
create policy "public_read_media" on storage.objects for select using (bucket_id in ('avatars','board','posters'));
create policy "admin_write_board_posters" on storage.objects for all using (bucket_id in ('board','posters') and current_role_name() = 'admin') with check (bucket_id in ('board','posters') and current_role_name() = 'admin');
create policy "own_avatar_write" on storage.objects for all using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_documents" on storage.objects for all using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
