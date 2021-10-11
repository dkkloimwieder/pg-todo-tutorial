import React from 'react';
import Todo from './Todo';
import { useQuery } from '@apollo/client';
import { GET_TODOS } from './graphql';

export default function TodoList() {
  const { data, error, loading } = useQuery(GET_TODOS);
  if (error) return <p className="alert">{error.message}</p>;
  if (loading) return <p className="alert">loading...</p>;
  const { todos } = data;

  return (
    <div className="todo-list">
      {todos.map((todo) => {
        return <Todo key={todo.id} {...todo} />;
      })}
    </div>
  );
}
