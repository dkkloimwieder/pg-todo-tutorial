CREATE TABLE todo_public.todo (
  id serial PRIMARY KEY,
  task text NOT NULL,
  completed boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now()
);
