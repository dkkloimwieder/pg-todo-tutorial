import React, { useState } from 'react';
import Todo from './Todo';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS, CREATE_TODO } from './graphql';

export default function TodoList() {
  const [input, setInput] = useState('');
  const [createTodo] = useMutation(CREATE_TODO, {
    update: (cache, mutationResult) => {
      const todosQuery = cache.readQuery({ query: GET_TODOS });
      cache.writeQuery({
        query: GET_TODOS,
        data: {
          todos: todosQuery.todos.concat(mutationResult.data.createTodo.todo),
        },
      });
    },
  });
  const { data, error, loading } = useQuery(GET_TODOS);
  if (error) return <p className="alert">{error.message}</p>;
  if (loading) return <p className="alert">loading...</p>;
  const { todos } = data;

  //const todos = [{ task: 'replace meeeee!', id: '1', completed: false }];
  return (
    <div>
      <ul className="todo-list">
        {todos.map((todo) => {
          return <Todo key={todo.id} {...todo} />;
        })}
      </ul>
      <form
        className="todo-list__form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await createTodo({
              variables: { task: input },
            });
          } catch (error) {
            console.error(error);
          }
          setInput('');
        }}
      >
        <input
          className="todo-list__input"
          type="text"
          placeholder="Enter Todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br></br>
        <input
          className="todo-list__button"
          type="submit"
          value="Create Todo"
        />
      </form>
    </div>
  );
}
