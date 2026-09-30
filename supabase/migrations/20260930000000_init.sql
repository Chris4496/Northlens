create extension if not exists vector with schema extensions;

-- Knowledge base: verified planning passages + Gemini embeddings (768 dims)
create table public.kb_chunks (
  id text primary key,
  source_id text not null,
  heading text not null,
  text text not null,
  text_zh text not null,
  topics text[] not null default '{}',
  status text not null,
  embedding extensions.vector(768) not null,
  updated_at timestamptz not null default now()
);

create index kb_chunks_embedding_idx on public.kb_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

-- Resident feedback (anonymous; PII redacted before insert)
create table public.feedback (
  id text primary key,
  created_at timestamptz not null default now(),
  text text not null,
  priorities text[] not null default '{}',
  persona text not null,
  lang text not null,
  zone text not null,
  theme text not null,
  stakeholder text not null,
  concern text not null,
  sentiment text not null,
  suggested_issue text not null,
  pii_redacted boolean not null default false,
  classified_by text not null,
  reviewed boolean not null default false,
  synthetic boolean not null default false
);

create index feedback_created_at_idx on public.feedback (created_at desc);

-- Only the server (secret key) touches these tables; no public policies.
alter table public.kb_chunks enable row level security;
alter table public.feedback enable row level security;

create or replace function public.match_kb_chunks(
  query_embedding extensions.vector(768),
  match_count int default 8
)
returns table (id text, similarity float)
language sql stable
set search_path = ''
as $$
  select c.id, 1 - (c.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.kb_chunks c
  order by c.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;

revoke execute on function public.match_kb_chunks from anon, authenticated, public;
