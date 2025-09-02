insert into languages(code, name) values
  ('en','English'),
  ('pl','Polski')
on conflict (code) do nothing;
