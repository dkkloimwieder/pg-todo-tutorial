CREATE OR REPLACE FUNCTION notify_todo()
  RETURNS trigger AS $$
  DECLARE
    todo_record RECORD;
  BEGIN
    IF (TG_OP = 'DELETE') THEN
      todo_record = OLD;
    ELSE
      todo_record = NEW;
    END IF;
     PERFORM pg_notify(
         'postgraphile:todo',
         json_build_object('__node__', json_build_array('todos', todo_record.id))::text);
    RETURN todo_record;

   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_todo
    AFTER INSERT OR UPDATE OR DELETE
    ON todo_public.todo
    FOR EACH ROW
    EXECUTE PROCEDURE notify_todo();
