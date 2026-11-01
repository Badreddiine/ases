-- Contenu d'exemple (à remplacer par les vraies données ASES)
insert into sports_sections (name, slug, description, schedule) values
 ('Football','football','Entraînements et tournois inter-écoles.','Mardi & jeudi 18h30 – Terrain Oasis'),
 ('Basketball','basketball','Section masculine et féminine.','Mercredi 15h – Terrains universitaires'),
 ('Volleyball','volleyball','Équipes mixtes et compétition universitaire.','Mercredi 16h30 – Terrains universitaires')
on conflict do nothing;
insert into boards (academic_year, title, is_active) values ('2026-2027','Bureau ASES 2026–2027', true), ('2025-2026','Bureau ASES 2025–2026', false) on conflict do nothing;
insert into events (title, description, category, location, starts_at, registration_deadline, capacity, status) values
 ('Tests sportifs – Football','Tests de sélection football. Venez avec votre tenue.','Tests sportifs','Terrain Oasis', now() + interval '2 days', now() + interval '1 day', 60,'published'),
 ('Tests sportifs – Basketball & Volleyball','Tests de sélection basketball et volleyball.','Tests sportifs','Terrains universitaires', now() + interval '1 day', now() + interval '12 hours', 80,'published');
insert into news (title, excerpt, is_published) values ('Ouverture des tests sportifs','Scannez le QR Code de l’affiche ou réservez directement sur le site.', true);
