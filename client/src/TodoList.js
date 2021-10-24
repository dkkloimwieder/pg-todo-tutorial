import React from 'react';
import Todo from './Todo';
import { useQuery } from '@apollo/client';
import { GET_TODOS, SUBSCRIBE_TODOS } from './graphql';

export default function TodoList() {
  const { subscribeToMore, data, error, loading } = useQuery(GET_TODOS);
  //  if (error) return <p className="alert">{error.message}</p>;
  //  if (loading) return <p className="alert">loading...</p>;
  React.useEffect(() => {
    subscribeToMore({
      document: SUBSCRIBE_TODOS,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(prev, subscriptionData);
        if (!subscriptionData.data) return prev;
        if (!subscriptionData.data.listen.relatedNode) {
          return {
            todos: {
              nodes: prev.todos.nodes.filter(
                (todo) => todo.id !== subscriptionData.data.listen.relatedNodeId
              ),
            },
          };
        } else {
          let incomingTodo = prev.todos.nodes.find(
            (todo) =>
              todo.id === `${subscriptionData.data.listen.relatedNodeId}`
          );
          if (incomingTodo) {
            return {
              todos: {
                nodes: prev.todos.nodes.map((todo) =>
                  todo.id === incomingTodo.id ? { ...incomingTodo } : todo
                ),
              },
            };
          } else {
            return {
              todos: {
                nodes: [
                  ...prev.todos.nodes,
                  {
                    id: subscriptionData.data.listen.relatedNodeId,
                    ...subscriptionData.data.listen.relatedNode,
                  },
                ],
              },
            };
          }
        }
      },
    });
  }, [subscribeToMore]);

  if (loading) return <h1>loading</h1>;
  if (error) return <h1>error</h1>;
  const { nodes } = data?.todos;
  return (
    <div className="todo-list">
      {nodes.map((todo) => {
        return <Todo key={todo.id} {...todo} />;
      })}
    </div>
  );
}
