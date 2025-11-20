-- Create vocabulary_sets table
create table vocabulary_sets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  user_id uuid references auth.users not null,
  topic text,
  category text,
  level text,
  is_public boolean default false,
  icon text,
  color_class text
);

-- Create words table
create table words (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  word text not null,
  meaning text not null,
  example text,
  set_id uuid references vocabulary_sets on delete cascade not null,
  image_url text,
  phonetic text,
  type text,
  synonyms text,
  antonyms text
);

-- Create user_progress table
create table user_progress (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  word_id uuid references words on delete cascade not null,
  status text check (status in ('learned', 'learning')) default 'learning',
  next_review_at timestamp with time zone default timezone('utc'::text, now()),
  interval integer default 1,
  ease_factor float default 2.5,
  streak integer default 0,
  unique(user_id, word_id)
);

-- Enable Row Level Security (RLS)
alter table vocabulary_sets enable row level security;
alter table words enable row level security;
alter table user_progress enable row level security;

-- Policies for vocabulary_sets
create policy "Users can view their own sets"
  on vocabulary_sets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sets"
  on vocabulary_sets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sets"
  on vocabulary_sets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sets"
  on vocabulary_sets for delete
  using (auth.uid() = user_id);

-- Policies for words
create policy "Users can view words in their sets"
  on words for select
  using (
    exists (
      select 1 from vocabulary_sets
      where vocabulary_sets.id = words.set_id
      and vocabulary_sets.user_id = auth.uid()
    )
  );

create policy "Users can insert words in their sets"
  on words for insert
  with check (
    exists (
      select 1 from vocabulary_sets
      where vocabulary_sets.id = words.set_id
      and vocabulary_sets.user_id = auth.uid()
    )
  );

create policy "Users can update words in their sets"
  on words for update
  using (
    exists (
      select 1 from vocabulary_sets
      where vocabulary_sets.id = words.set_id
      and vocabulary_sets.user_id = auth.uid()
    )
  );

create policy "Users can delete words in their sets"
  on words for delete
  using (
    exists (
      select 1 from vocabulary_sets
      where vocabulary_sets.id = words.set_id
      and vocabulary_sets.user_id = auth.uid()
    )
  );

-- Policies for user_progress
create policy "Users can view their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on user_progress for update
  using (auth.uid() = user_id);
