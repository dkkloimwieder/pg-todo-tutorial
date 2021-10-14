CREATE OR REPLACE FUNCTION notify_todo()
   RETURNS trigger AS $$
   BEGIN
     PERFORM pg_notify(
         'postgraphile:todo',
         json_build_object('__node__', json_build_array('todos', NEW.id))::text);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_todo
    AFTER INSERT
    ON todo_public.todo
    FOR EACH ROW
    EXECUTE PROCEDURE notify_todo();
