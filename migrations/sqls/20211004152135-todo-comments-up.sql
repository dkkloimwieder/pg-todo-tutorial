COMMENT ON TABLE todo_public.todo IS 'task and associated fields to accomplish';
COMMENT ON COLUMN todo_public.todo.id IS 'primary key/identifier of todo';
COMMENT ON COLUMN todo_public.todo.task IS 'the specific objective of todo';
COMMENT ON COLUMN todo_public.todo.created_at IS 'time of todo creation';
COMMENT ON COLUMN todo_public.todo.completed IS 'status of todo';
