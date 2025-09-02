create table if not exists users(
  id uuid primary key,
  email varchar(255) unique not null,
  password_hash varchar(255) not null,
  display_name varchar(120),
  role varchar(20) not null default 'USER',
  created_at timestamp not null default now()
);

create table if not exists languages(
  id bigserial primary key,
  code varchar(10) unique not null,
  name varchar(50) not null
);

create table if not exists categories(
  id bigserial primary key,
  language_id bigint references languages(id),
  parent_id bigint references categories(id),
  name varchar(120) not null
);

create table if not exists entries(
  id bigserial primary key,
  language_id bigint references languages(id),
  category_id bigint references categories(id),
  term text not null,
  translation text,
  ipa varchar(120),
  part_of_speech varchar(50),
  example text,
  tags text,
  cefr varchar(10),
  owner_user_id uuid references users(id),
  is_public boolean not null default false,
  created_at timestamp not null default now()
);
