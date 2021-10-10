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
  if (error) console.error(error);
  if (loading) return <h1>loading...</h1>;
  const { todos } = data;

  return (
    <div>
      <ul className="todo-list">
        {todos.map((todo) => {
          const { id } = todo;
          return <Todo key={id} {...todo} />;
        })}
      </ul>
      <form
        className="todo-list__element todo-list__form"
        onSubmit={(e) => {
          e.preventDefault();
          const { error } = createTodo({
            variables: { task: input },
          });
          if (error) console.error(error);
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
          className="todo-list__button--dark"
          type="submit"
          value="Create Todo"
        />
      </form>
    </div>
  );
}
