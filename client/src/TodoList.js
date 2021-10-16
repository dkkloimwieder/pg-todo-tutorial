import React from 'react';
import Todo from './Todo';
import { useQuery } from '@apollo/client';
import { GET_TODOS, SUBSCRIBE_TODOS } from './graphql';

export default function TodoList() {
  const { subscribeToMore, data, error, loading } = useQuery(GET_TODOS);
  if (error) return <p className="alert">{error.message}</p>;
  if (loading) return <p className="alert">loading...</p>;
  const { todos } = data;
  subscribeToMore({
    document: SUBSCRIBE_TODOS,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      if (!subscriptionData.data.listen.relatedNode) {
        return {
          todos: prev.todos.filter(
            (todo) => todo.id !== subscriptionData.data.listen.relatedNodeId
          ),
        };
      } else {
        let incomingTodo = prev.todos.find(
          (todo) => todo.id === `${subscriptionData.data.listen.relatedNodeId}`
        );
        if (incomingTodo) {
          return {
            todos: prev.todos.map((todo) =>
              todo.id === incomingTodo.id
                ? { ...todo, completed: !todo.completed }
                : todo
            ),
          };
        } else {
          return {
            todos: [
              ...prev.todos,
              {
                id: subscriptionData.data.listen.relatedNodeId,
                ...subscriptionData.data.listen.relatedNode,
              },
            ],
          };
        }
      }
    },
  });

  return (
    <div className="todo-list">
      {todos.map((todo) => {
        return <Todo key={todo.id} {...todo} />;
      })}
    </div>
  );
}
