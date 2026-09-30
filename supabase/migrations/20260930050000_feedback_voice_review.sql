-- How feedback was entered, and the classifier's original theme (for AI–reviewer agreement).
alter table public.feedback
  add column input_mode text not null default 'text' check (input_mode in ('text', 'voice')),
  add column ai_theme text;

update public.feedback set ai_theme = theme where ai_theme is null;
