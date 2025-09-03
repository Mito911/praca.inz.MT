-- Category
alter table categories alter column language_id set not null;

create unique index if not exists ux_categories_lang_name_lower
    on categories (language_id, lower(name));

-- Entry
create index if not exists ix_entries_term_lower on entries (lower(term));
create index if not exists ix_entries_translation_lower on entries (lower(translation));
