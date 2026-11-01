-- 002 : modules complémentaires (paramètres, annonces, rôles fins, Storage)

-- Le rôle ne peut être changé que par l'admin ; le statut par l'admin ou le RH
create or replace function protect_profile_privileges() returns trigger language plpgsql as $$
declare r user_role := coalesce(current_role_name(),'member');
begin
  if auth.uid() is not null then
    if new.role is distinct from old.role and r <> 'admin' then raise exception 'Modification du rôle réservée à l''administrateur'; end if;
    if new.status is distinct from old.status and r not in ('admin','rh') then raise exception 'Modification du statut réservée à l''administrateur ou au RH'; end if;
  end if;
  return new;
end $$;

create table site_settings (key text primary key, value text);
alter table site_settings enable row level security;
create policy "settings_public" on site_settings for select using (true);
create policy "settings_admin" on site_settings for all using (current_role_name() = 'admin') with check (current_role_name() = 'admin');
insert into site_settings (key, value) values
 ('contact_email',''),('phone',''),('address','ENCG Settat'),('instagram_url',''),('facebook_url',''),('linkedin_url','') on conflict do nothing;

-- Annonce administrative à tous les membres actifs
create function announce(p_title text, p_body text) returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if current_role_name() <> 'admin' then raise exception 'Réservé à l''administrateur'; end if;
  insert into notifications (user_id, title, body) select id, p_title, p_body from profiles where status = 'active';
  get diagnostics n = row_count; return n;
end $$;

-- Annonce d'un nouvel événement (admin ou responsable de l'événement)
create function announce_event(p_event uuid) returns int language plpgsql security definer set search_path = public as $$
declare e events; n int;
begin
  select * into e from events where id = p_event;
  if not found or e.status <> 'published' then return 0; end if;
  if not (current_role_name() = 'admin' or e.manager_id = auth.uid()) then raise exception 'Accès refusé'; end if;
  insert into notifications (user_id, title, body) select id, 'Nouvel événement', e.title from profiles where status = 'active';
  get diagnostics n = row_count; return n;
end $$;

-- Événements : un responsable peut créer / supprimer (brouillon) ses propres événements
create policy "events_manager_insert" on events for insert with check (current_role_name() = 'event_manager' and manager_id = auth.uid() and created_by = auth.uid());
create policy "events_manager_delete" on events for delete using (current_role_name() = 'event_manager' and manager_id = auth.uid() and status = 'draft');
-- Le responsable voit les participants de ses événements (pas les données RH)
create policy "profiles_read_event_manager" on profiles for select using (exists (select 1 from reservations r join events e on e.id = r.event_id where r.user_id = profiles.id and e.manager_id = auth.uid()));

-- Storage : galerie, limites de taille et de type, justificatifs lisibles par RH
insert into storage.buckets (id, name, public) values ('gallery','gallery',true) on conflict do nothing;
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id in ('avatars','board','posters');
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['application/pdf','image/jpeg','image/png'] where id = 'documents';
update storage.buckets set file_size_limit = 52428800, allowed_mime_types = array['image/jpeg','image/png','image/webp','video/mp4','video/webm'] where id = 'gallery';
create policy "gallery_public_read" on storage.objects for select using (bucket_id = 'gallery');
create policy "gallery_admin_write" on storage.objects for all using (bucket_id = 'gallery' and current_role_name() = 'admin') with check (bucket_id = 'gallery' and current_role_name() = 'admin');
create policy "rh_read_documents" on storage.objects for select using (bucket_id = 'documents' and current_role_name() in ('admin','rh'));
