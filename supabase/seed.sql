-- Editorial example only. Do not run on production without review.
insert into public.lq_knowledge_nodes (id,version,title,domain,summary,editorial_status)
values ('light-shadow',1,'Lumière et ombres','Sciences',
        'La direction de la lumière influence la longueur des ombres.','draft'),
       ('fraction-part',1,'Fractions et partage','Mathématiques',
        'Une fraction décrit des parts égales d''un tout.','draft')
on conflict (id) do nothing;
